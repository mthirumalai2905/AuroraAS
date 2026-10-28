import type { Insight } from "@/lib/data/site";
import { cn } from "@/lib/utils";

const categoryStyles: Record<
  Insight["category"],
  { bg: string; text: string; sub: string; pill: string; stroke: string; motif: "horizon" | "grid" | "prism" | "columns" | "rings" }
> = {
  "Market outlook": {
    bg: "from-[#1c2233] via-[#263149] to-[#131824]",
    text: "text-white",
    sub: "text-white/60",
    pill: "bg-white/12 text-white border border-white/15",
    stroke: "#bfe3f5",
    motif: "horizon",
  },
  "Energy transition": {
    bg: "from-[#c9e3f3] via-[#dceef9] to-[#b5d6eb]",
    text: "text-plum",
    sub: "text-plum/65",
    pill: "bg-white/80 text-plum",
    stroke: "#231d3a",
    motif: "grid",
  },
  Technology: {
    bg: "from-[#d8d0f2] via-[#e6e0f8] to-[#c7bcea]",
    text: "text-plum",
    sub: "text-plum/65",
    pill: "bg-white/80 text-plum",
    stroke: "#231d3a",
    motif: "prism",
  },
  "Private markets": {
    bg: "from-[#231d3a] via-[#302750] to-[#171327]",
    text: "text-white",
    sub: "text-white/60",
    pill: "bg-white/12 text-white border border-white/15",
    stroke: "#c7bdf2",
    motif: "columns",
  },
  Sustainability: {
    bg: "from-[#dde6dc] via-[#e8efe7] to-[#cad8c9]",
    text: "text-ink",
    sub: "text-ink/60",
    pill: "bg-white/80 text-ink",
    stroke: "#1f3327",
    motif: "rings",
  },
};

export function InsightCover({
  article,
  index = 0,
  badge,
  size = "card",
  className,
}: {
  article: Insight;
  index?: number;
  badge?: string;
  size?: "card" | "lead" | "banner";
  className?: string;
}) {
  const style = categoryStyles[article.category];
  const issue = String(index + 1).padStart(2, "0");

  return (
    <div
      className={cn(
        "grain relative flex flex-col justify-between overflow-hidden bg-gradient-to-br p-5 transition-transform duration-[1.2s] ease-apple group-hover:scale-[1.02]",
        style.bg,
        style.text,
        size === "lead" && "p-7 md:p-8",
        size === "banner" && "p-8 md:p-12",
        className,
      )}
    >
      <Motif kind={style.motif} stroke={style.stroke} />

      <div className="relative flex items-center justify-between gap-3">
        <span className={cn("eyebrow rounded-full px-3 py-1.5 text-[9px] backdrop-blur-md", style.pill)}>
          {badge ?? article.category}
        </span>
        <span className={cn("font-mono text-[10px] tracking-[0.18em] uppercase", style.sub)}>
          No. {issue} · {article.date.slice(0, 4)}
        </span>
      </div>

      <div className="relative flex items-end justify-between gap-4">
        <div>
          <div className={cn("eyebrow text-[9px]", style.sub)}>Aurora Research</div>
          <div className={cn("display mt-1 leading-none italic", size === "banner" ? "text-[44px] md:text-[56px]" : "text-[28px]")}>
            {article.category}
          </div>
        </div>
        <span className={cn("font-mono text-[10px] tracking-[0.14em] uppercase", style.sub)}>
          {article.readTime} min
        </span>
      </div>
    </div>
  );
}

function Motif({ kind, stroke }: { kind: "horizon" | "grid" | "prism" | "columns" | "rings"; stroke: string }) {
  return (
    <svg viewBox="0 0 400 260" className="pointer-events-none absolute inset-0 h-full w-full opacity-25" fill="none">
      {kind === "horizon" && (
        <>
          <circle cx="300" cy="130" r="88" stroke={stroke} strokeWidth="1.2" />
          <path d="M 0 175 Q 130 140 260 170 T 400 155" stroke={stroke} strokeWidth="1.2" />
          <path d="M 0 205 Q 150 175 280 200 T 400 190" stroke={stroke} strokeWidth="1" strokeDasharray="3 5" />
        </>
      )}
      {kind === "grid" && (
        <>
          <circle cx="310" cy="110" r="76" stroke={stroke} strokeWidth="1.2" />
          <circle cx="310" cy="110" r="42" stroke={stroke} strokeWidth="1" strokeDasharray="3 5" />
          <line x1="310" y1="18" x2="310" y2="202" stroke={stroke} strokeWidth="1" />
          <line x1="218" y1="110" x2="400" y2="110" stroke={stroke} strokeWidth="1" />
        </>
      )}
      {kind === "prism" && (
        <>
          <polygon points="300,36 372,188 228,188" stroke={stroke} strokeWidth="1.25" />
          <polygon points="270,62 342,204 198,204" stroke={stroke} strokeWidth="1" strokeDasharray="4 5" />
        </>
      )}
      {kind === "columns" && (
        <>
          <rect x="236" y="54" width="28" height="152" rx="14" stroke={stroke} strokeWidth="1.2" />
          <rect x="282" y="36" width="28" height="170" rx="14" stroke={stroke} strokeWidth="1.2" />
          <rect x="328" y="74" width="28" height="132" rx="14" stroke={stroke} strokeWidth="1.2" />
        </>
      )}
      {kind === "rings" && (
        <>
          <circle cx="285" cy="130" r="68" stroke={stroke} strokeWidth="1.2" />
          <circle cx="325" cy="130" r="68" stroke={stroke} strokeWidth="1.2" />
          <circle cx="305" cy="98" r="68" stroke={stroke} strokeWidth="1" strokeDasharray="3 5" />
        </>
      )}
    </svg>
  );
}
