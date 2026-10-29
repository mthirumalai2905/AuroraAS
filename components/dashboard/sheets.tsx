import type { Company } from "@/lib/data/companies";
import { rivalIds, type Dividend, type Holder, type HolderId, type RegisterRow, type Transaction } from "@/lib/data/register";
import { SHARES_OUTSTANDING, TRANSFER_COLUMNS, type Shareholder } from "@/lib/data/aurora-equity";
import { buildPersonTradeSummary, type LedgerTransaction } from "@/lib/data/ledger";
import { Sparkline } from "@/components/ui/Sparkline";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Column } from "@/components/dashboard/SheetGrid";

export type Units = "shares" | "pct" | "value";

function CompanyCell({ c, sub }: { c: Company; sub?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        className="h-6 w-6 shrink-0 rounded-[7px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
        style={{ background: `linear-gradient(135deg, ${c.colors[0]}, ${c.colors[1]})` }}
      />
      <span className="min-w-0">
        <span className="block truncate font-medium text-neutral-900">{c.name}</span>
        {sub && <span className="-mt-0.5 block truncate text-[11px] text-neutral-400">{sub}</span>}
      </span>
    </span>
  );
}

function companyColumn<R>(get: (r: R) => Company, opts: { sub?: (r: R) => string; title?: string } = {}): Column<R> {
  return {
    key: "company",
    title: opts.title ?? "Company",
    width: 250,
    kind: "text",
    value: (r) => get(r).name,
    render: (r) => <CompanyCell c={get(r)} sub={opts.sub?.(r)} />,
  };
}

function Bar({ pct, max, color }: { pct: number; max: number; color: string }) {
  return (
    <span className="flex items-center justify-end gap-2">
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-black/[0.06]">
        <span className="block h-full rounded-full" style={{ width: `${Math.min(100, (pct / max) * 100)}%`, background: color }} />
      </span>
      <span className="w-14 text-right">{fmt.pct(pct)}</span>
    </span>
  );
}

function ChangePill({ v }: { v: number }) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[12px] font-medium",
        v >= 0 ? "bg-[#30d158]/12 text-[#248a3d]" : "bg-[#ff3b30]/10 text-[#d70015]"
      )}
    >
      {fmt.signedPct(v)}
    </span>
  );
}

