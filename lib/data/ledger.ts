import { SHARES_OUTSTANDING, TRANSFER_COLUMNS, type Shareholder, type TransferKey } from "@/lib/data/aurora-equity";

export type LedgerEntryType = "credit" | "debit";

export type LedgerTransaction = {
  id: string;
  transferKey?: TransferKey;
  sequence: number;
  date: string; // ISO YYYY-MM-DD
  dateLabel: string; // e.g. "01 Oct 2026"
  time: string; // e.g. "09:15 CET"
  batchGroup: string; // "1 oktober" | "24 oktober" | "Live Copilot"
  shares: number;
  pctOfCompany: number;
  sellerId: string;
  sellerName: string;
  sellerRank: number;
  buyerId: string;
  buyerName: string;
  buyerRank: number;
  counterpartyLabel: string;
  auditHash: string;
  verifiedBy: string;
  note?: string;
};

export type PersonLedgerEvent = {
  tx: LedgerTransaction;
  direction: LedgerEntryType;
  signedShares: number;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyRank: number;
  balanceBefore: number;
  balanceAfter: number;
  pctAfter: number;
};

export type PersonTradeSummary = {
  holder: Shareholder;
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalDebits: number;
  netChange: number;
  netChangePct: number | null;
  creditCount: number;
  debitCount: number;
  events: PersonLedgerEvent[];
  balanceSeries: { label: string; date: string; time: string; shares: number; delta: number; counterparty?: string }[];
  auditDigest: string;
};

// Deterministic FNV-1a 32-bit hex digest for tamper-evident audit trail
export function computeAuditHash(payload: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + (i & 0xff);
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return `AEQ-${hex1.slice(0, 4).toUpperCase()}-${hex2.slice(0, 6).toUpperCase()}`;
}

const BATCH_TIMESTAMPS: Record<TransferKey, { date: string; dateLabel: string; time: string }> = {
  t01: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "09:12:04 CET" },
  t02: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "09:24:18 CET" },
  t03: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "09:41:50 CET" },
  t04: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "10:05:33 CET" },
  t05: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "10:19:12 CET" },
  t06: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "10:48:09 CET" },
  t07: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "11:02:44 CET" },
  t08: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "11:27:15 CET" },
  t09: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "12:14:30 CET" },
  t10: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "13:08:52 CET" },
  t11: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "13:45:19 CET" },
  t12: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "14:22:07 CET" },
  t13: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "15:10:41 CET" },
  t14: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "15:54:28 CET" },
  t15: { date: "2026-10-01", dateLabel: "01 Oct 2026", time: "16:30:00 CET" },
  t16: { date: "2026-10-24", dateLabel: "24 Oct 2026", time: "09:18:11 CET" },
  t17: { date: "2026-10-24", dateLabel: "24 Oct 2026", time: "10:04:36 CET" },
  t18: { date: "2026-10-24", dateLabel: "24 Oct 2026", time: "10:52:20 CET" },
  t19: { date: "2026-10-24", dateLabel: "24 Oct 2026", time: "11:39:47 CET" },
  t20: { date: "2026-10-24", dateLabel: "24 Oct 2026", time: "12:25:03 CET" },
  t21: { date: "2026-10-24", dateLabel: "24 Oct 2026", time: "13:48:19 CET" },
  t22: { date: "2026-10-24", dateLabel: "24 Oct 2026", time: "14:16:55 CET" },
  t23: { date: "2026-10-24", dateLabel: "24 Oct 2026", time: "15:09:30 CET" },
  t24: { date: "2026-10-24", dateLabel: "24 Oct 2026", time: "16:02:14 CET" },
};

/**
 * Reconstructs the complete double-entry ledger from the shareholder register
 * plus any live session transfers executed via Registrar Copilot.
 */
export function buildLedgerTransactions(
  shareholders: Shareholder[],
  liveTransactions: LedgerTransaction[] = []
): LedgerTransaction[] {
  const byId = new Map(shareholders.map((h) => [h.id, h]));
  // Primary seller in the historical October batches is SEMANTIC AS (rank 1 / investorId 894577002)
  const semantic =
    shareholders.find((h) => h.investorId === "894577002" || h.name.toUpperCase() === "SEMANTIC AS") ??
    shareholders[0];

  const historical: LedgerTransaction[] = [];

  TRANSFER_COLUMNS.forEach((col, idx) => {
    const key = col.key;
    const meta = BATCH_TIMESTAMPS[key];

    // Find buyer row(s) (non-seller rows that have a transfer entry in this column)
    const buyerRow = shareholders.find((h) => h.id !== semantic?.id && (h.transfers[key] ?? 0) > 0);
    const sellerAmount = semantic?.transfers[key] ?? buyerRow?.transfers[key] ?? 0;

    if (!sellerAmount && !buyerRow) return;

    const shares = buyerRow?.transfers[key] ?? sellerAmount;
    const buyerName = buyerRow ? buyerRow.displayName : col.title;
    const buyerId = buyerRow ? buyerRow.id : `unmatched-${key}`;
    const buyerRank = buyerRow ? buyerRow.rank : 999;

    const sellerId = semantic ? semantic.id : "semantic-as";
    const sellerName = semantic ? semantic.displayName : "SEMANTIC AS";
    const sellerRank = semantic ? semantic.rank : 1;

    const prevHash = historical.length > 0 ? historical[historical.length - 1].auditHash : "GENESIS-938395063";
    const auditHash = computeAuditHash(`${prevHash}|${key}|${meta.date}|${sellerId}->${buyerId}|${shares}`);

    historical.push({
      id: `LEDGER-${key.toUpperCase()}`,
      transferKey: key,
      sequence: idx + 1,
      date: meta.date,
      dateLabel: meta.dateLabel,
      time: meta.time,
      batchGroup: col.group,
      shares,
      pctOfCompany: (shares / SHARES_OUTSTANDING) * 100,
      sellerId,
      sellerName,
      sellerRank,
      buyerId,
      buyerName,
      buyerRank,
      counterpartyLabel: col.title,
      auditHash,
      verifiedBy: "paal@synx.tools · CSD Batch",
      note: ` Share transfer batch (${col.group}) — ${col.title}`,
    });
  });

  // Refresh ranks from current live shareholder table if available
  const all = [...historical, ...liveTransactions].map((tx, i) => {
    const s = byId.get(tx.sellerId);
    const b = byId.get(tx.buyerId);
    return {
      ...tx,
      sequence: i + 1,
      sellerRank: s ? s.rank : tx.sellerRank,
      buyerRank: b ? b.rank : tx.buyerRank,
    };
  });

  return all;
}

