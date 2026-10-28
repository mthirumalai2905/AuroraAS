import type { Metadata } from "next";
import { CalendarDays, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Performance } from "@/components/home/Performance";
import { PortalSection } from "@/components/home/PortalSection";
import { financialCalendar, funds, keyFigures, reports, team } from "@/lib/data/site";
import { fmt } from "@/lib/format";

export const metadata: Metadata = { title: "Investor relations" };

const shareInfo = [
  { label: "Listing", value: "Oslo Børs" },
  { label: "Ticker", value: "AURA" },
  { label: "ISIN", value: "NO0012345678" },
  { label: "Shares outstanding", value: "412,600,000" },
  { label: "Market capitalisation", value: "$18.4B" },
  { label: "Free float", value: "61.2%" },
];

const statusTone: Record<string, string> = {
  Investing: "bg-sky/60 text-plum",
  Harvesting: "bg-lilac-2 text-plum",
  Realised: "bg-paper-2 text-ink-2",
};

export default function InvestorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Investor relations"
        title="Clear numbers. Open books."
        italicWords={["Open"]}
        description="Aurora AS is listed on Oslo Børs. Here you will find our financial results, fund performance, reports, governance and upcoming events."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="#reports">Latest reports</Button>
          <Button href="/login" variant="outline">Stakeholder portal</Button>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="eyebrow text-[10px] text-muted">Q3 2026 at a glance</h2>
          <span className="eyebrow text-[10px] text-muted">Year-on-year</span>
        </div>
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {keyFigures.map((k, i) => (
            <StaggerItem key={k.label}>
              <Card tone={i === 0 ? "plum" : "white"} className="flex h-[200px] flex-col justify-between p-7">
                <div className={i === 0 ? "text-[14px] text-white/60" : "text-[14px] text-ink-2"}>{k.label}</div>
                <div className="flex items-end justify-between">
                  <span className="display text-[52px] leading-none">{k.value}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[12px] ${i === 0 ? "bg-white/10 text-lilac" : "bg-lilac-3 text-plum"}`}>{k.change}</span>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Performance />

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10 md:pb-32">
        <SectionIntro eyebrow="Funds" title="Our fund family." italicWords={["family."]} />
        <Reveal className="mt-12 overflow-x-auto rounded-[24px] bg-white">
          <table className="w-full min-w-[720px] text-[15px]">
            <thead>
              <tr className="border-b border-line text-left">
                {["Fund", "Vintage", "Size", "Status", "Net IRR", "TVPI", "DPI"].map((h, i) => (
                  <th key={h} className={`eyebrow px-6 py-4 text-[10px] font-normal text-muted ${i > 3 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {funds.map((f) => (
                <tr key={f.name} className="border-b border-line transition-colors last:border-0 hover:bg-paper">
                  <td className="px-6 py-4 font-medium">{f.name}</td>
                  <td className="px-6 py-4 text-ink-2">{f.vintage}</td>
                  <td className="px-6 py-4 text-ink-2">${f.size}B</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[12px] ${statusTone[f.status] ?? ""}`}>{f.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">{f.irr ? `${f.irr.toFixed(1)}%` : "n.m."}</td>
                  <td className="px-6 py-4 text-right tabular-nums">{f.tvpi.toFixed(1)}x</td>
                  <td className="px-6 py-4 text-right tabular-nums">{f.dpi.toFixed(1)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <section id="reports" className="mx-auto grid max-w-7xl scroll-mt-28 gap-16 px-6 pb-24 md:px-10 md:pb-32 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionIntro align="stack" eyebrow="Reports & presentations" title="Reports library." italicWords={["library."]} />
          <Stagger className="mt-10 border-t border-ink/15">
            {reports.map((r) => (
              <StaggerItem key={r.title}>
                <a href="#" className="group flex items-center gap-5 border-b border-line py-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white">
                    <FileText className="h-5 w-5 text-plum" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium transition-transform duration-500 ease-apple group-hover:translate-x-1">{r.title}</div>
                    <div className="mt-0.5 text-[13px] text-muted">
                      {r.type} · {fmt.date(r.date)} · PDF {r.size}
                    </div>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 transition-all duration-500 ease-apple group-hover:border-transparent group-hover:bg-plum group-hover:text-white">
                    <Download className="h-4 w-4" />
                  </span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div id="calendar" className="scroll-mt-28">
          <SectionIntro align="stack" eyebrow="Financial calendar" title="Upcoming events." italicWords={["Upcoming"]} />
          <Stagger className="mt-10 space-y-2">
            {financialCalendar.map((e) => {
              const d = new Date(e.date);
              return (
                <StaggerItem key={e.event}>
                  <div className="flex items-center gap-5 rounded-[18px] bg-white p-3">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-lilac-3 text-center">
                      <div>
                        <div className="display text-[28px] leading-none">{d.getUTCDate()}</div>
                        <div className="eyebrow mt-1 text-[8.5px] text-ink-2">
                          {d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} {String(d.getUTCFullYear()).slice(2)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{e.event}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
                        <CalendarDays className="h-3.5 w-3.5" /> {e.location}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 pb-24 md:px-10 md:pb-32 lg:grid-cols-2">
        <div>
          <SectionIntro align="stack" eyebrow="The share" title="Aurora AS on Oslo Børs." italicWords={["Oslo", "Børs."]} />
          <Reveal className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] bg-line">
            {shareInfo.map((s) => (
              <div key={s.label} className="bg-white p-6">
                <div className="eyebrow text-[9.5px] text-muted">{s.label}</div>
                <div className="mt-3 text-[20px] font-medium tracking-tight">{s.value}</div>
              </div>
            ))}
          </Reveal>
        </div>
        <div>
          <SectionIntro align="stack" eyebrow="Governance" title="Board & executive committee." italicWords={["Board"]} />
          <Reveal className="mt-10 border-t border-ink/15">
            {team.slice(0, 6).map((m) => (
              <div key={m.name} className="flex items-center gap-4 border-b border-line py-4">
                <span className="display grid h-11 w-11 place-items-center rounded-full bg-lilac-3 text-[17px] italic text-plum">
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-[13px] text-muted">{m.role}</div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <PortalSection />
      <div className="h-24" />
    </>
  );
}
