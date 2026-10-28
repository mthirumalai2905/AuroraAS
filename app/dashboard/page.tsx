import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { SESSION_COOKIE, getStakeholder } from "@/lib/auth";
import { buildRegister, getHolders } from "@/lib/data/register";
import { auroraEquity } from "@/lib/data/aurora-equity";

export const metadata: Metadata = { title: "Stakeholder dashboard" };

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = getStakeholder(cookieStore.get(SESSION_COOKIE)?.value);
  if (!user) redirect("/api/auth/logout");

  return <Dashboard user={user} register={buildRegister(user.id)} holders={getHolders(user.entity)} capTable={auroraEquity} />;
}
