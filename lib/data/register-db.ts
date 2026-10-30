import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  SHARES_OUTSTANDING,
  TRANSFER_COLUMNS,
  auroraEquity,
  type AuroraEquityRegister,
  type Shareholder,
  type ShareholderKind,
  type TransferKey,
} from "@/lib/data/aurora-equity";
import {
  composeRegister,
  displayHolderName,
  inferHolderKind,
  stampEvent,
  type RegisterEvent,
  type RegisterEventSource,
} from "@/lib/data/register-log";

const LEGACY_DB_PATH = path.join(process.cwd(), "data", "aurora-register.sqlite");
const DB_PATH = path.join(os.homedir(), ".aurora-as", "aurora-register.sqlite");

function migrateLegacyDb() {
  if (!existsSync(LEGACY_DB_PATH) || existsSync(DB_PATH)) return;
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  copyFileSync(LEGACY_DB_PATH, DB_PATH);
}

function removeWatchedDbArtifacts() {
  for (const file of [LEGACY_DB_PATH, `${LEGACY_DB_PATH}-wal`, `${LEGACY_DB_PATH}-shm`]) {
    try {
      if (existsSync(file)) unlinkSync(file);
    } catch {
      /* file may still be locked by a stale connection */
    }
  }
}

type HolderRow = {
  id: string;
  rank: number;
  kind: string;
  name: string;
  first_name: string;
  display_name: string;
  investor_id: string;
  org_nr: string | null;
  contact: string | null;
  address: string;
  address2: string;
  postal_code: string;
  city: string;
  country: string;
  email: string;
  shares: number;
  opening_shares: number | null;
  stake_text: string;
  pct: number;
  cum_pct: number;
  transfers_json: string;
};

type EventRow = {
  id: string;
  at: string;
  actor: string;
  source: string;
  kind: string;
  holder_id: string;
  holder_name: string;
  shares: number | null;
  field: string | null;
  before_value: string | null;
  after_value: string | null;
  counterparty_id: string | null;
  counterparty_name: string | null;
  group_id: string | null;
  note: string | null;
  audit_hash: string;
};

const FIELD_ALIASES: Record<string, "name" | "firstName" | "investorId" | "address" | "address2" | "postalCode" | "city" | "country" | "email" | "shares" | "openingShares"> = {
  name: "name",
  first_name: "firstName",
  firstName: "firstName",
  investor_id: "investorId",
  investorId: "investorId",
  org_nr: "investorId",
  address: "address",
  address2: "address2",
  postal: "postalCode",
  postalCode: "postalCode",
  city: "city",
  country: "country",
  email: "email",
  num_shares: "shares",
  shares: "shares",
  opening_shares: "openingShares",
};

const TRANSFER_KEYS = new Set<string>(TRANSFER_COLUMNS.map((c) => c.key));

const globalForDb = globalThis as { __auroraRegisterDb?: DatabaseSync; __auroraRegisterDbPath?: string };

function getDb() {
  if (globalForDb.__auroraRegisterDb && globalForDb.__auroraRegisterDbPath === DB_PATH) {
    return globalForDb.__auroraRegisterDb;
  }
  try {
    globalForDb.__auroraRegisterDb?.close();
  } catch {
    /* previous connection may already be closed */
  }
  migrateLegacyDb();
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = DELETE;");
  db.exec("PRAGMA foreign_keys = ON;");
  removeWatchedDbArtifacts();
  globalForDb.__auroraRegisterDbPath = DB_PATH;
  db.exec(`
    CREATE TABLE IF NOT EXISTS register_meta (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      org_nr TEXT NOT NULL,
      as_of TEXT NOT NULL,
      share_class TEXT NOT NULL,
      shares_outstanding INTEGER NOT NULL,
      holders INTEGER NOT NULL,
      companies INTEGER NOT NULL,
      persons INTEGER NOT NULL,
      company_shares_pct REAL NOT NULL,
      largest_id TEXT,
      largest_name TEXT,
      largest_pct REAL,
      top10_pct REAL NOT NULL,
      countries INTEGER NOT NULL,
      domestic_pct REAL NOT NULL,
      registered INTEGER NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shareholders (
      id TEXT PRIMARY KEY,
      rank INTEGER NOT NULL,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      investor_id TEXT NOT NULL,
      org_nr TEXT,
      contact TEXT,
      address TEXT NOT NULL,
      address2 TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      email TEXT NOT NULL,
      shares INTEGER NOT NULL,
      opening_shares INTEGER,
      stake_text TEXT NOT NULL,
      pct REAL NOT NULL,
      cum_pct REAL NOT NULL,
      transfers_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS register_events (
      id TEXT PRIMARY KEY,
      at TEXT NOT NULL,
      actor TEXT NOT NULL,
      source TEXT NOT NULL,
      kind TEXT NOT NULL,
      holder_id TEXT NOT NULL,
      holder_name TEXT NOT NULL,
      shares INTEGER,
      field TEXT,
      before_value TEXT,
      after_value TEXT,
      counterparty_id TEXT,
      counterparty_name TEXT,
      group_id TEXT,
      note TEXT,
      audit_hash TEXT NOT NULL
    );
  `);
  globalForDb.__auroraRegisterDb = db;
  return db;
}