export function holdingsColumns(holders: Holder[], units: Units): Column<RegisterRow>[] {
  const maxPct = (h: HolderId) => (h === "aurora" || h === "float" ? 70 : 15);
  const holderCol = (h: Holder): Column<RegisterRow> => {
    const base = {
      key: `${h.id}-${units}`,
      title: h.id === "you" ? "You" : h.short,
      width: units === "value" ? 160 : 150,
      align: "right" as const,
      accent: h.color,
      tint: h.id === "you" ? "bg-[#0a84ff]/[0.035]" : undefined,
    };
    const who = h.id === "you" ? "You" : h.short;
    if (units === "shares")
      return {
        ...base,
        kind: "int",
        value: (r) => r.shares[h.id],
        formula: (r) => `=REGISTER("${r.company.ticker}", "${who}")`,
        total: (rows) => fmt.int(rows.reduce((s, r) => s + r.shares[h.id], 0)),
      };
    if (units === "pct")
      return {
        ...base,
        kind: "pct",
        value: (r) => r.pct[h.id],
        render: (r) => <Bar pct={r.pct[h.id]} max={maxPct(h.id)} color={h.color} />,
        formula: (r, n, L) => `=REGISTER("${r.company.ticker}", "${who}") / ${L("outstanding")}${n}`,
        total: (rows) => <span className="text-neutral-500">avg {fmt.pct(rows.reduce((s, r) => s + r.pct[h.id], 0) / rows.length)}</span>,
      };
    return {
      ...base,
      kind: "usd",
      value: (r) => r.value[h.id],
      formula: (r, n, L) => `=REGISTER("${r.company.ticker}", "${who}") * ${L("price")}${n}`,
      total: (rows) => fmt.usdCompact(rows.reduce((s, r) => s + r.value[h.id], 0)),
    };
  };


  const cols: Column<RegisterRow>[] = [
    companyColumn((r) => r.company, { sub: (r) => `${r.company.ticker} · ${r.company.hq.split(",")[0]}` }),
    {
      key: "sector",
      title: "Sector",
      width: 128,
      kind: "text",
      value: (r) => r.company.sector,
      render: (r) => <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[12px] text-neutral-600">{r.company.sector}</span>,
    },
    {
      key: "outstanding",
      title: "Shares outstanding",
      width: 160,
      kind: "int",
      align: "right",
      value: (r) => r.company.sharesOutstanding,
      formula: (r) => `=SHARES_OUTSTANDING("${r.company.ticker}")`,
      total: (rows) => fmt.int(rows.reduce((s, r) => s + r.company.sharesOutstanding, 0)),
    },
    {
      key: "price",
      title: "Price",
      width: 110,
      kind: "price",
      align: "right",
      value: (r) => r.company.price,
      formula: (r) => `=PRICE("${r.company.ticker}")`,
    },
    {
      key: "change",
      title: "30D",
      width: 92,
      kind: "signedPct",
      align: "right",
      value: (r) => r.company.change30d,
      render: (r) => <ChangePill v={r.company.change30d} />,
    },
    ...holders.map(holderCol),
    {
      key: "rank",
      title: "Your rank",
      width: 110,
      kind: "int",
      align: "center",
      value: (r) => r.rank,
      formula: (_, n, L) => `=RANK(${L(`you-${units}`)}${n}, {${L(`you-${units}`)}${n}, ${L(`northwind-${units}`)}${n}:${L(`kronos-${units}`)}${n}})`,
      render: (r) => (
        <span
          className={cn(
            "inline-flex h-6 min-w-9 items-center justify-center rounded-full px-2 text-[12px] font-semibold",
            r.rank === 1 ? "bg-[#ffd60a]/25 text-[#a05a00]" : r.rank === 2 ? "bg-black/[0.06] text-neutral-700" : "bg-black/[0.03] text-neutral-500"
          )}
        >
          #{r.rank}
        </span>
      ),
      total: (rows) => <span className="text-neutral-500">{rows.filter((r) => r.rank === 1).length}× #1</span>,
    },
    {
      key: "trend",
      title: "24M trend",
      width: 130,
      kind: "text",
      align: "center",
      value: (r) => r.company.price,
      render: (r) => <Sparkline data={r.history} width={96} height={24} color={r.company.change30d >= 0 ? "#30d158" : "#ff453a"} animate={false} />,
    },
  ];

  return cols;
}

