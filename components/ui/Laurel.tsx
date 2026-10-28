const r2 = (n: number) => Math.round(n * 100) / 100;
const rad = (d: number) => (d * Math.PI) / 180;

const CX = 24;
const CY = 31;
const RX = 17;
const RY = 26;

const stemAt = (deg: number) => ({ x: CX + RX * Math.cos(rad(deg)), y: CY - RY * Math.sin(rad(deg)) });

const stem = Array.from({ length: 24 }, (_, i) => stemAt(108 + i * 6.3));
const stemPath = stem.map((p, i) => `${i ? "L" : "M"}${r2(p.x)} ${r2(p.y)}`).join(" ");

const leaves = Array.from({ length: 8 }, (_, i) => {
  const deg = 112 + i * 18;
  const p = stemAt(deg);
  const dx = RX * Math.sin(rad(deg));
  const dy = RY * Math.cos(rad(deg));
  const dir = (Math.atan2(dy, dx) * 180) / Math.PI + (i % 2 ? 32 : -32);
  const size = 1 - i * 0.06;
  const len = 5.4 * size;
  return {
    cx: r2(p.x + len * Math.cos(rad(dir))),
    cy: r2(p.y + len * Math.sin(rad(dir))),
    rx: r2(2.1 * size),
    ry: r2(len),
    rot: r2(dir + 90),
  };
});

function Branch({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 30 62" className="h-12 w-auto" style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <path d={stemPath} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill="currentColor" transform={`rotate(${l.rot} ${l.cx} ${l.cy})`} />
      ))}
    </svg>
  );
}

export function Laurel({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="flex items-center gap-1 text-white/85">
      <Branch />
      <div className="text-center">
        <div className="display text-[15px] leading-none">{title}</div>
        {lines.map((l) => (
          <div key={l} className="eyebrow mt-1 text-[8.5px] leading-tight text-white/65">
            {l}
          </div>
        ))}
      </div>
      <Branch flip />
    </div>
  );
}
