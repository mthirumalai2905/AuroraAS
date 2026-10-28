"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { PortalPreview } from "@/components/home/PortalPreview";

const features = [
  ["Live register", "Positions reconcile nightly with the central securities depository — no spreadsheets emailed around."],
  ["Competitive view", "See how your stake compares with every disclosed holder above the 1% threshold."],
  ["Spreadsheet-native", "Select ranges, sort, filter and export. It behaves the way your analysts already work."],
];

export function PortalSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);

  return (
    <section className="p-2 md:p-3">
      <div className="grain relative overflow-hidden rounded-[24px] bg-night px-6 py-24 text-white md:rounded-[32px] md:px-10 md:py-32">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-lilac/15 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">
          <SectionIntro
            align="center"
            tone="white"
            eyebrow="Stakeholder portal"
            title="See your ownership, clearly."
            italicWords={["clearly"]}
            description="Every stakeholder gets a private, real-time view of their positions across the Aurora portfolio — and how they stack up against other major holders."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button href="/login" variant="light">Open the portal</Button>
                <Button href="/investors" variant="glass">Investor relations</Button>
              </div>
            }
          />

          <div ref={ref} className="mt-16 [perspective:1600px] md:mt-20">
            <motion.div style={{ rotateX, scale, y, transformOrigin: "50% 0%" }}>
              <PortalPreview />
            </motion.div>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {features.map(([t, b], i) => (
              <Reveal key={t} delay={i * 0.08} className="border-t border-white/15 pt-6">
                <span className="eyebrow text-[10px] text-white/45">0{i + 1}</span>
                <h3 className="mt-3 text-[19px] font-medium tracking-tight">{t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/55">{b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
