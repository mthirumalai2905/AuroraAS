"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Copy,
  FileSpreadsheet,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { holderKindStyle } from "@/components/dashboard/sheets";
import type { AuroraEquityRegister, Shareholder } from "@/lib/data/aurora-equity";
import { buildPersonTradeSummary, type LedgerTransaction } from "@/lib/data/ledger";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  holder: Shareholder | null;
  register: AuroraEquityRegister;
  liveTransactions?: LedgerTransaction[];
  onSelectHolder?: (holder: Shareholder) => void;
  onClose: () => void;
  onNotice: (message: string) => void;
};

export function ShareholderDrawer({
  holder,
  register,
  liveTransactions = [],
  onSelectHolder,
  onClose,
  onNotice,
}: Props) {
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
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
          />
          <motion.aside
            key="panel"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed inset-y-2 right-2 z-50 flex w-[min(560px,calc(100vw-16px))] flex-col overflow-hidden rounded-[22px] border border-black/[0.08] bg-white/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
          >
            <Body
              holder={holder}
              register={register}
              liveTransactions={liveTransactions}
              onSelectHolder={onSelectHolder}
              onClose={onClose}
              onNotice={onNotice}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Body({
  holder: h,
  register,
  liveTransactions = [],
  onSelectHolder,
  onClose,
  onNotice,
}: Props & { holder: Shareholder }) {
  const [tab, setTab] = useState<"analytics" | "profile">("analytics");
  const [hoverPoint, setHoverPoint] = useState<number | null>(null);

  const k = holderKindStyle[h.kind];
  const tradeSummary = useMemo(
    () => buildPersonTradeSummary(h, register.shareholders, liveTransactions),
    [h, register.shareholders, liveTransactions]
  );

  const byId = useMemo(() => new Map(register.shareholders.map((s) => [s.id, s])), [register.shareholders]);
  const top = register.shareholders.slice(0, 5);
  const ladder = top.some((t) => t.id === h.id) ? top : [...top, h];
  const max = ladder[0]?.shares || 1;
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

  async function copyAuditDigest() {
    try {
      await navigator.clipboard.writeText(tradeSummary.auditDigest);
      onNotice(`Copied cryptographic audit digest ${tradeSummary.auditDigest}`);
    } catch {
      onNotice("Clipboard access was blocked by the browser");
    }
  }

  const pts = tradeSummary.balanceSeries;
  const activePt = hoverPoint !== null && pts[hoverPoint] ? pts[hoverPoint] : pts[pts.length - 1];

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-black/[0.06] bg-white px-5 py-4">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[13px] font-semibold"
          style={{ background: `${k.color}1f`, color: k.color }}
        >
          {h.name
            .replace(/[^\p{L}\s]/gu, "")
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-semibold text-neutral-900">
            {h.name}
            {h.firstName ? <span className="ml-1.5 font-normal text-neutral-600">{h.firstName}</span> : null}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-neutral-500">
            <span className={cn("rounded-full px-2 py-px text-[10.5px] font-medium", k.pill)}>{k.label}</span>
            <span>Rank #{h.rank}</span>
            <span>·</span>
            <span className="font-mono">ID: {h.investorId || "—"}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-full bg-black/[0.05] text-neutral-500 transition-colors hover:bg-black/[0.1]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#fafafa] px-5 py-2">
        <div className="flex gap-1 rounded-xl bg-black/[0.05] p-0.5">
          <button
            type="button"
            onClick={() => setTab("analytics")}
            className={cn(
              "rounded-[9px] px-3 py-1 text-[12px] font-medium transition-all",
              tab === "analytics" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
            )}
          >
            Trade History & Charts ({tradeSummary.events.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={cn(
              "rounded-[9px] px-3 py-1 text-[12px] font-medium transition-all",
              tab === "profile" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
            )}
          >
            Profile & Ladder
          </button>
        </div>

        <button
          type="button"
          onClick={copyAuditDigest}
          title="Click to copy tamper-evident hash digest"
          className="inline-flex items-center gap-1.5 rounded-lg border border-black/[0.07] bg-white px-2.5 py-1 font-mono text-[10.5px] text-neutral-600 transition-colors hover:border-[#0a84ff]/40"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#30d158]" />
          <span>{tradeSummary.auditDigest}</span>
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin">
        {tab === "analytics" ? (
          <>
            {/* 4-Card KPI Strip: Opening, Credits (+In), Debits (-Out), Closing */}
            <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-2xl border border-black/[0.06] bg-[#f8f8fa] p-3">
                <div className="text-[11px] text-neutral-500">Opening Balance</div>
                <div className="mt-1 font-mono text-[15px] font-semibold tabular-nums text-neutral-900">
                  {fmt.int(tradeSummary.openingBalance)}
                </div>
                <div className="mt-0.5 text-[10.5px] text-neutral-400">
                  {((tradeSummary.openingBalance / register.sharesOutstanding) * 100).toFixed(2)}% stake
                </div>
              </div>

              <div className="rounded-2xl border border-[#30d158]/25 bg-[#30d158]/[0.05] p-3">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#1f7a35]">
                  <span>Credits (+In)</span>
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                </div>
                <div className="mt-1 font-mono text-[15px] font-bold tabular-nums text-[#1f7a35]">
                  +{fmt.int(tradeSummary.totalCredits)}
                </div>
                <div className="mt-0.5 text-[10.5px] text-[#1f7a35]/75">
                  {tradeSummary.creditCount} credit{tradeSummary.creditCount === 1 ? "" : "s"}
                </div>
              </div>

              <div className="rounded-2xl border border-[#ff3b30]/25 bg-[#ff3b30]/[0.05] p-3">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#c92a2a]">
                  <span>Debits (−Out)</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
                <div className="mt-1 font-mono text-[15px] font-bold tabular-nums text-[#c92a2a]">
                  −{fmt.int(tradeSummary.totalDebits)}
                </div>
                <div className="mt-0.5 text-[10.5px] text-[#c92a2a]/75">
                  {tradeSummary.debitCount} debit{tradeSummary.debitCount === 1 ? "" : "s"}
                </div>
              </div>

              <div className="rounded-2xl border border-[#0a84ff]/25 bg-[#0a84ff]/[0.05] p-3">
                <div className="text-[11px] font-medium text-[#0a6bd6]">Current Balance</div>
                <div className="mt-1 font-mono text-[15px] font-bold tabular-nums text-neutral-900">
                  {fmt.int(tradeSummary.closingBalance)}
                </div>
                <div className="mt-0.5 text-[10.5px] font-medium text-[#0a6bd6]">
                  {fmt.pct(h.pct)} (#{h.rank})
                </div>
              </div>
            </section>

            {/* Interactive Share Balance Trajectory Chart */}
            <section className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-[12px] font-semibold text-neutral-900">Share Balance Trajectory</div>
                  <div className="text-[11px] text-neutral-500">
                    {activePt ? `${activePt.date} · ${activePt.time} · ${activePt.counterparty}` : "Cumulative shares over time"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[16px] font-bold tabular-nums text-neutral-900">
                    {fmt.int(activePt?.shares ?? h.shares)} <span className="text-[11px] font-normal text-neutral-400">sh</span>
                  </div>
                  {activePt && activePt.delta !== 0 ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[10.5px] font-semibold",
                        activePt.delta > 0 ? "bg-[#30d158]/15 text-[#1f7a35]" : "bg-[#ff3b30]/15 text-[#c92a2a]"
                      )}
                    >
                      {activePt.delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {activePt.delta > 0 ? `+${fmt.int(activePt.delta)}` : `−${fmt.int(Math.abs(activePt.delta))}`}
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-400">
                      Net change: {tradeSummary.netChange >= 0 ? "+" : "−"}
                      {fmt.int(Math.abs(tradeSummary.netChange))} sh
                    </span>
                  )}
                </div>
              </div>

              <BalanceTrajectoryChart
                points={pts}
                activeIndex={hoverPoint}
                onHoverIndex={setHoverPoint}
              />
            </section>

            {/* Credit vs Debit Volume Bar Chart */}
            {tradeSummary.events.length > 0 && (
              <section className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-semibold text-neutral-900">Credit / Debit Volume Breakdown</div>
                    <div className="text-[11px] text-neutral-500">
                      Each bar shows shares bought (+Credit) or sold (−Debit) per transaction
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-[#1f7a35]">
                      <span className="h-2 w-2 rounded-full bg-[#30d158]" /> Credit (+In)
                    </span>
                    <span className="flex items-center gap-1 text-[#c92a2a]">
                      <span className="h-2 w-2 rounded-full bg-[#ff3b30]" /> Debit (−Out)
                    </span>
                  </div>
                </div>
                <CreditDebitBars events={tradeSummary.events} />
              </section>
            )}

            {/* Counterparty Ledger Timeline (Who sold to whom, Date, Time, Audit Hash) */}
            <section className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-semibold text-neutral-900">
                    Counterparty Trade Ledger ({tradeSummary.events.length})
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Verified double-entry chain showing seller, buyer, timestamp, and balance impact
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#30d158]/12 px-2.5 py-0.5 text-[10.5px] font-semibold text-[#1f7a35]">
                  <CheckCircle2 className="h-3 w-3" /> Reconciled
                </span>
              </div>

              {tradeSummary.events.length === 0 ? (
                <div className="mt-4 rounded-xl bg-[#f8f8fa] p-6 text-center">
                  <div className="text-[13px] font-medium text-neutral-700">No share transfers recorded in this period</div>
                  <p className="mt-1 text-[11.5px] text-neutral-500">
                    {h.displayName} has held a steady balance of {fmt.int(h.shares)} shares ({fmt.pct(h.pct)}) since opening.
                  </p>
                </div>
              ) : (
                <div className="mt-3.5 space-y-2.5">
                  {tradeSummary.events.map((ev) => {
                    const isCredit = ev.direction === "credit";
                    const counterpartyHolder = byId.get(ev.counterpartyId);
                    return (
                      <div
                        key={`${ev.tx.id}-${ev.direction}`}
                        className="group rounded-xl border border-black/[0.07] bg-[#fafafa] p-3 transition-colors hover:border-black/[0.15] hover:bg-white"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase",
                                isCredit ? "bg-[#30d158]/15 text-[#1f7a35]" : "bg-[#ff3b30]/15 text-[#c92a2a]"
                              )}
                            >
                              {isCredit ? (
                                <>
                                  <ArrowDownLeft className="h-3 w-3" /> Credit (+In)
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="h-3 w-3" /> Debit (−Out)
                                </>
                              )}
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-neutral-700">{ev.tx.id}</span>
                            <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                              {ev.tx.batchGroup}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-500">
                            <Clock className="h-3 w-3" />
                            <span>{ev.tx.dateLabel}</span>
                            <span>·</span>
                            <span>{ev.tx.time}</span>
                          </div>
                        </div>

                        {/* Who sold to whom */}
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 border border-black/[0.05]">
                          <div className="min-w-0 flex-1">
                            <div className="text-[10.5px] uppercase tracking-wider text-neutral-400">
                              {isCredit ? "Acquired From (Seller / Debit)" : "Transferred To (Buyer / Credit)"}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2">
                              {counterpartyHolder && onSelectHolder ? (
                                <button
                                  type="button"
                                  onClick={() => onSelectHolder(counterpartyHolder)}
                                  className="truncate text-[13px] font-semibold text-[#0a6bd6] hover:underline"
                                >
                                  {ev.counterpartyName} (Rank #{ev.counterpartyRank})
                                </button>
                              ) : (
                                <span className="truncate text-[13px] font-semibold text-neutral-900">
                                  {ev.counterpartyName}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={cn(
                                "font-mono text-[14px] font-bold tabular-nums",
                                isCredit ? "text-[#1f7a35]" : "text-[#c92a2a]"
                              )}
                            >
                              {isCredit ? `+${fmt.int(ev.tx.shares)}` : `−${fmt.int(ev.tx.shares)}`} sh
                            </div>
                            <div className="font-mono text-[10.5px] text-neutral-500">
                              {ev.tx.pctOfCompany.toFixed(3)}% of company
                            </div>
                          </div>
                        </div>

                        {/* Balance Before -> After & Audit signature */}
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span>Balance: {fmt.int(ev.balanceBefore)}</span>
                            <ArrowRight className="h-3 w-3 text-neutral-400" />
                            <strong className="text-neutral-900">{fmt.int(ev.balanceAfter)} sh</strong>
                            <span>({ev.pctAfter.toFixed(2)}%)</span>
                          </div>
                          <span className="font-mono text-[10px] text-neutral-400">
                            Sig: {ev.tx.auditHash}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Profile & Ladder Tab */
          <>
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
                <span>
                  {fmt.int(h.shares)} of {fmt.int(register.sharesOutstanding)} shares
                </span>
                <span>
                  Top {h.rank} hold {fmt.pct(h.cumPct, 1)}
                </span>
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
                <div className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900">
                  {fmt.pct((aboveShares / register.sharesOutstanding) * 100, 1)}
                </div>
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
                    <dt className="text-neutral-500">First name / Contact</dt>
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
                      <button
                        onClick={copyAddress}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-black/[0.05] hover:text-neutral-700"
                        aria-label="Copy address"
                      >
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
              </dl>
            </section>
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-black/[0.06] bg-[#fafafa] px-5 py-3 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-neutral-400" />
          Write-protected ledger · Authorized: paal@synx.tools & thiru@synx.tools
        </span>
        <span className="font-mono text-[10.5px] text-neutral-400">{register.orgNr}</span>
      </div>
    </>
  );
}

function BalanceTrajectoryChart({
  points,
  activeIndex,
  onHoverIndex,
}: {
  points: { label: string; date: string; time: string; shares: number; delta: number; counterparty?: string }[];
  activeIndex: number | null;
  onHoverIndex: (idx: number | null) => void;
}) {
  const W = 480;
  const H = 148;
  const PAD_X = 16;
  const PAD_TOP = 18;
  const PAD_BOT = 26;

  const values = points.map((p) => p.shares);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const span = maxV - minV || Math.max(1, maxV * 0.1);

  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? W / 2
        : PAD_X + (i / (points.length - 1)) * (W - PAD_X * 2);
    const y =
      maxV === minV
        ? (H - PAD_BOT + PAD_TOP) / 2
        : PAD_TOP + (1 - (p.shares - minV) / span) * (H - PAD_TOP - PAD_BOT);
    return { x, y, pt: p };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${H - PAD_BOT} L${coords[0].x.toFixed(1)},${H - PAD_BOT} Z`;

  return (
    <div className="mt-3 select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-36 w-full overflow-visible"
        onMouseLeave={() => onHoverIndex(null)}
      >
        <defs>
          <linearGradient id="bal-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a84ff" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#0a84ff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal reference lines */}
        {[0, 0.5, 1].map((t, i) => {
          const y = PAD_TOP + t * (H - PAD_TOP - PAD_BOT);
          return (
            <line
              key={i}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={y}
              y2={y}
              stroke="rgba(0,0,0,0.06)"
              strokeDasharray={i === 1 ? "3 3" : undefined}
            />
          );
        })}

        <path d={areaPath} fill="url(#bal-grad)" />
        <path d={linePath} fill="none" stroke="#0a84ff" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((c, i) => {
          const isHovered = activeIndex === i;
          const color = c.pt.delta > 0 ? "#30d158" : c.pt.delta < 0 ? "#ff3b30" : "#0a84ff";
          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => onHoverIndex(i)}
            >
              <rect
                x={c.x - Math.max(12, W / (coords.length * 2))}
                y={0}
                width={Math.max(24, W / coords.length)}
                height={H}
                fill="transparent"
              />
              {isHovered && (
                <line
                  x1={c.x}
                  x2={c.x}
                  y1={PAD_TOP}
                  y2={H - PAD_BOT}
                  stroke="#0a84ff"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}
              <circle
                cx={c.x}
                cy={c.y}
                r={isHovered ? 5.5 : 3.5}
                fill="#fff"
                stroke={color}
                strokeWidth={isHovered ? 2.5 : 2}
              />
            </g>
          );
        })}

        {/* X-axis labels */}
        {coords.map((c, i) => {
          const showLabel =
            coords.length <= 6 || i === 0 || i === coords.length - 1 || i === Math.floor(coords.length / 2);
          if (!showLabel) return null;
          return (
            <text
              key={i}
              x={c.x}
              y={H - 6}
              textAnchor={i === 0 ? "start" : i === coords.length - 1 ? "end" : "middle"}
              className="fill-neutral-400 font-mono text-[9.5px]"
            >
              {c.pt.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function CreditDebitBars({
  events,
}: {
  events: ReturnType<typeof buildPersonTradeSummary>["events"];
}) {
  const maxShares = Math.max(...events.map((e) => e.tx.shares), 1);
  return (
    <div className="mt-3 space-y-2">
      {events.slice(0, 12).map((ev) => {
        const isCredit = ev.direction === "credit";
        const widthPct = Math.max(6, (ev.tx.shares / maxShares) * 100);
        return (
          <div key={`${ev.tx.id}-${ev.direction}`} className="text-[11.5px]">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-neutral-700">
                <span className="font-mono text-[10.5px] text-neutral-400">{ev.tx.dateLabel.slice(0, 6)}</span> ·{" "}
                {isCredit ? `From ${ev.counterpartyName}` : `To ${ev.counterpartyName}`}
              </span>
              <span
                className={cn(
                  "shrink-0 font-mono font-semibold tabular-nums",
                  isCredit ? "text-[#1f7a35]" : "text-[#c92a2a]"
                )}
              >
                {isCredit ? `+${fmt.int(ev.tx.shares)}` : `−${fmt.int(ev.tx.shares)}`}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/[0.05]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className={cn("h-full rounded-full", isCredit ? "bg-[#30d158]" : "bg-[#ff3b30]")}
              />
            </div>
          </div>
        );
      })}
      {events.length > 12 && (
        <div className="pt-1 text-center text-[11px] text-neutral-400">
          Showing 12 of {events.length} transactions — see full ledger below
        </div>
      )}
    </div>
  );
}
