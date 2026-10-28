import Image from "next/image";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function ClosingCTA() {
  return (
    <section className="p-2 md:p-3">
      <div className="grain relative flex min-h-[78svh] items-center justify-center overflow-hidden rounded-[24px] px-6 py-28 text-center text-white md:rounded-[32px]">
        <Image src="/images/fjord.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/10 via-night/25 to-night/60" />
        <div className="relative">
          <Reveal>
            <span className="eyebrow text-white/75">Partner with Aurora</span>
          </Reveal>
          <AnimatedText
            as="h2"
            inView
            text="Build what lasts, with us."
            italicWords={["lasts"]}
            className="display mx-auto mt-6 max-w-4xl justify-center text-[clamp(52px,8vw,112px)] leading-[0.98]"
          />
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-white/80">
              Founders, co-investors and institutions: we would like to hear what you are building.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href="/contact" variant="light">Talk to us</Button>
              <Button href="/login" variant="glass">Stakeholder login</Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
