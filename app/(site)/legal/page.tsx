import type { Metadata } from "next";
import { AnimatedText } from "@/components/ui/AnimatedText";

export const metadata: Metadata = { title: "Legal & privacy" };

const sections = [
  {
    id: "privacy",
    title: "Privacy policy",
    body: [
      "Aurora AS processes personal data in accordance with the EU General Data Protection Regulation (GDPR) and the Norwegian Personal Data Act.",
      "We collect only the data necessary to provide our services, manage investor relationships and comply with anti-money-laundering obligations. You may request access, rectification or erasure of your data at any time by contacting privacy@aurora-as.com.",
    ],
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    body: [
      "The information on this website is provided for general information purposes only and does not constitute an offer, solicitation or recommendation to buy or sell any security or financial instrument.",
      "Past performance is not a reliable indicator of future results. The value of investments may fall as well as rise, and investors may not get back the amount originally invested.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    body: [
      "We use strictly necessary cookies to keep the stakeholder portal secure, and optional analytics cookies only with your consent.",
    ],
  },
  {
    id: "regulatory",
    title: "Regulatory information",
    body: [
      "Aurora AS (org. no. 912 345 678) is authorised as an alternative investment fund manager by Finanstilsynet, the Financial Supervisory Authority of Norway.",
    ],
  },
];

export default function LegalPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-36 pb-16 md:px-10 md:pt-44">
        <span className="eyebrow text-muted">Legal</span>
        <AnimatedText text="Legal & privacy." italicWords={["privacy."]} delay={0.1} className="display mt-5 text-[56px] md:text-[96px]" />
        <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-2">
          Important information about how we operate, protect your data and present our materials.
        </p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-12 border-t border-ink/15 px-6 pt-14 pb-28 md:px-10 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-3 lg:sticky lg:top-32 lg:self-start">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="eyebrow block text-[10px] text-muted transition-colors hover:text-ink">
              {s.title}
            </a>
          ))}
        </nav>
        <div className="max-w-3xl space-y-16">
          {sections.map((s) => (
            <div key={s.id} id={s.id} className="scroll-mt-32">
              <h2 className="display text-[40px]">{s.title}</h2>
              <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-ink-2">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
