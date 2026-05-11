/**
 * Score History — Persiste storico verdetti per trend analysis AI
 *
 * Salva ogni analisi in localStorage con timestamp, verdetto, prezzi.
 * L'AI può poi confrontare con lo storico per dare consigli evoluti.
 */

const STORAGE_KEY = "preventivi_score_history";
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  categoryId: string;
  jobLabel: string;
  regionLabel: string;
  price: number;
  marketMid: number;
  verdict: string;
  pctFromMid: number;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* ignore quota errors */
  }
}

export function recordAnalysis(entry: Omit<HistoryEntry, "id" | "timestamp">): void {
  const history = loadHistory();
  const newEntry: HistoryEntry = {
    id: Math.random().toString(36).slice(2),
    timestamp: Date.now(),
    ...entry,
  };
  history.unshift(newEntry);
  saveHistory(history);
}

export function getHistory(): HistoryEntry[] {
  return loadHistory();
}

export function getHistoryForCategory(categoryId: string): HistoryEntry[] {
  return loadHistory().filter(e => e.categoryId === categoryId);
}

export function clearHistory(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function getSummaryStats(entries: HistoryEntry[]): {
  count: number;
  avgPctFromMid: number;
  verdictCounts: Record<string, number>;
  trend: "improving" | "stable" | "worsening" | null;
} {
  if (entries.length === 0) {
    return { count: 0, avgPctFromMid: 0, verdictCounts: {}, trend: null };
  }
  const avgPctFromMid = entries.reduce((s, e) => s + e.pctFromMid, 0) / entries.length;
  const verdictCounts: Record<string, number> = {};
  for (const e of entries) {
    verdictCounts[e.verdict] = (verdictCounts[e.verdict] ?? 0) + 1;
  }
  // Compare first half vs second half (oldest = better if prices were lower)
  let trend: "improving" | "stable" | "worsening" | null = null;
  if (entries.length >= 4) {
    const half = Math.floor(entries.length / 2);
    const recentAvg = entries.slice(0, half).reduce((s, e) => s + e.pctFromMid, 0) / half;
    const oldAvg = entries.slice(half).reduce((s, e) => s + e.pctFromMid, 0) / half;
    if (recentAvg < oldAvg - 5) trend = "improving";
    else if (recentAvg > oldAvg + 5) trend = "worsening";
    else trend = "stable";
  }
  return { count: entries.length, avgPctFromMid, verdictCounts, trend };
}
