"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Reveal } from "@/components/ui/Reveal";
import { buildPath } from "@/components/ui/Sparkline";
import { funds } from "@/lib/data/site";

const years = Array.from({ length: 13 }, (_, i) => 2014 + i);
const aurora = [100, 121, 139, 168, 196, 214, 247, 312, 334, 371, 428, 486, 547];
const benchmark = [100, 108, 105, 119, 110, 129, 125, 146, 131, 147, 160, 171, 184];
const W = 800;
const H = 320;

export function Performance() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [hover, setHover] = useState<number | null>(null);

  const all = [...aurora, ...benchmark];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const withBounds = (arr: number[]) => [0, ...arr.map((v) => ((v - min) / (max - min)) * 100), 100];
  const a = buildPath(withBounds(aurora), W, H, 8);
  const b = buildPath(withBounds(benchmark), W, H, 8);
  const xFor = (i: number) => 8 + ((i + 1) * (W - 16)) / (aurora.length + 1);
  const yFor = (v: number) => 8 + (H - 16) * (1 - (v - min) / (max - min));
  const idx = hover ?? aurora.length - 1;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <SectionIntro
        eyebrow="Performance"
        title="5.5x value created in twelve years."
        italicWords={["5.5x"]}
        description="Growth of $100 invested across Aurora flagship funds, net of fees, against the MSCI Europe Total Return index."
      />

      <div ref={ref} className="mt-14 grid gap-3 lg:grid-cols-[1.65fr_1fr]">
        <div className="rounded-[24px] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <span className="eyebrow text-[10px] text-muted">Value of $100 · {years[idx]}</span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="display mt-2 text-[48px] leading-none"
                >
                  ${aurora[idx]}
                  <span className="ml-3 font-sans text-[14px] text-muted">vs ${benchmark[idx]} index</span>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="ml-auto flex items-center gap-5 text-[12px] text-ink-2">
              <span className="flex items-center gap-2"><span className="h-[3px] w-5 rounded-full bg-plum" />Aurora funds</span>
              <span className="flex items-center gap-2"><span className="w-5 border-t border-dashed border-muted" />MSCI Europe TR</span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mt-8 w-full cursor-crosshair"
            onMouseLeave={() => setHover(null)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - r.left) / r.width) * W;
              let best = 0;
              for (let i = 0; i < aurora.length; i++) if (Math.abs(xFor(i) - x) < Math.abs(xFor(best) - x)) best = i;
              setHover(best);
            }}
          >
            <defs>
              <linearGradient id="perf-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b7abe4" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#b7abe4" stopOpacity="0" />
              </linearGradient>
              <clipPath id="perf-clip">
                <rect x={xFor(0)} y="0" width={xFor(aurora.length - 1) - xFor(0)} height={H} />
              </clipPath>
            </defs>
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#ebe9f0" />
            ))}
            <g clipPath="url(#perf-clip)">
              <motion.path d={a.area} fill="url(#perf-area)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 1.2, delay: 1 }} />
              <motion.path
                d={b.line}
                fill="none"
                stroke="#6f6b7d"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.path
                d={a.line}
                fill="none"
                stroke="#231d3a"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
            </g>
            {hover !== null && (
              <g>
                <line x1={xFor(hover)} x2={xFor(hover)} y1="0" y2={H} stroke="#dedbe6" />
                <circle cx={xFor(hover)} cy={yFor(aurora[hover])} r="6" fill="#fff" stroke="#231d3a" strokeWidth="2.5" />
                <circle cx={xFor(hover)} cy={yFor(benchmark[hover])} r="4.5" fill="#fff" stroke="#6f6b7d" strokeWidth="2" />
              </g>
            )}
          </svg>
          <div className="relative mt-3 h-4 font-mono text-[10px] text-muted">
            {years.map((y, i) =>
              i % 2 === 0 ? (
                <span key={y} className="absolute -translate-x-1/2" style={{ left: `${(xFor(i) / W) * 100}%` }}>
                  {y}
                </span>
              ) : null,
            )}
          </div>
        </div>

        <Reveal delay={0.15} className="flex flex-col overflow-hidden rounded-[24px] bg-plum text-white">
          <div className="eyebrow border-b border-white/10 px-6 py-5 text-[10px] text-white/50">Fund track record</div>
          <table className="w-full text-[14px]">
            <thead>
              <tr className="text-left text-[11px] text-white/40">
                <th className="px-6 py-3 font-normal">Fund</th>
                <th className="px-3 py-3 text-right font-normal">Net IRR</th>
                <th className="px-6 py-3 text-right font-normal">TVPI</th>
              </tr>
            </thead>
            <tbody>
              {funds
                .filter((f) => f.irr > 0)
                .map((f) => (
                  <tr key={f.name} className="border-t border-white/[0.07] transition-colors hover:bg-white/[0.04]">
                    <td className="px-6 py-3.5">
                      <div>{f.name}</div>
                      <div className="text-[12px] text-white/40">
                        Vintage {f.vintage} · ${f.size}B
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-lilac">{f.irr.toFixed(1)}%</td>
                    <td className="px-6 py-3.5 text-right tabular-nums">{f.tvpi.toFixed(1)}x</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className="mt-auto px-6 py-5 text-[11px] leading-relaxed text-white/35">
            Past performance is not a reliable indicator of future results. Figures as of 30 Sep 2026.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
