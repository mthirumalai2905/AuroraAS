import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Sparkline } from "@/components/ui/Sparkline";
import { Button } from "@/components/ui/Button";
import { companies, getCompany, priceHistory } from "@/lib/data/companies";
import { fmt } from "@/lib/format";

export function generateStaticParams() {
  return companies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCompany(slug);
  return { title: c?.name ?? "Portfolio company" };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCompany(slug);
  if (!c) notFound();

  const idx = companies.findIndex((x) => x.slug === c.slug);
  const next = companies[(idx + 1) % companies.length];
  const history = priceHistory(c, 36);
  const marketCap = c.sharesOutstanding * c.price;

  const facts = [
    { label: "Headquarters", value: c.hq },
    { label: "Founded", value: String(c.founded) },
    { label: "Aurora invested", value: String(c.invested) },
    { label: "Chief Executive", value: c.ceo },
    { label: "Employees", value: fmt.int(c.employees) },
    { label: "Revenue (LTM)", value: `$${fmt.int(c.revenue)}M` },
    { label: "EBITDA margin", value: `${c.ebitdaMargin}%` },
    { label: "Equity value", value: fmt.usdCompact(marketCap) },
  ];

  return (
    <>
      <section className="p-2 md:p-3">
        <div
          className="relative overflow-hidden rounded-[24px] px-6 pt-36 pb-16 md:rounded-[32px] md:px-10 md:pt-44 md:pb-20"
          style={{
            background: `radial-gradient(70% 90% at 0% 0%, ${c.colors[0]}40, transparent 70%), radial-gradient(60% 90% at 100% 100%, ${c.colors[1]}40, transparent 70%), #ebe9f0`,
          }}
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <Link href="/portfolio" className="eyebrow inline-flex items-center gap-2 text-[10px] text-ink-2 transition-colors hover:text-ink">
                <ArrowLeft className="h-3.5 w-3.5" /> All companies
              </Link>
            </Reveal>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              {[c.sector, c.stage, c.ticker].map((t) => (
                <span key={t} className="eyebrow rounded-full bg-white/70 px-3 py-1.5 text-[9.5px] backdrop-blur">
                  {t}
                </span>
              ))}
              {c.status === "Realised" && <span className="eyebrow rounded-full bg-plum px-3 py-1.5 text-[9.5px] text-white">Realised</span>}
            </div>
            <AnimatedText text={c.name} className="display mt-7 text-[60px] md:text-[120px]" />
            <Reveal delay={0.3}>
              <p className="mt-5 max-w-2xl text-[20px] leading-relaxed text-ink-2">{c.tagline}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-6 pt-12 pb-16 md:px-10 lg:grid-cols-[1.5fr_1fr]">
        <Reveal className="rounded-[24px] bg-white p-7 md:p-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="eyebrow text-[10px] text-muted">Indicative share price · USD</div>
              <div className="display mt-2 text-[52px] leading-none">{fmt.usd2(c.price)}</div>
            </div>
            <span className={`rounded-full px-3 py-1 text-[13px] ${c.change30d >= 0 ? "bg-[#30a14e]/10 text-[#2b8a45]" : "bg-[#e5484d]/10 text-[#c9353a]"}`}>
              {fmt.signedPct(c.change30d)} · 30D
            </span>
          </div>
          <Sparkline data={history} width={720} height={220} color="#231d3a" area strokeWidth={2} className="mt-8 h-auto w-full" />
        </Reveal>
        <Reveal delay={0.1} className="rounded-[24px] bg-plum p-7 text-white md:p-8">
          <h2 className="eyebrow text-[10px] text-white/50">Key facts</h2>
          <dl className="mt-5 divide-y divide-white/10">
            {facts.map((f) => (
              <div key={f.label} className="flex justify-between gap-4 py-3 text-[14.5px]">
                <dt className="text-white/50">{f.label}</dt>
                <dd className="text-right">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <AnimatedText as="h2" inView text="The investment story" italicWords={["investment"]} className="display text-[44px] md:text-[64px]" />
          <Reveal delay={0.15}>
            <p className="text-[20px] leading-[1.6] text-ink-2">{c.description}</p>
          </Reveal>
        </div>
        <Stagger className="mt-16 grid gap-3 md:grid-cols-3">
          {c.highlights.map((h, i) => (
            <StaggerItem key={h}>
              <div className="flex h-full min-h-[220px] flex-col rounded-[22px] bg-white p-7">
                <span className="display text-[40px] italic leading-none text-lilac">0{i + 1}</span>
                <p className="mt-auto pt-8 text-[19px] font-medium leading-snug tracking-tight">{h}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 rounded-[24px] bg-lilac-3 p-7 md:flex-row md:items-center md:p-10">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white">
                <Lock className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[20px] font-medium tracking-tight">Are you a {c.name} stakeholder?</h3>
                <p className="text-ink-2">See your shares and how you compare to other major holders.</p>
              </div>
            </div>
            <Button href="/login">Open your register</Button>
          </div>
        </Reveal>

        <Link href={`/portfolio/${next.slug}`} className="group mt-16 flex items-center justify-between border-t border-ink/15 pt-10">
          <div>
            <div className="eyebrow text-[10px] text-muted">Next company</div>
            <div className="display mt-3 text-[44px] transition-transform duration-500 ease-apple group-hover:translate-x-2 md:text-[72px]">{next.name}</div>
          </div>
          <span className="grid h-14 w-14 place-items-center rounded-full border border-ink/15 transition-all duration-500 ease-apple group-hover:bg-plum group-hover:text-white">
            <ArrowRight className="h-5 w-5" />
          </span>
        </Link>
      </section>
    </>
  );
}
