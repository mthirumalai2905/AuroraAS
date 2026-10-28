import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { Counter } from "@/components/ui/Counter";

export const metadata: Metadata = { title: "Portfolio" };

const facts = [
  { value: 41200, label: "People employed" },
  { value: 16.6, decimals: 1, prefix: "$", suffix: "B", label: "Aggregate revenue" },
  { value: 9, label: "Home countries" },
  { value: 19, suffix: "%", label: "Avg. revenue growth" },
];

export default function PortfolioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Fourteen companies. One shared ambition."
        italicWords={["shared"]}
        description="We back businesses that solve essential problems: powering the grid, curing disease, moving goods and money cleanly. Explore our current and realised investments."
      >
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}>
              <div className="display text-[36px] leading-none">
                <Counter value={f.value} decimals={f.decimals ?? 0} prefix={f.prefix} suffix={f.suffix} />
              </div>
              <div className="eyebrow mt-2 text-[9px] text-muted">{f.label}</div>
            </div>
          ))}
        </div>
      </PageHeader>
      <PortfolioGrid />
    </>
  );
}
