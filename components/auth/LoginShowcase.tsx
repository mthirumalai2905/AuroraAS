"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Trophy, TrendingUp } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Sparkline } from "@/components/ui/Sparkline";

const slices = [
  { pct: 30.55, color: "#231d3a" },
  { pct: 16.78, color: "#0a84ff" },
  { pct: 6.62, color: "#b7abe4" },
  { pct: 3.91, color: "#bfe3f5" },
  { pct: 42.14, color: "#dedbe6" },
];

const ease = [0.22, 1, 0.36, 1] as const;

function float(delay: number) {
  return {
    animate: { y: [0, -10, 0] },
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay },
  };
}

const glass = "rounded-[20px] border border-white/50 bg-white/70 text-ink shadow-[0_30px_60px_-30px_rgba(15,14,23,0.45)] backdrop-blur-xl";

export function LoginShowcase() {
  let acc = 0;
  return (
    <section className="hidden h-full min-h-0 p-3 lg:block">
      <div className="grain relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] p-8 text-white xl:p-10 short:p-6">
        <motion.div initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2.6, ease }} className="absolute inset-0">
          <Image src="/images/hero-sky.jpg" alt="" fill priority sizes="55vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-transparent to-night/70" />

        <Link href="/" className="relative">
          <Logo />
        </Link>

        <div className="relative mx-auto my-4 h-[clamp(250px,36vh,360px)] w-full max-w-[500px] short:my-2 short:scale-[0.92]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease }} className="absolute top-6 left-0 w-[290px]">
            <motion.div {...float(0)} className={`${glass} p-5`}>
              <div className="eyebrow text-[9.5px] text-muted">SEMANTIC AS · Aurora Equity</div>
              <div className="mt-4 flex items-center gap-5">
                <svg viewBox="0 0 42 42" className="h-24 w-24 -rotate-90">
                  {slices.map((s, i) => {
                    const el = (
                      <motion.circle
                        key={i}
                        cx="21"
                        cy="21"
                        r="15.9"
                        fill="none"
                        stroke={s.color}
                        strokeWidth="5"
                        strokeDashoffset={-acc}
                        initial={{ strokeDasharray: `0 100` }}
                        animate={{ strokeDasharray: `${s.pct - 0.6} ${100 - s.pct + 0.6}` }}
                        transition={{ duration: 1.2, delay: 0.7 + i * 0.12, ease }}
                      />
                    );
                    acc += s.pct;
                    return el;
                  })}
                </svg>
                <div>
                  <div className="display text-[40px] leading-none">30.55%</div>
                  <div className="mt-1 text-[12px] text-muted">Largest company stake</div>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#30a14e]/10 px-2 py-0.5 text-[11px] text-[#2b8a45]">
                    <TrendingUp className="h-3 w-3" /> Qualified stake
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease }} className="absolute top-0 right-0 w-[200px]">
            <motion.div {...float(1.2)} className={`${glass} p-5`}>
              <div className="flex items-center gap-2 text-[12px] text-ink-2">
                <Trophy className="h-3.5 w-3.5" /> Rank among companies
              </div>
              <div className="display mt-3 text-[48px] leading-none">#1</div>
              <div className="mt-1 text-[12px] text-muted">of 43 registered companies</div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7, ease }} className="absolute right-6 bottom-0 w-[310px]">
            <motion.div {...float(2.4)} className={`${glass} p-5`}>
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] text-ink-2">Share capital</span>
                <span className="text-[12px] text-[#2b8a45]">ordinary</span>
              </div>
              <div className="mt-1 text-[22px] font-semibold tracking-tight">30,000,000</div>
              <Sparkline data={[10, 12, 11, 14, 13, 16, 15, 18, 17, 21, 20, 24]} width={270} height={52} color="#231d3a" area className="mt-3" />
            </motion.div>
          </motion.div>
        </div>

        <div className="relative">
          <h2 className="display max-w-md text-[clamp(36px,4.2vh,52px)] leading-[1.02]">
            Your ownership, <span className="italic">illuminated.</span>
          </h2>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/75 short:mt-2 short:text-[13px]">
            A live shareholder register of Aurora Equity AS, with the real registered companies and every private holder on the
            book.
          </p>
        </div>
      </div>
    </section>
  );
}
