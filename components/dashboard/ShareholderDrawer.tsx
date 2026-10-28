"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { Copy, Mail, MapPin, X } from "lucide-react";
import { holderKindStyle } from "@/components/dashboard/sheets";
import type { AuroraEquityRegister, Shareholder } from "@/lib/data/aurora-equity";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  holder: Shareholder | null;
  register: AuroraEquityRegister;
  onClose: () => void;
  onNotice: (message: string) => void;
};

export function ShareholderDrawer({ holder, register, onClose, onNotice }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {holder && (
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
            <Body holder={holder} register={register} onClose={onClose} onNotice={onNotice} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Body({ holder: h, register, onClose, onNotice }: Props & { holder: Shareholder }) {
  const k = holderKindStyle[h.kind];
  const top = register.shareholders.slice(0, 5);
  const ladder = top.some((t) => t.id === h.id) ? top : [...top, h];
  const max = ladder[0].shares;
  const above = register.shareholders.filter((x) => x.rank < h.rank);
  const aboveShares = above.reduce((s, x) => s + x.shares, 0);
  const address = [h.address, h.address2, [h.postalCode, h.city].filter(Boolean).join(" "), h.country].filter(Boolean);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText([[h.name, h.firstName].filter(Boolean).join(" "), ...address].join("\n"));
      onNotice("Postal address copied");
    } catch {
      onNotice("Clipboard access was blocked by the browser");
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[13px] font-semibold" style={{ background: `${k.color}1f`, color: k.color }}>
          {h.name.replace(/[^\p{L}\s]/gu, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-semibold text-neutral-900">
            {h.name}
            {h.firstName ? <span className="ml-1.5 font-normal text-neutral-600">{h.firstName}</span> : null}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-neutral-500">
            <span className={cn("rounded-full px-2 py-px text-[11px] font-medium", k.pill)}>{k.label}</span>
            <span>Investor ID: {h.investorId}</span>
          </div>
        </div>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-black/[0.05] text-neutral-500 transition-colors hover:bg-black/[0.1]" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin">
        <section className="rounded-2xl bg-[#f5f5f7] p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[12px] text-neutral-500">Stake in {register.name}</div>
              <div className="text-2xl font-semibold tracking-tight text-neutral-900">{fmt.pct(h.pct)}</div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-neutral-500">Shares</div>
              <div className="text-[17px] font-semibold tabular-nums text-neutral-900">{fmt.int(h.shares)}</div>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0.6, h.pct)}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-[#0a84ff]"
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
            <span>{fmt.int(h.shares)} of {fmt.int(register.sharesOutstanding)} shares</span>
            <span>Top {h.rank} hold {fmt.pct(h.cumPct, 1)}</span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#f5f5f7] p-4">
            <div className="text-[12px] text-neutral-500">Rank</div>
            <div className="mt-1 text-2xl font-semibold text-neutral-900">
              #{h.rank} <span className="text-[13px] font-normal text-neutral-400">of {register.summary.holders}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-[#f5f5f7] p-4">
            <div className="text-[12px] text-neutral-500">Held by larger holders</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900">{fmt.pct((aboveShares / register.sharesOutstanding) * 100, 1)}</div>
          </div>
        </section>

        <section>
          <h3 className="text-[13px] font-semibold text-neutral-900">Position among the largest holders</h3>
          <div className="mt-3 space-y-2.5">
            {ladder.map((x, i) => {
              const me = x.id === h.id;
              return (
                <div key={x.id}>
                  <div className="flex justify-between gap-3 text-[12px]">
                    <span className={cn("min-w-0 truncate text-neutral-600", me && "font-semibold text-[#0a6bd6]")}>
                      {x.rank}. {x.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-neutral-900">{fmt.pct(x.pct)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/[0.05]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(1, (x.shares / max) * 100)}%` }}
                      transition={{ duration: 0.9, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: me ? "#0a84ff" : holderKindStyle[x.kind].color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-black/[0.06] p-4">
          <h3 className="text-[13px] font-semibold text-neutral-900">Registered details</h3>
          <dl className="mt-3 space-y-3 text-[12px]">
            {h.firstName && (
              <div>
                <dt className="text-neutral-500">First name / Contact (Column 4)</dt>
                <dd className="font-medium text-neutral-900">{h.firstName}</dd>
              </div>
            )}
            <div>
              <dt className="text-neutral-500">Investor ID</dt>
              <dd className="font-mono font-medium text-neutral-900">{h.investorId}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-neutral-500">
                <MapPin className="h-3 w-3" /> Postal address
              </dt>
              <dd className="mt-0.5 flex items-start justify-between gap-2 font-medium text-neutral-900">
                {address.length ? (
                  <span>
                    {address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="font-normal text-neutral-400">Not registered</span>
                )}
                {address.length > 0 && (
                  <button onClick={copyAddress} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-black/[0.05] hover:text-neutral-700" aria-label="Copy address">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-neutral-500">
                <Mail className="h-3 w-3" /> E-mail
              </dt>
              <dd className="mt-0.5 font-medium">
                <a href={`mailto:${h.email}`} className="break-all text-[#0a6bd6] hover:underline">
                  {h.email}
                </a>
              </dd>
            </div>
            {h.openingShares !== null && (
              <div>
                <dt className="text-neutral-500">Opening shares</dt>
                <dd className="font-medium tabular-nums text-neutral-900">{fmt.int(h.openingShares)}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      <div className="border-t border-black/[0.06] px-5 py-3 text-[11px] text-neutral-400">
        Source: {register.name} ({register.orgNr}) shareholder register, as of {fmt.date(register.asOf)}.
      </div>
    </>
  );
}
