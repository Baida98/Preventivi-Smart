/**
 * Smart Memory — Memoria persistente per Preventivi-Smart
 *
 * Adattato da agentMemory.ts (Baida98/AI) per il contesto di analisi preventivi.
 * Memorizza preferenze utente (ultima regione, categoria, viste, etc.) in localStorage.
 *
 * Utilizzo:
 *   smartMemory.remember("lastRegion", "lombardia");
 *   const region = smartMemory.recall("lastRegion"); // "lombardia"
 */

const MEMORY_KEY = "preventivi_smart_memory";

type MemoryStore = Record<string, string | number | boolean>;

function loadStore(): MemoryStore {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? (JSON.parse(raw) as MemoryStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: MemoryStore): void {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(store));
  } catch { /* ignore quota errors */ }
}

export const smartMemory = {
  remember: <T extends string | number | boolean>(key: string, value: T): void => {
    const store = loadStore();
    store[key] = value;
    saveStore(store);
  },

  recall: <T extends string | number | boolean = string>(
    key: string,
    defaultValue?: T
  ): T | null => {
    const store = loadStore();
    const val = store[key];
    if (val === undefined || val === null) return defaultValue ?? null;
    return val as T;
  },

  forget: (key: string): void => {
    const store = loadStore();
    delete store[key];
    saveStore(store);
  },

  clear: (): void => {
    try {
      localStorage.removeItem(MEMORY_KEY);
    } catch { /* ignore */ }
  },

  /** Aggiunge un valore a una lista (max N elementi) */
  appendToList: (key: string, value: string, maxItems = 10): void => {
    const store = loadStore();
    let list: string[] = [];
    try {
      list = JSON.parse(store[`${key}_list`] as string || "[]");
    } catch { /* ignore */ }
    list = [value, ...list.filter(v => v !== value)].slice(0, maxItems);
    store[`${key}_list`] = JSON.stringify(list);
    saveStore(store);
  },

  /** Legge una lista */
  recallList: (key: string): string[] => {
    const store = loadStore();
    try {
      return JSON.parse(store[`${key}_list`] as string || "[]");
    } catch {
      return [];
    }
  },
};

// Keys convenzionali per Preventivi-Smart
export const MEMORY_KEYS = {
  LAST_REGION: "lastRegion",
  LAST_CATEGORY: "lastCategory",
  AI_TOKEN_CONFIGURED: "aiTokenConfigured",
  PREFERRED_MODE: "preferredMode",
  ANALYSIS_COUNT: "analysisCount",
  LAST_VERDICT: "lastVerdict",
  AI_SETUP_DISMISSED: "aiSetupDismissed",
} as const;
