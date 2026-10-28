"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import { Laurel } from "@/components/ui/Laurel";
import { AskAurora } from "@/components/home/AskAurora";

const ease = [0.22, 1, 0.36, 1] as const;

function FadeUp({ delay, children, className }: { delay: number; children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay, ease }} className={className}>
      {children}
    </motion.div>
  );
}

export function HomeHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  // Full-bleed at the top; eases into the inset, rounded card as you start scrolling.
  const inset = useTransform(scrollYProgress, [0, 0.28], [0, 12]);
  const radius = useTransform(scrollYProgress, [0, 0.28], [0, 32]);
  const clip = useMotionTemplate`inset(${inset}px round ${radius}px)`;

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[700px]">
      <motion.div style={{ clipPath: clip }} className="grain relative h-full overflow-hidden bg-night">
        <motion.div style={{ y: bgY }} className="absolute inset-0">
          <motion.div
            initial={{ scale: 1.14 }}
            animate={{ scale: 1.02 }}
            transition={{ duration: 2.8, ease }}
            className="absolute inset-0"
          >
            <Image src="/images/hero-sky.jpg" alt="" fill priority quality={90} sizes="100vw" className="object-cover object-[50%_65%]" />
          </motion.div>
        </motion.div>
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-night/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-night via-night/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(15,14,23,0.35))]" />

        <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative flex h-full flex-col items-center px-5 pt-[clamp(120px,18vh,180px)] text-center text-white">
          <FadeUp delay={0.2}>
            <span className="eyebrow inline-block rounded-md bg-sky px-2.5 py-1.5 text-[10px] text-plum">Fund VI · $8.5B · Closed at hard cap</span>
          </FadeUp>

          <AnimatedText
            text="Capital, illuminated"
            italicWords={["Capital"]}
            delay={0.35}
            className="display mt-7 justify-center text-[clamp(56px,9.5vw,132px)] leading-[0.95] tracking-[-0.03em]"
          />

          <FadeUp delay={0.7} className="mt-6 max-w-[440px] text-[15px] leading-relaxed">
            <p className="font-medium text-white">Aurora AS is a Nordic finance and equity group.</p>
            <p className="text-white/70">
              We invest in, build and steward thirteen companies across energy, technology, healthcare and infrastructure.
            </p>
          </FadeUp>

          <FadeUp delay={0.85} className="mt-8">
            <Button href="/portfolio" variant="light" size="sm">
              Explore the portfolio
            </Button>
          </FadeUp>

          <FadeUp delay={1} className="mt-12 w-full">
            <AskAurora />
            <p className="eyebrow mt-4 text-[10px] text-white/55">Ask anything. Find everything.</p>
          </FadeUp>

          <FadeUp delay={1.15} className="mt-8 flex items-center gap-8">
            <Laurel title="Nordic PE Awards" lines={["Firm of the year", "2025"]} />
            <Laurel title="Infrastructure Review" lines={["Transition investor", "2024"]} />
          </FadeUp>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 hidden items-end justify-between px-8 pb-7 text-white/55 md:flex">
          <span className="eyebrow text-[10px]">Oslo · Stockholm · Copenhagen · London · Singapore</span>
          <span className="eyebrow flex items-center gap-3 text-[10px]">
            Scroll
            <span className="relative h-8 w-px overflow-hidden bg-white/20">
              <motion.span
                className="absolute inset-x-0 top-0 h-3 bg-white"
                animate={{ y: [-12, 32] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </span>
        </div>
      </motion.div>
    </section>
  );
}
