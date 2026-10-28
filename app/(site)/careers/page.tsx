import type { Metadata } from "next";
import { ArrowUpRight, GraduationCap, HeartPulse, Plane, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ClosingCTA } from "@/components/home/ClosingCTA";
import { jobs } from "@/lib/data/site";

export const metadata: Metadata = { title: "Careers" };

const perks = [
  { icon: Sparkles, title: "Carried interest for all", body: "Every permanent employee participates in fund performance." },
  { icon: GraduationCap, title: "Aurora Academy", body: "A 12-month programme with INSEAD for every new joiner." },
  { icon: HeartPulse, title: "Whole-person health", body: "Private healthcare, mental health support and fitness stipends." },
  { icon: Plane, title: "Work across offices", body: "Rotations between Oslo, Stockholm, London and Singapore." },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        image="/images/card-grow.jpg"
        eyebrow="Careers"
        title="Do the best work of your career."
        italicWords={["best"]}
        description="We hire curious, humble and ambitious people — then give them real responsibility early. 380 colleagues, 31 nationalities, one partnership."
      >
        <div className="mt-8">
          <Button href="#openings">See open roles</Button>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <Stagger className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {perks.map((p, i) => (
            <StaggerItem key={p.title} className="h-full">
              <Card tone={i === 1 ? "plum" : "white"} className="flex h-full min-h-[260px] flex-col p-7">
                <p.icon className={i === 1 ? "h-6 w-6 text-lilac" : "h-6 w-6 text-plum"} strokeWidth={1.5} />
                <h3 className="mt-auto pt-10 text-[19px] font-medium tracking-tight">{p.title}</h3>
                <p className={`mt-2 text-[14px] leading-relaxed ${i === 1 ? "text-white/65" : "text-ink-2"}`}>{p.body}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section id="openings" className="mx-auto max-w-7xl scroll-mt-28 px-6 pb-24 md:px-10 md:pb-32">
        <SectionIntro eyebrow="Open roles" title={`${jobs.length} opportunities to join us.`} italicWords={["join"]} />
        <div className="mt-12 border-t border-ink/15">
          {jobs.map((j, i) => (
            <Reveal key={j.title} delay={i * 0.04}>
              <a href="/contact" className="group grid gap-2 border-b border-line py-7 md:grid-cols-[1fr_200px_170px_110px_28px] md:items-center">
                <span className="display text-[28px] transition-transform duration-500 ease-apple group-hover:translate-x-2 md:text-[34px]">{j.title}</span>
                <span className="text-[14px] text-ink-2">{j.team}</span>
                <span className="text-[14px] text-muted">{j.location}</span>
                <span className="eyebrow text-[10px] text-muted">{j.type}</span>
                <ArrowUpRight className="hidden h-5 w-5 text-muted transition-all duration-500 ease-apple group-hover:rotate-45 group-hover:text-ink md:block" />
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <ClosingCTA />
    </>
  );
}
