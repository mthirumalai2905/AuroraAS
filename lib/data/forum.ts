import type { AuroraEquityRegister, Shareholder } from "@/lib/data/aurora-equity";

export type ForumVote = "pending" | "yes" | "no";
export type ForumOfferStatus = "open" | "matched" | "settled" | "declined" | "cancelled";

export type ForumOffer = {
  id: string;
  createdAt: string;
  updatedAt: string;
  shares: number;
  sellerEmail: string;
  sellerName: string;
  sellerHolderId: string;
  sellerHolderName: string;
  sellerVote: ForumVote;
  buyerEmail: string | null;
  buyerName: string | null;
  buyerHolderId: string | null;
  buyerHolderName: string | null;
  buyerVote: ForumVote;
  status: ForumOfferStatus;
  settledAt: string | null;
  settlementGroupId: string | null;
};

export type ForumMessage = {
  id: string;
  at: string;
  authorEmail: string;
  authorName: string;
  kind: "chat" | "offer" | "system";
  text: string;
  offerId: string | null;
  offer: ForumOffer | null;
};

export type ForumSnapshot = {
  messages: ForumMessage[];
  offers: ForumOffer[];
};

export type ForumActor = {
  email: string;
  name: string;
  canWrite: boolean;
  entity: string;
};

export function holdersForActor(actor: ForumActor, register: AuroraEquityRegister): Shareholder[] {
  if (actor.canWrite) return register.shareholders;
  const email = actor.email.trim().toLowerCase();
  const entity = actor.entity.trim().toLowerCase();
  return register.shareholders.filter((h) => {
    const holderEmail = h.email.trim().toLowerCase();
    const name = h.name.trim().toLowerCase();
    const display = h.displayName.trim().toLowerCase();
    return holderEmail === email || name === entity || display === entity;
  });
}

export function actorCanUseHolder(actor: ForumActor, holder: Shareholder) {
  if (actor.canWrite) return true;
  const email = actor.email.trim().toLowerCase();
  const entity = actor.entity.trim().toLowerCase();
  return (
    holder.email.trim().toLowerCase() === email ||
    holder.name.trim().toLowerCase() === entity ||
    holder.displayName.trim().toLowerCase() === entity
  );
}
