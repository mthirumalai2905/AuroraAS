const int = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const dec2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const fmt = {
  int: (n: number) => int.format(n),
  dec: (n: number) => dec2.format(n),
  compact: (n: number) => compact.format(n),
  usd: (n: number) => usd.format(n),
  usd2: (n: number) => usd2.format(n),
  usdCompact: (n: number) => "$" + compact.format(n),
  pct: (n: number, digits = 2) => `${n.toFixed(digits)}%`,
  signedPct: (n: number, digits = 1) => `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`,
  date: (iso: string) => dateFmt.format(new Date(iso)),
};
