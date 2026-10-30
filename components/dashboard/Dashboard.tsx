"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  Keyboard,
  Lock,
  LogOut,
  Maximize2,
  Minimize2,
  Pencil,
  Plus,
  Rows2,
  Rows4,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { LogoMark } from "@/components/ui/Logo";
import { RegisterKpis } from "@/components/dashboard/RegisterKpis";
import { ShareholderDrawer } from "@/components/dashboard/ShareholderDrawer";
import { RegistrarChatDrawer, type StagedAction } from "@/components/dashboard/RegistrarChatDrawer";
import { SheetGrid, formatKind, toCSV, type Stats } from "@/components/dashboard/SheetGrid";
import { companyHoldingsColumns, companyMatrixColumns, ledgerSheetColumns, registerLogColumns, shareholderColumns } from "@/components/dashboard/sheets";
import type { AuroraEquityRegister, Shareholder, ShareholderKind } from "@/lib/data/aurora-equity";
import { buildCompanyMatrix } from "@/lib/data/company-matrix";
import { buildLedgerTransactions } from "@/lib/data/ledger";
import { composeRegister, eventsToLiveLedger, type RegisterEvent } from "@/lib/data/register-log";
import { canWriteDashboard, type Stakeholder } from "@/lib/auth";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

const SHEETS = [
  { id: "register", label: "Aurora Equity" },
  { id: "ledger", label: "Trade Ledger" },
  { id: "log", label: "Register log" },
  { id: "companies", label: "Companies" },
  { id: "matrix", label: "Ownership matrix" },
] as const;
type SheetId = (typeof SHEETS)[number]["id"];
type KindFilter = "all" | ShareholderKind;

type Props = { user: Stakeholder; capTable: AuroraEquityRegister; events: RegisterEvent[] };

