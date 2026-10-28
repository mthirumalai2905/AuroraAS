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
        image="/images/card-prism.jpg"
        eyebrow="Capabilities"
        title="Every stage of capital, under one roof."
        italicWords={["Every"]}
        description="Private equity, growth, infrastructure, public markets, wealth and advisory — six integrated platforms sharing research, operators and a single long-term view."
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
              <div className="relative min-h-[320px] overflow-hidden rounded-[20px] bg-lilac-3">
                <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <Approach />
      <ClosingCTA />
    </>
  );
}
