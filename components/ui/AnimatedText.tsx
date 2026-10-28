"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
  italicWords?: string[];
  inView?: boolean;
};

export function AnimatedText({ text, className, delay = 0, as = "h1", italicWords = [], inView = false }: Props) {
  const Tag = motion[as];
  const words = text.split(" ");
  const trigger = inView ? { whileInView: "show", viewport: { once: true, margin: "-60px" } } : { animate: "show" };

  return (
    <Tag
      className={cn("flex flex-wrap", className)}
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((word, i) => {
        const italic = italicWords.includes(word.replace(/[.,?]/g, ""));
        return (
          <span key={i} className="relative mr-[0.22em] inline-flex overflow-hidden pb-[0.1em] -mb-[0.1em] last:mr-0" aria-hidden>
            <motion.span
              className={cn("inline-block", italic && "italic")}
              variants={{
                hidden: { y: "105%" },
                show: { y: "0%", transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
