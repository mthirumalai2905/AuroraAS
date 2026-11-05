import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { applyRegisterWrite, loadRegister } from "@/lib/data/register-db";
import type { AuroraEquityRegister } from "@/lib/data/aurora-equity";
import type { RegisterEvent } from "@/lib/data/register-log";
import {
  actorCanUseHolder,
  type ForumActor,
  type ForumMessage,
  type ForumOffer,
  type ForumSnapshot,
} from "@/lib/data/forum";

export type { ForumActor, ForumMessage, ForumOffer, ForumSnapshot };

const DB_PATH = path.join(os.homedir(), ".aurora-as", "aurora-forum.sqlite");

export type ForumWriteResult =
  | { ok: true; forum: ForumSnapshot; register?: AuroraEquityRegister; events?: RegisterEvent[] }
  | { ok: false; error: string };

type OfferRow = {
  id: string;
  created_at: string;
  updated_at: string;
  shares: number;
  seller_email: string;
  seller_name: string;
  seller_holder_id: string;
  seller_holder_name: string;
  seller_vote: string;
  buyer_email: string | null;
  buyer_name: string | null;
  buyer_holder_id: string | null;
  buyer_holder_name: string | null;
  buyer_vote: string;
  status: string;
  settled_at: string | null;
  settlement_group_id: string | null;
};

type MessageRow = {
  id: string;
  at: string;
  author_email: string;
  author_name: string;
  kind: string;
  text: string;
  offer_id: string | null;
};

const globalForForum = globalThis as { __auroraForumDb?: DatabaseSync; __auroraForumDbPath?: string };

function getForumDb() {
  if (globalForForum.__auroraForumDb && globalForForum.__auroraForumDbPath === DB_PATH) {
    return globalForForum.__auroraForumDb;
  }
  try {
    globalForForum.__auroraForumDb?.close();
  } catch {
    /* previous connection may already be closed */
  }
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = DELETE;");
  db.exec("PRAGMA foreign_keys = ON;");
  globalForForum.__auroraForumDbPath = DB_PATH;
  db.exec(`
    CREATE TABLE IF NOT EXISTS forum_offers (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      shares INTEGER NOT NULL,
      seller_email TEXT NOT NULL,
      seller_name TEXT NOT NULL,
      seller_holder_id TEXT NOT NULL,
      seller_holder_name TEXT NOT NULL,
      seller_vote TEXT NOT NULL,
      buyer_email TEXT,
      buyer_name TEXT,
      buyer_holder_id TEXT,
      buyer_holder_name TEXT,
      buyer_vote TEXT NOT NULL,
      status TEXT NOT NULL,
      settled_at TEXT,
      settlement_group_id TEXT
    );

    CREATE TABLE IF NOT EXISTS forum_messages (
      id TEXT PRIMARY KEY,
      at TEXT NOT NULL,
      author_email TEXT NOT NULL,
      author_name TEXT NOT NULL,
      kind TEXT NOT NULL,
      text TEXT NOT NULL,
      offer_id TEXT
    );
  `);
  globalForForum.__auroraForumDb = db;
  return db;
}

function nid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function mapOffer(row: OfferRow): ForumOffer {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    shares: row.shares,
    sellerEmail: row.seller_email,
    sellerName: row.seller_name,
    sellerHolderId: row.seller_holder_id,
    sellerHolderName: row.seller_holder_name,
    sellerVote: row.seller_vote as ForumOffer["sellerVote"],
    buyerEmail: row.buyer_email,
    buyerName: row.buyer_name,
    buyerHolderId: row.buyer_holder_id,
    buyerHolderName: row.buyer_holder_name,
    buyerVote: row.buyer_vote as ForumOffer["buyerVote"],
    status: row.status as ForumOffer["status"],
    settledAt: row.settled_at,
    settlementGroupId: row.settlement_group_id,
  };
}

function loadOffer(db: DatabaseSync, id: string): ForumOffer | null {
  const row = db.prepare("SELECT * FROM forum_offers WHERE id = ?").get(id) as OfferRow | undefined;
  return row ? mapOffer(row) : null;
}

function loadOffers(db: DatabaseSync): ForumOffer[] {
  const rows = db.prepare("SELECT * FROM forum_offers ORDER BY created_at ASC").all() as OfferRow[];
  return rows.map(mapOffer);
}

