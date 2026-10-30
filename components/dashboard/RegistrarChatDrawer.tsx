"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  ArrowRightLeft,
  Check,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { SHARES_OUTSTANDING, type AuroraEquityRegister, type Shareholder, type ShareholderKind } from "@/lib/data/aurora-equity";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export type StagedAction =
  | {
      id: string;
      kind: "transfer";
      status: "pending" | "executed" | "cancelled" | "reverted";
      shares: number;
      fromId: string;
      fromName: string;
      fromBefore: number;
      fromAfter: number;
      toId: string | null; // null if new shareholder will be created
      toName: string;
      toBefore: number;
      toAfter: number;
      note?: string;
      executedAt?: string;
    }
  | {
      id: string;
      kind: "add_holder";
      status: "pending" | "executed" | "cancelled" | "reverted";
      createdId: string;
      name: string;
      firstName: string;
      investorId: string;
      holderKind: ShareholderKind;
      shares: number;
      email: string;
      address: string;
      postalCode: string;
      city: string;
      country: string;
      executedAt?: string;
    }
  | {
      id: string;
      kind: "update_field";
      status: "pending" | "executed" | "cancelled" | "reverted";
      holderId: string;
      holderName: string;
      field: "email" | "address" | "postalCode" | "city" | "country" | "investorId" | "firstName" | "shares";
      fieldLabel: string;
      beforeValue: string | number;
      afterValue: string | number;
      executedAt?: string;
    };

type DisambiguationOption = {
  role: "from" | "to" | "target";
  originalPrompt: string;
  candidates: Shareholder[];
  selectHolderId: string;
};

type ChatMessage = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  stagedAction?: StagedAction;
  disambiguation?: {
    label: string;
    options: DisambiguationOption[];
  };
};

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  register: AuroraEquityRegister;
  canWrite: boolean;
  userEmail: string;
  onExecuteAction: (action: StagedAction) => Promise<{ ok: boolean; error?: string }>;
  onRevertAction: (action: StagedAction) => Promise<{ ok: boolean; error?: string }>;
};

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

type OrbMood = "idle" | "listen" | "think" | "angry" | "funny" | "light";

function moodFromReply(text: string): OrbMood | null {
  const t = text.toLowerCase();
  if (/safety stop|denied|cannot|could not|insufficient|error|rejected/.test(t)) return "angry";
  if (/confirm below|added|executed|done|applied/.test(t)) return "light";
  return null;
}

function SiriFace({
  live,
  gaze,
  blink,
  thinking,
  lastReply,
  typing,
}: {
  live: boolean;
  gaze: { x: number; y: number };
  blink: boolean;
  thinking: boolean;
  lastReply: string;
  typing: boolean;
}) {
  const [mood, setMood] = useState<OrbMood>("idle");
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (thinking) {
      setMood("think");
      return;
    }
    if (typing) {
      setMood("listen");
      return;
    }
    const fromReply = moodFromReply(lastReply);
    if (fromReply) {
      setMood(fromReply);
      return;
    }
    setMood("idle");
  }, [thinking, typing, lastReply]);

  useEffect(() => {
    if (thinking || typing) return;
    let timeout = 0;
    let cancelled = false;
    const loop = () => {
      timeout = window.setTimeout(() => {
        if (cancelled) return;
        const next = (["funny", "light", "angry", "idle"] as OrbMood[])[Math.floor(Math.random() * 4)];
        setMood(next);
        setPop(true);
        window.setTimeout(() => {
          setPop(false);
          if (!cancelled && !thinking && !typing) loop();
        }, 900);
      }, 4200 + Math.random() * 3800);
    };
    loop();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [thinking, typing]);

  const angry = mood === "angry";
  const funny = mood === "funny";
  const light = mood === "light";

  return (
    <motion.span
      className="relative grid h-[132px] w-[132px] place-items-center overflow-visible"
      animate={{
        scale: pop ? 1.16 : live ? 1.05 : 1,
        rotate: angry ? [-2, 2, -1, 1, 0] : funny ? [-3, 3, 0] : 0,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
    >
      <span className="siri-halo absolute -inset-8 rounded-full animate-siri-breathe" />
      <span className="siri-blob siri-blob-a absolute -inset-9 animate-siri-blob-a" />
      <span className="siri-blob siri-blob-b absolute -inset-11 animate-siri-blob-b" />
      <span className="siri-blob siri-blob-c absolute -inset-7 animate-siri-blob-c" />
      <span
        className={cn(
          "relative h-[118px] w-[118px] overflow-hidden rounded-full shadow-[0_10px_26px_rgba(88,70,160,0.2)]",
          angry && "saturate-150 hue-rotate-[-12deg]",
          funny && "saturate-125",
          light && "brightness-110"
        )}
      >
        <img
          src="/images/siri-orb.jpg"
          alt=""
          draggable={false}
          className="h-full w-full scale-[1.12] object-cover saturate-[1.25] contrast-125"
        />
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(70,40,120,0.14),transparent_46%)]" />
        <span
          className={cn("absolute top-[45%] left-1/2 flex items-center", angry ? "gap-[8px]" : "gap-[11px]")}
          style={{
            transform: `translate(calc(-50% + ${gaze.x}px), calc(-50% + ${gaze.y + (funny ? 2 : 0)}px))`,
          }}
        >
          <span
            className={cn(
              "siri-eye siri-eye-sm",
              blink && "scale-y-[0.1]",
              angry && !blink && "-rotate-[18deg] scale-y-[0.62]",
              funny && !blink && "scale-y-[0.12] -rotate-6",
              light && !blink && "scale-x-125 scale-y-[0.78]"
            )}
          />
          <span
            className={cn(
              "siri-eye siri-eye-sm",
              blink && "scale-y-[0.1]",
              angry && !blink && "rotate-[18deg] scale-y-[0.62]",
              funny && !blink && "scale-y-110 scale-x-110",
              light && !blink && "scale-x-125 scale-y-[0.78]"
            )}
          />
        </span>
        {funny && (
          <span className="absolute top-[62%] left-1/2 h-2.5 w-6 -translate-x-1/2 rounded-[100%] border-b-2 border-white/80" />
        )}
      </span>
    </motion.span>
  );
}

