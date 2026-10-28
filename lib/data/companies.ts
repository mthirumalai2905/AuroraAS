import { seeded } from "@/lib/utils";

export type Sector =
  | "Energy"
  | "Technology"
  | "Healthcare"
  | "Industrials"
  | "Financials"
  | "Consumer"
  | "Real Estate"
  | "Materials";

export type Company = {
  slug: string;
  name: string;
  ticker: string;
  sector: Sector;
  hq: string;
  founded: number;
  invested: number;
  ceo: string;
  employees: number;
  revenue: number;
  ebitdaMargin: number;
  sharesOutstanding: number;
  price: number;
  change30d: number;
  status: "Active" | "Realised";
  stage: "Buyout" | "Growth" | "Infrastructure" | "Venture";
  colors: [string, string];
  tagline: string;
  description: string;
  highlights: string[];
};

export const companies: Company[] = [
  {
    slug: "nordlys-energy",
    name: "Nordlys Energy",
    ticker: "NRDL",
    sector: "Energy",
    hq: "Oslo, Norway",
    founded: 2009,
    invested: 2016,
    ceo: "Kari Haugland",
    employees: 1840,
    revenue: 1240,
    ebitdaMargin: 38,
    sharesOutstanding: 184_000_000,
    price: 42.18,
    change30d: 6.4,
    status: "Active",
    stage: "Infrastructure",
    colors: ["#5eead4", "#38bdf8"],
    tagline: "Offshore wind and grid-scale storage for the Nordic grid.",
    description:
      "Nordlys Energy develops, owns and operates offshore wind farms and battery storage parks across Norway, Denmark and the North Sea. Since Aurora's investment, installed capacity has grown from 0.6 GW to 3.4 GW.",
    highlights: ["3.4 GW installed capacity", "5.8x growth since entry", "Net-zero operations 2024"],
  },
  {
    slug: "polaris-semiconductors",
    name: "Polaris Semiconductors",
    ticker: "PLRS",
    sector: "Technology",
    hq: "Trondheim, Norway",
    founded: 2004,
    invested: 2018,
    ceo: "Erik Lund",
    employees: 960,
    revenue: 780,
    ebitdaMargin: 31,
    sharesOutstanding: 96_500_000,
    price: 118.6,
    change30d: 11.2,
    status: "Active",
    stage: "Growth",
    colors: ["#a78bfa", "#60a5fa"],
    tagline: "Ultra-low-power chips for wearables and the edge.",
    description:
      "Polaris designs ultra-low-power wireless system-on-chips used in more than 400 million devices worldwide, from medical wearables to industrial sensors.",
    highlights: ["400M+ devices shipped", "Revenue CAGR 27%", "3 new fabs partnerships"],
  },
  {
    slug: "helix-biotherapeutics",
    name: "Helix Biotherapeutics",
    ticker: "HLXB",
    sector: "Healthcare",
    hq: "Copenhagen, Denmark",
    founded: 2012,
    invested: 2019,
    ceo: "Dr. Sofie Brandt",
    employees: 420,
    revenue: 215,
    ebitdaMargin: 12,
    sharesOutstanding: 72_400_000,
    price: 64.9,
    change30d: -3.1,
    status: "Active",
    stage: "Growth",
    colors: ["#f0abfc", "#a78bfa"],
    tagline: "Precision antibody therapies for rare autoimmune disease.",
    description:
      "Helix develops monoclonal antibody therapies targeting rare autoimmune conditions. Two candidates are in Phase III trials with readouts expected in 2027.",
    highlights: ["2 Phase III programmes", "Orphan drug designation", "$340M Series D led by Aurora"],
  },
  {
    slug: "fjordline-logistics",
    name: "Fjordline Logistics",
    ticker: "FJRD",
    sector: "Industrials",
    hq: "Bergen, Norway",
    founded: 1987,
    invested: 2015,
    ceo: "Anders Vik",
    employees: 5200,
    revenue: 2310,
    ebitdaMargin: 17,
    sharesOutstanding: 240_000_000,
    price: 18.74,
    change30d: 2.3,
    status: "Active",
    stage: "Buyout",
    colors: ["#7dd3fc", "#2563eb"],
    tagline: "Zero-emission short-sea shipping and port logistics.",
    description:
      "Fjordline operates a fleet of 64 vessels and 11 port terminals along the Nordic coast, and is converting its fleet to ammonia and battery-electric propulsion.",
    highlights: ["64 vessels, 11 terminals", "40% fleet electrified by 2028", "EBITDA doubled since entry"],
  },
  {
    slug: "meridian-payments",
    name: "Meridian Payments",
    ticker: "MRDN",
    sector: "Financials",
    hq: "Stockholm, Sweden",
    founded: 2014,
    invested: 2020,
    ceo: "Johanna Ek",
    employees: 610,
    revenue: 390,
    ebitdaMargin: 29,
    sharesOutstanding: 128_000_000,
    price: 36.25,
    change30d: 8.7,
    status: "Active",
    stage: "Growth",
    colors: ["#6ee7b7", "#14b8a6"],
    tagline: "Real-time B2B payments infrastructure for Europe.",
    description:
      "Meridian provides account-to-account payment rails and treasury APIs to 18,000 European businesses, processing over $90B in annual volume.",
    highlights: ["$90B annual volume", "18,000 business clients", "Licensed in 27 EU states"],
  },
  {
    slug: "kestrel-aerospace",
    name: "Kestrel Aerospace",
    ticker: "KSTL",
    sector: "Industrials",
    hq: "Kongsberg, Norway",
    founded: 1996,
    invested: 2017,
    ceo: "Lars Moen",
    employees: 2100,
    revenue: 960,
    ebitdaMargin: 22,
    sharesOutstanding: 88_000_000,
    price: 71.4,
    change30d: 4.9,
    status: "Active",
    stage: "Buyout",
    colors: ["#cbd5e1", "#64748b"],
    tagline: "Precision components for aerospace and satellites.",
    description:
      "Kestrel manufactures flight-critical composite structures and satellite components for leading aerospace primes across Europe and North America.",
    highlights: ["Supplier to 7 of top 10 primes", "Order backlog $2.1B", "New Toulouse facility 2025"],
  },
  {
    slug: "tidewater-aquaculture",
    name: "Tidewater Aquaculture",
    ticker: "TIDE",
    sector: "Consumer",
    hq: "Ålesund, Norway",
    founded: 2001,
    invested: 2014,
    ceo: "Marit Strand",
    employees: 1350,
    revenue: 1080,
    ebitdaMargin: 26,
    sharesOutstanding: 150_000_000,
    price: 27.9,
    change30d: -1.6,
    status: "Active",
    stage: "Buyout",
    colors: ["#38bdf8", "#0ea5e9"],
    tagline: "Closed-containment salmon farming at scale.",
    description:
      "Tidewater pioneers closed-containment and offshore salmon farming, eliminating sea-lice treatment and reducing escape risk to near zero.",
    highlights: ["Largest closed-containment operator", "ASC certified", "Exports to 41 countries"],
  },
  {
    slug: "solstice-real-estate",
    name: "Solstice Real Estate",
    ticker: "SOLS",
    sector: "Real Estate",
    hq: "Oslo, Norway",
    founded: 2008,
    invested: 2016,
    ceo: "Henrik Dahl",
    employees: 280,
    revenue: 410,
    ebitdaMargin: 61,
    sharesOutstanding: 210_000_000,
    price: 14.32,
    change30d: 1.1,
    status: "Active",
    stage: "Infrastructure",
    colors: ["#fcd34d", "#f59e0b"],
    tagline: "Net-zero commercial real estate in Nordic capitals.",
    description:
      "Solstice owns and develops a $4.6B portfolio of BREEAM Outstanding offices and logistics properties in Oslo, Stockholm, Copenhagen and Helsinki.",
    highlights: ["$4.6B gross asset value", "96% occupancy", "BREEAM Outstanding portfolio"],
  },
  {
    slug: "stratos-data-systems",
    name: "Stratos Data Systems",
    ticker: "STRS",
    sector: "Technology",
    hq: "Helsinki, Finland",
    founded: 2015,
    invested: 2021,
    ceo: "Mikko Virtanen",
    employees: 540,
    revenue: 260,
    ebitdaMargin: 18,
    sharesOutstanding: 64_000_000,
    price: 88.15,
    change30d: 14.6,
    status: "Active",
    stage: "Growth",
    colors: ["#818cf8", "#c084fc"],
    tagline: "Sovereign cloud and AI infrastructure for regulated industries.",
    description:
      "Stratos runs liquid-cooled data centres powered by 100% renewable energy, offering sovereign cloud and GPU capacity for banks, hospitals and governments.",
    highlights: ["4 hyperscale campuses", "PUE of 1.08", "ARR growth 64% YoY"],
  },
  {
    slug: "arctic-mineral-holdings",
    name: "Arctic Mineral Holdings",
    ticker: "ARCM",
    sector: "Materials",
    hq: "Kiruna, Sweden",
    founded: 1999,
    invested: 2019,
    ceo: "Per Holmgren",
    employees: 1720,
    revenue: 1460,
    ebitdaMargin: 34,
    sharesOutstanding: 132_000_000,
    price: 23.6,
    change30d: -4.2,
    status: "Active",
    stage: "Buyout",
    colors: ["#94a3b8", "#5eead4"],
    tagline: "Responsibly sourced battery metals for Europe.",
    description:
      "Arctic Mineral Holdings mines and refines nickel, cobalt and graphite for European battery manufacturers under the strictest traceability standards.",
    highlights: ["Fully traceable supply chain", "Electric mining fleet", "Offtake with 3 gigafactories"],
  },
  {
    slug: "boreal-foods",
    name: "Boreal Foods",
    ticker: "BORL",
    sector: "Consumer",
    hq: "Gothenburg, Sweden",
    founded: 1972,
    invested: 2013,
    ceo: "Elin Sjöberg",
    employees: 3100,
    revenue: 1720,
    ebitdaMargin: 15,
    sharesOutstanding: 176_000_000,
    price: 19.05,
    change30d: 0.8,
    status: "Active",
    stage: "Buyout",
    colors: ["#86efac", "#22c55e"],
    tagline: "Nordic plant-forward foods and beverages.",
    description:
      "Boreal Foods owns 14 heritage and challenger brands across oat-based dairy, bakery and functional beverages, sold in 30 markets.",
    highlights: ["14 consumer brands", "#1 in Nordic oat drinks", "30 export markets"],
  },
  {
    slug: "ember-mobility",
    name: "Ember Mobility",
    ticker: "EMBR",
    sector: "Energy",
    hq: "Amsterdam, Netherlands",
    founded: 2017,
    invested: 2022,
    ceo: "Daan Visser",
    employees: 390,
    revenue: 180,
    ebitdaMargin: 9,
    sharesOutstanding: 58_000_000,
    price: 31.4,
    change30d: 9.8,
    status: "Active",
    stage: "Venture",
    colors: ["#fb923c", "#f43f5e"],
    tagline: "High-power EV charging corridors across Europe.",
    description:
      "Ember builds and operates 350 kW charging hubs along major European highways, with 1,900 charge points live and 6,000 in development.",
    highlights: ["1,900 live charge points", "99.4% uptime", "Partnerships with 6 OEMs"],
  },
  {
    slug: "halcyon-health",
    name: "Halcyon Health",
    ticker: "HLCN",
    sector: "Healthcare",
    hq: "London, United Kingdom",
    founded: 2006,
    invested: 2018,
    ceo: "Dr. Amelia Ward",
    employees: 4600,
    revenue: 1190,
    ebitdaMargin: 20,
    sharesOutstanding: 112_000_000,
    price: 45.7,
    change30d: 3.6,
    status: "Active",
    stage: "Buyout",
    colors: ["#5eead4", "#a78bfa"],
    tagline: "Integrated outpatient and digital care clinics.",
    description:
      "Halcyon operates 120 outpatient diagnostic and specialist clinics across the UK and Nordics, combined with a digital-first care platform used by 2.3M patients.",
    highlights: ["120 clinics", "2.3M digital patients", "NPS of 78"],
  },
  {
    slug: "granite-insurance-group",
    name: "Granite Insurance Group",
    ticker: "GRNT",
    sector: "Financials",
    hq: "Oslo, Norway",
    founded: 1958,
    invested: 2012,
    ceo: "Thomas Berg",
    employees: 2400,
    revenue: 2050,
    ebitdaMargin: 24,
    sharesOutstanding: 160_000_000,
    price: 52.3,
    change30d: -0.7,
    status: "Realised",
    stage: "Buyout",
    colors: ["#e2e8f0", "#94a3b8"],
    tagline: "Specialist P&C insurance for Nordic SMEs.",
    description:
      "Granite was fully realised in 2024 through a strategic sale, returning 4.2x invested capital to Aurora Fund II investors.",
    highlights: ["4.2x gross MOIC", "Realised 2024", "Combined ratio 86%"],
  },
];

export const activeCompanies = companies.filter((c) => c.status === "Active");

export const sectors: Sector[] = Array.from(new Set(companies.map((c) => c.sector)));

export function getCompany(slug: string) {
  return companies.find((c) => c.slug === slug);
}

export function priceHistory(c: Company, points = 24) {
  const rand = seeded(c.slug + "history");
  const out: number[] = [];
  let p = c.price / (1 + c.change30d / 100) / (1 + (rand() - 0.3) * 0.4);
  for (let i = 0; i < points - 1; i++) {
    out.push(p);
    p *= 1 + (rand() - 0.46) * 0.08;
  }
  out.push(c.price);
  return out;
}
