import { activeCompanies, priceHistory, type Company } from "@/lib/data/companies";
import { seeded } from "@/lib/utils";

export type HolderId = "you" | "aurora" | "northwind" | "blackfjord" | "sterling" | "kronos" | "float";

export type Holder = { id: HolderId; name: string; short: string; color: string };

export const rivalIds: HolderId[] = ["northwind", "blackfjord", "sterling", "kronos"];

export function getHolders(stakeholderEntity: string): Holder[] {
  return [
    { id: "you", name: stakeholderEntity, short: "You", color: "#0a84ff" },
    { id: "aurora", name: "Aurora Equity (anchor)", short: "Aurora Equity", color: "#30d158" },
    { id: "northwind", name: "Northwind Capital", short: "Northwind", color: "#ff9f0a" },
    { id: "blackfjord", name: "Blackfjord Partners", short: "Blackfjord", color: "#bf5af2" },
    { id: "sterling", name: "Sterling & Vale", short: "Sterling & Vale", color: "#ff375f" },
    { id: "kronos", name: "Kronos Investment Board", short: "Kronos", color: "#64d2ff" },
    { id: "float", name: "Free float & others", short: "Free float", color: "#8e8e93" },
  ];
}

export type RegisterRow = {
  id: string;
  company: Company;
  history: number[];
  shares: Record<HolderId, number>;
  pct: Record<HolderId, number>;
  value: Record<HolderId, number>;
  rank: number;
  largestRival: { id: HolderId; pct: number };
};

export type Transaction = {
  id: string;
  date: string;
  settlement: string;
  company: Company;
  type: "Buy" | "Sell" | "Dividend reinvestment" | "Rights issue";
  shares: number;
  price: number;
  amount: number;
  counterparty: string;
  status: "Settled" | "Pending";
};

export type Dividend = {
  id: string;
  company: Company;
  exDate: string;
  payDate: string;
  dps: number;
  shares: number;
  gross: number;
  tax: number;
  net: number;
  yield: number;
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
const AS_OF = new Date("2026-10-28T12:00:00Z");

export function buildRegister(stakeholderId: string) {
  const rows: RegisterRow[] = activeCompanies.map((c) => {
    const rand = seeded(`${stakeholderId}:${c.slug}`);
    const raw: Partial<Record<HolderId, number>> = {
      aurora: 0.22 + rand() * 0.26,
      you: 0.008 + rand() * 0.075,
    };
    for (const r of rivalIds) raw[r] = rand() < 0.15 ? 0 : 0.015 + rand() * 0.12;

    const named = (["you", "aurora", ...rivalIds] as HolderId[]).reduce((s, k) => s + (raw[k] ?? 0), 0);
    if (named > 0.9) {
      const scale = 0.9 / named;
      for (const k of Object.keys(raw) as HolderId[]) raw[k] = (raw[k] ?? 0) * scale;
    }

    const shares = {} as Record<HolderId, number>;
    let allocated = 0;
    for (const k of ["you", "aurora", ...rivalIds] as HolderId[]) {
      shares[k] = Math.round(((raw[k] ?? 0) * c.sharesOutstanding) / 1000) * 1000;
      allocated += shares[k];
    }
    shares.float = c.sharesOutstanding - allocated;

    const pct = {} as Record<HolderId, number>;
    const value = {} as Record<HolderId, number>;
    for (const k of Object.keys(shares) as HolderId[]) {
      pct[k] = (shares[k] / c.sharesOutstanding) * 100;
      value[k] = shares[k] * c.price;
    }

    const contenders = (["you", ...rivalIds] as HolderId[]).sort((a, b) => shares[b] - shares[a]);
    const rank = contenders.indexOf("you") + 1;
    const topRival = rivalIds.reduce((best, r) => (shares[r] > shares[best] ? r : best), rivalIds[0]);

    return {
      id: c.slug,
      company: c,
      history: priceHistory(c),
      shares,
      pct,
      value,
      rank,
      largestRival: { id: topRival, pct: pct[topRival] },
    };
  });

  const rand = seeded(`${stakeholderId}:tx`);
  const counterparties = ["Aurora Registrar", "DNB Markets", "SEB", "Nordea Markets", "Pareto Securities", "Carnegie"];
  const types: Transaction["type"][] = ["Buy", "Buy", "Buy", "Sell", "Dividend reinvestment", "Rights issue"];
  const transactions: Transaction[] = Array.from({ length: 38 }, () => {
    const c = activeCompanies[Math.floor(rand() * activeCompanies.length)];
    const date = addDays(AS_OF, -Math.floor(rand() * 360) - 1);
    const type = types[Math.floor(rand() * types.length)];
    const shares = Math.round((5_000 + rand() * 240_000) / 100) * 100;
    const price = Number((c.price * (0.82 + rand() * 0.24)).toFixed(2));
    return {
      id: "",
      date: iso(date),
      settlement: iso(addDays(date, 2)),
      company: c,
      type,
      shares: type === "Sell" ? -shares : shares,
      price,
      amount: (type === "Sell" ? 1 : -1) * shares * price,
      counterparty: type === "Rights issue" ? "Aurora Registrar" : counterparties[Math.floor(rand() * counterparties.length)],
      status: "Settled" as const,
    };
  })
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((t, i, arr) => ({
      ...t,
      id: `TX-${t.date.slice(0, 4)}-${String(arr.length - i + 400).padStart(4, "0")}`,
      status: (i < 3 ? "Pending" : "Settled") as Transaction["status"],
    }));

  const dividends: Dividend[] = rows
    .filter((r) => r.company.stage !== "Venture" && r.company.ebitdaMargin >= 15)
    .flatMap((r) => {
      const dr = seeded(`${stakeholderId}:${r.id}:div`);
      const yld = 2 + dr() * 3.5;
      return [0, 1].map((half) => {
        const ex = addDays(AS_OF, -Math.floor(dr() * 150) - half * 180);
        const dps = Number(((r.company.price * yld) / 100 / 2).toFixed(2));
        const shares = r.shares.you;
        const gross = dps * shares;
        const tax = r.company.hq.includes("Norway") ? 0 : gross * 0.15;
        return {
          id: `${r.id}-${half}`,
          company: r.company,
          exDate: iso(ex),
          payDate: iso(addDays(ex, 14)),
          dps,
          shares,
          gross,
          tax,
          net: gross - tax,
          yield: yld,
        };
      });
    })
    .sort((a, b) => b.payDate.localeCompare(a.payDate));

  const totalValue = rows.reduce((s, r) => s + r.value.you, 0);
  const totalShares = rows.reduce((s, r) => s + r.shares.you, 0);
  const avgPct = rows.reduce((s, r) => s + r.pct.you, 0) / rows.length;
  const prevValue = rows.reduce((s, r) => s + r.value.you / (1 + r.company.change30d / 100), 0);
  const leadCount = rows.filter((r) => r.rank === 1).length;
  const income12m = dividends.filter((d) => d.payDate >= iso(addDays(AS_OF, -365))).reduce((s, d) => s + d.net, 0);

  return {
    asOf: iso(AS_OF),
    rows,
    transactions,
    dividends,
    summary: {
      totalValue,
      totalShares,
      avgPct,
      change30d: ((totalValue - prevValue) / prevValue) * 100,
      leadCount,
      positions: rows.length,
      income12m,
    },
  };
}

export type Register = ReturnType<typeof buildRegister>;
