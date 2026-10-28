import type { Metadata } from "next";
import Image from "next/image";
import { Leaf, Scale, Sprout, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Counter } from "@/components/ui/Counter";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ClosingCTA } from "@/components/home/ClosingCTA";
import { esgMetrics, esgPillars } from "@/lib/data/site";

export const metadata: Metadata = { title: "Sustainability" };

const pillarIcons = [Leaf, Users, Scale, Sprout];

const roadmap = [
  { year: "2021", label: "Net-zero 2040 pledge", done: true },
  { year: "2023", label: "SBTi validation for 100% of portfolio", done: true },
  { year: "2025", label: "−30% portfolio emissions vs 2021", done: true },
  { year: "2030", label: "−55% portfolio emissions vs 2021", done: false },
  { year: "2040", label: "Net-zero portfolio", done: false },
];

export default function SustainabilityPage() {
  return (
    <>
      <PageHeader
        image="/images/card-turbine.jpg"
        eyebrow="Sustainability"
        title="Responsible by design, not by disclosure."
        italicWords={["design,"]}
        description="Sustainability is underwritten into every investment decision. It is how we manage risk, find opportunity and build companies that last."
      />

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {esgMetrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.08} className="border-b border-line py-9 sm:pr-8 lg:border-r lg:border-b-0 lg:px-8 lg:first:pl-0 lg:last:border-r-0">
              <div className="display text-[64px] leading-none">
                <Counter value={m.value} decimals={m.decimals ?? 0} suffix={m.suffix} />
              </div>
              <p className="mt-4 max-w-[230px] text-[14px] leading-relaxed text-ink-2">{m.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10 md:pb-32">
        <SectionIntro eyebrow="Our framework" title="Four pillars of stewardship." italicWords={["stewardship."]} />
        <Stagger className="mt-14 grid gap-3 md:grid-cols-2">
          {esgPillars.map((p, i) => {
            const Icon = pillarIcons[i];
            return (
              <StaggerItem key={p.title} className="h-full">
                <Card tone={i === 0 ? "plum" : "white"} className="flex h-full min-h-[280px] flex-col p-8 md:p-10">
                  <Icon className={i === 0 ? "h-7 w-7 text-lilac" : "h-7 w-7 text-plum"} strokeWidth={1.4} />
                  <h3 className="display mt-auto pt-12 text-[36px]">{p.title}</h3>
                  <p className={`mt-3 max-w-md text-[15px] leading-relaxed ${i === 0 ? "text-white/65" : "text-ink-2"}`}>{p.body}</p>
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 md:px-10 md:pb-32 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col">
          <SectionIntro align="stack" eyebrow="Net-zero roadmap" title="The road to 2040." italicWords={["2040."]} />
          <Reveal className="relative mt-10 hidden min-h-[280px] flex-1 overflow-hidden rounded-[22px] lg:block">
            <Image src="/images/card-grow.jpg" alt="" fill sizes="40vw" className="object-cover" />
          </Reveal>
        </div>
        <div className="border-t border-ink/15">
          {roadmap.map((r, i) => (
            <Reveal key={r.year} delay={i * 0.06}>
              <div className="flex items-center gap-6 border-b border-line py-7">
                <span className="display w-24 text-[44px] leading-none">{r.year}</span>
                <span className="flex-1 text-[17px]">{r.label}</span>
                <span className={`eyebrow rounded-full px-3 py-1.5 text-[9.5px] ${r.done ? "bg-plum text-white" : "border border-ink/15 text-muted"}`}>
                  {r.done ? "Achieved" : "Target"}
                </span>
              </div>
            </Reveal>
          ))}
          <Reveal className="mt-10">
            <Button href="/investors#reports" variant="outline">Read the 2025 report</Button>
          </Reveal>
        </div>
      </section>

      <ClosingCTA />
    </>
  );
}
