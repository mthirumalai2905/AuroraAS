export const navLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Capabilities" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/investors", label: "Investors" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/insights", label: "Insights" },
  { href: "/careers", label: "Careers" },
];

export const headlineStats = [
  { value: 48.6, prefix: "$", suffix: "B", decimals: 1, label: "Assets under management" },
  { value: 22.4, suffix: "%", decimals: 1, label: "Gross IRR since inception" },
  { value: 13, label: "Active portfolio companies" },
  { value: 27, label: "Years compounding capital" },
];

export type Service = {
  slug: string;
  title: string;
  icon: "landmark" | "trending-up" | "layers" | "shield" | "handshake" | "zap";
  summary: string;
  description: string;
  points: string[];
  metric: { value: string; label: string };
  image: string;
};

export const services: Service[] = [
  {
    slug: "private-equity",
    image: "/images/card-institution.jpg",
    title: "Private Equity",
    icon: "landmark",
    summary: "Control investments in market-leading Nordic and European businesses.",
    description:
      "We partner with founders and management teams to build category leaders, taking majority positions in businesses with enterprise values between $200M and $3B.",
    points: ["Majority & co-control buyouts", "Operational value creation", "Buy-and-build platforms"],
    metric: { value: "$21.4B", label: "Committed capital" },
  },
  {
    slug: "growth-equity",
    image: "/images/card-grow.jpg",
    title: "Growth Equity",
    icon: "trending-up",
    summary: "Minority capital for founders scaling globally.",
    description:
      "Flexible minority growth capital for technology, healthcare and fintech companies with proven product-market fit and a path to international scale.",
    points: ["$25M–$250M cheques", "Board-level partnership", "Go-to-market acceleration"],
    metric: { value: "34", label: "Growth investments" },
  },
  {
    slug: "infrastructure",
    image: "/images/card-turbine.jpg",
    title: "Infrastructure & Energy",
    icon: "zap",
    summary: "Long-duration capital for the energy transition.",
    description:
      "We invest in the physical backbone of the low-carbon economy: renewable generation, storage, grids, charging and sustainable real estate.",
    points: ["Renewables & storage", "Digital infrastructure", "Sustainable real assets"],
    metric: { value: "7.2 GW", label: "Clean capacity financed" },
  },
  {
    slug: "asset-management",
    image: "/images/card-prism.jpg",
    title: "Asset Management",
    icon: "layers",
    summary: "Listed equity and credit strategies for institutions.",
    description:
      "Our public markets team manages concentrated Nordic equity and investment-grade credit mandates for pension funds, endowments and insurers.",
    points: ["Nordic long-only equity", "Sustainable credit", "Bespoke mandates"],
    metric: { value: "$11.8B", label: "Public markets AUM" },
  },
  {
    slug: "wealth-advisory",
    image: "/images/card-stones.jpg",
    title: "Wealth & Family Office",
    icon: "shield",
    summary: "Private wealth stewardship for families and foundations.",
    description:
      "A multi-family office offering co-investment access, estate structuring and consolidated reporting for a select group of families and foundations.",
    points: ["Co-investment access", "Estate & succession planning", "Consolidated reporting"],
    metric: { value: "140+", label: "Families served" },
  },
  {
    slug: "corporate-finance",
    image: "/images/card-rings.jpg",
    title: "Corporate Finance & M&A",
    icon: "handshake",
    summary: "Independent advice on transactions that define companies.",
    description:
      "Our advisory team supports boards on mergers, acquisitions, capital raises and restructurings — independent of our investment activities.",
    points: ["Sell-side & buy-side M&A", "Equity & debt capital markets", "Strategic reviews"],
    metric: { value: "$62B", label: "Transactions advised" },
  },
];

export const approachSteps = [
  {
    title: "Source with conviction",
    body: "Thematic research and a 27-year network surface opportunities long before they reach a process. 70% of our deals are proprietary.",
  },
  {
    title: "Underwrite with discipline",
    body: "Every investment is stress-tested across downside scenarios, ESG materiality and a clear value-creation plan before capital is committed.",
  },
  {
    title: "Build with operators",
    body: "Our 40-person operating team works alongside management on pricing, digital, talent and sustainability from day one.",
  },
  {
    title: "Realise with care",
    body: "We exit when businesses are ready — to strategic owners, public markets or long-term holders — never just when the fund clock says so.",
  },
];

