"use client";

import { motion } from "motion/react";
import { Building2, Crown, Globe2, Layers, Users } from "lucide-react";
import { Counter } from "@/components/ui/Counter";
import type { AuroraEquityRegister } from "@/lib/data/aurora-equity";
import { fmt } from "@/lib/format";

export function RegisterKpis({ register }: { register: AuroraEquityRegister }) {
  const s = register.summary;
  const cards = [
    {
      icon: Layers,
      label: "Share capital",
      node: <Counter value={register.sharesOutstanding} format={fmt.int} />,
      foot: <span className="text-neutral-400">{register.shareClass.toLowerCase()} · org. nr {register.orgNr}</span>,
      color: "#0a84ff",
    },
    {
      icon: Users,
      label: "Shareholders",
      node: <Counter value={s.holders} />,
      foot: (
        <span className="text-neutral-400">
          {s.companies} companies · {s.persons} private
        </span>
      ),
      color: "#5e5ce6",
    },
    {
      icon: Crown,
      label: "Largest holder",
      node: <Counter value={s.largest.pct} format={(n) => fmt.pct(n)} />,
      foot: <span className="truncate text-neutral-400">{s.largest.name}</span>,
      color: "#ffd60a",
    },
    {
      icon: Building2,
      label: "Top 10 concentration",
      node: <Counter value={s.top10Pct} format={(n) => fmt.pct(n, 1)} />,
      foot: <span className="text-neutral-400">{fmt.pct(s.companySharesPct, 1)} held via companies</span>,
      color: "#30d158",
    },
    {
      icon: Globe2,
      label: "Domestic ownership",
      node: <Counter value={s.domesticPct} format={(n) => fmt.pct(n, 1)} />,
      foot: <span className="text-neutral-400">Norway · {s.countries} countries in total</span>,
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
          <div className="mt-0.5 truncate text-[11.5px]">{c.foot}</div>
        </motion.div>
      ))}
    </div>
  );
}
