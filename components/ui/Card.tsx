import { cn } from "@/lib/utils";

const tones = {
  white: "bg-white text-ink",
  plum: "bg-plum text-white",
  lilac: "bg-lilac-3 text-ink",
  outline: "border border-line text-ink",
};

export function Card({
  tone = "white",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-[22px] transition-transform duration-500 ease-apple hover:-translate-y-1", tones[tone], className)}>
      {children}
    </div>
  );
}
