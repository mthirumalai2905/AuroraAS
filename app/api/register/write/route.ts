import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { canWriteDashboard } from "@/lib/auth";

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

  // Server-side safety verification for transfers
  if (body.action === "transfer-shares") {
    const shares = Number(body.shares);
    const fromBefore = Number(body.fromBefore);
    const fromAfter = Number(body.fromAfter);
    const toBefore = Number(body.toBefore);
    const toAfter = Number(body.toAfter);

    if (!Number.isInteger(shares) || shares <= 0) {
      return NextResponse.json({ error: "Share transfer amount must be a positive integer." }, { status: 400 });
    }
    if (fromBefore < shares || fromAfter < 0) {
      return NextResponse.json({ error: "Insufficient sender balance for this transfer." }, { status: 400 });
    }
    if (fromBefore - shares !== fromAfter || toBefore + shares !== toAfter) {
      return NextResponse.json({ error: "Transfer conservation check failed (before/after mismatch)." }, { status: 400 });
    }
    if (body.fromId && body.toId && body.fromId === body.toId) {
      return NextResponse.json({ error: "Sender and recipient cannot be the same shareholder." }, { status: 400 });
    }
  }

  return NextResponse.json({
    ok: true,
    updatedBy: primaryEmail,
    updatedAt: new Date().toISOString(),
    action: body.action ?? "update",
  });
}
