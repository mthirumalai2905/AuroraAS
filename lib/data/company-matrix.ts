import { type Shareholder } from "@/lib/data/aurora-equity";

export type OwnershipBand = "Blocking" | "Qualified" | "Significant" | "Material" | "Minority";

export type CompanyMatrixRow = Shareholder & {
  companyRank: number;
  corporateShares: number;
  corporateBlockPct: number;
  leaderName: string;
  leaderPct: number;
  gapVsLeaderPp: number;
  nextPeerName: string | null;
  nextPeerPct: number | null;
  band: OwnershipBand;
  domicile: "Norway" | "Foreign";
  cityCompanyCount: number;
  cityBlockPct: number;
};

export function ownershipBand(pct: number): OwnershipBand {
  if (pct >= 100 / 3) return "Blocking";
  if (pct >= 10) return "Qualified";
  if (pct >= 5) return "Significant";
  if (pct >= 1) return "Material";
  return "Minority";
}

function normalizeCountry(country: string) {
  return country.startsWith("Norway") ? "Norway" : country.trim();
}

export function buildCompanyMatrix(shareholders: Shareholder[]): CompanyMatrixRow[] {
  const companies = shareholders.filter((h) => h.kind === "company").sort((a, b) => b.shares - a.shares);
  const corporateShares = companies.reduce((s, h) => s + h.shares, 0);
  const leader = companies[0];

  const cityShares = new Map<string, { count: number; shares: number }>();
  for (const h of companies) {
    const city = h.city.trim() || "—";
    const cur = cityShares.get(city) ?? { count: 0, shares: 0 };
    cityShares.set(city, { count: cur.count + 1, shares: cur.shares + h.shares });
  }

  return companies.map((h, i) => {
    const next = companies[i + 1] ?? null;
    const country = normalizeCountry(h.country);
    const city = h.city.trim() || "—";
    const cluster = cityShares.get(city) ?? { count: 1, shares: h.shares };
    return {
      ...h,
      companyRank: i + 1,
      corporateShares,
      corporateBlockPct: corporateShares ? (h.shares / corporateShares) * 100 : 0,
      leaderName: leader?.name ?? "—",
      leaderPct: leader?.pct ?? 0,
      gapVsLeaderPp: h.pct - (leader?.pct ?? 0),
      nextPeerName: next?.name ?? null,
      nextPeerPct: next?.pct ?? null,
      band: ownershipBand(h.pct),
      domicile: country === "Norway" ? "Norway" : "Foreign",
      cityCompanyCount: cluster.count,
      cityBlockPct: corporateShares ? (cluster.shares / corporateShares) * 100 : 0,
    };
  });
}
