import type { VerdictKey } from "./verdict";

const KEY = "preventivi-smart-archive-v1";
export const GUEST_QUOTE_LIMIT = 5;

export type SavedQuote = {
  id: string;
  numero?: string;
  createdAt: string;
  updatedAt: string;
  data: string;
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
  
  // Campi per Phase 1
  ambito: string;
  sottotipo: string;
  mq?: number;
  stato: "bozza" | "finalizzato" | "inviato" | "accettato" | "rifiutato" | "modificato";
  source: "manuale" | "import" | "pdf";
  servizi?: { id: string; descrizione: string; quantita: number; unitaMisura: string; prezzoUnitario: number; totale: number }[];
  totale?: number;

  // Phase 5: Qualità e validazione
  qualityScore?: number;
  anomalyScore?: number;
  validated?: boolean;

  // Tracking & Analytics (Nuovo)
  prezzo_suggerito?: number;
  prezzo_finale?: number;
  range_min?: number;
  range_max?: number;
  confidence?: number;
  model_version?: string;
  segmento?: string;
  outcome?: "bozza" | "inviato" | "accettato" | "rifiutato" | "modificato";
  errore_assoluto?: number;
  errore_percentuale?: number;
  dentro_range?: boolean;
  ocrConfidence?: number;
  parserConfidence?: number;
};

export type QuoteEvent = {
  id?: string;
  preventivoId: string;
  type: "CREATED" | "UPDATED" | "SENT" | "ACCEPTED" | "REJECTED" | "MODIFIED" | "CLOSED";
  payload?: Record<string, any>;
  timestamp: number;
  uid?: string;
};

export type AnalyticsRecord = {
  preventivoId: string;
  uid?: string;
  segmento: string;
  prezzo_suggerito: number;
  prezzo_finale: number;
  errore_assoluto: number;
  errore_percentuale: number;
  dentro_range: boolean;
  outcome: string;
  confidence: number;
  model_version: string;
  createdAt: number;
};

export type AggregateMetrics = {
  segmento: string;
  count: number;
  errore_medio: number;
  errore_percentuale_medio: number;
  accuracy_range: number;
  acceptance_rate: number;
  avg_confidence: number;
  lastUpdated: number;
};

const EVENTS_KEY = "preventivi-smart-events-v1";
const ANALYTICS_KEY = "preventivi-smart-analytics-v1";
const AGGREGATES_KEY = "preventivi-smart-aggregates-v1";

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

// ⸻ TRACKING & ANALYTICS ⸻

/**
 * Salva un evento di tracking
 */
export function logEvent(type: QuoteEvent["type"], preventivoId: string, payload: Record<string, any> = {}) {
  try {
    const events = loadEvents();
    const event: QuoteEvent = {
      id: newId(),
      preventivoId,
      type,
      payload,
      timestamp: Date.now(),
      uid: "guest",
    };
    events.unshift(event);
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(0, 500)));
  } catch (error) {
    console.error("Errore nel salvataggio dell'evento:", error);
  }
}

/**
 * Carica gli eventi di tracking
 */
export function loadEvents(): QuoteEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (error) {
    console.error("Errore nel caricamento degli eventi:", error);
    return [];
  }
}

/**
 * Chiude un preventivo e genera un record analytics
 */