function loadMessages(db: DatabaseSync): ForumMessage[] {
  const offers = new Map(loadOffers(db).map((o) => [o.id, o]));
  const rows = db.prepare("SELECT * FROM forum_messages ORDER BY at ASC").all() as MessageRow[];
  return rows.map((row) => ({
    id: row.id,
    at: row.at,
    authorEmail: row.author_email,
    authorName: row.author_name,
    kind: row.kind as ForumMessage["kind"],
    text: row.text,
    offerId: row.offer_id,
    offer: row.offer_id ? offers.get(row.offer_id) ?? null : null,
  }));
}

export function loadForum(): ForumSnapshot {
  const db = getForumDb();
  return { messages: loadMessages(db), offers: loadOffers(db) };
}

function canUseHolder(actor: ForumActor, holder: Parameters<typeof actorCanUseHolder>[1]) {
  return actorCanUseHolder(actor, holder);
}

function insertMessage(
  db: DatabaseSync,
  input: {
    authorEmail: string;
    authorName: string;
    kind: ForumMessage["kind"];
    text: string;
    offerId?: string | null;
  }
) {
  const id = nid("msg");
  const at = nowIso();
  db.prepare(
    `INSERT INTO forum_messages (id, at, author_email, author_name, kind, text, offer_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, at, input.authorEmail, input.authorName, input.kind, input.text, input.offerId ?? null);
}

function persistOffer(db: DatabaseSync, offer: ForumOffer) {
  db.prepare(
    `UPDATE forum_offers SET
      updated_at = ?, shares = ?, seller_vote = ?, buyer_email = ?, buyer_name = ?,
      buyer_holder_id = ?, buyer_holder_name = ?, buyer_vote = ?, status = ?,
      settled_at = ?, settlement_group_id = ?
     WHERE id = ?`
  ).run(
    offer.updatedAt,
    offer.shares,
    offer.sellerVote,
    offer.buyerEmail,
    offer.buyerName,
    offer.buyerHolderId,
    offer.buyerHolderName,
    offer.buyerVote,
    offer.status,
    offer.settledAt,
    offer.settlementGroupId,
    offer.id
  );
}

function isParty(actor: ForumActor, email: string | null) {
  return Boolean(email && email.trim().toLowerCase() === actor.email.trim().toLowerCase());
}

function trySettle(offer: ForumOffer): ForumWriteResult | null {
  if (offer.sellerVote !== "yes" || offer.buyerVote !== "yes") return null;
  if (!offer.buyerHolderId || !offer.buyerHolderName) {
    return { ok: false, error: "Buyer holder is missing." };
  }

  const result = applyRegisterWrite(`forum:${offer.sellerEmail}`, {
    action: "transfer-shares",
    source: "forum",
    shares: offer.shares,
    fromId: offer.sellerHolderId,
    toId: offer.buyerHolderId,
    toName: offer.buyerHolderName,
  });
  if (!result.ok) return result;

  const db = getForumDb();
  const now = nowIso();
  const next: ForumOffer = {
    ...offer,
    status: "settled",
    settledAt: now,
    updatedAt: now,
    settlementGroupId: `forum-${offer.id}`,
  };
  persistOffer(db, next);
  insertMessage(db, {
    authorEmail: "system",
    authorName: "Forum",
    kind: "system",
    text: `Settled ${offer.shares.toLocaleString("en-US")} shares: ${offer.sellerHolderName} → ${offer.buyerHolderName}. Credit and debit written to the register.`,
    offerId: offer.id,
  });
  return { ok: true, forum: loadForum(), register: result.register, events: result.events };
}

export function applyForumWrite(actor: ForumActor, body: Record<string, unknown>): ForumWriteResult {
  const db = getForumDb();
  const action = typeof body.action === "string" ? body.action : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const register = loadRegister();

  try {
    if (action === "post-chat") {
      if (!text) return { ok: false, error: "Message cannot be empty." };
      insertMessage(db, {
        authorEmail: actor.email,
        authorName: actor.name,
        kind: "chat",
        text,
      });
      return { ok: true, forum: loadForum() };
    }

    if (action === "post-offer") {
      const shares = Math.round(Number(body.shares));
      const holderId = typeof body.holderId === "string" ? body.holderId : "";
      const holder = register.shareholders.find((h) => h.id === holderId);
      if (!holder) return { ok: false, error: "Choose the holder you are offering from." };
      if (!canUseHolder(actor, holder)) return { ok: false, error: "You cannot offer shares for that holder." };
      if (!Number.isInteger(shares) || shares <= 0) return { ok: false, error: "Share amount must be a positive integer." };
      if (holder.shares < shares) {
        return { ok: false, error: `${holder.displayName} only holds ${holder.shares.toLocaleString("en-US")} shares.` };
      }

      const now = nowIso();
      const offerId = nid("offer");
      db.prepare(
        `INSERT INTO forum_offers (
          id, created_at, updated_at, shares, seller_email, seller_name, seller_holder_id, seller_holder_name,
          seller_vote, buyer_email, buyer_name, buyer_holder_id, buyer_holder_name, buyer_vote, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, NULL, NULL, NULL, 'pending', 'open')`
      ).run(offerId, now, now, shares, actor.email, actor.name, holder.id, holder.displayName);

      insertMessage(db, {
        authorEmail: actor.email,
        authorName: actor.name,
        kind: "offer",
        text: text || `Offering ${shares.toLocaleString("en-US")} shares from ${holder.displayName}. Anyone interested?`,
        offerId,
      });
      return { ok: true, forum: loadForum() };
    }

    if (action === "interest") {
      const offerId = typeof body.offerId === "string" ? body.offerId : "";
      const holderId = typeof body.holderId === "string" ? body.holderId : "";
      const offer = loadOffer(db, offerId);
      if (!offer) return { ok: false, error: "Offer not found." };
      if (offer.status !== "open") return { ok: false, error: "This offer is no longer open." };
      if (isParty(actor, offer.sellerEmail)) return { ok: false, error: "Seller cannot take their own offer." };
      const holder = register.shareholders.find((h) => h.id === holderId);
      if (!holder) return { ok: false, error: "Choose the holder that would receive the shares." };
      if (!canUseHolder(actor, holder)) return { ok: false, error: "You cannot accept for that holder." };
      if (holder.id === offer.sellerHolderId) return { ok: false, error: "Buyer and seller cannot be the same holder." };

      const now = nowIso();
      persistOffer(db, {
        ...offer,
        updatedAt: now,
        buyerEmail: actor.email,
        buyerName: actor.name,
        buyerHolderId: holder.id,
        buyerHolderName: holder.displayName,
        buyerVote: "pending",
        status: "matched",
      });
      insertMessage(db, {
        authorEmail: actor.email,
        authorName: actor.name,
        kind: "system",
        text: `${actor.name} is interested as ${holder.displayName}. Both sides vote yes or no.`,
        offerId,
      });
      return { ok: true, forum: loadForum() };
    }

    if (action === "vote") {
      const offerId = typeof body.offerId === "string" ? body.offerId : "";
      const vote = body.vote === "yes" || body.vote === "no" ? body.vote : "";
      const offer = loadOffer(db, offerId);
      if (!offer) return { ok: false, error: "Offer not found." };
      if (offer.status === "settled" || offer.status === "declined" || offer.status === "cancelled") {
        return { ok: false, error: "This offer is already closed." };
      }
      if (!vote) return { ok: false, error: "Vote must be yes or no." };

      const isSeller = isParty(actor, offer.sellerEmail);
      const isBuyer = isParty(actor, offer.buyerEmail);
      if (!isSeller && !isBuyer) return { ok: false, error: "Only the two parties can vote." };

      const now = nowIso();
      const next: ForumOffer = {
        ...offer,
        updatedAt: now,
        sellerVote: isSeller ? vote : offer.sellerVote,
        buyerVote: isBuyer ? vote : offer.buyerVote,
      };

      if (next.sellerVote === "no" || next.buyerVote === "no") {
        next.status = "declined";
        persistOffer(db, next);
        insertMessage(db, {
          authorEmail: "system",
          authorName: "Forum",
          kind: "system",
          text: `${actor.name} voted no. Offer declined. No register change.`,
          offerId,
        });
        return { ok: true, forum: loadForum() };
      }

      persistOffer(db, next);
      if (next.sellerVote === "yes" && next.buyerVote === "yes") {
        const settled = trySettle(next);
        if (settled) return settled;
      }
      return { ok: true, forum: loadForum() };
    }

    if (action === "cancel") {
      const offerId = typeof body.offerId === "string" ? body.offerId : "";
      const offer = loadOffer(db, offerId);
      if (!offer) return { ok: false, error: "Offer not found." };
      if (!isParty(actor, offer.sellerEmail) && !actor.canWrite) {
        return { ok: false, error: "Only the seller can cancel." };
      }
      if (offer.status === "settled") return { ok: false, error: "A settled offer cannot be cancelled." };
      persistOffer(db, { ...offer, status: "cancelled", updatedAt: nowIso() });
      insertMessage(db, {
        authorEmail: "system",
        authorName: "Forum",
        kind: "system",
        text: `Offer cancelled by ${actor.name}.`,
        offerId,
      });
      return { ok: true, forum: loadForum() };
    }

    return { ok: false, error: "Unsupported forum action." };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Forum write failed." };
  }
}
