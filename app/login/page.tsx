import type { Metadata } from "next";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { demoAccounts } from "@/lib/auth";

export const metadata: Metadata = { title: "Stakeholder login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthSplitLayout>
      <LoginForm demos={demoAccounts} next={next} />
    </AuthSplitLayout>
  );
}