export function closePreventivo(preventivo: SavedQuote) {
  try {
    if (!preventivo.prezzo_suggerito || !preventivo.prezzo_finale || !preventivo.segmento) {
      console.warn("Preventivo incompleto per chiusura:", preventivo.id);
      return;
    }

    const errore_assoluto = Math.abs(preventivo.prezzo_finale - preventivo.prezzo_suggerito);
    const errore_percentuale = errore_assoluto / preventivo.prezzo_suggerito;
    const dentro_range = 
      preventivo.prezzo_finale >= (preventivo.range_min || 0) &&
      preventivo.prezzo_finale <= (preventivo.range_max || Infinity);

    const record: AnalyticsRecord = {
      preventivoId: preventivo.id,
      uid: "guest",
      segmento: preventivo.segmento,
      prezzo_suggerito: preventivo.prezzo_suggerito,
      prezzo_finale: preventivo.prezzo_finale,
      errore_assoluto,
      errore_percentuale,
      dentro_range,
      outcome: preventivo.outcome || "bozza",
      confidence: preventivo.confidence || 0.5,
      model_version: preventivo.model_version || "v1",
      createdAt: Date.now(),
    };

    saveAnalyticsRecord(record);
    logEvent("CLOSED", preventivo.id, { outcome: preventivo.outcome });
    updateAggregates(preventivo.segmento);
  } catch (error) {
    console.error("Errore nella chiusura del preventivo:", error);
  }
}

/**
 * Salva un record analytics
 */
export function saveAnalyticsRecord(record: AnalyticsRecord) {
  try {
    const analytics = loadAnalytics();
    analytics.unshift(record);
    window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics.slice(0, 1000)));
  } catch (error) {
    console.error("Errore nel salvataggio del record analytics:", error);
  }
}

/**
 * Carica i record analytics
 */
export function loadAnalytics(): AnalyticsRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ANALYTICS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (error) {
    console.error("Errore nel caricamento degli analytics:", error);
    return [];
  }
}

/**
 * Aggiorna gli aggregati per un segmento
 */
export function updateAggregates(segmento: string) {
  try {
    const analytics = loadAnalytics();
    const segmentData = analytics.filter(a => a.segmento === segmento);
    
    if (segmentData.length === 0) return;

    const count = segmentData.length;
    const errore_medio = segmentData.reduce((a, x) => a + x.errore_assoluto, 0) / count;
    const errore_percentuale_medio = segmentData.reduce((a, x) => a + x.errore_percentuale, 0) / count;
    const accuracy_range = segmentData.filter(x => x.dentro_range).length / count;
    const acceptance_rate = segmentData.filter(x => x.outcome === "accettato").length / count;
    const avg_confidence = segmentData.reduce((a, x) => a + x.confidence, 0) / count;

    const metrics: AggregateMetrics = {
      segmento,
      count,
      errore_medio,
      errore_percentuale_medio,
      accuracy_range,
      acceptance_rate,
      avg_confidence,
      lastUpdated: Date.now(),
    };

    saveAggregates(metrics);
  } catch (error) {
    console.error("Errore nell'aggiornamento degli aggregati:", error);
  }
}

/**
 * Salva le metriche aggregate
 */
export function saveAggregates(metrics: AggregateMetrics) {
  try {
    const aggregates = loadAggregates();
    const idx = aggregates.findIndex(a => a.segmento === metrics.segmento);
    if (idx >= 0) {
      aggregates[idx] = metrics;
    } else {
      aggregates.push(metrics);
    }
    window.localStorage.setItem(AGGREGATES_KEY, JSON.stringify(aggregates));
  } catch (error) {
    console.error("Errore nel salvataggio degli aggregati:", error);
  }
}

/**
 * Carica le metriche aggregate
 */
export function loadAggregates(): AggregateMetrics[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AGGREGATES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (error) {
    console.error("Errore nel caricamento degli aggregati:", error);
    return [];
  }
}

/**
 * Calcola il peso di un record analytics per il feedback loop
 */
export function computeWeight(record: AnalyticsRecord): number {
  let weight = 1;
  if (record.outcome === "accettato") weight *= 1.5;
  if (record.outcome === "rifiutato") weight *= 0.5;
  if (record.confidence < 0.5) weight *= 0.7;
  return weight;
}

/**
 * Ottiene le metriche aggregate per un segmento
 */
export function getSegmentMetrics(segmento: string): AggregateMetrics | null {
  try {
    const aggregates = loadAggregates();
    return aggregates.find(a => a.segmento === segmento) || null;
  } catch (error) {
    console.error("Errore nel recupero delle metriche del segmento:", error);
    return null;
  }
}
