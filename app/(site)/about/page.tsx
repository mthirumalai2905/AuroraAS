import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Card } from "@/components/ui/Card";
import { ClosingCTA } from "@/components/home/ClosingCTA";
import { team, timeline, values } from "@/lib/data/site";

export const metadata: Metadata = { title: "About" };

const portraitTones = ["#d9d2f3", "#cfe6f2", "#e6dff0", "#dfe7dc"];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        variant="full"
        image="/images/fjord.jpg"
        eyebrow="About Aurora AS"
        title="Patient capital, from the far north."
        italicWords={["Patient"]}
        description="Founded in Oslo in 1998, Aurora AS has grown from a single $120M fund into one of Northern Europe's leading finance and equity groups — $48.6B under management, 380 people, five offices."
      />

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <SectionIntro align="stack" eyebrow="Our story" title="Built by operators, for the long run." italicWords={["operators,"]} />
          <Reveal delay={0.15} className="space-y-6 text-[18px] leading-[1.6] text-ink-2 lg:pt-10">
            <p>
              Aurora was founded on a simple belief: the best returns come from building better companies, not from financial
              engineering. Our founders had run businesses themselves, and they wanted to invest the way they would want to be
              invested in.
            </p>
            <p>
              Twenty-seven years later, that belief still shapes everything we do. We hold companies for longer than most, we
              put operators on every deal team, and we open our books to stakeholders in real time.
            </p>
            <p>
              Our investors include sovereign wealth funds, pension plans, endowments and families across 24 countries. Their
              capital supports more than 41,000 people across our portfolio.
            </p>
          </Reveal>
        </div>

        <Stagger className="mt-20 grid gap-3 md:grid-cols-[1.4fr_1fr]">
          <StaggerItem>
            <div className="relative h-[420px] overflow-hidden rounded-[22px] bg-lilac-2">
              <Image src="/images/card-stones.jpg" alt="" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
              <p className="display absolute bottom-7 left-7 max-w-sm text-[30px] leading-tight">
                &ldquo;We measure ourselves in decades, not quarters.&rdquo;
              </p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <Card tone="plum" className="flex h-[420px] flex-col justify-between p-8">
              <span className="eyebrow text-[10px] text-white/50">Ownership</span>
              <div>
                <div className="display text-[80px] leading-none">100%</div>
                <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/65">
                  Partner-owned since day one. No outside shareholders, no pressure to sell before a company is ready.
                </p>
              </div>
            </Card>
          </StaggerItem>
        </Stagger>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10 md:pb-32">
        <SectionIntro eyebrow="Our values" title="What we stand for." italicWords={["stand"]} />
        <Stagger className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <StaggerItem key={v.title} className="h-full">
              <Card className="flex h-full min-h-[300px] flex-col p-7">
                <span className="display text-[44px] italic leading-none text-lilac">0{i + 1}</span>
                <h3 className="mt-auto pt-10 text-[20px] font-medium tracking-tight">{v.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{v.body}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10 md:pb-32">
        <SectionIntro eyebrow="Milestones" title="Twenty-seven years in six moments." italicWords={["six"]} />
        <Stagger className="mt-16 grid border-t border-ink/15 lg:grid-cols-6">
          {timeline.map((t, i) => (
            <StaggerItem key={t.year} className="relative border-b border-line py-8 lg:border-r lg:border-b-0 lg:px-5 lg:first:pl-0 lg:last:border-r-0">
              <span className={`absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full bg-plum ${i > 0 ? "lg:left-5" : ""}`} />
              <div className="display text-[44px] leading-none">{t.year}</div>
              <h3 className="mt-5 text-[15px] font-medium">{t.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">{t.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section id="leadership" className="mx-auto max-w-7xl scroll-mt-28 px-6 pb-24 md:px-10 md:pb-32">
        <SectionIntro
          eyebrow="Leadership"
          title="The people behind the capital."
          italicWords={["people"]}
          description="Our partnership blends investors, former CEOs, engineers and scientists — united by a commitment to stewardship."
        />
        <Stagger className="mt-14 grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m, i) => (
            <StaggerItem key={m.name} className="group">
              <div
                className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[22px]"
                style={{ background: portraitTones[i % portraitTones.length] }}
              >
                <span className="display text-[96px] italic text-plum/80 transition-transform duration-700 ease-apple group-hover:scale-110">
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <span className="eyebrow absolute bottom-4 left-4 rounded-full bg-white/70 px-3 py-1.5 text-[9px] backdrop-blur">{m.office}</span>
              </div>
              <h3 className="mt-5 text-[18px] font-medium tracking-tight">{m.name}</h3>
              <p className="eyebrow mt-1 text-[10px] text-muted">{m.role}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{m.bio}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <ClosingCTA />
    </>
  );
}
