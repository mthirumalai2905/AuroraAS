import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginShowcase } from "@/components/auth/LoginShowcase";
import { Logo } from "@/components/ui/Logo";

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid h-dvh overflow-hidden bg-paper lg:grid-cols-[1.1fr_1fr]">
      <LoginShowcase />
      <section className="relative flex h-full min-h-0 flex-col overflow-y-auto px-6 py-6 md:px-12 lg:px-14 scrollbar-none short:py-4">
        <div className="flex shrink-0 items-center justify-between">
          <Link href="/" className="lg:invisible">
            <Logo />
          </Link>
          <Link href="/" className="eyebrow inline-flex items-center gap-2 text-[10px] text-ink-2 transition-colors hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-4 short:py-2">{children}</div>
        <p className="shrink-0 text-center text-[12px] text-muted">
          Need access? Contact{" "}
          <a href="mailto:ir@aurora-as.com" className="text-ink underline-offset-4 hover:underline">
            ir@aurora-as.com
          </a>
        </p>
      </section>
    </main>
  );
}
