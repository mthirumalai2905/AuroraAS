"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, MessageSquare, X } from "lucide-react";
import type { AuroraEquityRegister, Shareholder } from "@/lib/data/aurora-equity";
import type { ForumMessage, ForumOffer, ForumSnapshot } from "@/lib/data/forum";
import { holdersForActor } from "@/lib/data/forum";
import type { RegisterEvent } from "@/lib/data/register-log";
import type { Stakeholder } from "@/lib/auth";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  user: Stakeholder;
  register: AuroraEquityRegister;
  onSettled: (register: AuroraEquityRegister, events: RegisterEvent[]) => void;
  onNotice: (msg: string) => void;
  onCount?: (n: number) => void;
};

function timeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function voteLabel(vote: ForumOffer["sellerVote"]) {
  if (vote === "yes") return "Yes";
  if (vote === "no") return "No";
  return "Pending";
}

export function ForumBoard({ user, register, onSettled, onNotice, onCount }: Props) {
  const [forum, setForum] = useState<ForumSnapshot>({ messages: [], offers: [] });
  const [text, setText] = useState("");
  const [asOffer, setAsOffer] = useState(false);
  const [holderId, setHolderId] = useState("");
  const [shares, setShares] = useState("");
  const [busy, setBusy] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [claimHolderId, setClaimHolderId] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const mine = useMemo(
    () =>
      holdersForActor(
        { email: user.email, name: user.name, canWrite: user.canWrite, entity: user.entity },
        register
      ),
    [register, user]
  );

  useEffect(() => {
    if (!holderId && mine[0]) setHolderId(mine[0].id);
  }, [holderId, mine]);

  useEffect(() => {
    let cancelled = false;
    const pull = () => {
      fetch("/api/forum")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data?.forum) {
            setForum(data.forum);
            onCount?.(data.forum.offers?.length ?? 0);
          }
        })
        .catch(() => {
          /* keep last snapshot */
        });
    };
    pull();
    const t = window.setInterval(pull, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [forum.messages.length]);

  async function send(body: Record<string, unknown>) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.forum) {
        onNotice(data.error ?? "Forum request failed.");
        return;
      }
      setForum(data.forum);
      onCount?.(data.forum.offers?.length ?? 0);
      if (data.register && data.events) {
        onSettled(data.register, data.events);
        onNotice("Both sides said yes. Credit and debit written to the register.");
      }
    } catch {
      onNotice("Could not reach the forum.");
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (asOffer) {
      void send({
        action: "post-offer",
        text,
        holderId,
        shares: Number(String(shares).replace(/[^0-9]/g, "")),
      });
      setText("");
      setShares("");
      return;
    }
    if (!text.trim()) return;
    void send({ action: "post-chat", text });
    setText("");
  }

  const openOffers = forum.offers.filter((o) => o.status === "open" || o.status === "matched").length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex items-center justify-between border-b border-black/[0.08] px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-[14px] font-semibold text-neutral-900">
            <MessageSquare className="h-4 w-4 text-[#0a84ff]" />
            Shareholder forum
          </div>
          <p className="mt-0.5 text-[12px] text-neutral-500">
            Isolated board. A transfer writes only after both sides vote yes.
          </p>
        </div>
        <div className="text-[12px] text-neutral-500">
          {openOffers} open · {forum.offers.filter((o) => o.status === "settled").length} settled
        </div>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin">
        {forum.messages.length === 0 && (
          <p className="py-16 text-center text-[14px] text-neutral-400">
            No posts yet. Send a note, or offer shares and wait for a counterpart.
          </p>
        )}
        {forum.messages.map((m) => (
          <ForumPost
            key={m.id}
            message={m}
            userEmail={user.email}
            mine={mine}
            busy={busy}
            claimId={claimId}
            claimHolderId={claimHolderId}
            onClaimId={setClaimId}
            onClaimHolder={setClaimHolderId}
            onInterest={(offerId) => {
              void send({ action: "interest", offerId, holderId: claimHolderId || mine[0]?.id });
              setClaimId(null);
            }}
            onVote={(offerId, vote) => void send({ action: "vote", offerId, vote })}
            onCancel={(offerId) => void send({ action: "cancel", offerId })}
          />
        ))}
      </div>

      <form onSubmit={submit} className="border-t border-black/[0.08] bg-[#fafafa] px-4 py-3">
        {asOffer && (
          <div className="mb-2 grid grid-cols-2 gap-2">
            <select
              value={holderId}
              onChange={(e) => setHolderId(e.target.value)}
              className="h-9 rounded-lg border border-black/[0.1] bg-white px-2 text-[13px]"
            >
              {mine.length === 0 && <option value="">No holder linked to your account</option>}
              {mine.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.displayName} · {fmt.int(h.shares)} sh
                </option>
              ))}
            </select>
            <input
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="Shares to sell"
              className="h-9 rounded-lg border border-black/[0.1] bg-white px-3 text-[13px]"
            />
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={asOffer ? "Anyone interested in these shares?" : "Write to the group…"}
            className="min-h-11 flex-1 resize-none rounded-lg border border-black/[0.1] bg-white px-3 py-2 text-[13px] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setAsOffer((v) => !v)}
            className={cn(
              "h-11 rounded-lg border px-3 text-[12.5px] font-medium",
              asOffer
                ? "border-[#0a84ff]/35 bg-[#0a84ff]/10 text-[#0a6bd6]"
                : "border-black/[0.08] bg-white text-neutral-700"
            )}
          >
            Offer
          </button>
          <button
            type="submit"
            disabled={busy || (!asOffer && !text.trim()) || (asOffer && (!holderId || !shares))}
            className="h-11 rounded-lg bg-[#0a84ff] px-4 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

