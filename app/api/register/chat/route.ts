import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { SESSION_COOKIE, canWriteDashboard, getStakeholder } from "@/lib/auth";
import type { Shareholder } from "@/lib/data/aurora-equity";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

type RequestBody = {
  prompt?: string;
  history?: { role: "user" | "assistant"; content: string }[];
  shareholders?: Pick<
    Shareholder,
    "id" | "rank" | "name" | "firstName" | "displayName" | "investorId" | "shares" | "stakeText" | "email" | "city" | "country" | "kind"
  >[];
};

const SYSTEM_PROMPT = `You are the Registrar Copilot for Aurora Equity AS (Org. nr 938 395 063, 30,000,000 shares outstanding).
Your job is to interpret natural-language instructions from the user with extreme care and precision, because any share transfer or entry affects a legal shareholder register.

Respond ONLY with a valid JSON object matching this exact schema (no markdown code fences, no extra text):
{
  "reply": "Clear, concise explanation to show in the chat bubble.",
  "intent": {
    "type": "transfer" | "add_holder" | "update_field" | "none",
    // When type === "transfer":
    "shares": number,              // positive integer number of shares to move
    "fromQuery": string,           // exact name, displayName, investorId, or email of the sender mentioned by the user
    "toQuery": string,             // exact name, displayName, investorId, or email of the recipient mentioned by the user

    // When type === "add_holder":
    "name": string,                // company name or last name
    "firstName": string,           // first name or contact person ("" if company/none)
    "investorId": string,          // 9-digit org nr or DOB ("" if not given)
    "holderKind": "company" | "person",
    "shares": number,              // positive integer number of shares
    "email": string,
    "address": string,
    "postalCode": string,
    "city": string,
    "country": string,

    // When type === "update_field":
    "targetQuery": string,         // shareholder name, displayName, investorId, or email
    "field": "email" | "address" | "postalCode" | "city" | "country" | "investorId" | "firstName" | "shares",
    "value": string | number
  }
}

Rules:
1. Never invent share counts or shareholder names that the user did not specify.
2. If the user asks to take/move/transfer/give X shares from A to B, set intent.type = "transfer", intent.shares = X (as an integer), intent.fromQuery = A, intent.toQuery = B.
3. If the user asks to add/create/register a new shareholder entry, set intent.type = "add_holder" with all provided fields. If share count or name is missing, set intent.type = "none" and ask for the missing field in "reply".
4. If the user asks a question about the register (e.g. top holders, who owns what, total shares of a holder), answer accurately using the provided shareholder snapshot and set intent.type = "none".
5. Mention in "reply" when an action is staged that it requires the user's explicit confirmation on the verification card before any change is committed.`;

export async function POST(request: Request) {
  const clerkUser = await currentUser();
  let email: string | null =
    clerkUser?.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    null;

  if (!email) {
    const cookieStore = await cookies();
    const demo = getStakeholder(cookieStore.get(SESSION_COOKIE)?.value);
    email = demo?.email ?? null;
  }

  if (!email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const canWrite = canWriteDashboard(email);
  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const prompt = body?.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DEEPSEEK_API_KEY is not configured on the server." }, { status: 500 });
  }

  const holdersSnapshot = (body?.shareholders ?? []).map((h) => ({
    rank: h.rank,
    name: h.name,
    firstName: h.firstName,
    displayName: h.displayName,
    investorId: h.investorId,
    shares: h.shares,
    stake: h.stakeText,
    email: h.email,
    city: h.city,
    kind: h.kind,
  }));

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "system",
            content: `Current signed-in user: ${email} (canWrite=${canWrite}).\nLive shareholder register (${holdersSnapshot.length} holders):\n${JSON.stringify(holdersSnapshot)}`,
          },
          ...(body?.history ?? []).slice(-6),
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return NextResponse.json(
        { error: `DeepSeek API error (${response.status}): ${errText.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawContent: string = data?.choices?.[0]?.message?.content ?? "{}";

    let parsed: {
      reply?: string;
      intent?: {
        type?: "transfer" | "add_holder" | "update_field" | "none";
        shares?: number;
        fromQuery?: string;
        toQuery?: string;
        name?: string;
        firstName?: string;
        investorId?: string;
        holderKind?: "company" | "person";
        email?: string;
        address?: string;
        postalCode?: string;
        city?: string;
        country?: string;
        targetQuery?: string;
        field?: "email" | "address" | "postalCode" | "city" | "country" | "investorId" | "firstName" | "shares";
        value?: string | number;
      };
    } = {};

    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = { reply: rawContent, intent: { type: "none" } };
    }

    return NextResponse.json({
      ok: true,
      canWrite,
      reply: parsed.reply ?? "Processed request.",
      intent: parsed.intent ?? { type: "none" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reach DeepSeek API." },
      { status: 500 }
    );
  }
}
