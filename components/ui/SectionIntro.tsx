import { AnimatedText } from "@/components/ui/AnimatedText";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  italicWords?: string[];
  description?: string;
  action?: React.ReactNode;
  tone?: "ink" | "white";
  align?: "split" | "stack" | "center";
  className?: string;
};

export function SectionIntro({ eyebrow, title, italicWords, description, action, tone = "ink", align = "split", className }: Props) {
  const muted = tone === "white" ? "text-white/60" : "text-muted";
  return (
    <div
      className={cn(
        align === "split" && "grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end",
        align === "center" && "mx-auto max-w-3xl text-center",
        className
      )}
    >
      <div>
        {eyebrow && (
          <Reveal>
            <span className={cn("eyebrow", muted)}>{eyebrow}</span>
          </Reveal>
        )}
        <AnimatedText
          as="h2"
          inView
          text={title}
          italicWords={italicWords}
          className={cn("display mt-4 text-[44px] md:text-[64px]", align === "center" && "justify-center", tone === "white" && "text-white")}
        />
        {action && align === "split" && <Reveal delay={0.2} className="mt-6">{action}</Reveal>}
      </div>
      {description && (
        <Reveal delay={0.15}>
          <p className={cn("max-w-md text-[17px] leading-relaxed", align === "center" && "mx-auto mt-6", align === "stack" && "mt-6", muted)}>
            {description}
          </p>
        </Reveal>
      )}
      {action && align !== "split" && <Reveal delay={0.2} className="mt-8">{action}</Reveal>}
    </div>
  );
}