export const values = [
  { title: "Patient capital", body: "We measure success in decades, not quarters, and structure our funds to match." },
  { title: "Radical transparency", body: "Stakeholders see what we see — real-time registers, open reporting, no surprises." },
  { title: "Operator mindset", body: "We roll up our sleeves. Half of our partners have run companies themselves." },
  { title: "Responsible by design", body: "Sustainability is underwritten, not appended. It is how durable value is built." },
];

export const timeline = [
  { year: "1998", title: "Founded in Oslo", body: "Aurora AS is founded by three partners with a $120M first fund." },
  { year: "2004", title: "Nordic expansion", body: "Offices open in Stockholm and Copenhagen. Fund II closes at $650M." },
  { year: "2011", title: "Infrastructure platform", body: "Launch of our dedicated energy and infrastructure strategy." },
  { year: "2016", title: "London & Singapore", body: "International expansion to serve a global LP base across 24 countries." },
  { year: "2021", title: "Net-zero commitment", body: "Portfolio-wide science-based targets and a net-zero 2040 pledge." },
  { year: "2026", title: "Fund VI — $8.5B", body: "Our largest flagship fund, oversubscribed and closed at hard cap." },
];

export const team = [
  { name: "Ingvild Aas", role: "Managing Partner & CEO", office: "Oslo", bio: "Joined in 2003. Previously at McKinsey and Norges Bank Investment Management." },
  { name: "Henrik Solheim", role: "Chief Investment Officer", office: "Oslo", bio: "Leads the investment committee. 25 years in Nordic private equity." },
  { name: "Clara Lindqvist", role: "Partner, Technology", office: "Stockholm", bio: "Former founder and COO of a Nordic SaaS unicorn." },
  { name: "James Okafor", role: "Partner, Infrastructure", office: "London", bio: "Built Europe's largest offshore wind financing practice." },
  { name: "Mette Kjær", role: "Partner, Healthcare", office: "Copenhagen", bio: "Physician by training; 15 years in life sciences investing." },
  { name: "Wei Ling Tan", role: "Head of Asia & LP Relations", office: "Singapore", bio: "Oversees relationships with 180 institutional investors." },
  { name: "Olav Brekke", role: "Chief Financial Officer", office: "Oslo", bio: "Previously CFO of an Oslo Børs listed industrial group." },
  { name: "Sara Nilsen", role: "Head of Sustainability", office: "Oslo", bio: "Former advisor to the UN Principles for Responsible Investment." },
];

export const offices = [
  { city: "Oslo", role: "Headquarters", address: "Aker Brygge, Stranden 1, 0250 Oslo", phone: "+47 22 00 00 00", tz: "Europe/Oslo" },
  { city: "Stockholm", role: "Nordic office", address: "Birger Jarlsgatan 12, 114 34 Stockholm", phone: "+46 8 000 00 00", tz: "Europe/Stockholm" },
  { city: "Copenhagen", role: "Nordic office", address: "Kongens Nytorv 8, 1050 København", phone: "+45 33 00 00 00", tz: "Europe/Copenhagen" },
  { city: "London", role: "International", address: "1 St James's Square, London SW1Y 4JU", phone: "+44 20 0000 0000", tz: "Europe/London" },
  { city: "Singapore", role: "Asia-Pacific", address: "8 Marina View, Asia Square, 018960", phone: "+65 6000 0000", tz: "Asia/Singapore" },
];

export const funds = [
  { name: "Aurora Fund II", vintage: 2004, size: 0.65, status: "Realised", irr: 24.1, tvpi: 3.1, dpi: 3.1 },
  { name: "Aurora Fund III", vintage: 2009, size: 1.4, status: "Realised", irr: 21.7, tvpi: 2.8, dpi: 2.7 },
  { name: "Aurora Fund IV", vintage: 2014, size: 2.9, status: "Harvesting", irr: 23.5, tvpi: 2.6, dpi: 1.9 },
  { name: "Aurora Fund V", vintage: 2019, size: 5.2, status: "Investing", irr: 19.8, tvpi: 1.7, dpi: 0.4 },
  { name: "Aurora Infrastructure II", vintage: 2021, size: 3.6, status: "Investing", irr: 14.2, tvpi: 1.3, dpi: 0.1 },
  { name: "Aurora Fund VI", vintage: 2026, size: 8.5, status: "Investing", irr: 0, tvpi: 1.0, dpi: 0 },
];

