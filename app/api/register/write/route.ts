import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { canWriteDashboard } from "@/lib/auth";
import { applyRegisterWrite } from "@/lib/data/register-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const clerkUser = await currentUser();
  const primaryEmail =
    clerkUser?.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    null;

  if (!canWriteDashboard(primaryEmail)) {
    return NextResponse.json(
      {
        error:
          "Read-only access. Only paal@synx.tools and thiru@synx.tools are authorized to write to the internal register.",
      },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const result = applyRegisterWrite(primaryEmail ?? "", body as Record<string, unknown>);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    updatedBy: primaryEmail,
    updatedAt: new Date().toISOString(),
    action: (body as { action?: string }).action ?? "update",
    register: result.register,
    events: result.events,
  });
}
