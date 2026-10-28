"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

type Props = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
};

export function Counter({ value, decimals = 0, prefix = "", suffix = "", duration = 2, className, format }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const from = useRef(0);

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const render = (n: number) =>
      format
        ? format(n)
        : prefix + n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    const controls = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = render(v);
      },
    });
    from.current = value;
    return () => controls.stop();
  }, [inView, value, decimals, prefix, suffix, duration, format]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format ? format(0) : `${prefix}${(0).toFixed(decimals)}${suffix}`}
    </span>
  );
}
