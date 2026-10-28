"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowUpRight, Trophy, X } from "lucide-react";
import { Sparkline } from "@/components/ui/Sparkline";
import { rivalIds, type Holder, type HolderId, type RegisterRow } from "@/lib/data/register";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CompanyDrawer({ row, holders, onClose }: { row: RegisterRow | null; holders: Holder[]; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {row && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          />
          <motion.aside
            key="panel"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed inset-y-2 right-2 z-50 flex w-[min(440px,calc(100vw-16px))] flex-col overflow-hidden rounded-[22px] border border-black/[0.06] bg-white/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          >
            <DrawerBody row={row} holders={holders} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerBody({ row, holders, onClose }: { row: RegisterRow; holders: Holder[]; onClose: () => void }) {
  const c = row.company;
  const [hover, setHover] = useState<HolderId | null>(null);
  const contenders = (["you", ...rivalIds] as HolderId[]).sort((a, b) => row.shares[b] - row.shares[a]);
  const byId = Object.fromEntries(holders.map((h) => [h.id, h])) as Record<HolderId, Holder>;
  const gap = row.pct.you - row.largestRival.pct;

  let acc = 0;
  const R = 15.915;

  return (
    <>
      <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4">
        <span className="h-10 w-10 rounded-xl" style={{ background: `linear-gradient(135deg, ${c.colors[0]}, ${c.colors[1]})` }} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-semibold text-neutral-900">{c.name}</div>
          <div className="text-[12px] text-neutral-500">
            {c.ticker} · {c.sector} · {c.hq}
          </div>
        </div>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-black/[0.05] text-neutral-500 transition-colors hover:bg-black/[0.1]" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin">
        <section className="rounded-2xl bg-[#f5f5f7] p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[12px] text-neutral-500">Share price</div>
              <div className="text-2xl font-semibold tracking-tight text-neutral-900">{fmt.usd2(c.price)}</div>
            </div>
            <span className={cn("rounded-md px-2 py-0.5 text-[12px] font-medium", c.change30d >= 0 ? "bg-[#30d158]/15 text-[#248a3d]" : "bg-[#ff3b30]/10 text-[#d70015]")}>
              {fmt.signedPct(c.change30d)} 30D
            </span>
          </div>
          <Sparkline data={row.history} width={380} height={90} color={c.change30d >= 0 ? "#30d158" : "#ff453a"} area strokeWidth={2} className="mt-3 h-auto w-full" />
        </section>

        <section>
          <h3 className="text-[13px] font-semibold text-neutral-900">Ownership structure</h3>
          <div className="mt-3 flex items-center gap-5">
            <div className="relative h-36 w-36 shrink-0">
              <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
                <circle cx="21" cy="21" r={R} fill="none" stroke="#f0f0f3" strokeWidth="6" />
                {holders.map((h, i) => {
                  const p = row.pct[h.id];
                  const offset = acc;
                  acc += p;
                  if (p <= 0) return null;
                  const dim = hover && hover !== h.id;
                  return (
                    <motion.circle
                      key={h.id}
                      cx="21"
                      cy="21"
                      r={R}
                      fill="none"
                      stroke={h.color}
                      strokeWidth={hover === h.id ? 7.5 : 6}
                      strokeDashoffset={-offset}
                      initial={{ strokeDasharray: "0 100" }}
                      animate={{ strokeDasharray: `${Math.max(0, p - 0.4)} ${100 - p + 0.4}`, opacity: dim ? 0.25 : 1 }}
                      transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      onMouseEnter={() => setHover(h.id)}
                      onMouseLeave={() => setHover(null)}
                      className="cursor-pointer"
                    />
                  );
                })}
              </svg>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <AnimatePresence mode="wait">
                  <motion.div key={hover ?? "you"} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.18 }}>
                    <div className="text-[18px] font-semibold tabular-nums text-neutral-900">{fmt.pct(row.pct[hover ?? "you"])}</div>
                    <div className="max-w-20 truncate text-[10px] text-neutral-500">{hover ? byId[hover].short : "Your stake"}</div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              {holders.map((h) => (
                <div
                  key={h.id}
                  onMouseEnter={() => setHover(h.id)}
                  onMouseLeave={() => setHover(null)}
                  className={cn("flex items-center gap-2 rounded-lg px-2 py-1 text-[12px] transition-colors", hover === h.id && "bg-black/[0.04]", h.id === "you" && "font-semibold")}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: h.color }} />
                  <span className="min-w-0 flex-1 truncate text-neutral-700">{h.id === "you" ? "You" : h.short}</span>
                  <span className="tabular-nums text-neutral-900">{fmt.pct(row.pct[h.id])}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#f5f5f7] p-4">
            <div className="flex items-center gap-1.5 text-[12px] text-neutral-500">
              <Trophy className="h-3.5 w-3.5 text-[#ff9f0a]" /> Rank vs rivals
            </div>
            <div className="mt-1 text-2xl font-semibold text-neutral-900">
              #{row.rank} <span className="text-[13px] font-normal text-neutral-400">of {contenders.length}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-[#f5f5f7] p-4">
            <div className="text-[12px] text-neutral-500">Gap vs {byId[row.largestRival.id].short}</div>
            <div className={cn("mt-1 text-2xl font-semibold", gap >= 0 ? "text-[#248a3d]" : "text-[#d70015]")}>
              {gap >= 0 ? "+" : ""}
              {gap.toFixed(2)} pp
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[13px] font-semibold text-neutral-900">You vs other holders</h3>
          <div className="mt-3 space-y-2.5">
            {contenders.map((id, i) => {
              const max = row.shares[contenders[0]] || 1;
              return (
                <div key={id}>
                  <div className="flex justify-between text-[12px]">
                    <span className={cn("text-neutral-600", id === "you" && "font-semibold text-[#0a6bd6]")}>
                      {i + 1}. {id === "you" ? "You" : byId[id].name}
                    </span>
                    <span className="tabular-nums text-neutral-900">{fmt.int(row.shares[id])}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/[0.05]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(row.shares[id] / max) * 100}%` }}
                      transition={{ duration: 0.9, delay: 0.2 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: byId[id].color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-black/[0.06] p-4">
          <dl className="grid grid-cols-2 gap-y-3 text-[12px]">
            {[
              ["Your position", fmt.usd(row.value.you)],
              ["Your shares", fmt.int(row.shares.you)],
              ["CEO", c.ceo],
              ["Employees", fmt.int(c.employees)],
              ["Revenue (LTM)", `$${fmt.int(c.revenue)}M`],
              ["Aurora since", String(c.invested)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-neutral-500">{k}</dt>
                <dd className="font-medium text-neutral-900">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="border-t border-black/[0.06] p-4">
        <Link
          href={`/portfolio/${c.slug}`}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 text-[13px] font-medium text-white transition-transform active:scale-[0.98]"
        >
          View company profile <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}
