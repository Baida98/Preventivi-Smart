import type { VerdictKey } from "./verdict";

const KEY = "preventivi-smart-archive-v1";

export type SavedQuote = {
  id: string;
  createdAt: string;
  jobId: string;
  jobLabel: string;
  categoryLabel: string;
  regionLabel: string;
  quantity: number;
  unitLabel: string;
  fieldValues: Record<string, string>;
  fieldLabels: { id: string; label: string; valueLabel: string }[];
  notes?: string;
  receivedPrice?: number;
  marketMin: number;
  marketMid: number;
  marketMax: number;
  verdict?: VerdictKey;
  verdictLabel?: string;
  mode: "analizza" | "stima";
};

export function loadArchive(): SavedQuote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return [];
  }
}

export function saveQuote(q: SavedQuote) {
  const all = loadArchive();
  all.unshift(q);
  window.localStorage.setItem(KEY, JSON.stringify(all.slice(0, 100)));
}

export function deleteQuote(id: string) {
  const all = loadArchive().filter((q) => q.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function clearArchive() {
  window.localStorage.removeItem(KEY);
}

export function newId() {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}