export function matrixColumns(holders: Holder[]): Column<RegisterRow>[] {
  const heat = (h: Holder, max: number): Column<RegisterRow> => ({
    key: h.id,
    title: h.id === "you" ? "You" : h.short,
    width: 132,
    kind: "pct",
    align: "right",
    accent: h.color,
    value: (r) => r.pct[h.id],
    fill: (r) => (r.pct[h.id] > 0 ? { color: h.color, opacity: Math.min(0.5, (r.pct[h.id] / max) * 0.5) } : null),
    render: (r) => (r.pct[h.id] === 0 ? <span className="text-neutral-300">-</span> : fmt.pct(r.pct[h.id])),
    total: (rows) => <span className="text-neutral-500">avg {fmt.pct(rows.reduce((s, r) => s + r.pct[h.id], 0) / rows.length)}</span>,
  });

  const byId = Object.fromEntries(holders.map((h) => [h.id, h])) as Record<HolderId, Holder>;

  return [
    companyColumn((r) => r.company, { sub: (r) => r.company.sector }),
    heat(byId.you, 10),
    heat(byId.aurora, 50),
    ...rivalIds.map((id) => heat(byId[id], 14)),
    heat(byId.float, 70),
    {
      key: "largest",
      title: "Largest rival",
      width: 170,
      kind: "text",
      value: (r) => byId[r.largestRival.id].short,
      render: (r) => (
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: byId[r.largestRival.id].color }} />
          {byId[r.largestRival.id].short}
        </span>
      ),
    },
    {
      key: "gap",
      title: "Gap vs rival (pp)",
      width: 150,
      kind: "signedPct",
      align: "right",
      value: (r) => Number((r.pct.you - r.largestRival.pct).toFixed(2)),
      formula: (_, n, L) => `=${L("you")}${n} - MAX(${L("northwind")}${n}:${L("kronos")}${n})`,
      render: (r) => {
        const g = r.pct.you - r.largestRival.pct;
        return <span className={g >= 0 ? "text-[#248a3d]" : "text-[#d70015]"}>{`${g >= 0 ? "+" : ""}${g.toFixed(2)} pp`}</span>;
      },
    },
    {
      key: "status",
      title: "Position",
      width: 120,
      kind: "text",
      align: "center",
      value: (r) => (r.pct.you >= r.largestRival.pct ? "Leading" : "Trailing"),
      render: (r) =>
        r.pct.you >= r.largestRival.pct ? (
          <span className="rounded-full bg-[#30d158]/15 px-2.5 py-0.5 text-[12px] font-medium text-[#248a3d]">Leading</span>
        ) : (
          <span className="rounded-full bg-[#ff9f0a]/15 px-2.5 py-0.5 text-[12px] font-medium text-[#b25000]">Trailing</span>
        ),
      total: (rows) => <span className="text-neutral-500">{rows.filter((r) => r.pct.you >= r.largestRival.pct).length} leading</span>,
    },
  ];
}

const txTypeStyle: Record<Transaction["type"], string> = {
  Buy: "bg-[#0a84ff]/10 text-[#0a6bd6]",
  Sell: "bg-[#ff9f0a]/15 text-[#b25000]",
  "Dividend reinvestment": "bg-[#30d158]/15 text-[#248a3d]",
  "Rights issue": "bg-[#bf5af2]/12 text-[#8e3bbf]",
};

export function transactionColumns(): Column<Transaction>[] {
  return [
    {
      key: "id",
      title: "Reference",
      width: 150,
      kind: "text",
      value: (t) => t.id,
      render: (t) => <span className="font-mono text-[12px] text-neutral-600">{t.id}</span>,
    },
    { key: "date", title: "Trade date", width: 120, kind: "date", value: (t) => t.date },
    { ...companyColumn<Transaction>((t) => t.company), key: "tx-company", width: 230 },
    {
      key: "type",
      title: "Type",
      width: 180,
      kind: "text",
      value: (t) => t.type,
      render: (t) => <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", txTypeStyle[t.type])}>{t.type}</span>,
    },
    {
      key: "shares",
      title: "Shares",
      width: 120,
      kind: "int",
      align: "right",
      value: (t) => t.shares,
      render: (t) => <span className={t.shares < 0 ? "text-[#d70015]" : "text-neutral-900"}>{t.shares > 0 ? "+" : ""}{fmt.int(t.shares)}</span>,
      total: (rows) => fmt.int(rows.reduce((s, t) => s + t.shares, 0)),
    },
    { key: "px", title: "Price", width: 110, kind: "price", align: "right", value: (t) => t.price },
    {
      key: "amount",
      title: "Amount",
      width: 150,
      kind: "usd",
      align: "right",
      value: (t) => t.amount,
      formula: (_, n, L) => `=-${L("shares")}${n} * ${L("px")}${n}`,
      render: (t) => <span className={t.amount > 0 ? "text-[#248a3d]" : "text-neutral-900"}>{fmt.usd(t.amount)}</span>,
      total: (rows) => fmt.usd(rows.reduce((s, t) => s + t.amount, 0)),
    },
    { key: "cp", title: "Counterparty", width: 160, kind: "text", value: (t) => t.counterparty },
    { key: "settle", title: "Settlement", width: 120, kind: "date", value: (t) => t.settlement },
    {
      key: "status",
      title: "Status",
      width: 120,
      kind: "text",
      align: "center",
      value: (t) => t.status,
      render: (t) =>
        t.status === "Pending" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff9f0a]/15 px-2.5 py-0.5 text-[12px] font-medium text-[#b25000]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff9f0a] animate-pulse-soft" /> Pending
          </span>
        ) : (
          <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[12px] text-neutral-600">Settled</span>
        ),
    },
  ];
}