function ChatReply({ text }: { text: string }) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bulletLines = lines.filter((line) => /^[-•*]\s+/.test(line) || /^\d+[.)]\s+/.test(line));

  const toItems = (source: string[]) =>
    source.map((line) => line.replace(/^[-•*]\s+/, "").replace(/^\d+[.)]\s+/, ""));

  let items: string[] | null = null;
  if (bulletLines.length >= 2) {
    items = toItems(bulletLines);
  } else if (lines.length === 1 && text.length > 150) {
    const parts = text.split(/(?<=[.!?])\s+/).map((p) => p.trim()).filter((p) => p.length > 8);
    if (parts.length >= 3) items = parts.slice(0, 5);
  }

  if (items && items.length >= 2) {
    const lead = lines.find((line) => !/^[-•*]|\d+[.)]/.test(line));
    return (
      <div className="text-[14px] leading-snug text-neutral-800">
        {lead && !/^[-•*]\s+|^\d+[.)]\s+/.test(lead) && <p className="mb-1.5">{lead}</p>}
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={`${item}-${i}`} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <p className="text-[14px] leading-snug text-neutral-800">{text}</p>;
}

function parseShareNumber(raw: string): number | null {
  const cleaned = raw.trim().toLowerCase().replace(/[\s,_']/g, "");
  const m = cleaned.match(/^(\d+(?:\.\d+)?)(k|m)?$/);
  if (!m) return null;
  let val = Number(m[1]);
  if (!Number.isFinite(val)) return null;
  if (m[2] === "k") val *= 1_000;
  if (m[2] === "m") val *= 1_000_000;
  const rounded = Math.round(val);
  return rounded > 0 ? rounded : null;
}

function findMatchingHolders(query: string, holders: Shareholder[]): Shareholder[] {
  const q = query
    .trim()
    .toLowerCase()
    .replace(/^["'«»“”]|["'«»“”]$/g, "")
    .replace(/\s+/g, " ");
  if (!q) return [];

  // 1. Exact match on displayName, name, email, investorId, or "firstName name"
  const exact = holders.filter((h) => {
    const full1 = `${h.name} ${h.firstName}`.trim().toLowerCase();
    const full2 = `${h.firstName} ${h.name}`.trim().toLowerCase();
    return (
      h.name.toLowerCase() === q ||
      h.displayName.toLowerCase() === q ||
      full1 === q ||
      full2 === q ||
      h.email.toLowerCase() === q ||
      h.investorId.replace(/\s+/g, "").toLowerCase() === q.replace(/\s+/g, "")
    );
  });
  if (exact.length === 1) return exact;

  // 2. Starts-with or contains all tokens
  const tokens = q.split(" ").filter(Boolean);
  const tokenMatches = holders.filter((h) => {
    const hay = `${h.name} ${h.firstName} ${h.displayName} ${h.email} ${h.investorId}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
  return tokenMatches;
}

export function RegistrarChatDrawer({
  open,
  onOpen,
  onClose,
  register,
  canWrite,
  onExecuteAction,
  onRevertAction,
}: Props) {
  const [input, setInput] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [applying, setApplying] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const orbRef = useRef<HTMLButtonElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const typingUntil = useRef(0);
  const openedAt = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      openedAt.current = Date.now();
      const t = setTimeout(() => inputRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let timeout = 0;
    let cancelled = false;
    const loop = () => {
      timeout = window.setTimeout(() => {
        if (cancelled) return;
        setBlink(true);
        window.setTimeout(() => {
          setBlink(false);
          if (!cancelled) loop();
        }, 130);
      }, 2400 + Math.random() * 2400);
    };
    loop();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [open]);

  function lookAt(clientX: number, clientY: number) {
    const orb = orbRef.current;
    if (!orb) return;
    const r = orb.getBoundingClientRect();
    setGaze({
      x: Math.max(-7, Math.min(7, (clientX - (r.left + r.width / 2)) / 18)),
      y: Math.max(-5, Math.min(6, (clientY - (r.top + r.height * 0.46)) / 22)),
    });
  }

  function lookAtInput() {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.min(1, el.value.length / 36);
    lookAt(r.left + r.width * (0.28 + ratio * 0.44), r.top + 6);
    typingUntil.current = Date.now() + 1800;
  }

  useEffect(() => {
    if (!open || !thinking) return;
    const orb = orbRef.current;
    if (!orb) return;
    const r = orb.getBoundingClientRect();
    lookAt(r.left + r.width / 2, r.top - 90);
  }, [open, thinking]);

  const pendingAction = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const a = messages[i].stagedAction;
      if (a && a.status === "pending") return a;
    }
    return null;
  }, [messages]);

  function updateActionStatus(actionId: string, status: StagedAction["status"], executedAt?: string) {
    setMessages((prev) =>
      prev.map((m) =>
        m.stagedAction && m.stagedAction.id === actionId
          ? {
              ...m,
              stagedAction: {
                ...m.stagedAction,
                status,
                ...(executedAt ? { executedAt } : {}),
              },
            }
          : m
      )
    );
  }

  async function confirmAction(action: StagedAction) {
    if (busyId) return;
    setBusyId(action.id);
    setApplying(true);
    const res = await onExecuteAction(action);
    setBusyId(null);
    setApplying(false);

    if (!res.ok) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          timestamp: nowTime(),
          text: res.error ?? "Transaction rejected by server verification.",
        },
      ]);
      return;
    }

    const ts = nowTime();
    updateActionStatus(action.id, "executed", ts);

    const summary =
      action.kind === "transfer"
        ? `Executed transfer of ${fmt.int(action.shares)} shares from ${action.fromName} (${fmt.int(action.fromBefore)} → ${fmt.int(action.fromAfter)}) to ${action.toName} (${fmt.int(action.toBefore)} → ${fmt.int(action.toAfter)}).`
        : action.kind === "add_holder"
          ? `Added ${action.name} with ${fmt.int(action.shares)} shares (${((action.shares / SHARES_OUTSTANDING) * 100).toFixed(2)}%) to the register.`
          : `Updated ${action.fieldLabel} for ${action.holderName} from "${action.beforeValue}" to "${action.afterValue}".`;

    setMessages((prev) => [
      ...prev,
      {
        id: `done-${Date.now()}`,
        sender: "assistant",
        timestamp: ts,
        text: summary,
      },
    ]);
  }

  function cancelAction(action: StagedAction) {
    updateActionStatus(action.id, "cancelled");
    setMessages((prev) => [
      ...prev,
      {
        id: `cancel-${Date.now()}`,
        sender: "assistant",
        timestamp: nowTime(),
        text: "Staged transaction cancelled. No changes were made to the shareholder register.",
      },
    ]);
  }

  async function revertAction(action: StagedAction) {
    if (busyId) return;
    setBusyId(action.id);
    const res = await onRevertAction(action);
    setBusyId(null);
    if (!res.ok) {
      setMessages((prev) => [
        ...prev,
        {
          id: `rev-err-${Date.now()}`,
          sender: "assistant",
          timestamp: nowTime(),
          text: res.error ?? "Could not revert transaction.",
        },
      ]);
      return;
    }
    updateActionStatus(action.id, "reverted");
    setMessages((prev) => [
      ...prev,
      {
        id: `rev-ok-${Date.now()}`,
        sender: "assistant",
        timestamp: nowTime(),
        text: "Transaction reverted. Shareholder balances have been restored to their previous state.",
      },
    ]);
  }

  async function processCommand(rawText: string) {
    const trimmed = rawText.trim();
    if (!trimmed || thinking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: nowTime(),
    };

    const lower = trimmed.toLowerCase();

    // Quick confirm / cancel for pending staged action
    if (pendingAction && (lower === "confirm" || lower === "yes" || lower === "execute" || lower === "approve")) {
      setMessages((prev) => [...prev, userMsg]);
      void confirmAction(pendingAction);
      return;
    }
    if (pendingAction && (lower === "cancel" || lower === "no" || lower === "abort")) {
      setMessages((prev) => [...prev, userMsg]);
      cancelAction(pendingAction);
      return;
    }

    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    try {
      const history = messages
        .slice(-6)
        .map((m) => ({ role: m.sender === "user" ? ("user" as const) : ("assistant" as const), content: m.text }));

      const res = await fetch("/api/register/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          history,
          shareholders: register.shareholders.map((h) => ({
            id: h.id,
            rank: h.rank,
            name: h.name,
            firstName: h.firstName,
            displayName: h.displayName,
            investorId: h.investorId,
            shares: h.shares,
            stakeText: h.stakeText,
            email: h.email,
            city: h.city,
            country: h.country,
            kind: h.kind,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const intent = data?.intent;
        const aiReply: string = data?.reply || "";

        if (intent && intent.type === "transfer" && intent.fromQuery && intent.toQuery && Number(intent.shares) > 0) {
          const synthetic = `Transfer ${Math.round(Number(intent.shares))} shares from "${intent.fromQuery}" to "${intent.toQuery}"`;
          const staged = buildAssistantResponse(synthetic, register.shareholders, canWrite);
          if (aiReply && staged.stagedAction) {
            staged.text = aiReply;
          }
          setMessages((prev) => [...prev, staged]);
          setThinking(false);
          return;
        }

        if (intent && intent.type === "add_holder" && intent.name && Number(intent.shares) > 0) {
          if (!canWrite) {
            setMessages((prev) => [
              ...prev,
              {
                id: `a-${Date.now()}`,
                sender: "assistant",
                timestamp: nowTime(),
                text: "Write access denied. Only paal@synx.tools and thiru@synx.tools can add new entries to the register.",
              },
            ]);
            setThinking(false);
            return;
          }
          const shares = Math.round(Number(intent.shares));
          const investorId = String(intent.investorId ?? "").trim();
          const cleanOrg = investorId.replace(/\s+/g, "");
          const isCompany =
            intent.holderKind === "company" ||
            /^[89]\d{8}$/.test(cleanOrg) ||
            /\b(?:AS|ASA|AB|LTD|INC|LLC|HOLDING|INVEST|CAPITAL)\b/i.test(String(intent.name));

          setMessages((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              sender: "assistant",
              timestamp: nowTime(),
              text:
                aiReply ||
                `Staged new shareholder entry for ${intent.name} with ${fmt.int(shares)} shares. Please verify all details below before confirming.`,
              stagedAction: {
                id: `add-${Date.now()}`,
                kind: "add_holder",
                status: "pending",
                createdId: `custom-${Date.now()}`,
                name: String(intent.name).trim(),
                firstName: String(intent.firstName ?? "").trim(),
                investorId: investorId || "—",
                holderKind: isCompany ? "company" : "person",
                shares,
                email: String(intent.email ?? "").trim(),
                address: String(intent.address ?? "").trim(),
                postalCode: String(intent.postalCode ?? "").trim(),
                city: String(intent.city ?? "OSLO").trim(),
                country: String(intent.country ?? "Norway").trim(),
              },
            },
          ]);
          setThinking(false);
          return;
        }

        if (intent && intent.type === "update_field" && intent.targetQuery && intent.field && intent.value !== undefined) {
          const synthetic = `Set ${intent.field} of "${intent.targetQuery}" to ${intent.value}`;
          const staged = buildAssistantResponse(synthetic, register.shareholders, canWrite);
          if (aiReply && staged.stagedAction) {
            staged.text = aiReply;
          }
          setMessages((prev) => [...prev, staged]);
          setThinking(false);
          return;
        }

        if (aiReply) {
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              sender: "assistant",
              timestamp: nowTime(),
              text: aiReply,
            },
          ]);
          setThinking(false);
          return;
        }
      }
    } catch {
      // Fall back to deterministic parser if network/API fails
    }

    const reply = buildAssistantResponse(trimmed, register.shareholders, canWrite);
    setMessages((prev) => [...prev, reply]);
    setThinking(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput("");
    if (!open) onOpen();
    processCommand(text);
  }

  const live = thinking || applying || Boolean(busyId);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, applying]);

  if (!open || !mounted) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[400]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={(e) => {
        if (thinking || Date.now() < typingUntil.current) return;
        lookAt(e.clientX, e.clientY);
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (Date.now() - openedAt.current < 450) return;
          onClose();
        }}
        aria-label="Dismiss Copilot"
        className="absolute inset-0 bg-transparent"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] overflow-hidden">
        <div className="siri-rim absolute inset-0 opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(46%_68%_at_50%_118%,rgba(186,156,255,0.32),rgba(56,189,248,0.12)_42%,transparent_70%)]" />
      </div>

      <div className="pointer-events-none relative flex h-full flex-col justify-end">
        <div className="pointer-events-auto mx-auto flex min-h-0 w-full max-w-[560px] flex-1 flex-col justify-end px-4 pb-1 pt-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-white/55 bg-white/48 shadow-[0_12px_36px_rgba(22,20,31,0.08)] backdrop-blur-xl"
          >
            <div
              ref={chatScrollRef}
              className="min-h-0 max-h-[38vh] overflow-y-auto px-3.5 py-3 scrollbar-thin"
            >
              {messages.length === 0 && !thinking ? (
                <p className="px-2 py-4 text-center text-[20px] leading-tight font-light tracking-tight text-neutral-900">
                  What can I help you with?
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {messages.map((m) =>
                    m.sender === "user" ? (
                      <div key={m.id} className="ml-auto max-w-[82%] text-right">
                        <p className="inline-block rounded-2xl rounded-br-md bg-neutral-900 px-3 py-1.5 text-left text-[13px] leading-snug text-white">
                          {m.text}
                        </p>
                      </div>
                    ) : (
                      <div key={m.id} className="mr-auto w-full max-w-[94%] text-left">
                        <ChatReply text={m.text} />
                        {m.disambiguation && (
                          <div className="mt-2 flex flex-col gap-1.5">
                            {m.disambiguation.options.map((opt) => {
                              const h = opt.candidates[0];
                              return (
                                <button
                                  key={h.id}
                                  type="button"
                                  onClick={() => processCommand(opt.originalPrompt)}
                                  className="rounded-full bg-black/[0.05] px-3 py-1.5 text-left text-[13px] text-neutral-800 hover:bg-black/[0.08]"
                                >
                                  #{h.rank} {h.displayName}
                                  <span className="ml-2 text-neutral-500">
                                    {fmt.int(h.shares)} · {h.stakeText}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {m.stagedAction && (
                          <div className="mt-2">
                            <StagedActionCard
                              action={m.stagedAction}
                              busy={busyId === m.stagedAction.id}
                              onConfirm={() => confirmAction(m.stagedAction!)}
                              onCancel={() => cancelAction(m.stagedAction!)}
                              onRevert={() => revertAction(m.stagedAction!)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  )}
                  {thinking && <p className="text-[13px] font-light text-neutral-500">On it…</p>}
                  {applying && <p className="text-[13px] text-neutral-500">Applying…</p>}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="pointer-events-auto relative flex flex-col items-center pb-[max(20px,env(safe-area-inset-bottom))]"
        >
          <motion.button
            ref={orbRef}
            type="submit"
            disabled={thinking}
            aria-label="Ask Copilot"
            initial={{ y: 24, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="relative mb-1 grid overflow-visible place-items-center"
          >
            <SiriFace
              live={live}
              gaze={gaze}
              blink={blink}
              thinking={thinking}
              typing={input.length > 0}
              lastReply={[...messages].reverse().find((m) => m.sender === "assistant")?.text ?? ""}
            />
          </motion.button>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              requestAnimationFrame(lookAtInput);
            }}
            onFocus={lookAtInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              } else {
                requestAnimationFrame(lookAtInput);
              }
            }}
            placeholder={thinking ? "Listening…" : "Speak or type, then press Return"}
            className="w-[min(400px,82vw)] resize-none bg-transparent text-center text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
          />
        </form>
      </div>
    </motion.div>,
    document.body
  );
}

function StagedActionCard({
  action,
  busy,
  onConfirm,
  onCancel,
  onRevert,
}: {
  action: StagedAction;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onRevert: () => void;
}) {
  const isPending = action.status === "pending";
  const isExecuted = action.status === "executed";
  const isCancelled = action.status === "cancelled";
  const isReverted = action.status === "reverted";

  return (
    <div
      className={cn(
        "mt-2 w-full overflow-hidden rounded-2xl border text-[12.5px] text-white shadow-[0_18px_50px_rgba(22,20,31,0.28)] backdrop-blur-xl",
        isPending && "border-white/15 bg-[#16141f]/88",
        isExecuted && "border-[#30d158]/35 bg-[#12351f]/88",
        (isCancelled || isReverted) && "border-white/10 bg-[#16141f]/70 opacity-75"
      )}
    >
      {/* Card top bar */}
      <div
        className={cn(
          "flex items-center justify-between border-b px-3.5 py-2.5",
          isPending && "border-white/10 bg-white/[0.04]",
          isExecuted && "border-[#30d158]/20 bg-[#30d158]/[0.1]",
          (isCancelled || isReverted) && "border-white/10 bg-white/[0.03]"
        )}
      >
        <div className="flex items-center gap-2 font-semibold text-white">
          {action.kind === "transfer" ? (
            <>
              <ArrowRightLeft className="h-3.5 w-3.5 text-[#0a6bd6]" />
              <span>Share Transfer Verification</span>
            </>
          ) : action.kind === "add_holder" ? (
            <>
              <UserPlus className="h-3.5 w-3.5 text-[#0a6bd6]" />
              <span>New Shareholder Entry</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-[#0a6bd6]" />
              <span>Register Field Update</span>
            </>
          )}
        </div>
        <span
          className={cn(
            "px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
            isPending && "bg-[#ff9f0a]/20 text-[#ffd60a]",
            isExecuted && "bg-[#30d158]/20 text-[#30d158]",
            isCancelled && "bg-white/10 text-white/60",
            isReverted && "bg-[#5e5ce6]/20 text-[#bfbdff]"
          )}
        >
          {isPending ? "Awaiting confirmation" : isExecuted ? "Committed" : isReverted ? "Reverted" : "Cancelled"}
        </span>
      </div>

      {/* Body details */}
      <div className="space-y-3 p-3.5">
        {action.kind === "transfer" && (
          <>
            <div className="flex items-center justify-between bg-white/[0.06] px-3 py-2">
              <span className="text-[11.5px] text-white/50">Shares to transfer</span>
              <span className="font-mono text-[14px] font-bold text-white">
                {fmt.int(action.shares)} sh ({((action.shares / SHARES_OUTSTANDING) * 100).toFixed(4)}%)
              </span>
            </div>

            <div className="space-y-2">
              {/* Sender */}
              <div className="border border-white/12 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider text-[#ff8a80] uppercase">
                    From (Debit −{fmt.int(action.shares)})
                  </span>
                  <span className="text-[11px] text-white/50">
                    {((action.fromBefore / SHARES_OUTSTANDING) * 100).toFixed(2)}% →{" "}
                    <strong className="text-white">
                      {((action.fromAfter / SHARES_OUTSTANDING) * 100).toFixed(2)}%
                    </strong>
                  </span>
                </div>
                <div className="mt-1 font-semibold text-white">{action.fromName}</div>
                <div className="mt-1 flex items-center gap-2 font-mono text-[12px] text-white/65">
                  <span>{fmt.int(action.fromBefore)}</span>
                  <ArrowRight className="h-3 w-3 text-white/40" />
                  <span className="font-bold text-[#ff8a80]">{fmt.int(action.fromAfter)} shares</span>
                </div>
              </div>

              {/* Recipient */}
              <div className="border border-white/12 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider text-[#7dffa6] uppercase">
                    To (Credit +{fmt.int(action.shares)})
                  </span>
                  <span className="text-[11px] text-white/50">
                    {((action.toBefore / SHARES_OUTSTANDING) * 100).toFixed(2)}% →{" "}
                    <strong className="text-white">
                      {((action.toAfter / SHARES_OUTSTANDING) * 100).toFixed(2)}%
                    </strong>
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 font-semibold text-white">
                  <span>{action.toName}</span>
                  {action.toId === null && (
                    <span className="bg-white/12 px-1.5 py-0.5 text-[10px] font-semibold text-white/80">
                      New holder
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 font-mono text-[12px] text-white/65">
                  <span>{fmt.int(action.toBefore)}</span>
                  <ArrowRight className="h-3 w-3 text-white/40" />
                  <span className="font-bold text-[#7dffa6]">{fmt.int(action.toAfter)} shares</span>
                </div>
              </div>
            </div>

            {/* Invariant checks */}
            <div className="bg-[#30d158]/[0.12] px-3 py-2 text-[11px] text-[#7dffa6]">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Balance verified · Net share delta: 0 (Sum conserved at{" "}
                  {fmt.int(action.fromBefore + action.toBefore)} shares)
                </span>
              </div>
            </div>
          </>
        )}

        {action.kind === "add_holder" && (
          <div className="space-y-2 border border-white/12 bg-white/[0.05] p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-semibold text-white">
                {action.name} {action.firstName}
              </span>
              <span className="bg-white/12 px-1.5 py-0.5 text-[10.5px] font-semibold text-white/80">
                {action.holderKind === "company" ? "Company" : "Private"}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px]">
              <div>
                <dt className="text-white/50">Shares allocated</dt>
                <dd className="font-mono font-semibold text-white">
                  {fmt.int(action.shares)} ({((action.shares / SHARES_OUTSTANDING) * 100).toFixed(2)}%)
                </dd>
              </div>
              <div>
                <dt className="text-white/50">Investor ID / Org. nr</dt>
                <dd className="font-mono text-white">{action.investorId || "—"}</dd>
              </div>
              <div>
                <dt className="text-white/50">E-mail</dt>
                <dd className="truncate text-white">{action.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-white/50">Location</dt>
                <dd className="text-white">
                  {[action.postalCode, action.city, action.country].filter(Boolean).join(" ") || "—"}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {action.kind === "update_field" && (
          <div className="space-y-1.5 border border-white/12 bg-white/[0.05] p-3">
            <div className="font-semibold text-white">{action.holderName}</div>
            <div className="text-[11.5px] text-white/50">Field: {action.fieldLabel}</div>
            <div className="flex items-center gap-2 font-mono text-[12px]">
              <span className="line-through text-white/35">{String(action.beforeValue || "—")}</span>
              <ArrowRight className="h-3 w-3 text-white/40" />
              <span className="font-semibold text-white">{String(action.afterValue)}</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {isPending && (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 bg-[#0a84ff] px-3 text-[12.5px] font-semibold text-white hover:bg-[#0070e0] disabled:opacity-50"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
              {busy ? "Executing…" : "Confirm & Execute"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="flex h-9 items-center justify-center border border-white/20 bg-white/8 px-3.5 text-[12.5px] font-medium text-white/85 hover:bg-white/12"
            >
              Cancel
            </button>
          </div>
        )}

        {isExecuted && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-medium text-[#7dffa6]">
              ✓ Applied to live register at {action.executedAt}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={onRevert}
              className="inline-flex items-center gap-1 border border-white/20 bg-white/8 px-2.5 py-1 text-[11px] font-medium text-white/80 hover:bg-white/12"
            >
              <RotateCcw className="h-3 w-3" /> Revert
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function buildAssistantResponse(
  prompt: string,
  holders: Shareholder[],
  canWrite: boolean
): ChatMessage {
  const id = `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = nowTime();
  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  // 1. Detect SHARE TRANSFER intent:
  // Patterns:
  // - "take 50,000 shares from X and give to Y"
  // - "transfer 50000 shares from X to Y"
  // - "move 10,000 from X to Y"
  // - "give 25000 shares from X to Y"
  const transferRegex =
    /(?:take|transfer|move|shift|give|deduct|send)\s+([\d,._'\s]+(?:k|m)?)\s*(?:shares|sh)?\s+from\s+(.+?)\s+(?:and\s+(?:give|transfer|send|add|assign|credit)\s+(?:them\s+|it\s+)?to|to)\s+(.+)$/i;
  const transferAltRegex =
    /give\s+(.+?)\s+([\d,._'\s]+(?:k|m)?)\s*(?:shares|sh)?\s+from\s+(.+)$/i;

  const tm1 = clean.match(transferRegex);
  const tm2 = !tm1 ? clean.match(transferAltRegex) : null;

  if (tm1 || tm2) {
    if (!canWrite) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: "Write access denied. Only paal@synx.tools and thiru@synx.tools are authorized to transfer shares or modify the register.",
      };
    }

    const rawAmount = tm1 ? tm1[1] : tm2![2];
    const rawFrom = (tm1 ? tm1[2] : tm2![3]).replace(/[.;,]+$/, "").trim();
    const rawTo = (tm1 ? tm1[3] : tm2![1]).replace(/[.;,]+$/, "").trim();

    const shares = parseShareNumber(rawAmount);
    if (!shares || shares <= 0) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: `Could not parse a valid positive share amount from "${rawAmount}". Please specify an exact integer number of shares (for example: "Transfer 25,000 shares from SEMANTIC AS to EBOOT AS").`,
      };
    }

    const fromCandidates = findMatchingHolders(rawFrom, holders);
    if (fromCandidates.length === 0) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: `Safety stop: Could not find any existing shareholder matching "${rawFrom}" to debit shares from. Please check the exact shareholder name in the register.`,
      };
    }

    if (fromCandidates.length > 1) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: `Multiple shareholders match "${rawFrom}". Because share transfers must be exact, please select which sender you mean:`,
        disambiguation: {
          label: `Select sender for ${fmt.int(shares)} shares:`,
          options: fromCandidates.slice(0, 6).map((c) => ({
            role: "from",
            originalPrompt: `Transfer ${shares} shares from "${c.displayName}" to ${rawTo}`,
            candidates: [c],
            selectHolderId: c.id,
          })),
        },
      };
    }

    const sender = fromCandidates[0];

    if (sender.shares < shares) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: `Safety stop — Insufficient balance: ${sender.displayName} currently holds ${fmt.int(sender.shares)} shares (${sender.stakeText}), so ${fmt.int(shares)} shares cannot be deducted.`,
      };
    }

    const toCandidates = findMatchingHolders(rawTo, holders);
    if (toCandidates.length > 1) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: `Multiple shareholders match the recipient "${rawTo}". Please select the exact recipient:`,
        disambiguation: {
          label: `Select recipient for ${fmt.int(shares)} shares from ${sender.displayName}:`,
          options: toCandidates.slice(0, 6).map((c) => ({
            role: "to",
            originalPrompt: `Transfer ${shares} shares from "${sender.displayName}" to "${c.displayName}"`,
            candidates: [c],
            selectHolderId: c.id,
          })),
        },
      };
    }

    const recipient = toCandidates.length === 1 ? toCandidates[0] : null;

    if (recipient && recipient.id === sender.id) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: `Safety stop: Sender and recipient both resolved to ${sender.displayName}. Self-transfers are not permitted.`,
      };
    }

    const fromBefore = sender.shares;
    const fromAfter = fromBefore - shares;
    const toBefore = recipient ? recipient.shares : 0;
    const toAfter = toBefore + shares;
    const toName = recipient ? recipient.displayName : rawTo;

    return {
      id,
      sender: "assistant",
      timestamp,
      text: recipient
        ? `Staged share transfer of ${fmt.int(shares)} shares from ${sender.displayName} to ${recipient.displayName}. Please review the before/after balances below and click "Confirm & Execute" to commit.`
        : `Staged share transfer of ${fmt.int(shares)} shares from ${sender.displayName} to new shareholder "${toName}". Review carefully before confirming.`,
      stagedAction: {
        id: `tx-${Date.now()}`,
        kind: "transfer",
        status: "pending",
        shares,
        fromId: sender.id,
        fromName: sender.displayName,
        fromBefore,
        fromAfter,
        toId: recipient ? recipient.id : null,
        toName,
        toBefore,
        toAfter,
      },
    };
  }

  // 2. Detect ADD SHAREHOLDER ENTRY intent:
  // e.g. "Add entry SYNX AS with 100,000 shares, org nr 928114502, email paal@synx.tools, city OSLO"
  if (/^(?:add|create|insert|register|new)\s+(?:an?\s+)?(?:entry|shareholder|holder|investor|company|person)?/i.test(clean)) {
    if (!canWrite) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: "Write access denied. Only paal@synx.tools and thiru@synx.tools can add new entries to the register.",
      };
    }

    const emailMatch = clean.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const email = emailMatch ? emailMatch[1] : "";

    const orgMatch = clean.match(/(?:org\.?\s*(?:nr|no)?|id|investor\s*id)[:\s#]*([0-9]{9}|\d{2}\/\d{2}\/\d{4}|\d{6}\s*\d{5})/i);
    const investorId = orgMatch ? orgMatch[1].trim() : "";

    const cityMatch = clean.match(/(?:city|in)\s+([A-Za-zÆØÅæøå\s-]+?)(?:,|$|\s+(?:email|org|id|with|shares|country|address|postal))/i);
    const city = cityMatch ? cityMatch[1].trim().toUpperCase() : "OSLO";

    const postalMatch = clean.match(/(?:postal(?:\s*code)?|zip)[:\s]*(\d{4,6})/i);
    const postalCode = postalMatch ? postalMatch[1] : "";

    const addressMatch = clean.match(/address[:\s]+([^,]+?)(?:,|$)/i);
    const address = addressMatch ? addressMatch[1].trim() : "";

    const sharesMatch = clean.match(/(?:with\s+)?([\d,._']+(?:k|m)?)\s*(?:shares|sh)\b/i);
    const shares = sharesMatch ? parseShareNumber(sharesMatch[1]) : null;

    // Extract name between command prefix and "with / <shares> / ,"
    const nameMatch = clean
      .replace(/^(?:add|create|insert|register|new)\s+(?:an?\s+)?(?:entry|shareholder|holder|investor|company|person)?\s*(?:for|named|called)?\s*/i, "")
      .match(/^([^,]+?)(?:\s+with\s+|\s+[\d,._']+\s*(?:shares|sh)\b|,|$)/i);

    const rawName = nameMatch ? nameMatch[1].trim().replace(/^["']|["']$/g, "") : "";

    if (!rawName || !shares) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: 'To add a shareholder entry safely, please include the name and share count — for example:\n"Add entry SYNX TOOLS AS with 50,000 shares, org nr 928114502, email thiru@synx.tools, city OSLO"',
      };
    }

    const cleanOrg = investorId.replace(/\s+/g, "");
    const isCompany = /^[89]\d{8}$/.test(cleanOrg) || /\b(?:AS|ASA|AB|LTD|INC|LLC|HOLDING|INVEST|CAPITAL)\b/i.test(rawName);

    return {
      id,
      sender: "assistant",
      timestamp,
      text: `Staged new shareholder entry for ${rawName} with ${fmt.int(shares)} shares. Please verify all details below before confirming.`,
      stagedAction: {
        id: `add-${Date.now()}`,
        kind: "add_holder",
        status: "pending",
        createdId: `custom-${Date.now()}`,
        name: rawName,
        firstName: "",
        investorId: investorId || "—",
        holderKind: isCompany ? "company" : "person",
        shares,
        email,
        address,
        postalCode,
        city,
        country: "Norway",
      },
    };
  }

  // 3. Detect FIELD UPDATE intent:
  // e.g. "set email of EBOOT AS to post@eboot.no" or "set shares of EBOOT AS to 5100000"
  const updateMatch = clean.match(
    /^(?:update|set|change)\s+(email|e-mail|address|city|postal(?:\s*code)?|country|investor\s*id|org\s*nr|shares)\s+(?:of|for)\s+(.+?)\s+to\s+(.+)$/i
  );
  if (updateMatch) {
    if (!canWrite) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: "Write access denied. Only paal@synx.tools and thiru@synx.tools can modify register fields.",
      };
    }
    const rawField = updateMatch[1].toLowerCase();
    const targetQuery = updateMatch[2].trim();
    const newValRaw = updateMatch[3].trim();

    const matches = findMatchingHolders(targetQuery, holders);
    if (matches.length === 0) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: `Could not find a shareholder matching "${targetQuery}".`,
      };
    }
    if (matches.length > 1) {
      return {
        id,
        sender: "assistant",
        timestamp,
        text: `Multiple shareholders match "${targetQuery}". Please choose the exact one:`,
        disambiguation: {
          label: "Select shareholder to update:",
          options: matches.slice(0, 6).map((c) => ({
            role: "target",
            originalPrompt: `Set ${rawField} of "${c.displayName}" to ${newValRaw}`,
            candidates: [c],
            selectHolderId: c.id,
          })),
        },
      };
    }

    const holder = matches[0];
    let field: "email" | "address" | "postalCode" | "city" | "country" | "investorId" | "firstName" | "shares" = "email";
    let fieldLabel = "E-mail";
    let beforeValue: string | number = holder.email;
    let afterValue: string | number = newValRaw;

    if (rawField.includes("share")) {
      const parsed = parseShareNumber(newValRaw);
      if (!parsed) {
        return {
          id,
          sender: "assistant",
          timestamp,
          text: `Invalid share count "${newValRaw}".`,
        };
      }
      field = "shares";
      fieldLabel = "Num Shares";
      beforeValue = holder.shares;
      afterValue = parsed;
    } else if (rawField.includes("address")) {
      field = "address";
      fieldLabel = "Address";
      beforeValue = holder.address;
    } else if (rawField.includes("city")) {
      field = "city";
      fieldLabel = "City";
      beforeValue = holder.city;
    } else if (rawField.includes("postal")) {
      field = "postalCode";
      fieldLabel = "Postal code";
      beforeValue = holder.postalCode;
    } else if (rawField.includes("country")) {
      field = "country";
      fieldLabel = "Country";
      beforeValue = holder.country;
    } else if (rawField.includes("id") || rawField.includes("org")) {
      field = "investorId";
      fieldLabel = "Investor ID";
      beforeValue = holder.investorId;
    }

    return {
      id,
      sender: "assistant",
      timestamp,
      text: `Staged update to ${fieldLabel} for ${holder.displayName}. Please confirm below.`,
      stagedAction: {
        id: `upd-${Date.now()}`,
        kind: "update_field",
        status: "pending",
        holderId: holder.id,
        holderName: holder.displayName,
        field,
        fieldLabel,
        beforeValue,
        afterValue,
      },
    };
  }

  // 4. Read / Query intents:
  if (lower.includes("top") && /\d+/.test(lower)) {
    const n = Math.min(15, Math.max(1, Number(lower.match(/(\d+)/)?.[1] ?? 5)));
    const top = holders.slice(0, n);
    return {
      id,
      sender: "assistant",
      timestamp,
      text:
        `Top ${n} shareholders in Aurora Equity AS:\n` +
        top.map((h) => `${h.rank}. ${h.displayName} — ${fmt.int(h.shares)} sh (${h.stakeText})`).join("\n"),
    };
  }

  // Search for a shareholder mentioned in the question
  const cleanedQuery = clean
    .replace(/^(?:who\s+is|how\s+many\s+shares\s+does|show|find|lookup|search|what\s+is\s+the\s+stake\s+of)\s+/i, "")
    .replace(/\s+(?:have|own|hold|stake|shares)\??$/i, "")
    .replace(/[?]+$/, "")
    .trim();

  const found = findMatchingHolders(cleanedQuery, holders);
  if (found.length === 1) {
    const h = found[0];
    return {
      id,
      sender: "assistant",
      timestamp,
      text: `${h.displayName} (Rank #${h.rank})\n• Shares: ${fmt.int(h.shares)} (${h.stakeText})\n• Investor ID: ${h.investorId || "—"}\n• E-mail: ${h.email || "—"}\n• Location: ${[h.address, h.postalCode, h.city, h.country].filter(Boolean).join(", ") || "—"}`,
    };
  }
  if (found.length > 1) {
    return {
      id,
      sender: "assistant",
      timestamp,
      text:
        `Found ${found.length} matching shareholders:\n` +
        found
          .slice(0, 8)
          .map((h) => `• #${h.rank} ${h.displayName}: ${fmt.int(h.shares)} sh (${h.stakeText})`)
          .join("\n"),
    };
  }

  return {
    id,
    sender: "assistant",
    timestamp,
    text:
      'I can help you safely inspect or update the Aurora Equity AS shareholder register. Try:\n• "Take 25,000 shares from SEMANTIC AS and give to EBOOT AS"\n• "Add entry SYNX TOOLS AS with 50,000 shares, org nr 928114502, email thiru@synx.tools, city OSLO"\n• "Set email of EBOOT AS to post@eboot.no"\n• "Show top 5 shareholders"',
  };
}
