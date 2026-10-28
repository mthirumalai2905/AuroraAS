"use client";

import { motion } from "motion/react";
import { Coins, Layers, PieChart, Trophy, Wallet } from "lucide-react";
import { Counter } from "@/components/ui/Counter";
import type { Register } from "@/lib/data/register";
import { fmt } from "@/lib/format";

export function KpiStrip({ summary }: { summary: Register["summary"] }) {
  const cards = [
    {
      icon: Wallet,
      label: "Portfolio value",
      node: <Counter value={summary.totalValue} format={fmt.usd} />,
      foot: (
        <span className={summary.change30d >= 0 ? "text-[#248a3d]" : "text-[#d70015]"}>
          {fmt.signedPct(summary.change30d)} <span className="text-neutral-400">30 days</span>
        </span>
      ),
      color: "#0a84ff",
    },
    {
      icon: Layers,
      label: "Shares held",
      node: <Counter value={summary.totalShares} format={fmt.int} />,
      foot: <span className="text-neutral-400">across {summary.positions} companies</span>,
      color: "#5e5ce6",
    },
    {
      icon: PieChart,
      label: "Avg. ownership",
      node: <Counter value={summary.avgPct} format={(n) => fmt.pct(n)} />,
      foot: <span className="text-neutral-400">per company</span>,
      color: "#30d158",
    },
    {
      icon: Trophy,
      label: "Leading positions",
      node: (
        <span>
          <Counter value={summary.leadCount} /> <span className="text-neutral-300">/ {summary.positions}</span>
        </span>
      ),
      foot: <span className="text-neutral-400">largest non-anchor holder</span>,
      color: "#ff9f0a",
    },
    {
      icon: Coins,
      label: "Dividend income",
      node: <Counter value={summary.income12m} format={fmt.usd} />,
      foot: <span className="text-neutral-400">net, last 12 months</span>,
      color: "#bf5af2",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.05 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-black/[0.05] bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] last:col-span-2 md:last:col-span-1"
        >
          <div className="flex items-center gap-2 text-[11.5px] font-medium text-neutral-500">
            <span className="grid h-5 w-5 place-items-center rounded-md" style={{ background: `${c.color}1a`, color: c.color }}>
              <c.icon className="h-3 w-3" />
            </span>
            {c.label}
          </div>
          <div className="mt-1.5 truncate text-[19px] font-semibold leading-tight tracking-tight text-neutral-900">{c.node}</div>
          <div className="mt-0.5 text-[11.5px]">{c.foot}</div>
        </motion.div>
      ))}
    </div>
  );
}