export const holderKindStyle: Record<Shareholder["kind"], { label: string; color: string; pill: string }> = {
  company: { label: "Company", color: "#5e5ce6", pill: "bg-[#5e5ce6]/12 text-[#4b49c4]" },
  person: { label: "Private", color: "#ff9f0a", pill: "bg-[#ff9f0a]/15 text-[#b25000]" },
};

export const formatOrgNr = (n: string) => n.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3");

export function HolderCell({ h, sub }: { h: Shareholder; sub?: string }) {
  const k = holderKindStyle[h.kind];
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold"
        style={{ background: `${k.color}1f`, color: k.color }}
      >
        {h.name.replace(/[^\p{L}\s]/gu, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-neutral-900">{h.name}</span>
        {sub && <span className="-mt-0.5 block truncate text-[11px] text-neutral-400">{sub}</span>}
      </span>
    </span>
  );
}

export function shareholderColumns(options?: {
  showBatchColumns?: boolean;
  allShareholders?: Shareholder[];
  liveTransactions?: LedgerTransaction[];
  onInspectHolder?: (h: Shareholder) => void;
}): Column<Shareholder>[] {
  const showBatch = options?.showBatchColumns ?? false;
  const allHolders = options?.allShareholders ?? [];
  const liveTxs = options?.liveTransactions ?? [];

  const summaryMap = new Map<string, ReturnType<typeof buildPersonTradeSummary>>();
  if (allHolders.length > 0) {
    for (const h of allHolders) {
      summaryMap.set(h.id, buildPersonTradeSummary(h, allHolders, liveTxs));
    }
  }

  return [
    {
      key: "name",
      title: "Shareholder",
      width: 245,
      kind: "text",
      value: (h) => h.name,
      render: (h) => <HolderCell h={h} sub={h.firstName || undefined} />,
      total: (rows) => <span className="text-neutral-500">{rows.length} holders</span>,
    },
    {
      key: "stake_pct",
      title: "Stake %",
      width: 108,
      kind: "pct",
      align: "right",
      accent: "#0a84ff",
      tint: "bg-[#0a84ff]/[0.035]",
      editable: false,
      value: (h) => h.pct,
      render: (h) => <span className="font-semibold text-neutral-900">{h.stakeText}</span>,
      formula: (_, n, L) => `=${L("num_shares")}${n} / ${SHARES_OUTSTANDING}`,
      total: (rows) => fmt.pct(rows.reduce((s, h) => s + h.pct, 0)),
    },
    {
      key: "num_shares",
      title: "Current Shares",
      width: 135,
      kind: "int",
      align: "right",
      value: (h) => h.shares,
      render: (h) => <span className="font-semibold tabular-nums text-neutral-900">{fmt.int(h.shares)}</span>,
      formula: (h) => `=HOLDING("AEQ", "${h.name}")`,
      total: (rows) => fmt.int(rows.reduce((s, h) => s + h.shares, 0)),
    },
    {
      key: "opening_shares",
      title: "Opening Shares",
      width: 130,
      kind: "int",
      align: "right",
      tint: "bg-[#c9daf8]/15",
      value: (h) => h.openingShares ?? 0,
      render: (h) =>
        h.openingShares !== null ? (
          <span className="tabular-nums text-neutral-700">{fmt.int(h.openingShares)}</span>
        ) : (
          <span className="text-neutral-300">-</span>
        ),
      total: (rows) => fmt.int(rows.reduce((s, h) => s + (h.openingShares ?? 0), 0)),
    },
    {
      key: "credits",
      title: "Credits (+In)",
      width: 128,
      kind: "int",
      align: "right",
      editable: false,
      accent: "#30d158",
      value: (h) => summaryMap.get(h.id)?.totalCredits ?? 0,
      render: (h) => {
        const c = summaryMap.get(h.id)?.totalCredits ?? 0;
        if (!c) return <span className="text-neutral-300">-</span>;
        return (
          <span className="inline-flex items-center rounded-md bg-[#30d158]/12 px-1.5 py-0.5 font-semibold tabular-nums text-[#1f7a35]">
            +{fmt.int(c)}
          </span>
        );
      },
      total: (rows) => {
        const tot = rows.reduce((s, h) => s + (summaryMap.get(h.id)?.totalCredits ?? 0), 0);
        return tot ? <span className="text-[#1f7a35]">+{fmt.int(tot)}</span> : "-";
      },
    },
    {
      key: "debits",
      title: "Debits (−Out)",
      width: 128,
      kind: "int",
      align: "right",
      editable: false,
      accent: "#ff3b30",
      value: (h) => summaryMap.get(h.id)?.totalDebits ?? 0,
      render: (h) => {
        const d = summaryMap.get(h.id)?.totalDebits ?? 0;
        if (!d) return <span className="text-neutral-300">-</span>;
        return (
          <span className="inline-flex items-center rounded-md bg-[#ff3b30]/12 px-1.5 py-0.5 font-semibold tabular-nums text-[#c92a2a]">
            −{fmt.int(d)}
          </span>
        );
      },
      total: (rows) => {
        const tot = rows.reduce((s, h) => s + (summaryMap.get(h.id)?.totalDebits ?? 0), 0);
        return tot ? <span className="text-[#c92a2a]">−{fmt.int(tot)}</span> : "-";
      },
    },
    {
      key: "trade_activity",
      title: "Trade History",
      width: 155,
      kind: "int",
      align: "center",
      editable: false,
      value: (h) => summaryMap.get(h.id)?.events.length ?? 0,
      render: (h) => {
        const sum = summaryMap.get(h.id);
        const count = sum?.events.length ?? 0;
        return (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              options?.onInspectHolder?.(h);
            }}
            className={cn(
              "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-medium transition-all",
              count > 0
                ? "bg-[#0a84ff]/12 text-[#0a6bd6] hover:bg-[#0a84ff]/20"
                : "bg-black/[0.045] text-neutral-600 hover:bg-black/[0.09]"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", count > 0 ? "bg-[#0a84ff]" : "bg-neutral-400")} />
            {count > 0 ? `${count} trade${count > 1 ? "s" : ""} · Chart` : "View profile"}
          </button>
        );
      },
    },
    {
      key: "investor_id",
      title: "Investor ID",
      width: 135,
      kind: "text",
      value: (h) => h.investorId,
      render: (h) => <span className="font-mono text-[12px] text-neutral-700">{h.investorId}</span>,
    },
    {
      key: "city",
      title: "City",
      width: 145,
      kind: "text",
      value: (h) => h.city,
      render: (h) => h.city || <span className="text-neutral-300">-</span>,
    },
    {
      key: "country",
      title: "Country",
      width: 120,
      kind: "text",
      value: (h) => h.country,
      render: (h) => h.country || <span className="text-neutral-300">-</span>,
    },
    {
      key: "email",
      title: "E-mail",
      width: 230,
      kind: "text",
      value: (h) => h.email,
      render: (h) => (
        <a href={`mailto:${h.email}`} onMouseDown={(e) => e.stopPropagation()} className="truncate text-[#0a6bd6] hover:underline">
          {h.email}
        </a>
      ),
    },
    ...(showBatch
      ? [
          {
            key: "first_name",
            title: "First name / Contact",
            width: 190,
            kind: "text" as const,
            value: (h: Shareholder) => h.firstName,
            render: (h: Shareholder) =>
              h.firstName ? <span className="font-medium text-neutral-800">{h.firstName}</span> : <span className="text-neutral-300">-</span>,
          },
          {
            key: "address",
            title: "Address",
            width: 210,
            kind: "text" as const,
            value: (h: Shareholder) => h.address,
            render: (h: Shareholder) => h.address || <span className="text-neutral-300">-</span>,
          },
          {
            key: "postal",
            title: "Postal code",
            width: 105,
            kind: "text" as const,
            value: (h: Shareholder) => h.postalCode,
            render: (h: Shareholder) => h.postalCode || <span className="text-neutral-300">-</span>,
          },
          ...TRANSFER_COLUMNS.map((tc): Column<Shareholder> => ({
            key: tc.key,
            title: `${tc.title} (${tc.group})`,
            width: 145,
            kind: "int",
            align: "right",
            accent: tc.group === "1 oktober" ? "#e06666" : "#6aa84f",
            value: (h) => h.transfers[tc.key] ?? "",
            fill: (h) => {
              const v = h.transfers[tc.key];
              if (!v) return null;
              return h.rank === 1 ? { color: "#e06666", opacity: 0.22 } : { color: "#6aa84f", opacity: 0.25 };
            },
            render: (h) => {
              const v = h.transfers[tc.key];
              if (v === undefined) return <span className="text-neutral-300">-</span>;
              return <span className={cn("font-semibold tabular-nums", h.rank === 1 ? "text-[#a61c1c]" : "text-[#1f5f1b]")}>{v}</span>;
            },
            total: (rows) => {
              const buyers = rows.filter((r) => r.rank !== 1).reduce((s, r) => s + (r.transfers[tc.key] ?? 0), 0);
              return buyers ? String(buyers) : "";
            },
          })),
        ]
      : []),
  ];
}

export function ledgerSheetColumns(onSelectParty?: (holderId: string) => void): Column<LedgerTransaction>[] {
  return [
    {
      key: "id",
      title: "Ledger Ref",
      width: 130,
      kind: "text",
      editable: false,
      value: (tx) => tx.id,
      render: (tx) => <span className="font-mono text-[12px] font-semibold text-neutral-800">{tx.id}</span>,
      total: (rows) => <span className="text-neutral-500">{rows.length} entries</span>,
    },
    {
      key: "date",
      title: "Date",
      width: 120,
      kind: "date",
      editable: false,
      value: (tx) => tx.date,
      render: (tx) => <span className="font-medium text-neutral-800">{tx.dateLabel}</span>,
    },
    {
      key: "time",
      title: "Timestamp",
      width: 120,
      kind: "text",
      editable: false,
      value: (tx) => tx.time,
      render: (tx) => <span className="font-mono text-[11.5px] text-neutral-500">{tx.time}</span>,
    },
    {
      key: "batch",
      title: "Settlement Batch",
      width: 135,
      kind: "text",
      editable: false,
      value: (tx) => tx.batchGroup,
      render: (tx) => (
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11.5px] font-medium",
            tx.batchGroup === "1 oktober"
              ? "bg-[#ff9f0a]/15 text-[#9a5b00]"
              : tx.batchGroup === "24 oktober"
                ? "bg-[#30d158]/15 text-[#1f7a35]"
                : "bg-[#0a84ff]/15 text-[#0a6bd6]"
          )}
        >
          {tx.batchGroup}
        </span>
      ),
    },
    {
      key: "seller",
      title: "Seller (Debit −)",
      width: 220,
      kind: "text",
      editable: false,
      accent: "#ff3b30",
      value: (tx) => tx.sellerName,
      render: (tx) => (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onSelectParty?.(tx.sellerId)}
          className="flex min-w-0 items-center gap-2 text-left hover:underline"
        >
          <span className="rounded bg-[#ff3b30]/12 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-[#c92a2a]">
            −OUT
          </span>
          <span className="truncate font-medium text-neutral-900">{tx.sellerName}</span>
        </button>
      ),
    },
    {
      key: "buyer",
      title: "Buyer (Credit +)",
      width: 240,
      kind: "text",
      editable: false,
      accent: "#30d158",
      value: (tx) => tx.buyerName,
      render: (tx) => (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onSelectParty?.(tx.buyerId)}
          className="flex min-w-0 items-center gap-2 text-left hover:underline"
        >
          <span className="rounded bg-[#30d158]/15 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-[#1f7a35]">
            +IN
          </span>
          <span className="truncate font-medium text-neutral-900">{tx.buyerName}</span>
        </button>
      ),
    },
    {
      key: "shares",
      title: "Shares Transferred",
      width: 155,
      kind: "int",
      align: "right",
      editable: false,
      value: (tx) => tx.shares,
      render: (tx) => <span className="font-mono font-semibold tabular-nums text-neutral-900">{fmt.int(tx.shares)}</span>,
      total: (rows) => fmt.int(rows.reduce((s, r) => s + r.shares, 0)),
    },
    {
      key: "pct",
      title: "% of Company",
      width: 120,
      kind: "pct",
      align: "right",
      editable: false,
      value: (tx) => tx.pctOfCompany,
      render: (tx) => <span className="tabular-nums text-neutral-600">{tx.pctOfCompany.toFixed(3)}%</span>,
      total: (rows) => `${rows.reduce((s, r) => s + r.pctOfCompany, 0).toFixed(2)}%`,
    },
    {
      key: "hash",
      title: "Audit Signature",
      width: 175,
      kind: "text",
      editable: false,
      value: (tx) => tx.auditHash,
      render: (tx) => (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-black/[0.04] px-2 py-0.5 font-mono text-[11px] text-neutral-600">
          <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />
          {tx.auditHash}
        </span>
      ),
    },
    {
      key: "verified",
      title: "Verified By",
      width: 185,
      kind: "text",
      editable: false,
      value: (tx) => tx.verifiedBy,
      render: (tx) => <span className="text-[12px] text-neutral-500">{tx.verifiedBy}</span>,
    },
  ];
}