function ForumPost({
  message,
  userEmail,
  mine,
  busy,
  claimId,
  claimHolderId,
  onClaimId,
  onClaimHolder,
  onInterest,
  onVote,
  onCancel,
}: {
  message: ForumMessage;
  userEmail: string;
  mine: Shareholder[];
  busy: boolean;
  claimId: string | null;
  claimHolderId: string;
  onClaimId: (id: string | null) => void;
  onClaimHolder: (id: string) => void;
  onInterest: (offerId: string) => void;
  onVote: (offerId: string, vote: "yes" | "no") => void;
  onCancel: (offerId: string) => void;
}) {
  const mineMsg = message.authorEmail.toLowerCase() === userEmail.toLowerCase();
  const offer = message.offer;

  return (
    <div className={cn("max-w-[640px]", mineMsg ? "ml-auto" : "mr-auto")}>
      <div className="mb-1 flex items-baseline gap-2 text-[11px] text-neutral-400">
        <span className="font-medium text-neutral-600">{message.authorName}</span>
        <span>{timeLabel(message.at)}</span>
      </div>
      <div
        className={cn(
          "rounded-xl border px-3.5 py-2.5 text-[13.5px] leading-relaxed",
          message.kind === "system"
            ? "border-black/[0.06] bg-[#f5f5f7] text-neutral-600"
            : mineMsg
              ? "border-[#0a84ff]/20 bg-[#0a84ff]/[0.06] text-neutral-900"
              : "border-black/[0.08] bg-white text-neutral-800"
        )}
      >
        {message.text}
        {offer && (
          <OfferCard
            offer={offer}
            userEmail={userEmail}
            mine={mine}
            busy={busy}
            claiming={claimId === offer.id}
            claimHolderId={claimHolderId}
            onClaim={() => onClaimId(offer.id)}
            onClaimHolder={onClaimHolder}
            onInterest={() => onInterest(offer.id)}
            onVote={(vote) => onVote(offer.id, vote)}
            onCancel={() => onCancel(offer.id)}
          />
        )}
      </div>
    </div>
  );
}

function OfferCard({
  offer,
  userEmail,
  mine,
  busy,
  claiming,
  claimHolderId,
  onClaim,
  onClaimHolder,
  onInterest,
  onVote,
  onCancel,
}: {
  offer: ForumOffer;
  userEmail: string;
  mine: Shareholder[];
  busy: boolean;
  claiming: boolean;
  claimHolderId: string;
  onClaim: () => void;
  onClaimHolder: (id: string) => void;
  onInterest: () => void;
  onVote: (vote: "yes" | "no") => void;
  onCancel: () => void;
}) {
  const email = userEmail.toLowerCase();
  const isSeller = offer.sellerEmail.toLowerCase() === email;
  const isBuyer = offer.buyerEmail?.toLowerCase() === email;
  const closed = offer.status === "settled" || offer.status === "declined" || offer.status === "cancelled";

  return (
    <div className="mt-2.5 rounded-lg border border-black/[0.08] bg-white p-3 text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[12.5px] font-semibold text-neutral-900">
          {fmt.int(offer.shares)} shares · {offer.sellerHolderName}
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
            offer.status === "settled" && "bg-[#30d158]/15 text-[#248a3d]",
            offer.status === "matched" && "bg-[#0a84ff]/12 text-[#0a6bd6]",
            offer.status === "open" && "bg-[#ff9f0a]/15 text-[#b25000]",
            (offer.status === "declined" || offer.status === "cancelled") && "bg-black/[0.06] text-neutral-500"
          )}
        >
          {offer.status}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
        <div>
          <div className="text-neutral-400">Seller</div>
          <div className="font-medium text-neutral-800">{offer.sellerName}</div>
          <div className="text-neutral-500">Vote: {voteLabel(offer.sellerVote)}</div>
        </div>
        <div>
          <div className="text-neutral-400">Buyer</div>
          <div className="font-medium text-neutral-800">{offer.buyerName ?? "Waiting"}</div>
          <div className="text-neutral-500">Vote: {voteLabel(offer.buyerVote)}</div>
        </div>
      </div>

      {!closed && offer.status === "open" && !isSeller && mine.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!claiming ? (
            <button
              type="button"
              disabled={busy}
              onClick={onClaim}
              className="h-8 rounded-lg bg-neutral-900 px-3 text-[12px] font-medium text-white"
            >
              I am interested
            </button>
          ) : (
            <>
              <select
                value={claimHolderId || mine[0]?.id || ""}
                onChange={(e) => onClaimHolder(e.target.value)}
                className="h-8 rounded-lg border border-black/[0.1] bg-white px-2 text-[12px]"
              >
                {mine.map((h) => (
                  <option key={h.id} value={h.id}>
                    Receive as {h.displayName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy}
                onClick={onInterest}
                className="h-8 rounded-lg bg-[#0a84ff] px-3 text-[12px] font-medium text-white"
              >
                Confirm interest
              </button>
            </>
          )}
        </div>
      )}

      {!closed && offer.status === "matched" && (isSeller || isBuyer) && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onVote("yes")}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#30d158] px-3 text-[12px] font-semibold text-white"
          >
            <Check className="h-3.5 w-3.5" /> Yes
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onVote("no")}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-black/[0.1] bg-white px-3 text-[12px] font-medium text-neutral-700"
          >
            <X className="h-3.5 w-3.5" /> No
          </button>
        </div>
      )}

      {!closed && isSeller && (
        <button type="button" disabled={busy} onClick={onCancel} className="mt-2 text-[11px] text-neutral-400 hover:text-neutral-700">
          Cancel offer
        </button>
      )}
    </div>
  );
}
