import { companies } from "@/lib/data/companies";
import { insights, jobs, services, team } from "@/lib/data/site";

export type SearchItem = { title: string; subtitle: string; href: string; kind: string; keywords: string };

export const searchIndex: SearchItem[] = [
  { title: "Investor relations", subtitle: "Results, key figures and governance", href: "/investors", kind: "Page", keywords: "ir shareholders results earnings dividend share price oslo bors" },
  { title: "Reports library", subtitle: "Annual, interim and ESG reports", href: "/investors#reports", kind: "Page", keywords: "annual report quarterly interim pdf download q3" },
  { title: "Financial calendar", subtitle: "Upcoming results and events", href: "/investors#calendar", kind: "Page", keywords: "next results date agm capital markets day event when" },
  { title: "Fund performance", subtitle: "Net IRR, TVPI and DPI by fund", href: "/investors", kind: "Page", keywords: "fund performance irr tvpi dpi returns fund v vi track record" },
  { title: "Stakeholder portal", subtitle: "Your shareholder register", href: "/login", kind: "Portal", keywords: "login dashboard my shares holdings register stake ownership" },
  { title: "Sustainability", subtitle: "Net-zero roadmap and ESG data", href: "/sustainability", kind: "Page", keywords: "esg climate net zero emissions responsible" },
  { title: "Careers", subtitle: `${jobs.length} open roles`, href: "/careers", kind: "Page", keywords: "jobs hiring roles work oslo london internship " + jobs.map((j) => j.title + " " + j.location).join(" ") },
  { title: "Contact", subtitle: "Offices and enquiries", href: "/contact", kind: "Page", keywords: "contact email phone office address" },
  ...services.map((s) => ({ title: s.title, subtitle: s.summary, href: `/services#${s.slug}`, kind: "Capability", keywords: s.points.join(" ") })),
  ...companies.map((c) => ({
    title: c.name,
    subtitle: `${c.sector} · ${c.hq}`,
    href: `/portfolio/${c.slug}`,
    kind: "Company",
    keywords: `${c.ticker} ${c.sector} ${c.stage} ${c.tagline} portfolio`,
  })),
  ...insights.map((i) => ({ title: i.title, subtitle: `${i.category} · ${i.author}`, href: `/insights/${i.slug}`, kind: "Insight", keywords: i.excerpt })),
  ...team.map((m) => ({ title: m.name, subtitle: m.role, href: "/about#leadership", kind: "Person", keywords: m.office + " leadership partner" })),
];

export function search(query: string, limit = 6) {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [];
  return searchIndex
    .map((item) => {
      const title = item.title.toLowerCase();
      const hay = `${title} ${item.subtitle} ${item.keywords}`.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (title.includes(t)) score += 3;
        else if (hay.includes(t)) score += 1;
      }
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);
}
