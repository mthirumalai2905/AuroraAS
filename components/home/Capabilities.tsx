"use client";

import { Landmark, Layers, Handshake, Shield, TrendingUp, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { services, type Service } from "@/lib/data/site";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const DURATION = 7;

const icons: Record<Service["icon"], typeof Landmark> = {
  landmark: Landmark,
  "trending-up": TrendingUp,
  zap: Zap,
  layers: Layers,
  shield: Shield,
  handshake: Handshake,
};

const cardThemes = [
  { bg: "from-[#231d3a] via-[#2e254b] to-[#171326]", text: "text-white", sub: "text-white/65", chip: "bg-white/10 text-white border border-white/15", badge: "bg-white/10 text-white border border-white/15", accent: "#c7bdf2" },
  { bg: "from-[#d8d0f2] via-[#e5dff7] to-[#cfc5ee]", text: "text-plum", sub: "text-plum/70", chip: "bg-white/80 text-plum", badge: "bg-white/85 text-plum", accent: "#231d3a" },
  { bg: "from-[#c7e2f2] via-[#d9edf8] to-[#b8d8ec]", text: "text-plum", sub: "text-plum/70", chip: "bg-white/80 text-plum", badge: "bg-white/85 text-plum", accent: "#1b3649" },
  { bg: "from-[#1c2333] via-[#242e42] to-[#141926]", text: "text-white", sub: "text-white/65", chip: "bg-white/10 text-white border border-white/15", badge: "bg-white/10 text-white border border-white/15", accent: "#bfe3f5" },
  { bg: "from-[#e6e1d6] via-[#efeae0] to-[#dad3c5]", text: "text-ink", sub: "text-ink-2", chip: "bg-white/80 text-ink", badge: "bg-white/85 text-ink", accent: "#231d3a" },
  { bg: "from-[#2c223c] via-[#3a2d4f] to-[#1e1729]", text: "text-white", sub: "text-white/65", chip: "bg-white/10 text-white border border-white/15", badge: "bg-white/10 text-white border border-white/15", accent: "#d8d0f2" },
];

export function Capabilities() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const s = services[active];
  const theme = cardThemes[active % cardThemes.length];
  const Icon = icons[s.icon];

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
                  key={s.slug}
                  className={cn("grain absolute inset-0 bg-gradient-to-br p-6 md:p-8", theme.bg, theme.text)}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <svg viewBox="0 0 600 320" className="pointer-events-none absolute inset-0 h-full w-full opacity-25" fill="none">
                    <circle cx="480" cy="160" r="190" stroke={theme.accent} strokeWidth="1" />
                    <circle cx="480" cy="160" r="130" stroke={theme.accent} strokeWidth="1" strokeDasharray="4 6" />
                    <circle cx="480" cy="160" r="70" stroke={theme.accent} strokeWidth="1" />
                    <line x1="0" y1="160" x2="600" y2="160" stroke={theme.accent} strokeWidth="0.75" strokeOpacity="0.5" />
                    <line x1="480" y1="0" x2="480" y2="320" stroke={theme.accent} strokeWidth="0.75" strokeOpacity="0.5" />
                  </svg>

                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <span className={cn("grid h-12 w-12 place-items-center rounded-2xl backdrop-blur-md", theme.badge)}>
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <div className={cn("rounded-2xl px-4 py-3 text-right backdrop-blur-md", theme.badge)}>
                        <div className="display text-[32px] leading-none">{s.metric.value}</div>
                        <div className={cn("eyebrow mt-1 text-[9px]", theme.sub)}>{s.metric.label}</div>
                      </div>
                    </div>

                    <div className="my-auto max-w-sm">
                      <div className={cn("eyebrow text-[9.5px]", theme.sub)}>
                        Mandate 0{active + 1} · {s.title}
                      </div>
                      <p className="display mt-2 text-[28px] leading-[1.12] md:text-[32px]">{s.summary}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {s.points.map((p) => (
                        <span key={`${s.slug}-${p}`} className={cn("rounded-full px-3.5 py-1.5 text-[12px] backdrop-blur-md", theme.chip)}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
