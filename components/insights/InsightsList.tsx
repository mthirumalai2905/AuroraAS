"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { categoryImage, insights } from "@/lib/data/site";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

const categories = ["All", ...Array.from(new Set(insights.map((i) => i.category)))];

export function InsightsList() {
  const [cat, setCat] = useState("All");
  const list = insights.filter((i) => cat === "All" || i.category === cat);
  const [lead, ...rest] = list;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-28 md:px-10">
      <div className="mb-10 flex gap-0.5 overflow-x-auto border-b border-line scrollbar-none">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn("eyebrow relative shrink-0 px-4 pt-2 pb-4 text-[10.5px] transition-colors", cat === c ? "text-ink" : "text-muted hover:text-ink")}
          >
            {c}
            {cat === c && <motion.span layoutId="insight-tab" className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-plum" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={cat}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {lead && (
            <Link href={`/insights/${lead.slug}`} className="group mb-14 grid gap-3 rounded-[28px] bg-white p-3 lg:grid-cols-[1.2fr_1fr]">
              <div className="relative min-h-80 overflow-hidden rounded-[20px] bg-lilac-3">
                <Image
                  src={categoryImage[lead.category]}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover transition-transform duration-[1.4s] ease-apple group-hover:scale-105"
                />
                <span className="eyebrow absolute top-5 left-5 rounded-full bg-white px-3 py-1.5 text-[9.5px]">Featured</span>
              </div>
              <div className="flex flex-col justify-center p-5 md:p-10">
                <span className="eyebrow text-[10px] text-muted">{lead.category}</span>
                <h2 className="display mt-4 text-[36px] leading-[1.08] md:text-[48px]">{lead.title}</h2>
                <p className="mt-5 text-[16px] leading-relaxed text-ink-2">{lead.excerpt}</p>
                <div className="mt-8 flex items-center gap-3 text-[13px] text-muted">
                  {lead.author} · {fmt.date(lead.date)} · {lead.readTime} min
                  <ArrowUpRight className="ml-auto h-5 w-5 text-ink transition-transform duration-500 group-hover:rotate-45" />
                </div>
              </div>
            </Link>
          )}
          <div className="grid gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <Link key={a.slug} href={`/insights/${a.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-lilac-3">
                  <Image
                    src={categoryImage[a.category]}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-[1.2s] ease-apple group-hover:scale-105"
                  />
                </div>
                <div className="eyebrow mt-5 flex justify-between text-[10px] text-muted">
                  <span>{a.category}</span>
                  <span>{a.readTime} min</span>
                </div>
                <h3 className="display mt-3 text-[26px] leading-[1.12]">{a.title}</h3>
                <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-ink-2">{a.excerpt}</p>
                <div className="mt-4 text-[13px] text-muted">
                  {a.author} · {fmt.date(a.date)}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
