"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { activeCompanies } from "@/lib/data/companies";
import { Button } from "@/components/ui/Button";
import { SectionIntro } from "@/components/ui/SectionIntro";

const featured = activeCompanies.slice(0, 7);

// Tilt per row: starts leaning left, then alternates right/left. Magnitudes are all
// different so each card looks distinct from the one before and the one before that.
const tilts = [-8, 6, -4, 9, -6, 3, -10];
const bounce = { type: "spring", stiffness: 320, damping: 14, mass: 0.8 } as const;

export function PortfolioList() {
  const [hover, setHover] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 22 });
  const sy = useSpring(y, { stiffness: 260, damping: 22 });
  const c = hover !== null ? featured[hover] : null;
  const tilt = hover !== null ? tilts[hover % tilts.length] : 0;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <SectionIntro
        eyebrow="Portfolio"
        title="Companies we build with."
        italicWords={["build"]}
        description="Thirteen businesses, each a leader in its niche. We hold significant stakes, sit on every board and stay for the long run."
        action={<Button href="/portfolio" variant="outline" size="sm">All companies</Button>}
      />

      <div
        className="relative mt-14 border-t border-ink/15"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - r.left);
          y.set(e.clientY - r.top);
        }}
        onMouseLeave={() => setHover(null)}
      >
        {featured.map((co, i) => (
          <Link
            key={co.slug}
            href={`/portfolio/${co.slug}`}
            onMouseEnter={() => setHover(i)}
            className="group relative grid grid-cols-[32px_1fr_24px] items-center gap-4 border-b border-ink/15 py-6 md:grid-cols-[48px_1.5fr_1fr_1fr_80px_24px] md:py-7"
          >
            <span className="eyebrow text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
            <span className="display flex items-center text-[28px] transition-[color,transform] duration-500 ease-apple group-hover:translate-x-2 md:text-[38px]">
              {co.name}
            </span>
            <span className="hidden text-[14px] text-ink-2 md:block">{co.sector}</span>
            <span className="hidden text-[14px] text-muted md:block">{co.hq}</span>
            <span className="eyebrow hidden text-[10px] text-muted md:block">Since {co.invested}</span>
            <ArrowUpRight className="h-5 w-5 text-muted transition-all duration-500 ease-apple group-hover:rotate-45 group-hover:text-ink" />
          </Link>
        ))}

        <motion.div style={{ x: sx, y: sy }} className="pointer-events-none absolute top-0 left-0 z-10 hidden md:block">
          <AnimatePresence>
            {c && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.7, rotate: tilt * 2.5, y: 24 }}
                animate={{ opacity: 1, scale: 1, rotate: tilt, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: tilt * 1.5, y: 12, transition: { duration: 0.2 } }}
                transition={{ ...bounce, opacity: { duration: 0.2 } }}
                style={{ transformOrigin: "50% 100%" }}
                className="-translate-x-1/2 -translate-y-[115%]"
              >
                <motion.div
                  layout
                  className="w-[260px] overflow-hidden rounded-[18px] p-5 text-white shadow-[0_30px_60px_-20px_rgba(35,29,58,0.5)]"
                  animate={{ background: `linear-gradient(135deg, ${c.colors[0]}, ${c.colors[1]})` }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="eyebrow text-[9px] text-white/70">
                    {c.ticker} · {c.stage}
                  </div>
                  <p className="mt-6 text-[15px] leading-snug">{c.tagline}</p>
                  <div className="mt-5 flex justify-between border-t border-white/20 pt-3 text-[12px] text-white/80">
                    <span>{c.employees.toLocaleString("en-US")} people</span>
                    <span className={c.change30d >= 0 ? "" : "opacity-80"}>
                      {c.change30d >= 0 ? "+" : ""}
                      {c.change30d.toFixed(1)}% 30d
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
