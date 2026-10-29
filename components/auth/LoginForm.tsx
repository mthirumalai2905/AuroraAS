"use client";

import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Demo = { email: string; password: string; name: string; entity: string };

export function LoginForm({ demos, next }: { demos: Demo[]; next?: string }) {
  const router = useRouter();
  const shake = useAnimationControls();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      setStatus("idle");
      shake.start({ x: [0, -10, 10, -7, 7, -3, 0], transition: { duration: 0.5 } });
      return;
    }
    setStatus("success");
    setTimeout(() => {
      router.push(next && next.startsWith("/dashboard") ? next : "/dashboard");
      router.refresh();
    }, 700);
  }

  return (
    <motion.div animate={shake} className="w-full max-w-[400px]">
      <span className="eyebrow text-[10px] text-muted">Stakeholder portal</span>
      <h1 className="display mt-3 text-[44px] leading-none short:mt-2 short:text-[38px]">
        Welcome <span className="italic">back</span>
      </h1>
      <p className="mt-2 text-[14px] text-ink-2 short:mt-1.5">Sign in to your shareholder register.</p>

      <form onSubmit={submit} className="mt-7 space-y-2.5 short:mt-5 short:space-y-2">
        <FloatingInput label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <div className="relative">
          <FloatingInput label="Password" type={show ? "text" : "password"} value={password} onChange={setPassword} autoComplete="current-password" />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute top-1/2 right-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-paper-2 hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 text-[13px]">
          <label className="flex cursor-pointer items-center gap-2 text-ink-2">
            <input type="checkbox" defaultChecked className="peer sr-only" />
            <span className="grid h-4 w-4 place-items-center rounded-[5px] border border-ink/20 transition-colors peer-checked:border-plum peer-checked:bg-plum [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
            Trust this device
          </label>
          <a href="/contact" className="text-ink underline-offset-4 hover:underline">
            Forgot password?
          </a>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden text-[14px] text-[#c9353a]">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          disabled={status !== "idle"}
          className={cn(
            "group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full font-mono text-[11.5px] tracking-[0.1em] uppercase transition-all duration-500 active:scale-[0.98] short:h-11",
            status === "success" ? "bg-[#30a14e] text-white" : "bg-plum text-white hover:bg-plum-2",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === "idle" && (
              <motion.span key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
                Sign in <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </motion.span>
            )}
            {status === "loading" && (
              <motion.span key="loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <Loader2 className="h-5 w-5 animate-spin" />
              </motion.span>
            )}
            {status === "success" && (
              <motion.span key="success" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                <Check className="h-4 w-4" strokeWidth={3} /> Authenticated
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </form>

      <div className="mt-7 short:mt-5">
        <div className="eyebrow flex items-center gap-3 text-[9.5px] text-muted">
          <span className="h-px flex-1 bg-line" /> Or sign in with Clerk <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-2.5 flex gap-2">
          <a
            href="/sign-in"
            className="flex h-10 flex-1 items-center justify-center rounded-full border border-line bg-white font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink transition-colors hover:border-plum/35"
          >
            Clerk Sign in
          </a>
          <a
            href="/sign-up"
            className="flex h-10 flex-1 items-center justify-center rounded-full border border-line bg-white font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink transition-colors hover:border-plum/35"
          >
            Create account
          </a>
        </div>
        <div className="eyebrow mt-4 flex items-center gap-3 text-[9.5px] text-muted short:mt-3">
          <span className="h-px flex-1 bg-line" /> Demo accounts <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-2.5 grid gap-1.5 short:mt-2">
          {demos.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => {
                setEmail(d.email);
                setPassword(d.password);
                setError(null);
              }}
              className={cn(
                "flex items-center gap-3 rounded-[14px] border p-2.5 text-left transition-all duration-300 short:p-2",
                email === d.email ? "border-plum/30 bg-white" : "border-line hover:bg-white",
              )}
            >
              <span className="display grid h-8 w-8 place-items-center rounded-full bg-lilac-3 text-[14px] italic text-plum">
                {d.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">{d.name}</span>
                <span className="block truncate text-[12px] text-muted">{d.entity}</span>
              </span>
              <span className="eyebrow text-[9.5px] text-muted">{email === d.email ? "Selected" : "Use"}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 flex items-center gap-2 text-[12px] text-muted short:mt-4">
        <ShieldCheck className="h-4 w-4" /> Protected with 256-bit encryption and BankID-ready MFA.
      </p>
    </motion.div>
  );
}

function FloatingInput({
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="group relative block">
      <input
        type={type}
        value={value}
        required
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer h-14 w-full rounded-[14px] border border-line bg-white px-4 pt-5 pb-1.5 text-[15px] transition-all duration-300 focus:border-plum/40 focus:ring-4 focus:ring-lilac-3 focus:outline-none short:h-[52px]"
      />
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[15px] text-muted transition-all duration-300 ease-apple peer-focus:top-4 peer-focus:text-[11px] peer-focus:text-plum peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px] short:peer-focus:top-3.5 short:peer-[:not(:placeholder-shown)]:top-3.5">
        {label}
      </span>
    </label>
  );
}
