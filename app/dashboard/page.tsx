import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { SESSION_COOKIE, getStakeholder, resolveClerkStakeholder, type Stakeholder } from "@/lib/auth";
import { auroraEquity } from "@/lib/data/aurora-equity";

export const metadata: Metadata = { title: "Stakeholder dashboard" };

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  let user: Stakeholder | null = null;

  if (clerkUser) {
    const primaryEmail =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      "";
    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username;
    user = resolveClerkStakeholder({
      email: primaryEmail,
      fullName,
      externalId: clerkUser.externalId,
    });
  } else {
    const cookieStore = await cookies();
    user = getStakeholder(cookieStore.get(SESSION_COOKIE)?.value);
  }

  if (!user) redirect("/login");

  return <Dashboard user={user} capTable={auroraEquity} events={[]} />;
}