export function dividendColumns(): Column<Dividend>[] {
  return [
    companyColumn<Dividend>((d) => d.company, { sub: (d) => d.company.ticker }),
    { key: "ex", title: "Ex-date", width: 120, kind: "date", value: (d) => d.exDate },
    { key: "pay", title: "Payment date", width: 130, kind: "date", value: (d) => d.payDate },
    { key: "dps", title: "Dividend / share", width: 140, kind: "price", align: "right", value: (d) => d.dps },
    { key: "shares", title: "Your shares", width: 140, kind: "int", align: "right", value: (d) => d.shares },
    {
      key: "gross",
      title: "Gross",
      width: 150,
      kind: "usd",
      align: "right",
      value: (d) => d.gross,
      formula: (_, n, L) => `=${L("dps")}${n} * ${L("shares")}${n}`,
      total: (rows) => fmt.usd(rows.reduce((s, d) => s + d.gross, 0)),
    },
    {
      key: "tax",
      title: "Withholding tax",
      width: 150,
      kind: "usd",
      align: "right",
      value: (d) => d.tax,
      formula: (_, n, L) => `=${L("gross")}${n} * IF(DOMICILE()="NO", 0, 15%)`,
      render: (d) => <span className={d.tax ? "text-[#d70015]" : "text-neutral-300"}>{d.tax ? fmt.usd(-d.tax) : "-"}</span>,
      total: (rows) => fmt.usd(-rows.reduce((s, d) => s + d.tax, 0)),
    },
    {
      key: "net",
      title: "Net income",
      width: 150,
      kind: "usd",
      align: "right",
      value: (d) => d.net,
      formula: (_, n, L) => `=${L("gross")}${n} - ${L("tax")}${n}`,
      render: (d) => <span className="font-medium text-[#248a3d]">{fmt.usd(d.net)}</span>,
      total: (rows) => <span className="text-[#248a3d]">{fmt.usd(rows.reduce((s, d) => s + d.net, 0))}</span>,
    },
    { key: "yield", title: "Yield", width: 100, kind: "pct", align: "right", value: (d) => d.yield },
  ];
}
