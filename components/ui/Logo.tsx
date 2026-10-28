import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cn("h-6 w-6", className)} aria-hidden>
      <rect x="1.75" y="1.75" width="20.5" height="20.5" rx="6" />
      <path d="M5.5 16 H18.5" strokeLinecap="round" />
      <path d="M6.5 16 A5.5 5.5 0 0 1 17.5 16" />
      <path d="M9.5 16 A2.5 2.5 0 0 1 14.5 16" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex items-start gap-1">
        <span className="display text-[24px] leading-none tracking-[-0.01em]">Aurora</span>
        <span className="eyebrow mt-0.5 text-[9px] opacity-60">AS</span>
      </span>
    </span>
  );
}
