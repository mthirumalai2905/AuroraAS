import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { SESSION_COOKIE, getStakeholder, resolveClerkStakeholder } from "@/lib/auth";
import { loadEvents, loadRegister } from "@/lib/data/register-db";

export const runtime = "nodejs";

export async function GET() {
  const clerkUser = await currentUser();
  let allowed = false;
  if (clerkUser) {
    const primaryEmail =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      "";
    allowed = Boolean(resolveClerkStakeholder({ email: primaryEmail }).email);
  } else {
    const cookieStore = await cookies();
    allowed = Boolean(getStakeholder(cookieStore.get(SESSION_COOKIE)?.value));
  }
  if (!allowed) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  return NextResponse.json({
    register: loadRegister(),
    events: loadEvents(),
  });
}
