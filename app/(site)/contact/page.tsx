import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { offices } from "@/lib/data/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHeader
        image="/images/card-rings.jpg"
        eyebrow="Contact"
        title="Let's start a conversation."
        italicWords={["conversation."]}
        description="Whether you are a founder, an investor or a future colleague, we would love to hear from you."
      />
      <section className="mx-auto grid max-w-7xl gap-3 px-6 pb-28 md:px-10 lg:grid-cols-[1.3fr_1fr]">
        <ContactForm />
        <div className="flex flex-col gap-3">
          <div className="rounded-[28px] bg-plum p-7 text-white md:p-8">
            <h3 className="eyebrow text-[10px] text-white/50">Direct lines</h3>
            <ul className="mt-6 space-y-4 text-[15px]">
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-lilac" /> ir@aurora-as.com</li>
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-lilac" /> press@aurora-as.com</li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-lilac" /> +47 22 00 00 00</li>
            </ul>
          </div>
          <Stagger className="flex-1 rounded-[28px] bg-white px-7 py-3 md:px-8">
            {offices.map((o) => (
              <StaggerItem key={o.city}>
                <div className="border-b border-line py-5 last:border-0">
                  <div className="flex items-baseline justify-between">
                    <span className="display text-[26px]">{o.city}</span>
                    <span className="eyebrow text-[9px] text-muted">{o.role}</span>
                  </div>
                  <div className="mt-1 text-[14px] text-ink-2">{o.address}</div>
                  <div className="text-[14px] text-muted">{o.phone}</div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
