"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowUp, CornerDownLeft } from "lucide-react";
import { search } from "@/lib/data/search";
import { cn } from "@/lib/utils";

const prompts = [
  "Which companies are in the energy portfolio?",
  "When are the next quarterly results?",
  "How has Fund V performed?",
  "Open roles in Oslo",
  "Show me the latest annual report",
];

function useTypewriter(paused: boolean) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (paused) return;
    let i = 0;
    let char = 0;
    let deleting = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = prompts[i];
      if (!deleting) {
        char++;
        setText(full.slice(0, char));
        if (char === full.length) {
          deleting = true;
          t = setTimeout(tick, 2200);
          return;
        }
        t = setTimeout(tick, 38 + Math.random() * 40);
      } else {
        char--;
        setText(full.slice(0, char));
        if (char === 0) {
          deleting = false;
          i = (i + 1) % prompts.length;
          t = setTimeout(tick, 400);
          return;
        }
        t = setTimeout(tick, 18);
      }
    };
    t = setTimeout(tick, 900);
    return () => clearTimeout(t);
  }, [paused]);
  return text;
}

export function AskAurora() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const typed = useTypewriter(focused || query.length > 0);
  const results = useMemo(() => search(query, 5), [query]);
  const open = focused && query.trim().length > 1;

  useEffect(() => setActive(0), [query]);

  function go(href: string) {
    setFocused(false);
    router.push(href);
  }

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = results[active] ?? results[0];
          if (target) go(target.href);
        }}
        className={cn(
          "relative flex h-14 items-center rounded-full border pl-6 pr-2 backdrop-blur-xl transition-all duration-500 ease-apple",
          focused ? "border-white/50 bg-white/20 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]" : "border-white/25 bg-white/12 hover:bg-white/16"
        )}
      >
        <div className="relative min-w-0 flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Escape") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            aria-label="Ask Aurora"
            className="w-full bg-transparent text-[15px] text-white placeholder:text-transparent focus:outline-none"
            placeholder="Ask Aurora"
          />
          {!query && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[15px] text-white/75">
              {focused ? "Search companies, reports, people…" : typed}
              {!focused && <span className="ml-0.5 inline-block h-[18px] w-px animate-caret bg-white/80" />}
            </span>
          )}
        </div>
        <button
          type="submit"
          aria-label="Search"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/90 text-ink transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-[64px] z-20 overflow-hidden rounded-[22px] border border-white/15 bg-night/80 p-2 text-left shadow-2xl backdrop-blur-2xl"
          >
            {results.length === 0 ? (
              <p className="px-4 py-5 text-[14px] text-white/60">No matches yet. Try “energy”, “results” or “careers”.</p>
            ) : (
              results.map((r, i) => (
                <button
                  key={r.href + r.title}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(r.href)}
                  onMouseEnter={() => setActive(i)}
                  className={cn("flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors", i === active ? "bg-white/10" : "")}
                >
                  <span className="eyebrow w-20 shrink-0 text-[9.5px] text-white/45">{r.kind}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] text-white">{r.title}</span>
                    <span className="block truncate text-[12px] text-white/50">{r.subtitle}</span>
                  </span>
                  {i === active && <CornerDownLeft className="h-4 w-4 text-white/50" />}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
