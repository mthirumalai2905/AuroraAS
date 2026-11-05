import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { SESSION_COOKIE, getStakeholder, resolveClerkStakeholder } from "@/lib/auth";
import { applyForumWrite, loadForum, type ForumActor } from "@/lib/data/forum-db";

export const runtime = "nodejs";

async function actor(): Promise<ForumActor | null> {
  const clerkUser = await currentUser();
  if (clerkUser) {
    const email =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      "";
    if (!email) return null;
    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username;
    const user = resolveClerkStakeholder({ email, fullName, externalId: clerkUser.externalId });
    return { email: user.email, name: user.name, canWrite: user.canWrite, entity: user.entity };
  }
  const cookieStore = await cookies();
  const user = getStakeholder(cookieStore.get(SESSION_COOKIE)?.value);
  if (!user) return null;
  return { email: user.email, name: user.name, canWrite: user.canWrite, entity: user.entity };
}

export async function GET() {
  const user = await actor();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ ok: true, forum: loadForum() });
}

export async function POST(request: Request) {
  const user = await actor();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const result = applyForumWrite(user, body as Record<string, unknown>);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({
    ok: true,
    forum: result.forum,
    register: result.register ?? null,
    events: result.events ?? null,
  });
}
