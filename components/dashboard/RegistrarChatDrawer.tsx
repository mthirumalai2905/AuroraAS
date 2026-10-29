"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Check,
  CheckCircle2,
  Lock,
  MessageSquareText,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserPlus,
  X,
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
  onClose,
  register,
  canWrite,
  userEmail,
  onExecuteAction,
  onRevertAction,
}: Props) {
  const [input, setInput] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      sender: "assistant",
      timestamp: "Ready",
      text: canWrite
        ? `Registrar Copilot active for ${userEmail}. Every share transfer or new entry is staged with a full pre-flight verification card and never mutates the register until you explicitly confirm.`
        : `Registrar Copilot is in read-only mode (${userEmail}). You can query shareholders and stakes, but write operations are restricted to paal@synx.tools and thiru@synx.tools.`,
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

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
    const res = await onExecuteAction(action);
    setBusyId(null);

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
    processCommand(text);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          />
          <motion.aside
            key="chat-panel"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed inset-y-2 right-2 z-50 flex w-[min(480px,calc(100vw-16px))] flex-col overflow-hidden rounded-[22px] border border-black/[0.08] bg-white/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-black/[0.06] bg-white/80 px-5 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#231d3a] to-[#0a84ff] text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className=" truncate text-[15px] font-semibold text-neutral-900">Registrar Copilot</span>
                  {canWrite ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#30d158]/15 px-2 py-0.5 text-[10.5px] font-semibold text-[#1f7a35]">
                      <ShieldCheck className="h-3 w-3" /> Write-enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.06] px-2 py-0.5 text-[10.5px] font-medium text-neutral-600">
                      <Lock className="h-3 w-3" /> Read-only
                    </span>
                  )}
                </div>
                <p className="truncate text-[11.5px] text-neutral-500">
                  Two-step verified share transfers & register entries
                </p>
              </div>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full bg-black/[0.05] text-neutral-500 transition-colors hover:bg-black/[0.1]"
                aria-label="Close Copilot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick templates bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-black/[0.05] bg-[#f8f8fa] px-4 py-2 scrollbar-none">
              <button
                type="button"
                onClick={() =>
                  setInput("Transfer 25,000 shares from SEMANTIC AS to EBOOT AS")
                }
                className="shrink-0 rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors hover:border-[#0a84ff]/40 hover:text-[#0a6bd6]"
              >
                ⇄ Transfer shares
              </button>
              <button
                type="button"
                onClick={() =>
                  setInput("Add entry SYNX TOOLS AS with 50,000 shares, org nr 928114502, email thiru@synx.tools, city OSLO")
                }
                className="shrink-0 rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors hover:border-[#0a84ff]/40 hover:text-[#0a6bd6]"
              >
                ＋ Add shareholder
              </button>
              <button
                type="button"
                onClick={() => processCommand("Show top 5 shareholders")}
                className="shrink-0 rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors hover:border-[#0a84ff]/40 hover:text-[#0a6bd6]"
              >
                Top 5 holders
              </button>
            </div>

            {/* Messages list */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex flex-col", m.sender === "user" ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                      m.sender === "user"
                        ? "bg-[#231d3a] text-white"
                        : "border border-black/[0.06] bg-[#f5f5f7] text-neutral-800"
                    )}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>

                  {/* Disambiguation picker if multiple shareholders matched */}
                  {m.disambiguation && (
                    <div className="mt-2 w-full rounded-2xl border border-[#ff9f0a]/30 bg-[#ff9f0a]/[0.06] p-3 text-[12px]">
                      <div className="flex items-center gap-1.5 font-semibold text-[#9a5b00]">
                        <AlertTriangle className="h-3.5 w-3.5" /> {m.disambiguation.label}
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {m.disambiguation.options.map((opt) => {
                          const h = opt.candidates[0];
                          return (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => processCommand(opt.originalPrompt)}
                              className="flex w-full items-center justify-between rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-left transition-colors hover:border-[#0a84ff]"
                            >
                              <div>
                                <div className="font-semibold text-neutral-900">
                                  #{h.rank} {h.displayName}
                                </div>
                                <div className="text-[11px] text-neutral-500">
                                  ID: {h.investorId || "—"} · {h.city || "—"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono font-semibold text-neutral-900">{fmt.int(h.shares)} sh</div>
                                <div className="text-[11px] text-neutral-500">{h.stakeText}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Staged transaction verification card */}
                  {m.stagedAction && (
                    <StagedActionCard
                      action={m.stagedAction}
                      busy={busyId === m.stagedAction.id}
                      onConfirm={() => confirmAction(m.stagedAction!)}
                      onCancel={() => cancelAction(m.stagedAction!)}
                      onRevert={() => revertAction(m.stagedAction!)}
                    />
                  )}

                  <span className="mt-1 px-1 text-[10px] text-neutral-400">{m.timestamp}</span>
                </div>
              ))}
              {thinking && (
                <div className="flex items-center gap-2 rounded-2xl border border-black/[0.06] bg-[#f5f5f7] px-3.5 py-2.5 text-[12.5px] text-neutral-600">
                  <span className="h-2 w-2 rounded-full bg-[#0a84ff] animate-pulse" />
                  <span>DeepSeek is analyzing the register…</span>
                </div>
              )}
            </div>

            {/* Input composer */}
            <form onSubmit={handleSubmit} className="border-t border-black/[0.07] bg-white p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-black/[0.1] bg-[#f8f8fa] px-3 py-2 focus-within:border-[#0a84ff] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(10,132,255,0.15)]">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={
                    canWrite
                      ? 'e.g. "Take 50,000 shares from SEMANTIC AS and give to EBOOT AS" or "Add entry..."'
                      : "Ask about shareholders, stakes, or rankings…"
                  }
                  className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || thinking}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#0a84ff] text-white transition-all hover:bg-[#0070e0] disabled:opacity-35"
                  aria-label="Send instruction"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between px-1 text-[10.5px] text-neutral-400">
                <span>All changes stage a dry-run preview before execution</span>
                <span>Enter to send</span>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
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
        "mt-2.5 w-full overflow-hidden rounded-2xl border text-[12.5px] shadow-sm",
        isPending && "border-[#0a84ff]/35 bg-white",
        isExecuted && "border-[#30d158]/40 bg-[#30d158]/[0.04]",
        (isCancelled || isReverted) && "border-black/[0.08] bg-neutral-50 opacity-75"
      )}
    >
      {/* Card top bar */}
      <div
        className={cn(
          "flex items-center justify-between border-b px-3.5 py-2.5",
          isPending && "border-[#0a84ff]/15 bg-[#0a84ff]/[0.06]",
          isExecuted && "border-[#30d158]/20 bg-[#30d158]/[0.1]",
          (isCancelled || isReverted) && "border-black/[0.06] bg-black/[0.03]"
        )}
      >
        <div className="flex items-center gap-2 font-semibold text-neutral-900">
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
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            isPending && "bg-[#ff9f0a]/20 text-[#9a5b00]",
            isExecuted && "bg-[#30d158]/20 text-[#1f7a35]",
            isCancelled && "bg-black/[0.08] text-neutral-600",
            isReverted && "bg-[#5e5ce6]/15 text-[#4b49c4]"
          )}
        >
          {isPending ? "Awaiting confirmation" : isExecuted ? "Committed" : isReverted ? "Reverted" : "Cancelled"}
        </span>
      </div>

      {/* Body details */}
      <div className="space-y-3 p-3.5">
        {action.kind === "transfer" && (
          <>
            <div className="flex items-center justify-between rounded-xl bg-[#f5f5f7] px-3 py-2">
              <span className="text-[11.5px] text-neutral-500">Shares to transfer</span>
              <span className="font-mono text-[14px] font-bold text-neutral-900">
                {fmt.int(action.shares)} sh ({((action.shares / SHARES_OUTSTANDING) * 100).toFixed(4)}%)
              </span>
            </div>

            <div className="space-y-2">
              {/* Sender */}
              <div className="rounded-xl border border-black/[0.06] p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d70015]">
                    From (Debit −{fmt.int(action.shares)})
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {((action.fromBefore / SHARES_OUTSTANDING) * 100).toFixed(2)}% →{" "}
                    <strong className="text-neutral-900">
                      {((action.fromAfter / SHARES_OUTSTANDING) * 100).toFixed(2)}%
                    </strong>
                  </span>
                </div>
                <div className="mt-1 font-semibold text-neutral-900">{action.fromName}</div>
                <div className="mt-1 flex items-center gap-2 font-mono text-[12px] text-neutral-600">
                  <span>{fmt.int(action.fromBefore)}</span>
                  <ArrowRight className="h-3 w-3 text-neutral-400" />
                  <span className="font-bold text-[#d70015]">{fmt.int(action.fromAfter)} shares</span>
                </div>
              </div>

              {/* Recipient */}
              <div className="rounded-xl border border-black/[0.06] p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1f7a35]">
                    To (Credit +{fmt.int(action.shares)})
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {((action.toBefore / SHARES_OUTSTANDING) * 100).toFixed(2)}% →{" "}
                    <strong className="text-neutral-900">
                      {((action.toAfter / SHARES_OUTSTANDING) * 100).toFixed(2)}%
                    </strong>
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 font-semibold text-neutral-900">
                  <span>{action.toName}</span>
                  {action.toId === null && (
                    <span className="rounded-full bg-[#0a84ff]/15 px-2 py-0.5 text-[10px] font-semibold text-[#0a6bd6]">
                      New holder
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 font-mono text-[12px] text-neutral-600">
                  <span>{fmt.int(action.toBefore)}</span>
                  <ArrowRight className="h-3 w-3 text-neutral-400" />
                  <span className="font-bold text-[#1f7a35]">{fmt.int(action.toAfter)} shares</span>
                </div>
              </div>
            </div>

            {/* Invariant checks */}
            <div className="rounded-xl bg-[#30d158]/[0.08] px-3 py-2 text-[11px] text-[#1f7a35]">
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
          <div className="space-y-2 rounded-xl border border-black/[0.06] bg-[#f8f8fa] p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-semibold text-neutral-900">
                {action.name} {action.firstName}
              </span>
              <span className="rounded-full bg-[#0a84ff]/12 px-2 py-0.5 text-[10.5px] font-semibold text-[#0a6bd6]">
                {action.holderKind === "company" ? "Company" : "Private"}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px]">
              <div>
                <dt className="text-neutral-500">Shares allocated</dt>
                <dd className="font-mono font-semibold text-neutral-900">
                  {fmt.int(action.shares)} ({((action.shares / SHARES_OUTSTANDING) * 100).toFixed(2)}%)
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Investor ID / Org. nr</dt>
                <dd className="font-mono text-neutral-900">{action.investorId || "—"}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">E-mail</dt>
                <dd className="truncate text-neutral-900">{action.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Location</dt>
                <dd className="text-neutral-900">
                  {[action.postalCode, action.city, action.country].filter(Boolean).join(" ") || "—"}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {action.kind === "update_field" && (
          <div className="space-y-1.5 rounded-xl border border-black/[0.06] bg-[#f8f8fa] p-3">
            <div className="font-semibold text-neutral-900">{action.holderName}</div>
            <div className="text-[11.5px] text-neutral-500">Field: {action.fieldLabel}</div>
            <div className="flex items-center gap-2 font-mono text-[12px]">
              <span className="line-through text-neutral-400">{String(action.beforeValue || "—")}</span>
              <ArrowRight className="h-3 w-3 text-neutral-400" />
              <span className="font-semibold text-[#0a6bd6]">{String(action.afterValue)}</span>
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
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0a84ff] px-3 text-[12.5px] font-semibold text-white shadow-sm transition-all hover:bg-[#0070e0] active:scale-[0.98] disabled:opacity-50"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
              {busy ? "Executing…" : "Confirm & Execute"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="flex h-9 items-center justify-center rounded-xl border border-black/12 bg-white px-3.5 text-[12.5px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        )}

        {isExecuted && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-medium text-[#1f7a35]">
              ✓ Applied to live register at {action.executedAt}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={onRevert}
              className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
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