export const reports = [
  { title: "Annual Report 2025", type: "Annual report", date: "2026-03-14", size: "8.4 MB" },
  { title: "Q3 2026 Interim Report", type: "Quarterly report", date: "2026-10-22", size: "2.1 MB" },
  { title: "Q2 2026 Interim Report", type: "Quarterly report", date: "2026-07-17", size: "2.0 MB" },
  { title: "Sustainability Report 2025", type: "ESG report", date: "2026-04-02", size: "6.2 MB" },
  { title: "Q1 2026 Interim Report", type: "Quarterly report", date: "2026-04-24", size: "1.9 MB" },
  { title: "Annual Report 2024", type: "Annual report", date: "2025-03-12", size: "7.9 MB" },
  { title: "Corporate Governance Statement 2025", type: "Governance", date: "2026-03-14", size: "0.9 MB" },
];

export const financialCalendar = [
  { date: "2026-11-12", event: "Capital Markets Day", location: "Oslo & webcast" },
  { date: "2027-02-11", event: "Q4 2026 Results", location: "Webcast 08:00 CET" },
  { date: "2027-03-12", event: "Annual Report 2026", location: "Online" },
  { date: "2027-04-28", event: "Annual General Meeting", location: "Aker Brygge, Oslo" },
  { date: "2027-05-06", event: "Q1 2027 Results", location: "Webcast 08:00 CET" },
];

export const keyFigures = [
  { label: "Fee-related earnings", value: "$612M", change: "+14%" },
  { label: "Net income", value: "$1.04B", change: "+18%" },
  { label: "Dividend per share", value: "$2.40", change: "+9%" },
  { label: "Fundraising YTD", value: "$9.7B", change: "+41%" },
];

export type Insight = {
  slug: string;
  title: string;
  category: "Market outlook" | "Energy transition" | "Technology" | "Private markets" | "Sustainability";
  date: string;
  readTime: number;
  author: string;
  excerpt: string;
  body: string[];
};

export const categoryImage: Record<Insight["category"], string> = {
  "Market outlook": "/images/fjord.jpg",
  "Energy transition": "/images/card-turbine.jpg",
  Technology: "/images/card-prism.jpg",
  "Private markets": "/images/card-institution.jpg",
  Sustainability: "/images/card-grow.jpg",
};

