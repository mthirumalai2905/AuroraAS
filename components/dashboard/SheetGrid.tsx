"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { fmt } from "@/lib/format";
import { cn, columnLetter } from "@/lib/utils";

export type Kind = "int" | "usd" | "price" | "pct" | "signedPct" | "text" | "date";

export type Column<R> = {
  key: string;
  title: string;
  width: number;
  kind?: Kind;
  align?: "left" | "right" | "center";
  value: (row: R) => number | string;
  render?: (row: R) => ReactNode;
  formula?: (row: R, rowNumber: number, letter: (key: string) => string) => string;
  total?: (rows: R[]) => ReactNode;
  accent?: string;
  tint?: string;
  fill?: (row: R) => { color: string; opacity: number } | null;
  editable?: boolean;
};

export type Stats = {
  count: number;
  numericCount: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  kind: Kind | null;
};

type Pos = { r: number; c: number };

const NUMERIC: Kind[] = ["int", "usd", "price", "pct", "signedPct"];
const ROWNUM_W = 52;
const LETTER_H = 26;
const TITLE_H = 40;
const TOTAL_H = 40;

export function formatKind(kind: Kind | undefined, v: number | string): string {
  if (typeof v === "string") return kind === "date" ? fmt.date(v) : v;
  switch (kind) {
    case "int":
      return fmt.int(v);
    case "usd":
      return fmt.usd(v);
    case "price":
      return fmt.usd2(v);
    case "pct":
      return fmt.pct(v);
    case "signedPct":
      return fmt.signedPct(v);
    default:
      return String(v);
  }
}

function display<R>(col: Column<R>, row: R) {
  return formatKind(col.kind, col.value(row));
}

type Props<R> = {
  id: string;
  rows: R[];
  columns: Column<R>[];
  getRowId: (row: R) => string;
  density: "compact" | "comfortable";
  onOpenRow?: (row: R) => void;
  onStats: (stats: Stats | null) => void;
  onNotice: (message: string) => void;
  emptyMessage?: string;
  canWrite?: boolean;
  onWriteCell?: (row: R, columnKey: string, value: string) => void;
};

