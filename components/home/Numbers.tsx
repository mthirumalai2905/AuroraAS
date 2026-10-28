import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { headlineStats } from "@/lib/data/site";

const notes = [
  "Across buyout, growth, infrastructure and liquid strategies.",
  "Realised and unrealised, across six flagship funds.",
  "Employing more than 41,000 people in 19 countries.",
  "Founded in Oslo in 1999 by three operators.",
];

export function Numbers() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10 md:pb-32">
      <div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
        {headlineStats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.08}
            className="border-b border-line py-9 sm:pr-8 lg:border-r lg:border-b-0 lg:px-8 lg:first:pl-0 lg:last:border-r-0"
          >
            <span className="eyebrow text-[10px] text-muted">{s.label}</span>
            <div className="display mt-6 text-[64px] leading-none md:text-[76px]">
              <Counter value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
            </div>
            <p className="mt-4 max-w-[230px] text-[14px] leading-relaxed text-ink-2">{notes[i]}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
