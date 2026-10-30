import { SHARES_OUTSTANDING, TRANSFER_COLUMNS, type Shareholder } from "@/lib/data/aurora-equity";
import type { CompanyMatrixRow, OwnershipBand } from "@/lib/data/company-matrix";
import { buildPersonTradeSummary, type LedgerTransaction } from "@/lib/data/ledger";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Column } from "@/components/dashboard/SheetGrid";

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

const bandStyle: Record<OwnershipBand, string> = {
  Blocking: "bg-[#5e5ce6]/15 text-[#3d3bb8]",
  Qualified: "bg-[#0a84ff]/12 text-[#0a6bd6]",
  Significant: "bg-[#30d158]/15 text-[#1f7a35]",
  Material: "bg-[#ff9f0a]/15 text-[#9a5b00]",
  Minority: "bg-black/[0.05] text-neutral-600",
};

export function companyHoldingsColumns(options?: {
  allShareholders?: Shareholder[];
  liveTransactions?: LedgerTransaction[];
  onInspectHolder?: (h: Shareholder) => void;
}): Column<Shareholder>[] {
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
      title: "Registered company",
      width: 250,
      kind: "text",
      value: (h) => h.name,
      render: (h) => <HolderCell h={h} sub={h.contact || h.firstName || undefined} />,
      total: (rows) => <span className="text-neutral-500">{rows.length} companies</span>,
    },
    {
      key: "org_nr",
      title: "Org. nr",
      width: 130,
      kind: "text",
      value: (h) => h.orgNr ?? h.investorId,
      render: (h) => <span className="font-mono text-[12px] text-neutral-700">{formatOrgNr((h.orgNr ?? h.investorId).replace(/\s+/g, ""))}</span>,
    },
    {
      key: "stake_pct",
      title: "Stake %",
      width: 108,
      kind: "pct",
      align: "right",
      accent: "#5e5ce6",
      tint: "bg-[#5e5ce6]/[0.04]",
      value: (h) => h.pct,
      render: (h) => <span className="font-semibold text-neutral-900">{h.stakeText}</span>,
      formula: (_, n, L) => `=${L("num_shares")}${n} / ${SHARES_OUTSTANDING}`,
      total: (rows) => fmt.pct(rows.reduce((s, h) => s + h.pct, 0)),
    },
    {
      key: "num_shares",
      title: "Current Shares",
      width: 140,
      kind: "int",
      align: "right",
      value: (h) => h.shares,
      render: (h) => <span className="font-semibold tabular-nums text-neutral-900">{fmt.int(h.shares)}</span>,
      total: (rows) => fmt.int(rows.reduce((s, h) => s + h.shares, 0)),
    },
    {
      key: "opening_shares",
      title: "Opening Shares",
      width: 130,
      kind: "int",
      align: "right",
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
    },
    {
      key: "debits",
      title: "Debits (−Out)",
      width: 128,
      kind: "int",
      align: "right",
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
    },
    {
      key: "trade_activity",
      title: "Trade History",
      width: 150,
      kind: "int",
      align: "center",
      value: (h) => summaryMap.get(h.id)?.events.length ?? 0,
      render: (h) => {
        const count = summaryMap.get(h.id)?.events.length ?? 0;
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
              count > 0 ? "bg-[#0a84ff]/12 text-[#0a6bd6] hover:bg-[#0a84ff]/20" : "bg-black/[0.045] text-neutral-600 hover:bg-black/[0.09]"
            )}
          >
            {count > 0 ? `${count} trade${count > 1 ? "s" : ""} · Chart` : "View profile"}
          </button>
        );
      },
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
      render: (h) =>
        h.email ? (
          <a href={`mailto:${h.email}`} onMouseDown={(e) => e.stopPropagation()} className="truncate text-[#0a6bd6] hover:underline">
            {h.email}
          </a>
        ) : (
          <span className="text-neutral-300">-</span>
        ),
    },
  ];
}

