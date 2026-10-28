import Image from "next/image";
import { Circle, Diamond, Hexagon, Mountain, Sun, Triangle, Waves } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";

const backers = [
  { name: "NORDVIK PENSJON", icon: Circle, className: "font-mono text-[13px] font-semibold tracking-[0.18em]" },
  { name: "Helios Endowment", icon: Sun, className: "display text-[22px] italic" },
  { name: "KVARTS", icon: Hexagon, className: "text-[17px] font-black tracking-[0.3em]" },
  { name: "Fjell & Co.", icon: Mountain, className: "display text-[22px]" },
  { name: "Meridian Life", icon: Diamond, className: "text-[16px] font-semibold tracking-tight" },
  { name: "Østhav Foundation", icon: Waves, className: "text-[16px] font-light tracking-wide" },
  { name: "ARKTIS SOVEREIGN", icon: Triangle, className: "font-mono text-[12px] tracking-[0.22em]" },
];

export function Intro() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-24 pb-10 md:px-10 md:pt-36">
      <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-start">
        <div>
          <AnimatedText as="h2" inView text="What is Aurora AS?" className="display text-[48px] md:text-[72px]" />
          <Reveal delay={0.2} className="mt-6">
            <Button href="/about" size="sm">Our story</Button>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <p className="max-w-md text-[19px] leading-[1.5] text-ink-2 md:mt-3">
            Aurora AS is a Nordic investment group that owns and grows businesses for the long term, combining private equity
            discipline with the patience of a family office.
          </p>
        </Reveal>
      </div>

      <Stagger className="mt-14 grid gap-3 lg:grid-cols-[1.7fr_1fr_1fr]">
        <StaggerItem>
          <div className="group relative h-[360px] overflow-hidden rounded-[22px] bg-lilac-2">
            <Image
              src="/images/card-grow.jpg"
              alt="A flower growing through a stone"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[70%_50%] transition-transform duration-[1.6s] ease-apple group-hover:scale-[1.04]"
            />
            <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-[#bfb8d8] via-[#bfb8d8]/75 to-transparent" />
            <div className="relative flex h-full flex-col justify-between p-7">
              <h3 className="text-[24px] font-medium tracking-tight">Capital that grows</h3>
              <p className="max-w-[250px] text-[14px] leading-relaxed text-ink-2">
                We reinvest alongside our companies year after year, compounding value instead of chasing exits.
              </p>
            </div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <PlumCard title="Patient by design" stat="11.4 yrs" body="Average holding period, roughly twice the industry norm." />
        </StaggerItem>
        <StaggerItem>
          <PlumCard title="Operators, not spectators" stat="40" body="Operating partners working inside our companies from day one." />
        </StaggerItem>
      </Stagger>

      <Reveal className="mt-14 flex flex-col items-center gap-6 md:flex-row md:gap-10">
        <p className="max-w-[190px] shrink-0 text-center text-[12px] leading-snug text-muted md:text-left">
          Backed by pension funds, endowments and families in 24 countries
        </p>
        <Marquee className="w-full">
          {backers.map((b) => (
            <span key={b.name} className="mx-9 flex shrink-0 items-center gap-2 text-ink/55">
              <b.icon className="h-4 w-4" strokeWidth={1.8} />
              <span className={b.className}>{b.name}</span>
            </span>
          ))}
        </Marquee>
      </Reveal>
    </section>
  );
}

function PlumCard({ title, stat, body }: { title: string; stat: string; body: string }) {
  return (
    <div className="flex h-[360px] flex-col justify-between rounded-[22px] bg-plum p-7 text-white transition-transform duration-500 ease-apple hover:-translate-y-1">
      <h3 className="max-w-[180px] text-[24px] font-medium leading-tight tracking-tight">{title}</h3>
      <div>
        <div className="display text-[64px] leading-none">{stat}</div>
        <p className="mt-3 max-w-[220px] text-[14px] leading-relaxed text-white/60">{body}</p>
      </div>
    </div>
  );
}
