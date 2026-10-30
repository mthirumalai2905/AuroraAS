"use client";

import { Building2, Crown, Globe2, Layers, Users } from "lucide-react";
import type { AuroraEquityRegister } from "@/lib/data/aurora-equity";
import { fmt } from "@/lib/format";

export function RegisterKpis({ register }: { register: AuroraEquityRegister }) {
  const s = register.summary;
  const cards = [
    {
      icon: Layers,
      label: "Share capital",
      value: fmt.int(register.sharesOutstanding),
      foot: (
        <span className="text-neutral-400">
          {register.shareClass.toLowerCase()} · org. nr {register.orgNr}
        </span>
      ),
    },
    {
      icon: Users,
      label: "Shareholders",
      value: fmt.int(s.holders),
      foot: (
        <span className="text-neutral-400">
          {s.companies} companies · {s.persons} private
        </span>
      ),
    },
    {
      icon: Crown,
      label: "Largest holder",
      value: fmt.pct(s.largest.pct),
      foot: <span className="truncate text-neutral-400">{s.largest.name}</span>,
    },
    {
      icon: Building2,
      label: "Top 10 concentration",
      value: fmt.pct(s.top10Pct, 1),
      foot: <span className="text-neutral-400">{fmt.pct(s.companySharesPct, 1)} held via companies</span>,
    },
    {
      icon: Globe2,
      label: "Domestic ownership",
      value: fmt.pct(s.domesticPct, 1),
      foot: <span className="text-neutral-400">Norway · {s.countries} countries in total</span>,
    },
  ];

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-sm border border-black/[0.12] bg-white md:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className="px-3.5 py-2.5 shadow-[inset_-1px_-1px_0_0_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center gap-1.5 text-[10.5px] font-medium tracking-[0.04em] text-neutral-500 uppercase">
            <c.icon className="h-3 w-3 text-neutral-400" />
            {c.label}
          </div>
          <div className="mt-1.5 truncate font-mono text-[18px] font-semibold leading-none tracking-tight text-neutral-900">
            {c.value}
          </div>
          <div className="mt-1.5 truncate text-[11px]">{c.foot}</div>
        </div>
      ))}
    </div>
  );
}