export function companyMatrixColumns(): Column<CompanyMatrixRow>[] {
  return [
    {
      key: "name",
      title: "Registered company",
      width: 240,
      kind: "text",
      value: (h) => h.name,
      render: (h) => <HolderCell h={h} sub={h.orgNr ? formatOrgNr(h.orgNr.replace(/\s+/g, "")) : undefined} />,
      total: (rows) => <span className="text-neutral-500">{rows.length} companies</span>,
    },
    {
      key: "stake",
      title: "Stake in Aurora Equity",
      width: 170,
      kind: "pct",
      align: "right",
      accent: "#5e5ce6",
      value: (h) => h.pct,
      fill: (h) => ({ color: "#5e5ce6", opacity: Math.min(0.46, (h.pct / 32) * 0.46) }),
      render: (h) => <span className="font-semibold tabular-nums">{fmt.pct(h.pct)}</span>,
      total: (rows) => fmt.pct(rows.reduce((s, h) => s + h.pct, 0)),
    },
    {
      key: "corp_block",
      title: "Share of company block",
      width: 175,
      kind: "pct",
      align: "right",
      accent: "#0a84ff",
      value: (h) => h.corporateBlockPct,
      fill: (h) => ({ color: "#0a84ff", opacity: Math.min(0.42, (h.corporateBlockPct / 45) * 0.42) }),
      render: (h) => <span className="tabular-nums">{fmt.pct(h.corporateBlockPct)}</span>,
      total: (rows) => <span className="text-neutral-500">100% of companies</span>,
    },
    {
      key: "rank",
      title: "Company rank",
      width: 120,
      kind: "int",
      align: "center",
      value: (h) => h.companyRank,
      render: (h) => (
        <span
          className={cn(
            "inline-flex h-6 min-w-9 items-center justify-center rounded-full px-2 text-[12px] font-semibold",
            h.companyRank === 1
              ? "bg-[#ffd60a]/25 text-[#a05a00]"
              : h.companyRank === 2
                ? "bg-black/[0.06] text-neutral-700"
                : "bg-black/[0.03] text-neutral-500"
          )}
        >
          #{h.companyRank}
        </span>
      ),
    },
    {
      key: "band",
      title: "Position",
      width: 130,
      kind: "text",
      align: "center",
      value: (h) => h.band,
      render: (h) => <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", bandStyle[h.band])}>{h.band}</span>,
      total: (rows) => <span className="text-neutral-500">{rows.filter((r) => r.pct >= 10).length} qualified</span>,
    },
    {
      key: "leader",
      title: "Largest company",
      width: 170,
      kind: "text",
      value: (h) => h.leaderName,
      render: (h) => <span className="truncate text-neutral-700">{h.leaderName}</span>,
    },
    {
      key: "gap",
      title: "Gap vs leader (pp)",
      width: 150,
      kind: "signedPct",
      align: "right",
      value: (h) => Number(h.gapVsLeaderPp.toFixed(2)),
      render: (h) => {
        const g = h.gapVsLeaderPp;
        return <span className={g >= 0 ? "text-[#248a3d]" : "text-[#d70015]"}>{`${g >= 0 ? "+" : ""}${g.toFixed(2)} pp`}</span>;
      },
    },
    {
      key: "peer",
      title: "Next company",
      width: 180,
      kind: "text",
      value: (h) => h.nextPeerName ?? "",
      render: (h) =>
        h.nextPeerName ? (
          <span className="truncate text-neutral-700">
            {h.nextPeerName}
            {h.nextPeerPct !== null && <span className="text-neutral-400"> · {fmt.pct(h.nextPeerPct)}</span>}
          </span>
        ) : (
          <span className="text-neutral-300">—</span>
        ),
    },
    {
      key: "city",
      title: "City cluster",
      width: 170,
      kind: "text",
      value: (h) => h.city,
      render: (h) => (
        <span className="truncate">
          {h.city || "—"}
          <span className="text-neutral-400"> · {h.cityCompanyCount}</span>
        </span>
      ),
    },
    {
      key: "city_block",
      title: "City block %",
      width: 120,
      kind: "pct",
      align: "right",
      value: (h) => h.cityBlockPct,
      fill: (h) => ({ color: "#30d158", opacity: Math.min(0.36, (h.cityBlockPct / 70) * 0.36) }),
      render: (h) => fmt.pct(h.cityBlockPct),
    },
    {
      key: "domicile",
      title: "Domicile",
      width: 110,
      kind: "text",
      align: "center",
      value: (h) => h.domicile,
      render: (h) => (
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[12px] font-medium",
            h.domicile === "Norway" ? "bg-[#30d158]/12 text-[#1f7a35]" : "bg-[#bf5af2]/12 text-[#7d3bb3]"
          )}
        >
          {h.domicile}
        </span>
      ),
      total: (rows) => <span className="text-neutral-500">{rows.filter((r) => r.domicile === "Norway").length} NO</span>,
    },
    {
      key: "shares",
      title: "Shares",
      width: 130,
      kind: "int",
      align: "right",
      value: (h) => h.shares,
      render: (h) => <span className="tabular-nums font-medium">{fmt.int(h.shares)}</span>,
      total: (rows) => fmt.int(rows.reduce((s, h) => s + h.shares, 0)),
    },
  ];
}
