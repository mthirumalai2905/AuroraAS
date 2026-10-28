import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "light" | "dark" | "outline" | "glass" | "lilac";

const styles: Record<Variant, string> = {
  light: "bg-white text-ink hover:bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
  dark: "bg-plum text-white hover:bg-plum-2",
  outline: "border border-ink/15 text-ink hover:border-ink/40 hover:bg-white/60",
  glass: "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
  lilac: "bg-lilac-3 text-plum hover:bg-lilac-2",
};

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  arrow?: boolean;
  className?: string;
};

export function Button({ href, children, variant = "dark", size = "md", arrow = true, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-mono uppercase tracking-[0.1em] transition-all duration-300 ease-apple active:scale-[0.97]",
        size === "sm" ? "h-9 px-4 text-[10.5px]" : "h-11 px-5 text-[11.5px]",
        styles[variant],
        className
      )}
    >
      {children}
      {arrow && <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-apple group-hover:translate-x-0.5" />}
    </Link>
  );
}

export function TextLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2 text-[14px] font-medium", className)}>
      <span className="grid h-6 w-6 place-items-center rounded-full border border-current/20 transition-colors group-hover:bg-ink group-hover:text-white">
        <ArrowRight className="h-3 w-3" />
      </span>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-apple group-hover:bg-[length:100%_1px]">
        {children}
      </span>
    </Link>
  );
}
