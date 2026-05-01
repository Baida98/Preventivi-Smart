import type { VerdictKey } from "./verdict";

/**
 * Modello dati completo per un preventivo
 * Struttura ottimizzata per Firestore con tutti i campi necessari
 */
export type Quote = {
  // Identificativi
  id: string;
  numero: string; // Numerazione preventivo (es: "2026-0001")
  
  // Informazioni temporali
  data: string; // ISO 8601 format (YYYY-MM-DD)
  createdAt: string; // Timestamp ISO 8601 con ora
  updatedAt?: string; // Timestamp ISO 8601 con ora
  
  // Dati cliente
  cliente: {
    nome: string;
    cognome?: string;
    email?: string;
    telefono?: string;
    indirizzo?: string;
    citta?: string;
    cap?: string;
    provincia?: string;
  };
  
  // Servizi/Lavori
  servizi: Service[];
  
  // Totali
  totale: number; // Importo totale in euro
  
  // Metadati analisi
  jobId?: string;
  jobLabel?: string;
  categoryLabel?: string;
  regionLabel?: string;
  
  // Verdetto analisi
  verdict?: VerdictKey;
  verdictLabel?: string;
  
  // Note e osservazioni
  note?: string;
  
  // Modalità di analisi
  mode?: "analizza" | "stima";
  
  // Dati di mercato di riferimento
  marketMin?: number;
  marketMid?: number;
  marketMax?: number;
  
  // Prezzo ricevuto (se disponibile)
  receivedPrice?: number;
  
  // Campi legacy per compatibilità
  fieldValues?: Record<string, string>;
  fieldLabels?: { id: string; label: string; valueLabel: string }[];
  quantity?: number;
  unitLabel?: string;
};

/**
 * Singolo servizio/lavoro nel preventivo
 */
export type Service = {
  id: string;
  descrizione: string;
  quantita: number;
  unitaMisura: string;
  prezzoUnitario: number;
  totale: number; // quantita * prezzoUnitario
  note?: string;
};

/**
 * Tipo per la risposta di creazione preventivo con numero assegnato
 */
export type CreateQuoteResponse = {
  id: string;
  numero: string;
  createdAt: string;
};

/**
 * Validazione base del modello Quote
 */
export function isValidQuote(quote: unknown): quote is Quote {
  if (!quote || typeof quote !== "object") return false;
  
  const q = quote as Record<string, unknown>;
  
  // Campi obbligatori
  if (typeof q.id !== "string" || !q.id.trim()) return false;
  if (typeof q.numero !== "string" || !q.numero.trim()) return false;
  if (typeof q.data !== "string") return false;
  if (typeof q.createdAt !== "string") return false;
  if (typeof q.totale !== "number" || q.totale < 0) return false;
  
  // Cliente
  if (!q.cliente || typeof q.cliente !== "object") return false;
  const cliente = q.cliente as Record<string, unknown>;
  if (typeof cliente.nome !== "string" || !cliente.nome.trim()) return false;
  
  // Servizi
  if (!Array.isArray(q.servizi)) return false;
  if (q.servizi.length === 0) return false;
  
  return true;
}

/**
 * Crea un nuovo preventivo vuoto con ID e timestamp
 */
export function createEmptyQuote(userId: string): Partial<Quote> {
  const now = new Date().toISOString();
  const today = now.split("T")[0];
  
  return {
    id: generateQuoteId(),
    data: today,
    createdAt: now,
    cliente: {
      nome: "",
    },
    servizi: [],
    totale: 0,
  };
}

/**
 * Genera un ID univoco per il preventivo
 */
export function generateQuoteId(): string {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

/**
 * Calcola il totale dei servizi
 */
export function calculateTotal(servizi: Service[]): number {
  return servizi.reduce((sum, s) => sum + (s.totale || 0), 0);
}

/**
 * Formatta il numero preventivo
 * Formato: YYYY-NNNN (es: 2026-0001)
 */
export function formatQuoteNumber(year: number, sequence: number): string {
  return `${year}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Estrae l'anno dal numero preventivo
 */
export function extractYearFromQuoteNumber(numero: string): number {
  const parts = numero.split("-");
  return parseInt(parts[0], 10);
}

/**
 * Estrae il numero sequenziale dal numero preventivo
 */
export function extractSequenceFromQuoteNumber(numero: string): number {
  const parts = numero.split("-");
  return parseInt(parts[1], 10);
}
