"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  italicWords?: string[];
  description: string;
  image?: string;
  variant?: "split" | "full" | "editorial";
  children?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, italicWords, description, image, variant = image ? "split" : "editorial", children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  if (variant === "full" && image) {
    return (
      <section ref={ref} className="p-2 md:p-3">
        <div className="relative flex min-h-[78svh] items-end overflow-hidden rounded-[24px] md:rounded-[32px]">
          <motion.div style={{ y }} className="absolute inset-0 scale-110">
            <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/20 to-night/30" />
          <div className="relative mx-auto w-full max-w-7xl px-6 pb-14 pt-40 text-white md:px-10 md:pb-20">
            <Reveal>
              <span className="eyebrow text-white/70">{eyebrow}</span>
            </Reveal>
            <AnimatedText text={title} italicWords={italicWords} delay={0.1} className="display mt-5 max-w-4xl text-[52px] md:text-[96px]" />
            <Reveal delay={0.35}>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/75">{description}</p>
            </Reveal>
            {children && <Reveal delay={0.45}>{children}</Reveal>}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "editorial" || !image) {
    return (
      <section ref={ref} className="mx-auto max-w-7xl px-6 pt-32 pb-16 md:px-10 md:pt-40 md:pb-20">
        <div className="grid items-end gap-8 border-b border-line pb-14 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div>
            <Reveal>
              <span className="eyebrow text-muted">{eyebrow}</span>
            </Reveal>
            <AnimatedText text={title} italicWords={italicWords} delay={0.1} className="display mt-5 text-[52px] md:text-[84px]" />
          </div>
          <div className="lg:pb-2">
            <Reveal delay={0.25}>
              <p className="max-w-lg text-[17px] leading-relaxed text-ink-2">{description}</p>
            </Reveal>
          </div>
        </div>
        {children && <Reveal delay={0.35}>{children}</Reveal>}
      </section>
    );
  }

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-6 pt-32 pb-16 md:px-10 md:pt-40 md:pb-24">
      <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <Reveal>
            <span className="eyebrow text-muted">{eyebrow}</span>
          </Reveal>
          <AnimatedText text={title} italicWords={italicWords} delay={0.1} className="display mt-5 text-[52px] md:text-[84px]" />
          <Reveal delay={0.3}>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-muted">{description}</p>
          </Reveal>
          {children && <Reveal delay={0.4}>{children}</Reveal>}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className={cn("relative aspect-[5/4] overflow-hidden rounded-[24px] bg-lilac-2")}
        >
          <motion.div style={{ y }} className="absolute inset-0 scale-110">
            <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
