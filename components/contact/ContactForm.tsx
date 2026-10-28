"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const topics = ["Investor relations", "Portfolio opportunity", "Wealth advisory", "Media", "Careers", "Other"];

const inputCls =
  "w-full rounded-[14px] border border-line bg-paper px-4 text-[15px] transition-all placeholder:text-muted/70 focus:border-plum/40 focus:bg-white focus:ring-4 focus:ring-lilac-3 focus:outline-none";

export function ContactForm() {
  const [topic, setTopic] = useState(topics[0]);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-white p-7 md:p-10">
      <AnimatePresence mode="wait">
        {state === "sent" ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[480px] flex-col items-center justify-center text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
              className="grid h-16 w-16 place-items-center rounded-full bg-plum text-white"
            >
              <Check className="h-7 w-7" />
            </motion.span>
            <h3 className="display mt-6 text-[40px]">Message received</h3>
            <p className="mt-2 max-w-sm text-ink-2">A member of our {topic.toLowerCase()} team will be in touch within one business day.</p>
            <button onClick={() => setState("idle")} className="eyebrow mt-8 text-[10px] text-ink-2 underline-offset-4 hover:underline">
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0, scale: 0.98 }}
            onSubmit={(e) => {
              e.preventDefault();
              setState("sending");
              setTimeout(() => setState("sent"), 1200);
            }}
            className="space-y-6"
          >
            <div>
              <div className="eyebrow mb-3 text-[10px] text-muted">I&apos;m interested in</div>
              <div className="flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTopic(t)}
                    className={cn(
                      "relative rounded-full border px-4 py-2 text-[13.5px] transition-colors",
                      topic === t ? "border-transparent text-white" : "border-line text-ink-2 hover:border-ink/25",
                    )}
                  >
                    {topic === t && <motion.span layoutId="topic-pill" className="absolute inset-0 rounded-full bg-plum" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                    <span className="relative">{t}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" name="name" required />
              <Field label="Organisation" name="org" />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" />
            </div>
            <label className="block">
              <span className="mb-2 block text-[13px] text-ink-2">Message</span>
              <textarea required rows={5} className={cn(inputCls, "resize-none py-3")} placeholder="How can we help?" />
            </label>
            <button
              disabled={state === "sending"}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-plum font-mono text-[11.5px] tracking-[0.1em] text-white uppercase transition-all hover:bg-plum-2 active:scale-[0.98] disabled:opacity-70"
            >
              {state === "sending" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Send message <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] text-ink-2">{label}</span>
      <input name={name} type={type} required={required} className={cn(inputCls, "h-12")} />
    </label>
  );
}