export const insights: Insight[] = [
  {
    slug: "nordic-private-markets-outlook-2027",
    title: "Nordic private markets outlook 2027: quality at a fair price",
    category: "Market outlook",
    date: "2026-10-20",
    readTime: 8,
    author: "Henrik Solheim",
    excerpt:
      "With rates stabilising and valuation gaps narrowing, we see the strongest entry window for high-quality Nordic assets since 2013.",
    body: [
      "After two years of subdued deal activity, the Nordic private markets are entering a new phase. Financing costs have stabilised, and the gap between buyer and seller expectations has narrowed meaningfully.",
      "We believe the coming 24 months will reward investors who can underwrite operational improvement rather than multiple expansion. Businesses with pricing power, recurring revenue and energy-transition tailwinds remain our priority.",
      "Our pipeline is the deepest in the firm's history, with particular strength in industrial technology, healthcare services and digital infrastructure.",
    ],
  },
  {
    slug: "financing-the-grid",
    title: "Financing the grid: why storage is the next trillion-dollar asset class",
    category: "Energy transition",
    date: "2026-09-28",
    readTime: 6,
    author: "James Okafor",
    excerpt: "Renewables are now cheap. Moving and storing their power is the bottleneck — and the opportunity.",
    body: [
      "Europe added record renewable capacity last year, yet curtailment rates have risen across several markets. The constraint is no longer generation; it is flexibility.",
      "Grid-scale storage, interconnectors and demand-response platforms are emerging as an infrastructure asset class with contracted, inflation-linked cash flows.",
      "Through Nordlys Energy and our Infrastructure II fund we have deployed over $1.2B into storage, and expect to double that by 2028.",
    ],
  },
  {
    slug: "ai-in-the-portfolio",
    title: "AI in the portfolio: from pilots to P&L",
    category: "Technology",
    date: "2026-09-05",
    readTime: 7,
    author: "Clara Lindqvist",
    excerpt: "How our operating team helped 11 portfolio companies move generative AI from experiments to measurable margin gains.",
    body: [
      "Eighteen months ago, most of our portfolio companies were running isolated AI pilots. Today, eleven have AI-driven workflows in production with measurable impact.",
      "The biggest gains came not from customer-facing chatbots but from back-office processes: claims handling, procurement, quality control and software development.",
      "Across the portfolio, we estimate an aggregate EBITDA uplift of $140M annually from initiatives launched since 2025.",
    ],
  },
  {
    slug: "the-case-for-continuation-funds",
    title: "The case for continuation funds, done right",
    category: "Private markets",
    date: "2026-08-14",
    readTime: 5,
    author: "Ingvild Aas",
    excerpt: "Continuation vehicles can align everyone — if governance, pricing and choice are handled with care.",
    body: [
      "Continuation funds have become a mainstream liquidity tool. Used well, they let investors stay invested in trophy assets while offering liquidity to those who need it.",
      "We insist on three principles: a competitive price discovery process, a genuine choice for every investor, and GP commitment that rolls over in full.",
    ],
  },
  {
    slug: "measuring-what-matters",
    title: "Measuring what matters: our 2025 impact data",
    category: "Sustainability",
    date: "2026-07-30",
    readTime: 4,
    author: "Sara Nilsen",
    excerpt: "Portfolio emissions fell 31% while revenues grew 19%. Here is what drove the decoupling.",
    body: [
      "Our 2025 sustainability report shows portfolio-wide Scope 1 and 2 emissions down 31% year on year, while aggregate revenues grew 19%.",
      "Electrification of operations at Fjordline and Arctic Mineral Holdings accounted for over half of the reduction.",
    ],
  },
  {
    slug: "healthcare-services-consolidation",
    title: "Healthcare services: the consolidation opportunity",
    category: "Private markets",
    date: "2026-06-18",
    readTime: 6,
    author: "Mette Kjær",
    excerpt: "Fragmented outpatient markets and digital care create a rare buy-and-build setup across Northern Europe.",
    body: [
      "Outpatient care in Northern Europe remains highly fragmented, with the top five operators holding less than 15% market share in most specialties.",
      "Combining clinic networks with digital front doors creates better patient outcomes and superior unit economics — the thesis behind Halcyon Health.",
    ],
  },
];

export function getInsight(slug: string) {
  return insights.find((i) => i.slug === slug);
}

export const jobs = [
  { title: "Associate, Private Equity", team: "Investments", location: "Oslo", type: "Full-time" },
  { title: "Vice President, Infrastructure", team: "Investments", location: "London", type: "Full-time" },
  { title: "Senior Data Engineer", team: "Technology", location: "Stockholm", type: "Full-time" },
  { title: "Investor Relations Manager", team: "Capital Formation", location: "Singapore", type: "Full-time" },
  { title: "ESG Analyst", team: "Sustainability", location: "Oslo", type: "Full-time" },
  { title: "Operating Partner, Digital", team: "Portfolio Operations", location: "Copenhagen", type: "Full-time" },
  { title: "Fund Accountant", team: "Finance", location: "Oslo", type: "Full-time" },
  { title: "Summer Analyst 2027", team: "Investments", location: "Oslo / Stockholm", type: "Internship" },
];

export const esgMetrics = [
  { value: 31, suffix: "%", label: "Reduction in portfolio Scope 1+2 emissions (YoY)" },
  { value: 7.2, suffix: " GW", decimals: 1, label: "Clean energy capacity financed" },
  { value: 42, suffix: "%", label: "Women on portfolio company boards" },
  { value: 100, suffix: "%", label: "Portfolio companies with science-based targets" },
];

export const esgPillars = [
  {
    title: "Climate",
    body: "Net-zero by 2040 across the portfolio, with interim 2030 targets validated by SBTi and annual third-party assurance.",
  },
  {
    title: "People",
    body: "Fair pay audits, employee ownership programmes at 9 companies, and a 40% gender-diversity target for boards.",
  },
  {
    title: "Governance",
    body: "Independent board members at every control investment, anti-corruption training and full tax transparency.",
  },
  {
    title: "Nature",
    body: "Biodiversity assessments for all real-asset investments, and zero-deforestation commitments in supply chains.",
  },
];