/**
 * Builds a complete per-person trade history, balance trajectory, and credit/debit breakdown.
 */
export function buildPersonTradeSummary(
  holder: Shareholder,
  shareholders: Shareholder[],
  liveTransactions: LedgerTransaction[] = []
): PersonTradeSummary {
  const allTxs = buildLedgerTransactions(shareholders, liveTransactions);
  const matching = allTxs.filter((tx) => tx.sellerId === holder.id || tx.buyerId === holder.id);

  const totalCredits = matching
    .filter((tx) => tx.buyerId === holder.id)
    .reduce((sum, tx) => sum + tx.shares, 0);
  const totalDebits = matching
    .filter((tx) => tx.sellerId === holder.id)
    .reduce((sum, tx) => sum + tx.shares, 0);

  // Derive opening balance accurately:
  // If openingShares is recorded in the sheet, use it; otherwise reconstruct from current shares - credits + debits
  const inferredOpening =
    holder.openingShares !== null && holder.openingShares !== undefined
      ? holder.openingShares
      : Math.max(0, holder.shares - totalCredits + totalDebits);

  let running = inferredOpening;
  const events: PersonLedgerEvent[] = [];
  const balanceSeries: PersonTradeSummary["balanceSeries"] = [
    {
      label: "Opening",
      date: "2026-09-30",
      time: "08:00:00 CET",
      shares: inferredOpening,
      delta: 0,
      counterparty: "Opening register balance",
    },
  ];

  for (const tx of matching) {
    const isCredit = tx.buyerId === holder.id;
    const signedShares = isCredit ? tx.shares : -tx.shares;
    const balanceBefore = running;
    const balanceAfter = Math.max(0, running + signedShares);
    running = balanceAfter;

    const counterpartyId = isCredit ? tx.sellerId : tx.buyerId;
    const counterpartyName = isCredit ? tx.sellerName : tx.buyerName;
    const counterpartyRank = isCredit ? tx.sellerRank : tx.buyerRank;

    events.push({
      tx,
      direction: isCredit ? "credit" : "debit",
      signedShares,
      counterpartyId,
      counterpartyName,
      counterpartyRank,
      balanceBefore,
      balanceAfter,
      pctAfter: (balanceAfter / SHARES_OUTSTANDING) * 100,
    });

    balanceSeries.push({
      label: tx.dateLabel.replace(" 2026", ""),
      date: tx.date,
      time: tx.time,
      shares: balanceAfter,
      delta: signedShares,
      counterparty: `${isCredit ? "From" : "To"} ${counterpartyName}`,
    });
  }

  // If current live share count differs from last event (e.g. direct cell edit or historical adjustment), append current snapshot point
  if (running !== holder.shares) {
    const diff = holder.shares - running;
    balanceSeries.push({
      label: "Current",
      date: "2026-10-24",
      time: "17:30:00 CET",
      shares: holder.shares,
      delta: diff,
      counterparty: "Register reconciliation",
    });
  } else if (balanceSeries.length === 1) {
    balanceSeries.push({
      label: "24 Oct",
      date: "2026-10-24",
      time: "17:30:00 CET",
      shares: holder.shares,
      delta: 0,
      counterparty: "No transfers in period",
    });
  }

  const netChange = holder.shares - inferredOpening;
  const netChangePct = inferredOpening > 0 ? (netChange / inferredOpening) * 100 : null;

  const auditDigest = computeAuditHash(
    `${holder.id}|${holder.investorId}|open:${inferredOpening}|close:${holder.shares}|txs:${events.length}`
  );

  return {
    holder,
    openingBalance: inferredOpening,
    closingBalance: holder.shares,
    totalCredits,
    totalDebits,
    netChange,
    netChangePct,
    creditCount: events.filter((e) => e.direction === "credit").length,
    debitCount: events.filter((e) => e.direction === "debit").length,
    events,
    balanceSeries,
    auditDigest,
  };
}