function rowToHolder(row: HolderRow): Shareholder {
  return {
    id: row.id,
    rank: row.rank,
    kind: row.kind as ShareholderKind,
    name: row.name,
    firstName: row.first_name,
    displayName: row.display_name,
    investorId: row.investor_id,
    orgNr: row.org_nr,
    contact: row.contact,
    address: row.address,
    address2: row.address2,
    postalCode: row.postal_code,
    city: row.city,
    country: row.country,
    email: row.email,
    shares: row.shares,
    openingShares: row.opening_shares,
    stakeText: row.stake_text,
    pct: row.pct,
    cumPct: row.cum_pct,
    transfers: JSON.parse(row.transfers_json || "{}"),
  };
}

function rowToEvent(row: EventRow): RegisterEvent {
  return {
    id: row.id,
    at: row.at,
    actor: row.actor,
    source: row.source as RegisterEvent["source"],
    kind: row.kind as RegisterEvent["kind"],
    holderId: row.holder_id,
    holderName: row.holder_name,
    shares: row.shares,
    field: row.field,
    beforeValue: row.before_value,
    afterValue: row.after_value,
    counterpartyId: row.counterparty_id,
    counterpartyName: row.counterparty_name,
    groupId: row.group_id,
    note: row.note,
    auditHash: row.audit_hash,
  };
}

function insertHolder(db: DatabaseSync, holder: Shareholder, now: string) {
  db.prepare(
    `INSERT OR REPLACE INTO shareholders (
      id, rank, kind, name, first_name, display_name, investor_id, org_nr, contact,
      address, address2, postal_code, city, country, email, shares, opening_shares,
      stake_text, pct, cum_pct, transfers_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM shareholders WHERE id = ?), ?), ?)`
  ).run(
    holder.id,
    holder.rank,
    holder.kind,
    holder.name,
    holder.firstName,
    holder.displayName,
    holder.investorId,
    holder.orgNr,
    holder.contact,
    holder.address,
    holder.address2,
    holder.postalCode,
    holder.city,
    holder.country,
    holder.email,
    holder.shares,
    holder.openingShares,
    holder.stakeText,
    holder.pct,
    holder.cumPct,
    JSON.stringify(holder.transfers ?? {}),
    holder.id,
    now,
    now
  );
}

