import type { VerdictKey } from "./verdict";

const KEY = "preventivi-smart-archive-v1";
export const GUEST_QUOTE_LIMIT = 5;

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
  cliente?: {
    nome: string;
    cognome?: string;
    email?: string;
    telefono?: string;
  };
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
  } catch (error) {
    console.error("Errore nel caricamento dell'archivio:", error);
    return [];
  }
}

export function saveQuote(q: SavedQuote) {
  try {
    const all = loadArchive();
    all.unshift(q);
    window.localStorage.setItem(KEY, JSON.stringify(all.slice(0, 100)));
  } catch (error) {
    console.error("Errore nel salvataggio del preventivo:", error);
    throw new Error("Impossibile salvare il preventivo. Verifica lo spazio disponibile.");
  }
}

export function deleteQuote(id: string) {
  try {
    const all = loadArchive().filter((q) => q.id !== id);
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch (error) {
    console.error("Errore nell'eliminazione del preventivo:", error);
    throw new Error("Impossibile eliminare il preventivo.");
  }
}

export function clearArchive() {
  try {
    window.localStorage.removeItem(KEY);
  } catch (error) {
    console.error("Errore nella cancellazione dell'archivio:", error);
    throw new Error("Impossibile cancellare l'archivio.");
  }
}

export function newId() {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

/**
 * Conta il numero di preventivi salvati
 */
export function getQuoteCount(): number {
  try {
    return loadArchive().length;
  } catch (error) {
    console.error("Errore nel conteggio dei preventivi:", error);
    return 0;
  }
}

/**
 * Verifica se l'utente ospite ha raggiunto il limite di preventivi
 */
export function isGuestLimitReached(): boolean {
  try {
    return getQuoteCount() >= GUEST_QUOTE_LIMIT;
  } catch (error) {
    console.error("Errore nella verifica del limite ospite:", error);
    return false;
  }
}

/**
 * Calcola il totale economico di tutti i preventivi salvati
 */
export function calculateTotalArchive(): number {
  try {
    const quotes = loadArchive();
    return quotes.reduce((sum, q) => {
      const value = q.mode === "analizza" && q.receivedPrice 
        ? q.receivedPrice 
        : q.marketMid;
      return sum + value;
    }, 0);
  } catch (error) {
    console.error("Errore nel calcolo del totale archivio:", error);
    return 0;
  }
}

/**
 * Ottiene una lista di clienti unici dai preventivi salvati per l'autocompletamento
 */
export function getClientSuggestions() {
  try {
    const quotes = loadArchive();
    const clients = quotes
      .filter(q => q.cliente && q.cliente.nome)
      .map(q => q.cliente!);
    
    // Rimuovi duplicati basati su nome e cognome
    const uniqueClients = Array.from(
      new Map(clients.map(c => [`${c.nome}-${c.cognome || ""}`, c])).values()
    );
    
    return uniqueClients;
  } catch (error) {
    console.error("Errore nel recupero suggerimenti clienti:", error);
    return [];
  }
}
