import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Approach } from "@/components/home/Approach";
import { ClosingCTA } from "@/components/home/ClosingCTA";
import { services } from "@/lib/data/site";

export const metadata: Metadata = { title: "Capabilities" };

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Capabilities"
        title="Every stage of capital, under one roof."
        italicWords={["Every"]}
        description="Private equity, growth, infrastructure, public markets, wealth and advisory: six integrated platforms sharing research, operators and a single long-term view."
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {services.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className="rounded-full border border-ink/12 px-3.5 py-1.5 text-[13px] text-ink-2 transition-colors duration-300 hover:border-ink/30 hover:bg-white hover:text-ink"
            >
              {s.title}
            </a>
          ))}
        </div>
      </PageHeader>

      <section className="mx-auto max-w-7xl space-y-3 px-6 pb-24 md:px-10">
        {services.map((s, i) => (
          <Reveal key={s.slug}>
            <article
              id={s.slug}
              className="grid scroll-mt-28 gap-3 rounded-[28px] bg-white p-3 lg:grid-cols-[1.2fr_1fr]"
            >
              <div className={`flex flex-col p-5 md:p-9 ${i % 2 ? "lg:order-2" : ""}`}>
                <span className="eyebrow text-[10px] text-muted">
                  {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                </span>
                <h2 className="display mt-5 text-[44px] md:text-[56px]">{s.title}</h2>
                <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-2">{s.description}</p>
                <ul className="mt-8 space-y-3">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-[15px]">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-lilac-3">
                        <Check className="h-3 w-3 text-plum" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-10">
                  <div>
                    <div className="display text-[48px] leading-none">{s.metric.value}</div>
                    <div className="eyebrow mt-2 text-[10px] text-muted">{s.metric.label}</div>
                  </div>
                  <Button href="/contact" variant="outline" size="sm">Enquire</Button>
                </div>
              </div>
              {s.image ? (
                <div className="relative min-h-[320px] overflow-hidden rounded-[20px] bg-lilac-3">
                  <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                </div>
              ) : (
                <div className="grain relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[20px] bg-gradient-to-br from-[#231d3a] via-[#2f2550] to-[#171326] p-8 text-white">
                  <svg viewBox="0 0 400 320" className="pointer-events-none absolute inset-0 h-full w-full opacity-25" fill="none">
                    <path d="M 30 260 C 120 240, 170 180, 230 130 C 290 80, 330 55, 380 40" stroke="#c7bdf2" strokeWidth="2" />
                    <path d="M 30 280 C 130 265, 190 215, 260 165 C 320 120, 350 95, 380 80" stroke="#bfe3f5" strokeWidth="1.25" strokeDasharray="4 6" />
                    <circle cx="230" cy="130" r="5" fill="#c7bdf2" />
                    <circle cx="380" cy="40" r="6" fill="#bfe3f5" />
                  </svg>
                  <div className="relative flex items-center justify-between">
                    <span className="eyebrow text-[9.5px] text-white/60">Minority growth mandate</span>
                    <span className="eyebrow rounded-full bg-white/10 px-3 py-1 text-[9px] text-lilac">$25M – $250M</span>
                  </div>
                  <div className="relative">
                    <div className="display text-[64px] leading-none text-lilac">{s.metric.value}</div>
                    <p className="mt-2 max-w-xs text-[14px] text-white/70">{s.summary}</p>
                  </div>
                </div>
              )}
            </article>
          </Reveal>
        ))}
      </section>

      <Approach />
      <ClosingCTA />
    </>
  );
}