export function Dashboard({ user, capTable, events }: Props) {
  const router = useRouter();
  const { signOut } = useClerk();
  const canWrite = Boolean(user.canWrite && canWriteDashboard(user.email));
  const [sheet, setSheet] = useState<SheetId>("register");
  const [direction, setDirection] = useState(1);
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [holderDrawer, setHolderDrawer] = useState<Shareholder | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const [shareholdersState, setShareholdersState] = useState<Shareholder[]>(capTable.shareholders);
  const [eventsState, setEventsState] = useState<RegisterEvent[]>(events);
  const [showBatchCols, setShowBatchCols] = useState(false);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [newHolder, setNewHolder] = useState({
    name: "",
    firstName: "",
    investorId: "",
    shares: "",
    email: "",
    city: "OSLO",
    country: "Norway",
    address: "",
    postalCode: "",
  });
  const searchRef = useRef<HTMLInputElement>(null);
  const isRegister = sheet === "register";

  const liveCapTable = useMemo(
    () =>
      composeRegister(shareholdersState, {
        name: capTable.name,
        orgNr: capTable.orgNr,
        asOf: capTable.asOf,
        shareClass: capTable.shareClass,
      }),
    [capTable.asOf, capTable.name, capTable.orgNr, capTable.shareClass, shareholdersState]
  );
  const liveTransactions = useMemo(() => eventsToLiveLedger(eventsState), [eventsState]);

  const applyPersisted = useCallback((register: AuroraEquityRegister, nextEvents: RegisterEvent[]) => {
    setShareholdersState(register.shareholders);
    setEventsState(nextEvents);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/register")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.register) return;
        applyPersisted(data.register, data.events ?? []);
      })
      .catch(() => {
        /* keep the seeded book on screen */
      });
    return () => {
      cancelled = true;
    };
  }, [applyPersisted]);

  const notify = useCallback((msg: string) => setToast({ id: Date.now(), msg }), []);
  const closeHolderDrawer = useCallback(() => setHolderDrawer(null), []);
  const toggleFullscreen = useCallback(() => setFullscreen((f) => !f), []);

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
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setChatOpen((o) => !o);
      } else if (e.key === "Escape" && chatOpen) {
        setChatOpen(false);
      } else if (e.key === "Escape" && fullscreen && !holderDrawer && !menuOpen && !chatOpen) {
        setFullscreen(false);
      } else if (
        e.key.toLowerCase() === "f" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setFullscreen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, holderDrawer, menuOpen, chatOpen]);

  const holdersRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return liveCapTable.shareholders.filter(
      (h) =>
        (kindFilter === "all" || h.kind === kindFilter) &&
        (!q ||
          `${h.stakeText} ${h.shares} ${h.name} ${h.firstName} ${h.investorId} ${h.address} ${h.address2} ${h.postalCode} ${h.city} ${h.country} ${h.email}`
            .toLowerCase()
            .includes(q))
    );
  }, [liveCapTable.shareholders, kindFilter, query]);

  const allLedgerRows = useMemo(
    () => buildLedgerTransactions(liveCapTable.shareholders, liveTransactions),
    [liveCapTable.shareholders, liveTransactions]
  );

  const ledgerRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allLedgerRows;
    return allLedgerRows.filter((tx) =>
      `${tx.id} ${tx.dateLabel} ${tx.batchGroup} ${tx.sellerName} ${tx.buyerName} ${tx.shares} ${tx.auditHash}`
        .toLowerCase()
        .includes(q)
    );
  }, [allLedgerRows, query]);

  const selectHolderById = useCallback(
    (holderId: string) => {
      const found = liveCapTable.shareholders.find((h) => h.id === holderId);
      if (found) setHolderDrawer(found);
    },
    [liveCapTable.shareholders]
  );

  const companyRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return liveCapTable.shareholders.filter(
      (h) =>
        h.kind === "company" &&
        (!q ||
          `${h.name} ${h.firstName} ${h.investorId} ${h.address} ${h.city} ${h.country} ${h.email}`
            .toLowerCase()
            .includes(q))
    );
  }, [liveCapTable.shareholders, query]);

  const matrixRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return buildCompanyMatrix(liveCapTable.shareholders).filter(
      (h) =>
        !q ||
        `${h.name} ${h.investorId} ${h.city} ${h.country} ${h.band} ${h.leaderName} ${h.nextPeerName ?? ""}`
          .toLowerCase()
          .includes(q)
    );
  }, [liveCapTable.shareholders, query]);

  const cCols = useMemo(
    () =>
      companyHoldingsColumns({
        allShareholders: liveCapTable.shareholders,
        liveTransactions,
        onInspectHolder: setHolderDrawer,
      }),
    [liveCapTable.shareholders, liveTransactions]
  );
  const logRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = [...eventsState].reverse();
    if (!q) return rows;
    return rows.filter((e) =>
      `${e.kind} ${e.holderName} ${e.counterpartyName ?? ""} ${e.field ?? ""} ${e.note ?? ""} ${e.actor} ${e.source} ${e.auditHash}`
        .toLowerCase()
        .includes(q)
    );
  }, [eventsState, query]);
  const mCols = useMemo(() => companyMatrixColumns(), []);
  const logCols = useMemo(() => registerLogColumns(), []);
  const lCols = useMemo(() => ledgerSheetColumns(selectHolderById), [selectHolderById]);
  const sCols = useMemo(
    () =>
      shareholderColumns({
        showBatchColumns: showBatchCols,
        allShareholders: liveCapTable.shareholders,
        liveTransactions,
        onInspectHolder: setHolderDrawer,
      }),
    [showBatchCols, liveCapTable.shareholders, liveTransactions]
  );

  const counts: Record<SheetId, number> = {
    register: holdersRows.length,
    ledger: ledgerRows.length,
    log: logRows.length,
    companies: companyRows.length,
    matrix: matrixRows.length,
  };

  function switchSheet(id: SheetId) {
    const from = SHEETS.findIndex((s) => s.id === sheet);
    const to = SHEETS.findIndex((s) => s.id === id);
    setDirection(to >= from ? 1 : -1);
    setSheet(id);
  }

  function exportCSV() {
    const csv =
      sheet === "register"
        ? toCSV(sCols, holdersRows)
        : sheet === "ledger"
          ? toCSV(lCols, ledgerRows)
          : sheet === "log"
            ? toCSV(logCols, logRows)
            : sheet === "companies"
              ? toCSV(cCols, companyRows)
              : toCSV(mCols, matrixRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aurora-equity-${sheet}-${capTable.asOf}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${SHEETS.find((s) => s.id === sheet)?.label} as CSV`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    try {
      await signOut({ redirectUrl: "/login" });
    } catch {
      router.push("/login");
      router.refresh();
    }
  }

  const handleWriteShareholderCell = useCallback(
    async (row: Shareholder, columnKey: string, rawValue: string) => {
      if (!canWrite) {
        notify("Read-only access. Only paal@synx.tools and thiru@synx.tools have write access.");
        return;
      }

      const res = await fetch("/api/register/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cell-update", source: "grid", id: row.id, columnKey, value: rawValue }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.register) {
        notify(data.error ?? "Write denied by server.");
        return;
      }

      applyPersisted(data.register, data.events ?? eventsState);
      notify(`Saved changes to ${row.name}`);
    },
    [applyPersisted, canWrite, eventsState, notify]
  );

  async function handleAddShareholder(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) {
      notify("Read-only access. Only paal@synx.tools and thiru@synx.tools have write access.");
      return;
    }
    const parsedShares = Number(newHolder.shares.replace(/[^0-9]/g, ""));
    if (!newHolder.name.trim() || !Number.isFinite(parsedShares) || parsedShares <= 0) {
      notify("Please enter a valid shareholder name and share count.");
      return;
    }

    const res = await fetch("/api/register/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add-shareholder", source: "modal", holder: newHolder }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.register) {
      notify(data.error ?? "Write denied by server.");
      return;
    }

    applyPersisted(data.register, data.events ?? eventsState);
    setWriteModalOpen(false);
    setNewHolder({
      name: "",
      firstName: "",
      investorId: "",
      shares: "",
      email: "",
      city: "OSLO",
      country: "Norway",
      address: "",
      postalCode: "",
    });
    notify(`Added ${newHolder.name.trim()} (${fmt.int(parsedShares)} shares) to register`);
  }

  const handleExecuteChatAction = useCallback(
    async (action: StagedAction): Promise<{ ok: boolean; error?: string }> => {
      if (!canWrite) {
        return {
          ok: false,
          error: "Read-only access. Only paal@synx.tools and thiru@synx.tools have write access.",
        };
      }

      if (action.kind === "transfer") {
        const res = await fetch("/api/register/write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "transfer-shares",
            source: "copilot",
            shares: action.shares,
            fromId: action.fromId,
            fromBefore: action.fromBefore,
            fromAfter: action.fromAfter,
            toId: action.toId,
            toName: action.toName,
            toBefore: action.toBefore,
            toAfter: action.toAfter,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.register) {
          return { ok: false, error: data.error ?? "Transfer rejected by server." };
        }
        applyPersisted(data.register, data.events ?? eventsState);
        notify(`Transferred ${fmt.int(action.shares)} shares from ${action.fromName} to ${action.toName}`);
        return { ok: true };
      }

      if (action.kind === "add_holder") {
        const res = await fetch("/api/register/write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add-shareholder", source: "copilot", holder: action }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.register) {
          return { ok: false, error: data.error ?? "Add entry rejected by server." };
        }
        applyPersisted(data.register, data.events ?? eventsState);
        notify(`Added ${action.name} (${fmt.int(action.shares)} shares)`);
        return { ok: true };
      }

      if (action.kind === "update_field") {
        const res = await fetch("/api/register/write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "cell-update",
            source: "copilot",
            id: action.holderId,
            columnKey: action.field,
            value: action.afterValue,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.register) {
          return { ok: false, error: data.error ?? "Update rejected by server." };
        }
        applyPersisted(data.register, data.events ?? eventsState);
        notify(`Updated ${action.fieldLabel} for ${action.holderName}`);
        return { ok: true };
      }

      return { ok: false, error: "Unsupported action." };
    },
    [applyPersisted, canWrite, eventsState, notify]
  );

  const handleRevertChatAction = useCallback(
    async (action: StagedAction): Promise<{ ok: boolean; error?: string }> => {
      if (!canWrite) return { ok: false, error: "Read-only access." };
      const res = await fetch("/api/register/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revert", source: "revert", target: action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.register) {
        return { ok: false, error: data.error ?? "Could not revert transaction." };
      }
      applyPersisted(data.register, data.events ?? eventsState);
      notify("Reverted and written to the register log");
      return { ok: true };
    },
    [applyPersisted, canWrite, eventsState, notify]
  );

  const gridProps = { density, onStats: setStats, onNotice: notify, canWrite };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f5f5f7] text-neutral-900 [color-scheme:light] selection:bg-[#0a84ff]/20 selection:text-neutral-900">
      {/* App bar */}
      <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 border-b border-black/[0.06] bg-white/75 px-3 backdrop-blur-xl md:px-4">
        <Link href="/" className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-black/[0.04]" aria-label="Aurora Equity website">
          <LogoMark className="h-6 w-6" />
        </Link>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="hidden h-8 w-8 place-items-center rounded-lg bg-[#30d158]/12 text-[#248a3d] sm:grid">
            <FileSpreadsheet className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold leading-tight">Shareholder Register</div>
            <div className="truncate text-[11px] text-neutral-500">
              {user.entity} · as of {fmt.date(capTable.asOf)}
            </div>
          </div>
        </div>

        <label className="group mx-auto hidden h-9 w-full max-w-md items-center gap-2 rounded-xl bg-black/[0.045] px-3 transition-all focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(10,132,255,0.25)] md:flex">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              sheet === "ledger"
                ? "Search ledger refs, counterparties, audit hashes…"
                : sheet === "log"
                  ? "Search adds, credits, debits, actors, audit hashes…"
                  : sheet === "companies" || sheet === "matrix"
                    ? "Search registered companies, org. numbers, cities…"
                    : "Search shareholders, org. numbers, cities, e-mails…"
            }
            className="min-w-0 flex-1 bg-transparent text-[13px] placeholder:text-neutral-400 focus:outline-none"
          />
          <kbd className="rounded-md border border-black/10 bg-white px-1.5 py-0.5 font-sans text-[10px] text-neutral-400">Ctrl K</kbd>
        </label>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {canWrite ? (
            <span className="hidden items-center gap-1.5 rounded-full bg-[#0a84ff]/12 px-2.5 py-1 text-[11px] font-medium text-[#0a6bd6] lg:inline-flex">
              <Pencil className="h-3 w-3" /> Write access · {user.email}
            </span>
          ) : (
            <span
              title="Only paal@synx.tools and thiru@synx.tools have write access"
              className="hidden items-center gap-1.5 rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-medium text-neutral-600 lg:inline-flex"
            >
              <Lock className="h-3 w-3" /> Read-only
            </span>
          )}
          {canWrite && isRegister && (
            <button
              onClick={() => setWriteModalOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0a84ff] px-3 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(10,132,255,0.28)] transition-all hover:bg-[#0070e0] active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Write entry</span>
            </button>
          )}
          <button
            onClick={() => setChatOpen((o) => !o)}
            title="Open Registrar Copilot (Ctrl+J)"
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium shadow-[0_1px_1px_rgba(0,0,0,0.04)] transition-all active:scale-[0.97]",
              chatOpen
                ? "border-[#231d3a] bg-[#231d3a] text-white"
                : "border-black/[0.08] bg-white text-neutral-800 hover:bg-neutral-50"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#0a84ff]" />
            <span className="hidden sm:inline">Copilot</span>
          </button>
          <span className="hidden items-center gap-1.5 rounded-full bg-[#30d158]/12 px-2.5 py-1 text-[11px] font-medium text-[#248a3d] lg:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#30d158] animate-pulse-soft" /> Live
          </span>
          <button
            onClick={toggleFullscreen}
            title={fullscreen ? "Exit full screen (F or Esc)" : "View full screen (F)"}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium shadow-[0_1px_1px_rgba(0,0,0,0.04)] transition-all active:scale-[0.97]",
              fullscreen
                ? "border-[#0a84ff]/30 bg-[#0a84ff]/10 text-[#0a6bd6]"
                : "border-black/[0.08] bg-white text-neutral-800 hover:bg-neutral-50"
            )}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{fullscreen ? "Exit full screen" : "View full screen"}</span>
          </button>
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

      <div className={cn("flex min-h-0 flex-1 flex-col", fullscreen ? "gap-2 p-2 md:px-3 md:pb-2.5 md:pt-2" : "gap-2.5 p-2.5 md:p-3.5")}>
        <AnimatePresence initial={false}>
          {!fullscreen && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-2.5 overflow-hidden"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h1 suppressHydrationWarning className="text-[19px] font-semibold tracking-tight">
                  Welcome, {user.name.split(" ")[0]}
                </h1>
                <p className="text-[12.5px] text-neutral-500">
                  {sheet === "companies"
                    ? `${liveCapTable.summary.companies} registered companies on the ${capTable.name} register · ${fmt.pct(liveCapTable.summary.companySharesPct, 1)} of share capital`
                    : sheet === "matrix"
                      ? `Ownership matrix of registered companies in ${capTable.name} · ranked by stake, city cluster and control band`
                      : sheet === "log"
                        ? `${eventsState.length} persisted register events · every add, credit, debit and field change`
                        : `Shareholder register of ${capTable.name} (org. nr ${capTable.orgNr}) · ${fmt.int(liveCapTable.sharesOutstanding)} shares across ${liveCapTable.summary.holders} holders`}
                </p>
              </div>

              <div className="hidden md:block">
                <RegisterKpis register={liveCapTable} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {isRegister && (
              <motion.div
                key="kind"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <Segmented
                  id="kind"
                  value={kindFilter}
                  onChange={setKindFilter}
                  options={[
                    { value: "all", label: "All holders" },
                    { value: "company", label: `Companies · ${liveCapTable.summary.companies}` },
                    { value: "person", label: `Private · ${liveCapTable.summary.persons}` },
                  ]}
                />
                <button
                  type="button"
                  onClick={() => setShowBatchCols((v) => !v)}
                  title="Toggle the 24 raw batch transfer columns vs clean ledger summary"
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[12.5px] font-medium transition-all active:scale-[0.97]",
                    showBatchCols
                      ? "border-[#0a84ff]/35 bg-[#0a84ff]/10 text-[#0a6bd6]"
                      : "border-black/[0.08] bg-white text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  <span>{showBatchCols ? "Hide 24 batch cols" : "Show 24 batch cols"}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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

          <span className="ml-auto hidden items-center gap-1.5 text-[12px] text-neutral-400 xl:flex">
            <Keyboard className="h-3.5 w-3.5" /> Arrow keys to move · Shift to select · Ctrl C to copy ·{" "}
            {canWrite && isRegister ? "Double-click or Enter to edit cell · " : ""}Enter on a shareholder for details · F for full screen
          </span>

          <button
            onClick={toggleFullscreen}
            title={fullscreen ? "Exit full screen (F or Esc)" : "View full screen (F)"}
            className={cn(
              "ml-auto inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium transition-all active:scale-[0.97] xl:ml-0",
              fullscreen
                ? "border-[#0a84ff]/30 bg-[#0a84ff]/10 text-[#0a6bd6]"
                : "border-black/[0.08] bg-white text-neutral-700 hover:bg-neutral-50"
            )}
          >
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>{fullscreen ? "Exit full screen" : "View full screen"}</span>
          </button>
        </div>

        {/* Workbook */}
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-black/[0.1] bg-white"
          )}
        >
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
                {sheet === "register" && (
                  <SheetGrid
                    id="register"
                    rows={holdersRows}
                    columns={sCols}
                    getRowId={(h) => h.id}
                    onOpenRow={setHolderDrawer}
                    onWriteCell={canWrite ? handleWriteShareholderCell : undefined}
                    emptyMessage="No shareholders match your search."
                    {...gridProps}
                  />
                )}
                {sheet === "ledger" && (
                  <SheetGrid
                    id="ledger"
                    rows={ledgerRows}
                    columns={lCols}
                    getRowId={(tx) => tx.id}
                    onOpenRow={(tx) => selectHolderById(tx.buyerId)}
                    emptyMessage="No ledger entries match your search."
                    {...gridProps}
                    canWrite={false}
                  />
                )}
                {sheet === "log" && (
                  <SheetGrid
                    id="log"
                    rows={logRows}
                    columns={logCols}
                    getRowId={(e) => e.id}
                    emptyMessage="No register events match your search."
                    {...gridProps}
                    canWrite={false}
                  />
                )}
                {sheet === "companies" && (
                  <SheetGrid
                    id="companies"
                    rows={companyRows}
                    columns={cCols}
                    getRowId={(h) => h.id}
                    onOpenRow={setHolderDrawer}
                    emptyMessage="No registered companies match your search."
                    {...gridProps}
                    canWrite={false}
                  />
                )}
                {sheet === "matrix" && (
                  <SheetGrid
                    id="matrix"
                    rows={matrixRows}
                    columns={mCols}
                    getRowId={(h) => h.id}
                    onOpenRow={(row) => {
                      const found = liveCapTable.shareholders.find((h) => h.id === row.id);
                      if (found) setHolderDrawer(found);
                    }}
                    emptyMessage="No registered companies match your search."
                    {...gridProps}
                    canWrite={false}
                  />
                )}
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

      <ShareholderDrawer
        holder={holderDrawer}
        register={liveCapTable}
        liveTransactions={liveTransactions}
        onSelectHolder={setHolderDrawer}
        onClose={closeHolderDrawer}
        onNotice={notify}
      />
      <RegistrarChatDrawer
        open={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
        register={liveCapTable}
        canWrite={canWrite}
        userEmail={user.email}
        onExecuteAction={handleExecuteChatAction}
        onRevertAction={handleRevertChatAction}
      />

      <AnimatePresence>
        {canWrite && writeModalOpen && (
          <>
            <motion.div
              key="write-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWriteModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
            />
            <motion.div
              key="write-modal"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="fixed top-1/2 left-1/2 z-[55] w-[min(480px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
                <div>
                  <h2 className="text-[15px] font-semibold text-neutral-900">Write shareholder entry</h2>
                  <p className="text-[12px] text-neutral-500">Authorized as {user.email}</p>
                </div>
                <button
                  onClick={() => setWriteModalOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-black/[0.05] text-neutral-500 hover:bg-black/[0.1]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleAddShareholder} className="mt-4 space-y-3 text-[13px]">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-[11.5px] font-medium text-neutral-600">Name / Company *</span>
                    <input
                      required
                      value={newHolder.name}
                      onChange={(e) => setNewHolder({ ...newHolder, name: e.target.value })}
                      placeholder="e.g. SYNX AS"
                      className="h-9 w-full rounded-lg border border-black/15 px-2.5 focus:border-[#0a84ff] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11.5px] font-medium text-neutral-600">First name / Contact</span>
                    <input
                      value={newHolder.firstName}
                      onChange={(e) => setNewHolder({ ...newHolder, firstName: e.target.value })}
                      placeholder="Optional"
                      className="h-9 w-full rounded-lg border border-black/15 px-2.5 focus:border-[#0a84ff] focus:outline-none"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-[11.5px] font-medium text-neutral-600">Number of shares *</span>
                    <input
                      required
                      type="number"
                      min={1}
                      value={newHolder.shares}
                      onChange={(e) => setNewHolder({ ...newHolder, shares: e.target.value })}
                      placeholder="100000"
                      className="h-9 w-full rounded-lg border border-black/15 px-2.5 tabular-nums focus:border-[#0a84ff] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11.5px] font-medium text-neutral-600">Org. nr / Investor ID</span>
                    <input
                      value={newHolder.investorId}
                      onChange={(e) => setNewHolder({ ...newHolder, investorId: e.target.value })}
                      placeholder="9-digit org nr or DOB"
                      className="h-9 w-full rounded-lg border border-black/15 px-2.5 font-mono focus:border-[#0a84ff] focus:outline-none"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1 block text-[11.5px] font-medium text-neutral-600">E-mail</span>
                  <input
                    type="email"
                    value={newHolder.email}
                    onChange={(e) => setNewHolder({ ...newHolder, email: e.target.value })}
                    placeholder="investor@domain.no"
                    className="h-9 w-full rounded-lg border border-black/15 px-2.5 focus:border-[#0a84ff] focus:outline-none"
                  />
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <label className="col-span-2 block">
                    <span className="mb-1 block text-[11.5px] font-medium text-neutral-600">Address</span>
                    <input
                      value={newHolder.address}
                      onChange={(e) => setNewHolder({ ...newHolder, address: e.target.value })}
                      placeholder="Street address"
                      className="h-9 w-full rounded-lg border border-black/15 px-2.5 focus:border-[#0a84ff] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11.5px] font-medium text-neutral-600">Postal code</span>
                    <input
                      value={newHolder.postalCode}
                      onChange={(e) => setNewHolder({ ...newHolder, postalCode: e.target.value })}
                      placeholder="0250"
                      className="h-9 w-full rounded-lg border border-black/15 px-2.5 focus:border-[#0a84ff] focus:outline-none"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-[11.5px] font-medium text-neutral-600">City</span>
                    <input
                      value={newHolder.city}
                      onChange={(e) => setNewHolder({ ...newHolder, city: e.target.value })}
                      className="h-9 w-full rounded-lg border border-black/15 px-2.5 focus:border-[#0a84ff] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11.5px] font-medium text-neutral-600">Country</span>
                    <input
                      value={newHolder.country}
                      onChange={(e) => setNewHolder({ ...newHolder, country: e.target.value })}
                      className="h-9 w-full rounded-lg border border-black/15 px-2.5 focus:border-[#0a84ff] focus:outline-none"
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWriteModalOpen(false)}
                    className="h-9 rounded-xl border border-black/10 px-3.5 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-xl bg-[#0a84ff] px-4 text-[13px] font-medium text-white hover:bg-[#0070e0]"
                  >
                    Save to register
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
