"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { services } from "@/lib/data/site";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const DURATION = 7;

export function Capabilities() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const s = services[active];

  return (
    <section id="capabilities" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        <div className="flex flex-col">
          <Reveal>
            <span className="eyebrow text-muted">Aurora in action</span>
          </Reveal>
          <AnimatedText as="h2" inView text="What we do" className="display mt-5 text-[48px] md:text-[72px]" />
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-sm text-[16px] leading-relaxed text-ink-2">
              Six disciplines, one balance sheet. Every team shares the same long-term capital and the same operating bench.
            </p>
          </Reveal>

          <div className="mt-10 border-t border-line lg:mt-auto" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {services.map((svc, i) => {
              const on = i === active;
              return (
                <button
                  key={svc.slug}
                  onClick={() => setActive(i)}
                  className="group relative flex w-full items-center gap-5 border-b border-line py-4 text-left"
                >
                  <span className={cn("eyebrow w-6 text-[10px] transition-colors", on ? "text-ink" : "text-muted")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-[19px] tracking-tight transition-all duration-500 ease-apple",
                      on ? "translate-x-1 text-ink" : "text-ink/40 group-hover:text-ink/70",
                    )}
                  >
                    {svc.title}
                  </span>
                  <span className={cn("eyebrow text-[10px] transition-opacity duration-500", on ? "text-ink-2 opacity-100" : "opacity-0")}>
                    {svc.metric.value}
                  </span>
                  {on && (
                    <span className="absolute inset-x-0 -bottom-px h-px overflow-hidden">
                      <motion.span
                        key={`${active}-${paused}`}
                        className="block h-full origin-left bg-plum"
                        initial={{ scaleX: paused ? 1 : 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: paused ? 0 : DURATION, ease: "linear" }}
                        onAnimationComplete={() => !paused && setActive((a) => (a + 1) % services.length)}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="relative flex h-[620px] flex-col overflow-hidden rounded-[28px] bg-white p-3 shadow-[0_1px_0_rgba(22,20,31,0.04),0_30px_60px_-30px_rgba(35,29,58,0.18)]">
            <div className="relative px-5 pt-5 pb-7 md:px-7 md:pt-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={s.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="display text-[34px] md:text-[40px]">{s.title}</h3>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-2">{s.description}</p>
                  <div className="mt-5">
                    <TextLink href={`/services#${s.slug}`}>Learn more</TextLink>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-[20px] bg-lilac-3">
              <AnimatePresence initial={false}>
                <motion.div
                  key={s.image}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                {s.points.map((p) => (
                  <span key={`${s.slug}-${p}`} className="rounded-full bg-white/75 px-3 py-1.5 text-[12px] text-ink backdrop-blur-md">
                    {p}
                  </span>
                ))}
              </div>
              <div className="absolute top-4 right-4 rounded-2xl bg-white/80 px-4 py-3 text-right backdrop-blur-md">
                <div className="display text-[28px] leading-none">{s.metric.value}</div>
                <div className="eyebrow mt-1 text-[9px] text-muted">{s.metric.label}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
