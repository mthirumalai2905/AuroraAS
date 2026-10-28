"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { approachSteps } from "@/lib/data/site";

export function Approach() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionIntro
            align="stack"
            eyebrow="Our approach"
            title="A process refined over 27 years."
            italicWords={["refined"]}
            description="Disciplined at entry, hands-on during ownership and thoughtful at exit. Our process is built to compound value — and trust."
          />
        </div>
        <div ref={ref} className="relative pl-12">
          <div className="absolute top-2 bottom-2 left-[7px] w-px bg-line" />
          <motion.div style={{ height }} className="absolute top-2 left-[7px] w-px bg-plum" />
          <div className="space-y-20">
            {approachSteps.map((s, i) => (
              <Step key={s.title} index={i} total={approachSteps.length} progress={scrollYProgress} title={s.title} body={s.body} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ index, total, progress, title, body }: { index: number; total: number; progress: MotionValue<number>; title: string; body: string }) {
  const start = index / total;
  const opacity = useTransform(progress, [start - 0.1, start + 0.05], [0.3, 1]);
  const dotScale = useTransform(progress, [start - 0.05, start + 0.05], [0.6, 1]);
  const dotBg = useTransform(progress, [start - 0.05, start + 0.05], ["#dedbe6", "#231d3a"]);

  return (
    <motion.div style={{ opacity }} className="relative">
      <motion.span style={{ scale: dotScale, backgroundColor: dotBg }} className="absolute top-2 -left-12 h-[15px] w-[15px] rounded-full ring-4 ring-paper" />
      <span className="eyebrow text-[10px] text-muted">Step 0{index + 1}</span>
      <h3 className="display mt-3 text-[36px] md:text-[44px]">{title}</h3>
      <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-ink-2">{body}</p>
    </motion.div>
  );
}