export function SheetGrid<R>({
  id,
  rows,
  columns,
  getRowId,
  density,
  onOpenRow,
  onStats,
  onNotice,
  emptyMessage = "No rows match your filters.",
  canWrite = false,
  onWriteCell,
}: Props<R>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [anchor, setAnchor] = useState<Pos>({ r: 0, c: 0 });
  const [focus, setFocus] = useState<Pos>({ r: 0, c: 0 });
  const [editing, setEditing] = useState<{ r: number; c: number; draft: string } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);
  const interacted = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowH = density === "compact" ? 34 : 44;

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const m = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.value(a);
      const vb = col.value(b);
      return (typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb))) * m;
    });
  }, [rows, columns, sort]);

  const maxR = sorted.length - 1;
  const maxC = columns.length - 1;
  const clamp = (p: Pos): Pos => ({ r: Math.max(0, Math.min(maxR, p.r)), c: Math.max(0, Math.min(maxC, p.c)) });
  const a = clamp(anchor);
  const f = clamp(focus);
  const r0 = Math.min(a.r, f.r);
  const r1 = Math.max(a.r, f.r);
  const c0 = Math.min(a.c, f.c);
  const c1 = Math.max(a.c, f.c);
  const isRange = r0 !== r1 || c0 !== c1;

  const letterOf = useMemo(() => {
    const map = new Map(columns.map((c, i) => [c.key, columnLetter(i)]));
    return (key: string) => map.get(key) ?? "?";
  }, [columns]);

  useEffect(() => {
    if (!sorted.length) {
      onStats(null);
      return;
    }
    const nums: number[] = [];
    const kinds = new Set<Kind>();
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const col = columns[c];
        const v = col.value(sorted[r]);
        if (col.kind && NUMERIC.includes(col.kind) && typeof v === "number") {
          nums.push(v);
          kinds.add(col.kind);
        }
      }
    }
    const sum = nums.reduce((s, v) => s + v, 0);
    onStats({
      count: (r1 - r0 + 1) * (c1 - c0 + 1),
      numericCount: nums.length,
      sum,
      avg: nums.length ? sum / nums.length : 0,
      min: nums.length ? Math.min(...nums) : 0,
      max: nums.length ? Math.max(...nums) : 0,
      kind: kinds.size === 1 ? [...kinds][0] : null,
    });
  }, [r0, r1, c0, c1, sorted, columns, onStats]);

  useEffect(() => {
    const up = () => (dragging.current = false);
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  useEffect(() => {
    if (!interacted.current) return;
    scrollRef.current
      ?.querySelector<HTMLElement>(`[data-cell="${f.r}-${f.c}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [f.r, f.c]);

  function select(p: Pos, extend: boolean) {
    interacted.current = true;
    const n = clamp(p);
    setFocus(n);
    if (!extend) setAnchor(n);
  }

  function startEdit(r: number, c: number, initialValue?: string) {
    const col = columns[c];
    const row = sorted[r];
    if (!col || !row) return;
    if (!canWrite || !onWriteCell) {
      onNotice("Read-only access. Only paal@synx.tools and thiru@synx.tools have write access.");
      return;
    }
    if (col.editable === false) {
      onNotice(`"${col.title}" is a formula-computed column and cannot be edited directly.`);
      return;
    }
    const raw = initialValue !== undefined ? initialValue : String(col.value(row) ?? "");
    setEditing({ r, c, draft: raw });
    setTimeout(() => {
      editInputRef.current?.focus();
      if (initialValue === undefined) editInputRef.current?.select();
    }, 0);
  }

  function commitEdit() {
    if (!editing) return;
    const col = columns[editing.c];
    const row = sorted[editing.r];
    const nextDraft = editing.draft;
    setEditing(null);
    if (col && row && onWriteCell && String(col.value(row) ?? "") !== nextDraft) {
      onWriteCell(row, col.key, nextDraft);
    }
    scrollRef.current?.focus({ preventScroll: true });
  }

  async function copy() {
    const lines: string[] = [];
    for (let r = r0; r <= r1; r++) {
      const cells: string[] = [];
      for (let c = c0; c <= c1; c++) cells.push(display(columns[c], sorted[r]));
      lines.push(cells.join("\t"));
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      onNotice(`Copied ${(r1 - r0 + 1) * (c1 - c0 + 1)} cell${isRange ? "s" : ""} to clipboard`);
    } catch {
      onNotice("Clipboard access was blocked by the browser");
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!sorted.length || editing) return;
    const mod = e.metaKey || e.ctrlKey;
    const step = (dr: number, dc: number) => {
      if (mod) {
        select({ r: dr ? (dr > 0 ? maxR : 0) : f.r, c: dc ? (dc > 0 ? maxC : 0) : f.c }, e.shiftKey);
      } else {
        select({ r: f.r + dr, c: f.c + dc }, e.shiftKey);
      }
    };
    switch (e.key) {
      case "ArrowUp":
        step(-1, 0);
        break;
      case "ArrowDown":
        step(1, 0);
        break;
      case "ArrowLeft":
        step(0, -1);
        break;
      case "ArrowRight":
        step(0, 1);
        break;
      case "Tab":
        select({ r: f.r, c: f.c + (e.shiftKey ? -1 : 1) }, false);
        break;
      case "Home":
        select({ r: mod ? 0 : f.r, c: 0 }, e.shiftKey);
        break;
      case "End":
        select({ r: mod ? maxR : f.r, c: maxC }, e.shiftKey);
        break;
      case "PageDown":
        select({ r: f.r + 10, c: f.c }, e.shiftKey);
        break;
      case "PageUp":
        select({ r: f.r - 10, c: f.c }, e.shiftKey);
        break;
      case "F2":
        startEdit(f.r, f.c);
        break;
      case "Enter":
        if (f.c === 0 && onOpenRow) onOpenRow(sorted[f.r]);
        else if (canWrite && onWriteCell) startEdit(f.r, f.c);
        else select({ r: f.r + (e.shiftKey ? -1 : 1), c: f.c }, false);
        break;
      case "Escape":
        setAnchor(f);
        break;
      default:
        if (mod && e.key.toLowerCase() === "a") {
          interacted.current = true;
          setAnchor({ r: 0, c: 0 });
          setFocus({ r: maxR, c: maxC });
        } else if (mod && e.key.toLowerCase() === "c") {
          copy();
        } else if (!mod && e.key.length === 1) {
          startEdit(f.r, f.c, e.key);
        } else return;
    }
    e.preventDefault();
  }

  function toggleSort(key: string, kind?: Kind) {
    setSort((s) => {
      const first = kind && NUMERIC.includes(kind) ? "desc" : "asc";
      if (!s || s.key !== key) return { key, dir: first };
      if (s.dir === first) return { key, dir: first === "desc" ? "asc" : "desc" };
      return null;
    });
  }

  const activeRow = sorted[f.r];
  const activeCol = columns[f.c];
  const cellRef = isRange
    ? `${columnLetter(c0)}${r0 + 1}:${columnLetter(c1)}${r1 + 1}`
    : `${columnLetter(f.c)}${f.r + 1}`;
  const formula = activeRow ? (activeCol.formula ? activeCol.formula(activeRow, f.r + 1, letterOf) : display(activeCol, activeRow)) : "";
  const stickyW = ROWNUM_W + columns[0].width;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-black/[0.06] bg-white px-3 text-[13px]">
        <motion.span
          key={cellRef}
          initial={{ opacity: 0.4, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-w-[76px] rounded-md bg-black/[0.04] px-2 py-1 text-center font-mono text-[12px] text-neutral-600"
        >
          {cellRef}
        </motion.span>
        <span className="h-5 w-px bg-black/10" />
        <span className="font-display text-[15px] italic text-neutral-400">fx</span>
        <motion.span
          key={`${f.r}-${f.c}-${formula}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className={cn("min-w-0 flex-1 truncate", activeCol?.formula ? "font-mono text-[12.5px] text-[#0a6bd6]" : "text-neutral-800")}
        >
          {formula}
        </motion.span>
        {activeRow && (
          <span className="hidden shrink-0 text-[12px] text-neutral-400 md:block">
            {display(columns[0], activeRow)} <span className="mx-1">›</span> {activeCol.title}
          </span>
        )}
      </div>

      <motion.div
        layoutScroll
        ref={scrollRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative min-h-0 flex-1 overflow-auto bg-white outline-none scrollbar-thin"
        aria-label="Shareholder register grid"
        role="grid"
      >
        <div className="relative w-max min-w-full">
          {/* column letters */}
          <div className="sticky top-0 z-30 flex w-max min-w-full" style={{ height: LETTER_H }}>
            <button
              onClick={() => {
                interacted.current = true;
                setAnchor({ r: 0, c: 0 });
                setFocus({ r: maxR, c: maxC });
              }}
              className="sticky left-0 z-10 shrink-0 border-b border-r border-black/[0.07] bg-[#f6f6f8] transition-colors hover:bg-[#ececf0]"
              style={{ width: ROWNUM_W }}
              aria-label="Select all"
            >
              <svg viewBox="0 0 8 8" className="absolute bottom-1 right-1 h-2 w-2 text-neutral-300" aria-hidden>
                <path d="M8 0 L8 8 L0 8 Z" fill="currentColor" />
              </svg>
            </button>
            {columns.map((col, c) => {
              const on = c >= c0 && c <= c1;
              return (
                <button
                  key={col.key}
                  onClick={() => {
                    interacted.current = true;
                    setAnchor({ r: 0, c });
                    setFocus({ r: maxR, c });
                  }}
                  className={cn(
                    "shrink-0 border-b border-r border-black/[0.07] text-[11px] font-medium transition-colors duration-200",
                    on ? "bg-[#e3eefc] text-[#0a6bd6]" : "bg-[#f6f6f8] text-neutral-400 hover:bg-[#efeff3]",
                    c === 0 && "sticky z-10"
                  )}
                  style={{ width: col.width, left: c === 0 ? ROWNUM_W : undefined }}
                >
                  {columnLetter(c)}
                </button>
              );
            })}
            <div className="flex-1 border-b border-black/[0.07] bg-[#f6f6f8]" />
          </div>

          {/* titles */}
          <div className="sticky z-30 flex w-max min-w-full" style={{ top: LETTER_H, height: TITLE_H }}>
            <div className="sticky left-0 z-10 shrink-0 border-b border-r border-black/[0.07] bg-[#fbfbfc]" style={{ width: ROWNUM_W }} />
            {columns.map((col, c) => {
              const active = sort?.key === col.key;
              return (
                <button
                  key={col.key}
                  onClick={() => toggleSort(col.key, col.kind)}
                  className={cn(
                    "group/h flex shrink-0 items-center gap-1.5 border-b border-r border-black/[0.07] bg-[#fbfbfc] px-3 text-[12px] font-semibold text-neutral-600 transition-colors hover:bg-[#f3f3f6]",
                    col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "justify-start",
                    c === 0 && "sticky z-10"
                  )}
                  style={{ width: col.width, left: c === 0 ? ROWNUM_W : undefined }}
                  title={`Sort by ${col.title}`}
                >
                  {col.accent && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: col.accent }} />}
                  <span className="truncate">{col.title}</span>
                  <motion.span
                    initial={false}
                    animate={{ rotate: active && sort?.dir === "asc" ? 180 : 0, opacity: active ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={cn("shrink-0 text-[#0a84ff]", !active && "group-hover/h:!opacity-40")}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </motion.span>
                </button>
              );
            })}
            <div className="flex-1 border-b border-black/[0.07] bg-[#fbfbfc]" />
          </div>

          {/* rows */}
          {sorted.map((row, r) => {
            const rowOn = r >= r0 && r <= r1;
            return (
              <motion.div
                key={getRowId(row)}
                layout="position"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  opacity: { duration: 0.35, delay: Math.min(r * 0.018, 0.4) },
                  y: { duration: 0.45, delay: Math.min(r * 0.018, 0.4), ease: [0.22, 1, 0.36, 1] },
                  layout: { type: "spring", stiffness: 380, damping: 38 },
                }}
                className="group/row flex w-max min-w-full"
                style={{ height: rowH }}
              >
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    scrollRef.current?.focus({ preventScroll: true });
                    interacted.current = true;
                    if (e.shiftKey) setFocus({ r, c: maxC });
                    else {
                      setAnchor({ r, c: 0 });
                      setFocus({ r, c: maxC });
                    }
                  }}
                  className={cn(
                    "sticky left-0 z-10 flex shrink-0 cursor-default select-none items-center justify-center border-b border-r border-black/[0.07] text-[11px] tabular-nums transition-colors duration-200",
                    rowOn ? "bg-[#e3eefc] font-semibold text-[#0a6bd6]" : "bg-[#f6f6f8] text-neutral-400"
                  )}
                  style={{ width: ROWNUM_W }}
                >
                  {r + 1}
                </div>
                {columns.map((col, c) => {
                  const inRange = rowOn && c >= c0 && c <= c1;
                  const active = r === f.r && c === f.c;
                  const sticky = c === 0;
                  return (
                    <div
                      key={col.key}
                      data-cell={`${r}-${c}`}
                      role="gridcell"
                      aria-selected={inRange}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        scrollRef.current?.focus({ preventScroll: true });
                        dragging.current = true;
                        select({ r, c }, e.shiftKey);
                      }}
                      onMouseEnter={() => {
                        if (dragging.current) select({ r, c }, true);
                      }}
                      onDoubleClick={() => {
                        if (sticky && onOpenRow) onOpenRow(row);
                        else startEdit(r, c);
                      }}
                      className={cn(
                        "relative flex shrink-0 cursor-cell select-none items-center border-b border-r border-black/[0.06] px-3 text-[13px] tabular-nums text-neutral-800 transition-colors duration-150",
                        col.align === "right" ? "justify-end text-right" : col.align === "center" ? "justify-center" : "justify-start",
                        sticky ? "sticky z-10 bg-white group-hover/row:bg-[#f8f9fb]" : "z-0 group-hover/row:bg-[#f8f9fb]",
                        !sticky && col.tint
                      )}
                      style={{
                        width: col.width,
                        left: sticky ? ROWNUM_W : undefined,
                        scrollMarginTop: LETTER_H + TITLE_H,
                        scrollMarginBottom: TOTAL_H,
                        scrollMarginLeft: sticky ? 0 : stickyW,
                      }}
                    >
                      {(() => {
                        const fill = col.fill?.(row);
                        return fill ? (
                          <span className="pointer-events-none absolute inset-[3px] rounded-[6px]" style={{ background: fill.color, opacity: fill.opacity }} />
                        ) : null;
                      })()}
                      {inRange && <span className="pointer-events-none absolute inset-0 bg-[#0a84ff]/[0.08]" />}
                      {editing && editing.r === r && editing.c === c ? (
                        <input
                          ref={editInputRef}
                          value={editing.draft}
                          onChange={(e) => setEditing({ ...editing, draft: e.target.value })}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commitEdit();
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              setEditing(null);
                              scrollRef.current?.focus({ preventScroll: true });
                            }
                          }}
                          className={cn(
                            "relative z-30 h-full w-full bg-white text-[13px] font-medium text-neutral-900 focus:outline-none",
                            col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                          )}
                        />
                      ) : (
                        <span className="relative min-w-0 truncate">{col.render ? col.render(row) : display(col, row)}</span>
                      )}
                      {active && (
                        <motion.span
                          layoutId={`${id}-active-cell`}
                          className="pointer-events-none absolute -inset-px z-20 rounded-[3px] border-2 border-[#0a84ff] shadow-[0_0_0_3px_rgba(10,132,255,0.15)]"
                          transition={{ type: "spring", stiffness: 650, damping: 42, mass: 0.7 }}
                        />
                      )}
                    </div>
                  );
                })}
                <div className="flex-1 border-b border-black/[0.06] group-hover/row:bg-[#f8f9fb]" />
              </motion.div>
            );
          })}

          {sorted.length === 0 && (
            <div className="sticky left-0 flex h-64 w-[min(100%,100vw)] items-center justify-center text-[14px] text-neutral-400">{emptyMessage}</div>
          )}

          {/* totals */}
          {sorted.length > 0 && columns.some((c) => c.total) && (
            <div className="sticky bottom-0 z-30 flex w-max min-w-full" style={{ height: TOTAL_H }}>
              <div className="sticky left-0 z-10 flex shrink-0 items-center justify-center border-r border-t border-black/[0.08] bg-[#f6f6f8] text-[13px] text-neutral-400" style={{ width: ROWNUM_W }}>
                Σ
              </div>
              {columns.map((col, c) => (
                <div
                  key={col.key}
                  className={cn(
                    "flex shrink-0 items-center border-r border-t border-black/[0.08] bg-[#fbfbfc]/95 px-3 text-[13px] font-semibold tabular-nums text-neutral-900 backdrop-blur",
                    col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "justify-start",
                    c === 0 && "sticky z-10 bg-[#fbfbfc]"
                  )}
                  style={{ width: col.width, left: c === 0 ? ROWNUM_W : undefined }}
                >
                  {c === 0 ? `Total · ${sorted.length} rows` : col.total?.(sorted)}
                </div>
              ))}
              <div className="flex-1 border-t border-black/[0.08] bg-[#fbfbfc]/95" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function toCSV<R>(columns: Column<R>[], rows: R[]) {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const head = columns.map((c) => esc(c.title)).join(",");
  const body = rows.map((r) => columns.map((c) => esc(String(c.value(r)))).join(","));
  return [head, ...body].join("\n");
}