function insertEvent(db: DatabaseSync, event: RegisterEvent) {
  db.prepare(
    `INSERT INTO register_events (
      id, at, actor, source, kind, holder_id, holder_name, shares, field, before_value,
      after_value, counterparty_id, counterparty_name, group_id, note, audit_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    event.id,
    event.at,
    event.actor,
    event.source,
    event.kind,
    event.holderId,
    event.holderName,
    event.shares,
    event.field,
    event.beforeValue,
    event.afterValue,
    event.counterpartyId,
    event.counterpartyName,
    event.groupId,
    event.note,
    event.auditHash
  );
}

function persistRegister(db: DatabaseSync, register: AuroraEquityRegister, actor: string, now: string) {
  for (const holder of register.shareholders) insertHolder(db, holder, now);
  const existing = db.prepare("SELECT id FROM shareholders").all() as Array<{ id: string }>;
  const keep = new Set(register.shareholders.map((h) => h.id));
  for (const row of existing) {
    if (!keep.has(row.id)) db.prepare("DELETE FROM shareholders WHERE id = ?").run(row.id);
  }
  db.prepare(
    `INSERT OR REPLACE INTO register_meta (
      id, name, org_nr, as_of, share_class, shares_outstanding, holders, companies, persons,
      company_shares_pct, largest_id, largest_name, largest_pct, top10_pct, countries,
      domestic_pct, registered, updated_at, updated_by
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    register.name,
    register.orgNr,
    register.asOf,
    register.shareClass,
    register.sharesOutstanding,
    register.summary.holders,
    register.summary.companies,
    register.summary.persons,
    register.summary.companySharesPct,
    register.summary.largest.id,
    register.summary.largest.name,
    register.summary.largest.pct,
    register.summary.top10Pct,
    register.summary.countries,
    register.summary.domesticPct,
    register.summary.registered,
    now,
    actor
  );
}

function loadHolders(db: DatabaseSync): Shareholder[] {
  const rows = db.prepare("SELECT * FROM shareholders ORDER BY rank ASC").all() as HolderRow[];
  return rows.map(rowToHolder);
}

const memory = globalThis as {
  __auroraRegisterCache?: { register: AuroraEquityRegister; events: RegisterEvent[] };
};

function snapshotFromDb() {
  const db = getDb();
  ensureSeeded(db);
  const meta = db.prepare("SELECT * FROM register_meta WHERE id = 1").get() as
    | { name: string; org_nr: string; as_of: string; share_class: string }
    | undefined;
  const register = composeRegister(loadHolders(db), {
    name: meta?.name ?? auroraEquity.name,
    orgNr: meta?.org_nr ?? auroraEquity.orgNr,
    asOf: meta?.as_of ?? auroraEquity.asOf,
    shareClass: meta?.share_class ?? auroraEquity.shareClass,
  });
  const events = (db.prepare("SELECT * FROM register_events ORDER BY at ASC").all() as EventRow[]).map(rowToEvent);
  memory.__auroraRegisterCache = { register, events };
  return memory.__auroraRegisterCache;
}

export function loadEvents(): RegisterEvent[] {
  return (memory.__auroraRegisterCache ?? snapshotFromDb()).events;
}

export function loadRegister(): AuroraEquityRegister {
  return (memory.__auroraRegisterCache ?? snapshotFromDb()).register;
}

function ensureSeeded(db: DatabaseSync) {
  const count = (db.prepare("SELECT COUNT(*) AS n FROM shareholders").get() as { n: number } | undefined)?.n ?? 0;
  if (count > 0) return;

  const now = new Date().toISOString();
  const seeded = composeRegister(auroraEquity.shareholders, auroraEquity);
  persistRegister(db, seeded, "system", now);

  const semantic =
    seeded.shareholders.find((h) => h.investorId === "894577002" || h.name.toUpperCase() === "SEMANTIC AS") ??
    seeded.shareholders[0];

  TRANSFER_COLUMNS.forEach((col) => {
    const buyers = seeded.shareholders.filter((h) => h.id !== semantic?.id && (h.transfers[col.key] ?? 0) > 0);
    for (const buyer of buyers) {
      const shares = buyer.transfers[col.key] ?? 0;
      if (!shares) continue;
      const groupId = `seed-${col.key}-${buyer.id}`;
      insertEvent(
        db,
        stampEvent({
          actor: "paal@synx.tools",
          source: "seed",
          kind: "debit",
          holderId: semantic.id,
          holderName: semantic.displayName,
          shares,
          field: col.key,
          beforeValue: String(semantic.openingShares ?? SHARES_OUTSTANDING),
          afterValue: String(semantic.shares),
          counterpartyId: buyer.id,
          counterpartyName: buyer.displayName,
          groupId,
          note: `Historical batch ${col.group} · ${col.title}`,
        })
      );
      insertEvent(
        db,
        stampEvent({
          actor: "paal@synx.tools",
          source: "seed",
          kind: "credit",
          holderId: buyer.id,
          holderName: buyer.displayName,
          shares,
          field: col.key,
          beforeValue: String(buyer.openingShares ?? 0),
          afterValue: String(buyer.shares),
          counterpartyId: semantic.id,
          counterpartyName: semantic.displayName,
          groupId,
          note: `Historical batch ${col.group} · ${col.title}`,
        })
      );
    }
  });
}

function newHolderId(name: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "holder"}-${Date.now()}`;
}

function asText(value: unknown) {
  return value == null ? "" : String(value);
}

export type RegisterWriteResult =
  | { ok: true; register: AuroraEquityRegister; events: RegisterEvent[] }
  | { ok: false; error: string };

export function applyRegisterWrite(actor: string, body: Record<string, unknown>): RegisterWriteResult {
  const db = getDb();
  ensureSeeded(db);
  const source = (typeof body.source === "string" ? body.source : "grid") as RegisterEventSource;
  const action = typeof body.action === "string" ? body.action : "";

  try {
    db.exec("BEGIN");
    let result: RegisterWriteResult;
    if (action === "cell-update") result = writeCell(db, actor, source, body);
    else if (action === "add-shareholder") result = writeAdd(db, actor, source, body);
    else if (action === "transfer-shares") result = writeTransfer(db, actor, source, body);
    else if (action === "revert") result = writeRevert(db, actor, body);
    else result = { ok: false, error: "Unsupported register action." };

    if (!result.ok) {
      db.exec("ROLLBACK");
      return result;
    }
    db.exec("COMMIT");
    memory.__auroraRegisterCache = undefined;
    return { ok: true, register: loadRegister(), events: loadEvents() };
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    return { ok: false, error: error instanceof Error ? error.message : "Register write failed." };
  }
}

function writeCell(
  db: DatabaseSync,
  actor: string,
  source: RegisterEventSource,
  body: Record<string, unknown>
): RegisterWriteResult {
  const id = asText(body.id);
  const columnKey = asText(body.columnKey);
  const rawValue = body.value;
  const holders = loadHolders(db);
  const current = holders.find((h) => h.id === id);
  if (!current) return { ok: false, error: "Shareholder not found." };

  const next = { ...current, transfers: { ...current.transfers } };
  const now = new Date().toISOString();
  const events: RegisterEvent[] = [];

  if (TRANSFER_KEYS.has(columnKey)) {
    const key = columnKey as TransferKey;
    const trimmed = asText(rawValue).trim();
    const before = next.transfers[key] ?? 0;
    if (!trimmed) delete next.transfers[key];
    else {
      const parsed = Number(String(rawValue).replace(/[^0-9.-]/g, ""));
      if (!Number.isFinite(parsed)) return { ok: false, error: "Invalid batch transfer amount." };
      next.transfers[key] = Math.round(parsed);
    }
    const after = next.transfers[key] ?? 0;
    const delta = after - before;
    if (delta !== 0) {
      events.push(
        stampEvent({
          actor,
          source,
          kind: delta > 0 ? "credit" : "debit",
          holderId: next.id,
          holderName: next.displayName,
          shares: Math.abs(delta),
          field: key,
          beforeValue: String(before),
          afterValue: String(after),
          counterpartyId: null,
          counterpartyName: "Batch column",
          groupId: `grid-${key}-${next.id}-${Date.now()}`,
          note: `Batch column ${key} edited`,
        })
      );
    }
  } else {
    const field = FIELD_ALIASES[columnKey];
    if (!field) return { ok: false, error: `Unsupported field "${columnKey}".` };

    if (field === "shares") {
      const parsed = Number(String(rawValue).replace(/[^0-9.-]/g, ""));
      if (!Number.isFinite(parsed) || parsed < 0) return { ok: false, error: "Share count must be a non-negative number." };
      const after = Math.round(parsed);
      const delta = after - next.shares;
      events.push(
        stampEvent({
          actor,
          source,
          kind: delta >= 0 ? "credit" : "debit",
          holderId: next.id,
          holderName: next.displayName,
          shares: Math.abs(delta),
          field: "shares",
          beforeValue: String(next.shares),
          afterValue: String(after),
          counterpartyId: "share-capital",
          counterpartyName: "Share capital adjustment",
          groupId: `adj-${next.id}-${Date.now()}`,
          note: "Direct share balance edit",
        })
      );
      next.shares = after;
    } else if (field === "openingShares") {
      const trimmed = asText(rawValue).trim();
      const before = next.openingShares;
      if (!trimmed) next.openingShares = null;
      else {
        const parsed = Number(trimmed.replace(/[^0-9.-]/g, ""));
        if (!Number.isFinite(parsed)) return { ok: false, error: "Invalid opening share count." };
        next.openingShares = Math.round(parsed);
      }
      events.push(
        stampEvent({
          actor,
          source,
          kind: "field_update",
          holderId: next.id,
          holderName: next.displayName,
          shares: next.openingShares,
          field: "openingShares",
          beforeValue: before == null ? "" : String(before),
          afterValue: next.openingShares == null ? "" : String(next.openingShares),
          counterpartyId: null,
          counterpartyName: null,
          groupId: null,
          note: "Opening balance updated",
        })
      );
    } else {
      const before = asText(next[field]);
      const after = asText(rawValue).trim();
      if (field === "name") next.name = after || next.name;
      else if (field === "firstName") next.firstName = after;
      else if (field === "investorId") next.investorId = after;
      else if (field === "address") next.address = after;
      else if (field === "address2") next.address2 = after;
      else if (field === "postalCode") next.postalCode = after;
      else if (field === "city") next.city = after;
      else if (field === "country") next.country = after;
      else if (field === "email") next.email = after;
      next.kind = inferHolderKind(next.name, next.investorId);
      next.displayName = displayHolderName(next.name, next.firstName, next.kind);
      events.push(
        stampEvent({
          actor,
          source,
          kind: "field_update",
          holderId: next.id,
          holderName: next.displayName,
          shares: null,
          field,
          beforeValue: before,
          afterValue: after,
          counterpartyId: null,
          counterpartyName: null,
          groupId: null,
          note: `${field} updated`,
        })
      );
    }
  }

  const register = composeRegister(
    holders.map((h) => (h.id === next.id ? next : h)),
    auroraEquity
  );
  persistRegister(db, register, actor, now);
  for (const event of events) insertEvent(db, event);
  return { ok: true, register, events: [] };
}

function parseIncomingHolder(body: Record<string, unknown>): Omit<Shareholder, "rank" | "pct" | "cumPct" | "stakeText"> | { error: string } {
  const raw = (body.holder && typeof body.holder === "object" ? body.holder : body) as Record<string, unknown>;
  const name = asText(raw.name).trim();
  const shares = Math.round(Number(String(raw.shares ?? "").replace(/[^0-9.-]/g, "")));
  if (!name) return { error: "Shareholder name is required." };
  if (!Number.isFinite(shares) || shares <= 0) return { error: "A positive share count is required." };
  const firstName = asText(raw.firstName).trim();
  const investorId = asText(raw.investorId).trim() || "—";
  const kind = inferHolderKind(name, investorId, raw.holderKind as ShareholderKind | undefined);
  const id = asText(raw.createdId || raw.id) || newHolderId(name);
  return {
    id,
    kind,
    name,
    firstName,
    displayName: displayHolderName(name, firstName, kind),
    investorId,
    orgNr: kind === "company" ? investorId : null,
    contact: kind === "company" && firstName ? firstName : null,
    address: asText(raw.address).trim(),
    address2: asText(raw.address2).trim(),
    postalCode: asText(raw.postalCode).trim(),
    city: asText(raw.city).trim() || "OSLO",
    country: asText(raw.country).trim() || "Norway",
    email: asText(raw.email).trim(),
    shares,
    openingShares: shares,
    transfers: {},
  };
}

function writeAdd(
  db: DatabaseSync,
  actor: string,
  source: RegisterEventSource,
  body: Record<string, unknown>
): RegisterWriteResult {
  const parsed = parseIncomingHolder(body);
  if ("error" in parsed) return { ok: false, error: parsed.error };
  const holders = loadHolders(db);
  if (holders.some((h) => h.id === parsed.id)) return { ok: false, error: "A shareholder with this id already exists." };
  const now = new Date().toISOString();
  const entry: Shareholder = {
    ...parsed,
    rank: holders.length + 1,
    pct: 0,
    cumPct: 0,
    stakeText: "0.00%",
  };
  const register = composeRegister([...holders, entry], auroraEquity);
  persistRegister(db, register, actor, now);
  const groupId = `add-${entry.id}`;
  insertEvent(
    db,
    stampEvent({
      actor,
      source,
      kind: "add",
      holderId: entry.id,
      holderName: entry.displayName,
      shares: entry.shares,
      field: "shares",
      beforeValue: "0",
      afterValue: String(entry.shares),
      counterpartyId: "share-capital",
      counterpartyName: "New issuance",
      groupId,
      note: `Added ${entry.displayName} to the register`,
    })
  );
  insertEvent(
    db,
    stampEvent({
      actor,
      source,
      kind: "credit",
      holderId: entry.id,
      holderName: entry.displayName,
      shares: entry.shares,
      field: "shares",
      beforeValue: "0",
      afterValue: String(entry.shares),
      counterpartyId: "share-capital",
      counterpartyName: "New issuance",
      groupId,
      note: "Initial share credit",
    })
  );
  return { ok: true, register, events: [] };
}

function writeTransfer(
  db: DatabaseSync,
  actor: string,
  source: RegisterEventSource,
  body: Record<string, unknown>
): RegisterWriteResult {
  const shares = Math.round(Number(body.shares));
  const fromId = asText(body.fromId);
  const toId = body.toId ? asText(body.toId) : "";
  const toName = asText(body.toName).trim();
  if (!Number.isInteger(shares) || shares <= 0) return { ok: false, error: "Share transfer amount must be a positive integer." };

  const holders = loadHolders(db);
  const sender = holders.find((h) => h.id === fromId);
  if (!sender) return { ok: false, error: "Sender not found in the persisted register." };
  if (sender.shares < shares) return { ok: false, error: "Insufficient sender balance for this transfer." };

  let recipient = toId ? holders.find((h) => h.id === toId) : holders.find((h) => h.displayName.toLowerCase() === toName.toLowerCase());
  const created = !recipient;
  if (!recipient) {
    if (!toName) return { ok: false, error: "Recipient name is required for a new holder." };
    const kind = inferHolderKind(toName, "");
    recipient = {
      id: newHolderId(toName),
      rank: holders.length + 1,
      kind,
      name: toName,
      firstName: "",
      displayName: toName,
      investorId: "—",
      orgNr: kind === "company" ? toName : null,
      contact: null,
      address: "",
      address2: "",
      postalCode: "",
      city: "OSLO",
      country: "Norway",
      email: "",
      shares: 0,
      openingShares: 0,
      stakeText: "0.00%",
      pct: 0,
      cumPct: 0,
      transfers: {},
    };
  }
  if (recipient.id === sender.id) return { ok: false, error: "Sender and recipient cannot be the same shareholder." };

  const fromBefore = sender.shares;
  const fromAfter = fromBefore - shares;
  const toBefore = recipient.shares;
  const toAfter = toBefore + shares;
  if (fromBefore - shares !== fromAfter || toBefore + shares !== toAfter) {
    return { ok: false, error: "Transfer conservation check failed." };
  }

  const nextHolders = holders.map((h) => {
    if (h.id === sender.id) return { ...h, shares: fromAfter };
    if (h.id === recipient.id) return { ...h, shares: toAfter };
    return h;
  });
  if (created) nextHolders.push({ ...recipient, shares: toAfter });

  const now = new Date().toISOString();
  const register = composeRegister(nextHolders, auroraEquity);
  persistRegister(db, register, actor, now);
  const groupId = `tx-${sender.id}-${recipient.id}-${Date.now()}`;
  if (created) {
    insertEvent(
      db,
      stampEvent({
        actor,
        source,
        kind: "add",
        holderId: recipient.id,
        holderName: recipient.displayName,
        shares: toAfter,
        field: "shares",
        beforeValue: "0",
        afterValue: String(toAfter),
        counterpartyId: sender.id,
        counterpartyName: sender.displayName,
        groupId,
        note: `Created ${recipient.displayName} as transfer recipient`,
      })
    );
  }
  insertEvent(
    db,
    stampEvent({
      actor,
      source,
      kind: "debit",
      holderId: sender.id,
      holderName: sender.displayName,
      shares,
      field: "shares",
      beforeValue: String(fromBefore),
      afterValue: String(fromAfter),
      counterpartyId: recipient.id,
      counterpartyName: recipient.displayName,
      groupId,
      note: `Debit ${shares} shares to ${recipient.displayName}`,
    })
  );
  insertEvent(
    db,
    stampEvent({
      actor,
      source,
      kind: "credit",
      holderId: recipient.id,
      holderName: recipient.displayName,
      shares,
      field: "shares",
      beforeValue: String(toBefore),
      afterValue: String(toAfter),
      counterpartyId: sender.id,
      counterpartyName: sender.displayName,
      groupId,
      note: `Credit ${shares} shares from ${sender.displayName}`,
    })
  );
  return { ok: true, register, events: [] };
}

function writeRevert(db: DatabaseSync, actor: string, body: Record<string, unknown>): RegisterWriteResult {
  const target = (body.target && typeof body.target === "object" ? body.target : body) as Record<string, unknown>;
  const kind = asText(target.kind);
  const holders = loadHolders(db);
  const now = new Date().toISOString();

  if (kind === "transfer") {
    const shares = Math.round(Number(target.shares));
    const fromId = asText(target.fromId);
    const toId = target.toId ? asText(target.toId) : "";
    const sender = holders.find((h) => h.id === fromId);
    const recipient = toId ? holders.find((h) => h.id === toId) : holders.find((h) => h.displayName === asText(target.toName));
    if (!sender || !recipient) return { ok: false, error: "Cannot revert — counterparties no longer exist." };
    if (recipient.shares < shares) return { ok: false, error: "Cannot revert — recipient no longer holds those shares." };
    const next = holders
      .map((h) => {
        if (h.id === sender.id) return { ...h, shares: h.shares + shares };
        if (h.id === recipient.id) return { ...h, shares: h.shares - shares };
        return h;
      })
      .filter((h) => !(asText(target.toId) === "" && h.id === recipient.id && h.shares === 0 && h.openingShares === 0));
    const register = composeRegister(next, auroraEquity);
    persistRegister(db, register, actor, now);
    insertEvent(
      db,
      stampEvent({
        actor,
        source: "revert",
        kind: "revert",
        holderId: sender.id,
        holderName: sender.displayName,
        shares,
        field: "shares",
        beforeValue: String(sender.shares),
        afterValue: String(sender.shares + shares),
        counterpartyId: recipient.id,
        counterpartyName: recipient.displayName,
        groupId: `rev-${Date.now()}`,
        note: `Reverted transfer of ${shares} shares`,
      })
    );
    return { ok: true, register, events: [] };
  }

  if (kind === "add_holder") {
    const id = asText(target.createdId || target.id);
    const register = composeRegister(
      holders.filter((h) => h.id !== id),
      auroraEquity
    );
    persistRegister(db, register, actor, now);
    insertEvent(
      db,
      stampEvent({
        actor,
        source: "revert",
        kind: "remove",
        holderId: id,
        holderName: asText(target.name),
        shares: Number(target.shares) || 0,
        field: "shares",
        beforeValue: asText(target.shares),
        afterValue: "0",
        counterpartyId: null,
        counterpartyName: null,
        groupId: `rev-${id}`,
        note: `Removed ${asText(target.name)} after revert`,
      })
    );
    return { ok: true, register, events: [] };
  }

  if (kind === "update_field") {
    return writeCell(db, actor, "revert", {
      id: target.holderId,
      columnKey: target.field,
      value: target.beforeValue,
    });
  }

  return { ok: false, error: "Cannot revert this action." };
}
