"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { buildRegister } from "@/lib/data/register";
import { cn } from "@/lib/utils";

const cols = [
  { key: "you", title: "Your shares", letter: "B" },
  { key: "pct", title: "Your %", letter: "C" },
  { key: "northwind", title: "Northwind", letter: "D" },
  { key: "blackfjord", title: "Blackfjord", letter: "E" },
  { key: "rank", title: "Rank", letter: "F" },
] as const;

const path = [
  [0, 0], [1, 0], [2, 1], [3, 2], [1, 3], [0, 4], [4, 2], [2, 6], [0, 8], [4, 7], [1, 1],
] as const;

export function PortalPreview() {
  const rows = useMemo(() => buildRegister("solberg").rows.slice(0, 9), []);
  const sum = useMemo(() => rows.reduce((s, r) => s + r.shares.you, 0), [rows]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % path.length), 1900);
    return () => clearInterval(t);
  }, []);

  const [c, r] = path[step];
  const cell = (row: (typeof rows)[number], key: (typeof cols)[number]["key"]) => {
    if (key === "you") return row.shares.you.toLocaleString("en-US");
    if (key === "pct") return `${row.pct.you.toFixed(2)}%`;
    if (key === "rank") return `#${row.rank}`;
    return row.shares[key].toLocaleString("en-US");
  };
  const formula = (() => {
    if (cols[c].key === "pct") return `=B${r + 2}/SHARES_OUT("${rows[r].company.ticker}")`;
    if (cols[c].key === "rank") return `=RANK(B${r + 2}, B${r + 2}:E${r + 2})`;
    return `=REGISTER("${rows[r].company.ticker}", "${cols[c].title.replace("Your shares", "You")}")`;
  })();

  return (
    <div className="overflow-hidden rounded-[18px] bg-[#fbfbfd] text-ink shadow-[0_50px_100px_-40px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
      <div className="flex items-center gap-4 border-b border-black/[0.06] bg-white/80 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[12px] font-semibold">Shareholder Register</span>
        <span className="hidden text-[12px] text-muted sm:inline">Solberg Family Office</span>
        <div className="ml-auto hidden items-center gap-2 rounded-lg bg-black/[0.04] px-2.5 py-1.5 text-[11px] text-muted sm:flex">
          <Search className="h-3 w-3" /> Search companies <kbd className="ml-4 font-sans text-[10px]">⌘K</kbd>
        </div>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-plum text-[9px] font-semibold text-white">IS</span>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-black/[0.06] p-3 sm:grid-cols-4">
        {[
          ["Portfolio value", "$1.84B", "+4.2%"],
          ["Companies held", "13", "of 13"],
          ["Ranked #1", "6", "vs rivals"],
          ["Dividends YTD", "$38.1M", "+11%"],
        ].map(([l, v, d]) => (
          <div key={l} className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-black/[0.05]">
            <div className="text-[10px] text-muted">{l}</div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-[16px] font-semibold tracking-tight">{v}</span>
              <span className="text-[10px] text-[#30a14e]">{d}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-b border-black/[0.06] bg-white px-3 py-2 font-mono text-[11px]">
        <span className="w-10 rounded bg-black/[0.04] px-1.5 py-0.5 text-center text-muted">
          {cols[c].letter}
          {r + 2}
        </span>
        <span className="text-muted">ƒx</span>
        <motion.span key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate text-ink-2">
          {formula}
        </motion.span>
      </div>

      <div className="overflow-hidden">
        <table className="w-full border-collapse text-[11.5px]">
          <thead>
            <tr className="bg-[#f4f4f7] text-muted">
              <th className="w-8 border-r border-b border-black/[0.06] py-1.5 font-normal" />
              <th className="border-r border-b border-black/[0.06] px-3 py-1.5 text-left font-medium">Company</th>
              {cols.map((col, i) => (
                <th
                  key={col.key}
                  className={cn(
                    "border-r border-b border-black/[0.06] px-3 py-1.5 text-right font-medium transition-colors",
                    i === c && "bg-[#0a84ff]/10 text-[#0a84ff]",
                    i > 2 && "hidden sm:table-cell",
                  )}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.id} className="bg-white">
                <td className={cn("border-r border-b border-black/[0.05] text-center text-[10px] text-muted transition-colors", ri === r && "bg-[#0a84ff]/10 text-[#0a84ff]")}>
                  {ri + 2}
                </td>
                <td className="border-r border-b border-black/[0.05] px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded" style={{ background: `linear-gradient(135deg, ${row.company.colors[0]}, ${row.company.colors[1]})` }} />
                    <span className="truncate font-medium">{row.company.name}</span>
                  </span>
                </td>
                {cols.map((col, ci) => (
                  <td
                    key={col.key}
                    className={cn(
                      "relative border-r border-b border-black/[0.05] px-3 py-2.5 text-right tabular-nums",
                      ci > 2 && "hidden sm:table-cell",
                      col.key === "rank" && row.rank === 1 && "text-[#30a14e]",
                    )}
                  >
                    {ci === c && ri === r && (
                      <motion.span
                        layoutId="preview-cell"
                        className="absolute inset-0 rounded-[3px] bg-[#0a84ff]/[0.06] ring-2 ring-[#0a84ff]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{cell(row, col.key)}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-1 border-t border-black/[0.06] bg-[#f4f4f7] px-2 py-1.5 text-[11px]">
        {["Holdings", "Ownership matrix", "Transactions", "Dividends"].map((t, i) => (
          <span key={t} className={cn("rounded-md px-2.5 py-1", i === 0 ? "bg-white font-medium shadow-sm" : "text-muted")}>
            {t}
          </span>
        ))}
        <span className="ml-auto hidden pr-2 text-muted sm:inline">
          Sum: {sum.toLocaleString("en-US")} · Avg: {Math.round(sum / rows.length).toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );
}
