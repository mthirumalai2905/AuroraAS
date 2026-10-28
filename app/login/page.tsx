import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginShowcase } from "@/components/auth/LoginShowcase";
import { Logo } from "@/components/ui/Logo";
import { demoAccounts } from "@/lib/auth";

export const metadata: Metadata = { title: "Stakeholder login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-dvh bg-paper lg:grid-cols-[1.1fr_1fr]">
      <LoginShowcase />
      <section className="relative flex flex-col px-6 py-8 md:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="lg:invisible">
            <Logo />
          </Link>
          <Link href="/" className="eyebrow inline-flex items-center gap-2 text-[10px] text-ink-2 transition-colors hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <LoginForm demos={demoAccounts} next={next} />
        </div>
        <p className="text-center text-[12px] text-muted">
          Need access? Contact{" "}
          <a href="mailto:ir@aurora-as.com" className="text-ink underline-offset-4 hover:underline">
            ir@aurora-as.com
          </a>
        </p>
      </section>
    </main>
  );
}
