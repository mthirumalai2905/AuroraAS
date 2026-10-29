import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { FooterWordmark } from "@/components/site/FooterWordmark";
import { offices } from "@/lib/data/site";

const columns = [
  {
    title: "Firm",
    links: [
      { href: "/about", label: "About us" },
      { href: "/about#leadership", label: "Leadership" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Capabilities",
    links: [
      { href: "/services", label: "What we do" },
      { href: "/portfolio", label: "Portfolio" },
      { href: "/sustainability", label: "Sustainability" },
      { href: "/insights", label: "Insights" },
    ],
  },
  {
    title: "Investors",
    links: [
      { href: "/investors", label: "Investor relations" },
      { href: "/investors#reports", label: "Reports" },
      { href: "/investors#calendar", label: "Financial calendar" },
      { href: "/login", label: "Stakeholder portal" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="p-2 md:p-3">
      <div className="relative overflow-hidden rounded-[24px] bg-night px-6 pt-16 text-white md:rounded-[32px] md:px-10 md:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[1.3fr_2fr]">
            <div>
              <h2 className="display max-w-sm text-[44px] md:text-[56px]">
                Notes from the <span className="italic">investment floor.</span>
              </h2>
              <p className="mt-4 max-w-sm text-[15px] text-white/55">Quarterly letters, market outlooks and portfolio news. No noise.</p>
              <form className="mt-8 flex max-w-sm items-center gap-2 rounded-full border border-white/15 p-1.5 pl-5 transition-colors focus-within:border-white/40">
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="min-w-0 flex-1 bg-transparent text-[14px] placeholder:text-white/35 focus:outline-none"
                />
                <button className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink transition-transform active:scale-95">
                  Subscribe <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              {columns.map((col) => (
                <div key={col.title}>
                  <h4 className="eyebrow text-white/40">{col.title}</h4>
                  <ul className="mt-6 space-y-3.5">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-[15px] text-white/75 transition-colors hover:text-white">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3 lg:grid-cols-5">
            {offices.map((o) => (
              <div key={o.city}>
                <div className="eyebrow text-white/40">{o.role}</div>
                <div className="mt-3 text-[15px] text-white">{o.city}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-white/45">{o.address}</div>
              </div>
            ))}
          </div>

          <div className="mt-20 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-[12px] text-white/40 md:flex-row md:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Logo className="text-white/80" />
              <p>© 2026 Aurora Equity · Org. no. 912 345 678 · Authorised by Finanstilsynet</p>
            </div>
            <div className="flex gap-6">
              <Link href="/legal" className="hover:text-white">Privacy</Link>
              <Link href="/legal#disclaimer" className="hover:text-white">Disclaimer</Link>
              <Link href="/legal#cookies" className="hover:text-white">Cookies</Link>
            </div>
          </div>
        </div>
        <FooterWordmark />
      </div>
    </footer>
  );
}
