"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { companies, sectors } from "@/lib/data/companies";
import { cn } from "@/lib/utils";

const statuses = ["All", "Active", "Realised"] as const;

export function PortfolioGrid() {
  const [sector, setSector] = useState<string>("All");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [query, setQuery] = useState("");

  const list = useMemo(
    () =>
      companies.filter(
        (c) =>
          (sector === "All" || c.sector === sector) &&
          (status === "All" || c.status === status) &&
          (c.name + c.tagline + c.hq).toLowerCase().includes(query.toLowerCase()),
      ),
    [sector, status, query],
  );

  return (
    <section className="mx-auto max-w-7xl px-6 pb-28 md:px-10">
      <div className="sticky top-20 z-30 mb-10 flex flex-col gap-2 rounded-[22px] border border-line bg-paper/85 p-1.5 backdrop-blur-xl md:flex-row md:items-center">
        <div className="flex flex-1 gap-0.5 overflow-x-auto scrollbar-none">
          {["All", ...sectors].map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={cn("relative shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors", sector === s ? "text-white" : "text-ink-2 hover:text-ink")}
            >
              {sector === s && (
                <motion.span layoutId="sector-pill" className="absolute inset-0 rounded-full bg-plum" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <span className="relative">{s}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-paper-2 p-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn("relative rounded-full px-3 py-1.5 text-[12.5px] transition-colors", status === s ? "text-ink" : "text-muted")}
              >
                {status === s && <motion.span layoutId="status-pill" className="absolute inset-0 rounded-full bg-white shadow-sm" />}
                <span className="relative">{s}</span>
              </button>
            ))}
          </div>
          <label className="flex h-10 items-center gap-2 rounded-full bg-white px-4 ring-1 ring-line focus-within:ring-ink/30">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-28 bg-transparent text-[14px] placeholder:text-muted focus:outline-none"
            />
          </label>
        </div>
      </div>

      <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((c) => (
            <motion.div
              key={c.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/portfolio/${c.slug}`} className="group block h-full rounded-[24px] bg-white p-2.5 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(35,29,58,0.25)]">
                <div className="relative h-52 overflow-hidden rounded-[18px] bg-paper-2">
                  <div
                    className="absolute inset-0 transition-transform duration-[1.2s] ease-apple group-hover:scale-110"
                    style={{
                      background: `radial-gradient(90% 110% at 0% 0%, ${c.colors[0]}55, transparent 65%), radial-gradient(90% 110% at 100% 100%, ${c.colors[1]}55, transparent 65%)`,
                    }}
                  />
                  <span className="display absolute right-5 bottom-2 text-[96px] leading-none text-white/80 italic">{c.name[0]}</span>
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    <span className="eyebrow rounded-full bg-white/80 px-2.5 py-1 text-[9px] backdrop-blur">{c.sector}</span>
                    {c.status === "Realised" && <span className="eyebrow rounded-full bg-plum px-2.5 py-1 text-[9px] text-white">Realised</span>}
                  </div>
                  <span className="eyebrow absolute bottom-4 left-4 text-[10px] text-ink/60">{c.ticker}</span>
                  <span className="absolute top-4 right-4 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-white text-ink opacity-0 transition-all duration-500 ease-apple group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="px-3.5 pt-5 pb-3">
                  <h3 className="display text-[28px]">{c.name}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{c.tagline}</p>
                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-4 text-[12px]">
                    {[
                      ["HQ", c.hq.split(",")[0]],
                      ["Invested", c.invested],
                      ["Stage", c.stage],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div className="eyebrow text-[9px] text-muted">{l}</div>
                        <div className="mt-1 truncate">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="py-20 text-center text-muted">No companies match your filters.</p>}
    </section>
  );
}
