"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Filter,
  Keyboard,
  LogOut,
  Rows2,
  Rows4,
  Search,
} from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { CompanyDrawer } from "@/components/dashboard/CompanyDrawer";
import { SheetGrid, formatKind, toCSV, type Stats } from "@/components/dashboard/SheetGrid";
import { dividendColumns, holdingsColumns, matrixColumns, transactionColumns, type Units } from "@/components/dashboard/sheets";
import type { Holder, Register, RegisterRow } from "@/lib/data/register";
import type { Stakeholder } from "@/lib/auth";
import { sectors, type Company } from "@/lib/data/companies";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

const SHEETS = [
  { id: "holdings", label: "Holdings" },
  { id: "matrix", label: "Competitor matrix" },
  { id: "transactions", label: "Transactions" },
  { id: "dividends", label: "Dividends" },
] as const;
type SheetId = (typeof SHEETS)[number]["id"];

export function Dashboard({ user, register, holders }: { user: Stakeholder; register: Register; holders: Holder[] }) {
  const router = useRouter();
  const [sheet, setSheet] = useState<SheetId>("holdings");
  const [direction, setDirection] = useState(1);
  const [units, setUnits] = useState<Units>("shares");
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");
  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawer, setDrawer] = useState<RegisterRow | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((msg: string) => setToast({ id: Date.now(), msg }), []);
  const closeDrawer = useCallback(() => setDrawer(null), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const matches = useCallback(
    (c: Company, extra = "") =>
      (sectorFilter.size === 0 || sectorFilter.has(c.sector)) &&
      `${c.name} ${c.ticker} ${c.sector} ${extra}`.toLowerCase().includes(query.trim().toLowerCase()),
    [query, sectorFilter]
  );

  const rows = useMemo(() => register.rows.filter((r) => matches(r.company)), [register.rows, matches]);
  const txs = useMemo(() => register.transactions.filter((t) => matches(t.company, `${t.id} ${t.type} ${t.counterparty}`)), [register.transactions, matches]);
  const divs = useMemo(() => register.dividends.filter((d) => matches(d.company)), [register.dividends, matches]);

  const hCols = useMemo(() => holdingsColumns(holders, units), [holders, units]);
  const mCols = useMemo(() => matrixColumns(holders), [holders]);
  const tCols = useMemo(() => transactionColumns(), []);
  const dCols = useMemo(() => dividendColumns(), []);

  const counts: Record<SheetId, number> = { holdings: rows.length, matrix: rows.length, transactions: txs.length, dividends: divs.length };

  function switchSheet(id: SheetId) {
    const from = SHEETS.findIndex((s) => s.id === sheet);
    const to = SHEETS.findIndex((s) => s.id === id);
    setDirection(to >= from ? 1 : -1);
    setSheet(id);
  }

  function exportCSV() {
    const csv =
      sheet === "holdings" ? toCSV(hCols, rows) : sheet === "matrix" ? toCSV(mCols, rows) : sheet === "transactions" ? toCSV(tCols, txs) : toCSV(dCols, divs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aurora-register-${sheet}-${register.asOf}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${SHEETS.find((s) => s.id === sheet)?.label} as CSV`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const gridProps = { density, onStats: setStats, onNotice: notify };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f5f5f7] text-neutral-900 [color-scheme:light] selection:bg-[#0a84ff]/20 selection:text-neutral-900">
      {/* App bar */}
      <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 border-b border-black/[0.06] bg-white/75 px-3 backdrop-blur-xl md:px-4">
        <Link href="/" className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-black/[0.04]" aria-label="Aurora AS website">
          <LogoMark className="h-6 w-6" />
        </Link>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="hidden h-8 w-8 place-items-center rounded-lg bg-[#30d158]/12 text-[#248a3d] sm:grid">
            <FileSpreadsheet className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold leading-tight">Shareholder Register</div>
            <div className="truncate text-[11px] text-neutral-500">
              {user.entity} · as of {fmt.date(register.asOf)}
            </div>
          </div>
        </div>

        <label className="group mx-auto hidden h-9 w-full max-w-md items-center gap-2 rounded-xl bg-black/[0.045] px-3 transition-all focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(10,132,255,0.25)] md:flex">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, tickers, transactions…"
            className="min-w-0 flex-1 bg-transparent text-[13px] placeholder:text-neutral-400 focus:outline-none"
          />
          <kbd className="rounded-md border border-black/10 bg-white px-1.5 py-0.5 font-sans text-[10px] text-neutral-400">Ctrl K</kbd>
        </label>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <span className="hidden items-center gap-1.5 rounded-full bg-[#30d158]/12 px-2.5 py-1 text-[11px] font-medium text-[#248a3d] lg:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#30d158] animate-pulse-soft" /> Live
          </span>
          <button
            onClick={exportCSV}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-black/[0.08] bg-white px-3 text-[13px] font-medium shadow-[0_1px_1px_rgba(0,0,0,0.04)] transition-all hover:bg-neutral-50 active:scale-[0.97]"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 items-center gap-2 rounded-xl pl-1 pr-2 transition-colors hover:bg-black/[0.04]"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6] text-[11px] font-semibold text-white">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-neutral-400 transition-transform", menuOpen && "rotate-180")} />
            </button>
            <Popover open={menuOpen} onClose={() => setMenuOpen(false)} className="right-0 w-64">
              <div className="border-b border-black/[0.06] px-3 py-3">
                <div className="text-[13px] font-semibold">{user.name}</div>
                <div className="text-[12px] text-neutral-500">{user.role}</div>
                <div className="text-[12px] text-neutral-500">{user.email}</div>
              </div>
              <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] hover:bg-black/[0.04]">
                Back to aurora-as.com
              </Link>
              <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[#d70015] hover:bg-[#ff3b30]/[0.06]">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </Popover>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:p-4">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 suppressHydrationWarning className="text-[22px] font-semibold tracking-tight">Good {greeting()}, {user.name.split(" ")[0]}</h1>
            <p className="text-[13px] text-neutral-500">Your positions across {register.summary.positions} Aurora companies, compared with every major holder.</p>
          </div>
        </motion.div>

        <div className="hidden md:block">
          <KpiStrip summary={register.summary} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {sheet === "holdings" && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <Segmented
                  id="units"
                  value={units}
                  onChange={setUnits}
                  options={[
                    { value: "shares", label: "Shares" },
                    { value: "pct", label: "Ownership %" },
                    { value: "value", label: "Value" },
                  ]}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium transition-all active:scale-[0.97]",
                sectorFilter.size ? "border-[#0a84ff]/30 bg-[#0a84ff]/10 text-[#0a6bd6]" : "border-black/[0.08] bg-white text-neutral-700 hover:bg-neutral-50"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              {sectorFilter.size ? `${sectorFilter.size} sector${sectorFilter.size > 1 ? "s" : ""}` : "All sectors"}
            </button>
            <Popover open={filterOpen} onClose={() => setFilterOpen(false)} className="left-0 w-56">
              {sectors.map((s) => {
                const on = sectorFilter.has(s);
                return (
                  <button
                    key={s}
                    onClick={() =>
                      setSectorFilter((prev) => {
                        const next = new Set(prev);
                        if (next.has(s)) next.delete(s);
                        else next.add(s);
                        return next;
                      })
                    }
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] hover:bg-black/[0.04]"
                  >
                    <span className={cn("grid h-4 w-4 place-items-center rounded-[5px] border transition-colors", on ? "border-[#0a84ff] bg-[#0a84ff] text-white" : "border-black/20")}>
                      {on && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    {s}
                  </button>
                );
              })}
              {sectorFilter.size > 0 && (
                <button onClick={() => setSectorFilter(new Set())} className="mt-1 w-full border-t border-black/[0.06] px-3 py-2 text-left text-[13px] text-[#0a84ff]">
                  Clear filters
                </button>
              )}
            </Popover>
          </div>

          <label className="flex h-9 items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 md:hidden">
            <Search className="h-3.5 w-3.5 text-neutral-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="w-28 bg-transparent text-[13px] focus:outline-none" />
          </label>

          <Segmented
            id="density"
            value={density}
            onChange={setDensity}
            options={[
              { value: "comfortable", label: <Rows2 className="h-4 w-4" />, title: "Comfortable rows" },
              { value: "compact", label: <Rows4 className="h-4 w-4" />, title: "Compact rows" },
            ]}
          />

          <span className="ml-auto hidden items-center gap-1.5 text-[12px] text-neutral-400 lg:flex">
            <Keyboard className="h-3.5 w-3.5" /> Arrow keys to move · Shift to select · Ctrl C to copy · Enter on a company for details
          </span>
        </div>

        {/* Workbook */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_12px_40px_-20px_rgba(0,0,0,0.15)]">
          <div className="relative min-h-0 flex-1">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={sheet}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 24 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: d * -24 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {sheet === "holdings" && <SheetGrid id="holdings" rows={rows} columns={hCols} getRowId={(r) => r.id} onOpenRow={setDrawer} {...gridProps} />}
                {sheet === "matrix" && <SheetGrid id="matrix" rows={rows} columns={mCols} getRowId={(r) => r.id} onOpenRow={setDrawer} {...gridProps} />}
                {sheet === "transactions" && <SheetGrid id="transactions" rows={txs} columns={tCols} getRowId={(t) => t.id} {...gridProps} />}
                {sheet === "dividends" && <SheetGrid id="dividends" rows={divs} columns={dCols} getRowId={(d) => d.id} {...gridProps} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sheet tabs + stats */}
          <div className="flex h-11 shrink-0 items-center gap-2 border-t border-black/[0.07] bg-[#fafafa] px-2">
            <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto scrollbar-none">
              {SHEETS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => switchSheet(s.id)}
                  className={cn("relative flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] transition-colors", sheet === s.id ? "font-semibold text-neutral-900" : "text-neutral-500 hover:text-neutral-800")}
                >
                  {sheet === s.id && (
                    <motion.span
                      layoutId="sheet-tab"
                      className="absolute inset-0 rounded-lg bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06)]"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative">{s.label}</span>
                  <span className={cn("relative rounded-full px-1.5 text-[11px] tabular-nums", sheet === s.id ? "bg-[#0a84ff]/12 text-[#0a6bd6]" : "bg-black/[0.05] text-neutral-500")}>
                    {counts[s.id]}
                  </span>
                </button>
              ))}
            </div>
            <StatsBar stats={stats} />
          </div>
        </div>
      </div>

      <CompanyDrawer row={drawer} holders={holders} onClose={closeDrawer} />

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="fixed bottom-16 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-neutral-900/90 px-4 py-2.5 text-[13px] text-white shadow-xl backdrop-blur"
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}

function StatsBar({ stats }: { stats: Stats | null }) {
  if (!stats) return null;
  const f = (n: number) => (stats.kind ? formatKind(stats.kind, n) : fmt.dec(n));
  const items: [string, string][] =
    stats.numericCount > 0
      ? [
          ["Sum", f(stats.sum)],
          ["Avg", f(stats.avg)],
          ["Min", f(stats.min)],
          ["Max", f(stats.max)],
          ["Count", fmt.int(stats.count)],
        ]
      : [["Count", fmt.int(stats.count)]];
  return (
    <div className="ml-auto flex shrink-0 items-center gap-1 overflow-hidden">
      {items.map(([k, v], i) => (
        <span key={k} className={cn("items-center gap-1.5 rounded-lg px-2 py-1 text-[12px]", i === 0 || k === "Count" ? "flex" : "hidden xl:flex", i === 0 && "bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)]")}>
          <span className="text-neutral-400">{k}</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={v}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="font-medium tabular-nums text-neutral-800"
            >
              {v}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </div>
  );
}

function Segmented<T extends string>({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; title?: string }[];
}) {
  return (
    <div className="flex h-9 items-center rounded-xl bg-black/[0.055] p-[3px]">
      {options.map((o) => (
        <button
          key={o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cn("relative flex h-full items-center rounded-[9px] px-3 text-[13px] font-medium transition-colors", value === o.value ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-700")}
        >
          {value === o.value && (
            <motion.span
              layoutId={`seg-${id}`}
              className="absolute inset-0 rounded-[9px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.05)]"
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          <span className="relative whitespace-nowrap">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Popover({ open, onClose, className, children }: { open: boolean; onClose: () => void; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.parentElement?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -4 }}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
          className={cn(
            "absolute top-11 z-50 origin-top rounded-xl border border-black/[0.08] bg-white/95 p-1 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)] backdrop-blur-xl",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
