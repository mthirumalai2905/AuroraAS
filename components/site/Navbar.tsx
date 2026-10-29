"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/ui/Logo";
import { navLinks } from "@/lib/data/site";
import { cn } from "@/lib/utils";

const IMAGE_HEROES = ["/"];

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > prev && y > 480);
  });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const onImage = IMAGE_HEROES.includes(pathname) && !scrolled && !open;

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: hidden && !open ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-2 pt-2 md:px-3 md:pt-3"
      >
        <nav
          className={cn(
            "mx-auto flex h-14 items-center justify-between rounded-[18px] border px-4 transition-all duration-500 ease-apple md:h-16 md:px-7",
            onImage ? "border-transparent text-white" : "text-ink",
            !onImage && (scrolled || open) ? "border-line/80 bg-paper/80 shadow-[0_8px_30px_-12px_rgba(22,20,31,0.18)] backdrop-blur-xl" : "border-transparent",
            scrolled && "max-w-6xl"
          )}
        >
          <Link href="/" aria-label="Aurora Equity home" className="shrink-0">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {navLinks.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn("eyebrow relative py-2 transition-opacity duration-300", active ? "opacity-100" : "opacity-60 hover:opacity-100")}
                  >
                    {l.label}
                    {active && <motion.span layoutId="nav-active" className="absolute -bottom-0.5 left-0 right-0 h-px bg-current" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-4">
            <Suspense>
              <Show when="signed-out">
                <Link href="/login" className="eyebrow hidden opacity-70 transition-opacity hover:opacity-100 sm:block">
                  Log in
                </Link>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="eyebrow hidden opacity-75 transition-opacity hover:opacity-100 sm:block">
                  Dashboard
                </Link>
                <UserButton />
              </Show>
            </Suspense>
            <Link
              href="/contact"
              className={cn(
                "group hidden h-9 items-center gap-2 rounded-full px-4 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors duration-300 sm:inline-flex",
                onImage ? "bg-white text-ink hover:bg-white/90" : "bg-plum text-white hover:bg-plum-2"
              )}
            >
              Contact us <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="relative grid h-9 w-9 place-items-center lg:hidden"
            >
              <span className={cn("absolute h-px w-5 bg-current transition-all duration-500 ease-apple", open ? "rotate-45" : "-translate-y-[3.5px]")} />
              <span className={cn("absolute h-px w-5 bg-current transition-all duration-500 ease-apple", open ? "-rotate-45" : "translate-y-[3.5px]")} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-paper px-6 pt-28 lg:hidden"
          >
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
            >
              {[...navLinks, { href: "/contact", label: "Contact" }, { href: "/login", label: "Stakeholder login" }].map((l) => (
                <motion.li
                  key={l.href}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
                >
                  <Link href={l.href} className="display flex items-center justify-between border-b border-line py-4 text-[36px]">
                    {l.label}
                    <ArrowRight className="h-5 w-5 text-muted" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
