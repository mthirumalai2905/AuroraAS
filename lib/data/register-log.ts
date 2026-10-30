import type { AuroraEquityRegister, Shareholder, ShareholderKind } from "@/lib/data/aurora-equity";
import { computeAuditHash, type LedgerTransaction } from "@/lib/data/ledger";

export type RegisterEventKind = "add" | "credit" | "debit" | "field_update" | "remove" | "revert";
export type RegisterEventSource = "grid" | "modal" | "copilot" | "revert" | "seed";

export type RegisterEvent = {
  id: string;
  at: string;
  actor: string;
  source: RegisterEventSource;
  kind: RegisterEventKind;
  holderId: string;
  holderName: string;
  shares: number | null;
  field: string | null;
  beforeValue: string | null;
  afterValue: string | null;
  counterpartyId: string | null;
  counterpartyName: string | null;
  groupId: string | null;
  note: string | null;
  auditHash: string;
};

export function inferHolderKind(name: string, investorId: string, explicit?: ShareholderKind): ShareholderKind {
  if (explicit) return explicit;
  const clean = investorId.replace(/\s+/g, "");
  if (/^[89]\d{8}$/.test(clean)) return "company";
  if (/\b(?:AS|ASA|AB|LTD|INC|LLC|HOLDING|INVEST|CAPITAL)\b/i.test(name)) return "company";
  return "person";
}

export function displayHolderName(name: string, firstName: string, kind: ShareholderKind) {
  return firstName && kind === "person" ? `${name} ${firstName}`.trim() : name;
}

export function composeRegister(
  rows: Shareholder[],
  meta: Pick<AuroraEquityRegister, "name" | "orgNr" | "asOf" | "shareClass">
): AuroraEquityRegister {
  const sorted = [...rows].sort((a, b) => b.shares - a.shares || a.name.localeCompare(b.name));
  const registered = sorted.reduce((sum, h) => sum + h.shares, 0);
  const outstanding = registered > 0 ? registered : 1;
  let cum = 0;
  const shareholders = sorted.map((h, idx) => {
    const kind = inferHolderKind(h.name, h.investorId, h.kind);
    const pct = (h.shares / outstanding) * 100;
    cum += pct;
    return {
      ...h,
      kind,
      displayName: displayHolderName(h.name, h.firstName, kind),
      orgNr: kind === "company" ? h.investorId : null,
      contact: kind === "company" && h.firstName ? h.firstName : null,
      rank: idx + 1,
      pct,
      cumPct: cum,
      stakeText: `${pct.toFixed(2)}%`,
    };
  });

  const companies = shareholders.filter((h) => h.kind === "company");
  const persons = shareholders.filter((h) => h.kind === "person");
  const countries = new Map<string, number>();
  for (const h of shareholders) {
    const country = h.country.startsWith("Norway") ? "Norway" : h.country;
    if (country) countries.set(country, (countries.get(country) ?? 0) + h.shares);
  }

  return {
    name: meta.name,
    orgNr: meta.orgNr,
    asOf: meta.asOf,
    shareClass: meta.shareClass,
    sharesOutstanding: registered,
    shareholders,
    summary: {
      holders: shareholders.length,
      companies: companies.length,
      persons: persons.length,
      companySharesPct: registered ? (companies.reduce((s, h) => s + h.shares, 0) / registered) * 100 : 0,
      largest: shareholders[0] ?? {
        id: "",
        rank: 0,
        kind: "company",
        name: "—",
        firstName: "",
        displayName: "—",
        investorId: "",
        orgNr: null,
        contact: null,
        address: "",
        address2: "",
        postalCode: "",
        city: "",
        country: "",
        email: "",
        shares: 0,
        openingShares: 0,
        stakeText: "0.00%",
        pct: 0,
        cumPct: 0,
        transfers: {},
      },
      top10Pct: shareholders.slice(0, 10).reduce((s, h) => s + h.pct, 0),
      countries: countries.size,
      domesticPct: registered ? ((countries.get("Norway") ?? 0) / registered) * 100 : 0,
      registered,
    },
  };
}

export function eventsToLiveLedger(events: RegisterEvent[]): LedgerTransaction[] {
  const live = events.filter((e) => e.source !== "seed" && (e.kind === "credit" || e.kind === "debit") && e.shares);
  const used = new Set<string>();
  const txs: LedgerTransaction[] = [];

  for (const event of live) {
    if (used.has(event.id)) continue;
    const pair =
      event.groupId != null
        ? live.find((other) => other.id !== event.id && other.groupId === event.groupId && other.kind !== event.kind)
        : undefined;
    if (pair) used.add(pair.id);
    used.add(event.id);

    const debit = event.kind === "debit" ? event : pair?.kind === "debit" ? pair : null;
    const credit = event.kind === "credit" ? event : pair?.kind === "credit" ? pair : null;
    const shares = event.shares ?? pair?.shares ?? 0;
    const at = new Date(event.at);
    const date = Number.isNaN(at.getTime()) ? event.at.slice(0, 10) : at.toISOString().slice(0, 10);
    const dateLabel = Number.isNaN(at.getTime())
      ? event.at
      : at.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const time = Number.isNaN(at.getTime()) ? "" : `${at.toTimeString().slice(0, 8)} CET`;

    txs.push({
      id: `LEDGER-${(event.groupId ?? event.id).slice(-8).toUpperCase()}`,
      sequence: txs.length + 1,
      date,
      dateLabel,
      time,
      batchGroup: event.source === "copilot" ? "Live Copilot" : event.source === "grid" ? "Grid edit" : "Register write",
      shares,
      pctOfCompany: 0,
      sellerId: debit?.holderId ?? credit?.counterpartyId ?? "register",
      sellerName: debit?.holderName ?? credit?.counterpartyName ?? "Register adjustment",
      sellerRank: 0,
      buyerId: credit?.holderId ?? debit?.counterpartyId ?? "register",
      buyerName: credit?.holderName ?? debit?.counterpartyName ?? "Register adjustment",
      buyerRank: 0,
      counterpartyLabel: credit?.holderName ?? debit?.holderName ?? "—",
      auditHash: event.auditHash,
      verifiedBy: `${event.actor} · ${event.source}`,
      note: event.note ?? undefined,
    });
  }

  return txs;
}

export function stampEvent(
  input: Omit<RegisterEvent, "id" | "at" | "auditHash"> & { id?: string; at?: string }
): RegisterEvent {
  const at = input.at ?? new Date().toISOString();
  const id = input.id ?? `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const auditHash = computeAuditHash(
    `${id}|${at}|${input.actor}|${input.source}|${input.kind}|${input.holderId}|${input.shares ?? ""}|${input.field ?? ""}|${input.beforeValue ?? ""}|${input.afterValue ?? ""}`
  );
  return { ...input, id, at, auditHash };
}
