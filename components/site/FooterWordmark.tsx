"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const W = 1000;
const H = 300;
const BASELINE = 322;
const SIZE = 420;

export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const spot = useRef<SVGRadialGradientElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["45%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  const move = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    spot.current?.setAttribute("cx", String(((e.clientX - r.left) / r.width) * W));
    spot.current?.setAttribute("cy", String(((e.clientY - r.top) / r.height) * H));
  };

  const text = (fill: string, extra?: React.SVGProps<SVGTextElement>) => (
    <text
      x={W / 2}
      y={BASELINE}
      textAnchor="middle"
      fontSize={SIZE}
      fill={fill}
      style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.01em" }}
      {...extra}
    >
      Aurora
    </text>
  );

  return (
    <div ref={ref} className="pointer-events-none relative -mx-6 mt-16 select-none md:-mx-10" aria-hidden>
      <motion.svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ y, opacity }}
        className="pointer-events-auto block w-full"
        onMouseMove={move}
        onMouseLeave={() => spot.current?.setAttribute("cx", "-400")}
      >
        <defs>
          <linearGradient id="wm-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="75%" stopColor="#fff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wm-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.02" />
          </linearGradient>
          <radialGradient ref={spot} id="wm-spot" gradientUnits="userSpaceOnUse" cx="-400" cy="150" r="220">
            <stop offset="0%" stopColor="#d9d2f3" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#d9d2f3" stopOpacity="0" />
          </radialGradient>
        </defs>
        {text("url(#wm-fill)", { stroke: "url(#wm-stroke)", strokeWidth: 1, vectorEffect: "non-scaling-stroke" })}
        {text("url(#wm-spot)")}
      </motion.svg>
    </div>
  );
}
