import { getFirestoreInstance, getCurrentUser } from "./firebase-service";
import { doc, collection, addDoc, setDoc, getDocs, query, orderBy, limit, Timestamp, deleteDoc } from "firebase/firestore";
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

  // Tracking & Analytics (Standardizzato 0-1)
  prezzo_suggerito?: number;
  prezzo_finale?: number;
  range_min?: number;
  range_max?: number;
  confidence?: number; // 0.0 - 1.0
  model_version?: string;
  segmento?: string;
  outcome?: "bozza" | "inviato" | "accettato" | "rifiutato" | "modificato";
  errore_assoluto?: number;
  errore_percentuale?: number;
  dentro_range?: boolean;
  ocrConfidence?: number;
  parserConfidence?: number;
  uid?: string;
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

/**
 * COMMIT 1: Firestore è l'unica sorgente di verità
 * localStorage è solo cache locale (read-only per i guest)
 */

/**
 * Carica i preventivi da Firestore (utenti loggati) o localStorage (guest)
 * FIRESTORE FIRST: Prova sempre il cloud prima del locale
 */
export async function loadArchive(): Promise<SavedQuote[]> {
  const user = getCurrentUser();
  const db = getFirestoreInstance();

  // Se loggato e Firestore disponibile: carica dal cloud
  if (user && db) {
    try {
      const col = collection(db, "users", user.uid, "quotes");
      const q = query(col, orderBy("updatedAt", "desc"), limit(100));
      const snap = await getDocs(q);
      const cloudQuotes = snap.docs.map(d => d.data() as SavedQuote);
      
      // Aggiorna cache locale
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEY, JSON.stringify(cloudQuotes));
      }
      return cloudQuotes;
    } catch (error) {
      console.error("Errore nel caricamento da Firestore:", error);
      // Fallback a cache locale
    }
  }

  // Guest o Firestore non disponibile: carica da localStorage (cache)
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (error) {
    console.error("Errore nel caricamento della cache locale:", error);
    return [];
  }
}

/**
 * Salva un preventivo su Firestore (sorgente primaria)
 * localStorage viene aggiornato solo come cache
 */
export async function saveQuote(q: SavedQuote) {
  const user = getCurrentUser();
  const db = getFirestoreInstance();
  const quoteWithUid = { ...q, uid: user?.uid || "guest" };

  try {
    // FIRESTORE FIRST: Se loggato, salva sempre su Firestore
    if (user && db) {
      const col = collection(db, "users", user.uid, "quotes");
      const quoteRef = doc(col, q.id);
      await setDoc(quoteRef, {
        ...quoteWithUid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else if (db) {
      // Guest: salva su collezione globale guest con uid "guest"
      const quoteRef = doc(db, "guests", "guest", "quotes", q.id);
      await setDoc(quoteRef, {
        ...quoteWithUid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Aggiorna cache locale (fallback per offline)
    if (typeof window !== "undefined") {
      const all = await loadArchive();
      const existingIdx = all.findIndex(item => item.id === q.id);
      if (existingIdx >= 0) {
        all[existingIdx] = quoteWithUid;
      } else {
        all.unshift(quoteWithUid);
      }
      window.localStorage.setItem(KEY, JSON.stringify(all.slice(0, 100)));
    }

    // Log evento
    logEvent(q.id ? "UPDATED" : "CREATED", q.id);
    
  } catch (error) {
    console.error("Errore nel salvataggio del preventivo:", error);
    throw new Error("Impossibile salvare il preventivo.");
  }
}

/**
 * Sincronizza i dati cloud con la cache locale
 */
export async function syncArchiveWithCloud(): Promise<SavedQuote[]> {
  const user = getCurrentUser();
  const db = getFirestoreInstance();

  if (!user || !db) return loadArchive();

  try {
    const col = collection(db, "users", user.uid, "quotes");
    const q = query(col, orderBy("updatedAt", "desc"), limit(100));
    const snap = await getDocs(q);
    const cloudQuotes = snap.docs.map(d => d.data() as SavedQuote);
    
    if (cloudQuotes.length > 0 && typeof window !== "undefined") {
      window.localStorage.setItem(KEY, JSON.stringify(cloudQuotes));
    }
    return cloudQuotes;
  } catch (error) {
    console.error("Errore sincronizzazione cloud:", error);
    return loadArchive();
  }
}

export async function deleteQuote(id: string) {
  const user = getCurrentUser();
  const db = getFirestoreInstance();

  try {
    // Firestore first
    if (user && db) {
      const quoteRef = doc(db, "users", user.uid, "quotes", id);
      await deleteDoc(quoteRef);
    } else if (db) {
      const quoteRef = doc(db, "guests", "guest", "quotes", id);
      await deleteDoc(quoteRef);
    }

    // Aggiorna cache locale
    if (typeof window !== "undefined") {
      const all = await loadArchive();
      const filtered = all.filter((q) => q.id !== id);
      window.localStorage.setItem(KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error("Errore nell'eliminazione del preventivo:", error);
    throw new Error("Impossibile eliminare il preventivo.");
  }
}

export function newId() {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

export async function getQuoteCount(): Promise<number> {
  const archive = await loadArchive();
  return archive.length;
}

export async function isGuestLimitReached(): Promise<boolean> {
  const user = getCurrentUser();
  if (user) return false; // Nessun limite per utenti loggati
  const count = await getQuoteCount();
  return count >= GUEST_QUOTE_LIMIT;
}

export async function calculateTotalArchive(): Promise<number> {
  const quotes = await loadArchive();
  return quotes.reduce((sum, q) => {
    const value = q.mode === "analizza" && q.receivedPrice 
      ? q.receivedPrice 
      : q.marketMid;
    return sum + value;
  }, 0);
}

// ⸻ TRACKING & ANALYTICS ⸻

/**
 * Salva un evento di tracking (Firestore se loggato, localStorage se guest)
 */
export async function logEvent(type: QuoteEvent["type"], preventivoId: string, payload: Record<string, any> = {}) {
  const user = getCurrentUser();
  const db = getFirestoreInstance();
  const event: QuoteEvent = {
    preventivoId,
    type,
    payload,
    timestamp: Date.now(),
    uid: user?.uid || "guest",
  };

  try {
    // Firestore: collezione globale events per aggregazione admin
    if (db) {
      await addDoc(collection(db, "events"), event);
    }

    // Local fallback per offline
    if (typeof window !== "undefined") {
      const events = loadEvents();
      events.unshift(event);
      window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(0, 500)));
    }
  } catch (error) {
    console.error("Errore nel logging evento:", error);
  }
}

export function loadEvents(): QuoteEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/**
 * Chiude un preventivo e genera un record analytics
 * STANDARDIZZATO: confidence 0-1, prezzi in number
 */
export async function closePreventivo(preventivo: SavedQuote) {
  const db = getFirestoreInstance();
  
  try {
    if (!preventivo.prezzo_suggerito || !preventivo.prezzo_finale || !preventivo.segmento) {
      return;
    }

    const errore_assoluto = Math.abs(preventivo.prezzo_finale - preventivo.prezzo_suggerito);
    const errore_percentuale = errore_assoluto / preventivo.prezzo_suggerito;
    const dentro_range = 
      preventivo.prezzo_finale >= (preventivo.range_min || 0) &&
      preventivo.prezzo_finale <= (preventivo.range_max || Infinity);

    const record: AnalyticsRecord = {
      preventivoId: preventivo.id,
      uid: getCurrentUser()?.uid || "guest",
      segmento: preventivo.segmento,
      prezzo_suggerito: preventivo.prezzo_suggerito,
      prezzo_finale: preventivo.prezzo_finale,
      errore_assoluto,
      errore_percentuale,
      dentro_range,
      outcome: preventivo.outcome || "bozza",
      confidence: preventivo.confidence || 0.5, // Sempre 0-1
      model_version: preventivo.model_version || "v1.0",
      createdAt: Date.now(),
    };

    // Salva record su Firestore
    if (db) {
      await setDoc(doc(db, "analytics", preventivo.id), record);
    }

    // Local cache
    if (typeof window !== "undefined") {
      const analytics = loadAnalytics();
      analytics.unshift(record);
      window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics.slice(0, 1000)));
    }

    logEvent("CLOSED", preventivo.id, { outcome: preventivo.outcome });
    updateAggregates(preventivo.segmento);
  } catch (error) {
    console.error("Errore nella chiusura del preventivo:", error);
  }
}

export function loadAnalytics(): AnalyticsRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

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

    // Save
    if (typeof window !== "undefined") {
      const aggregates = loadAggregates();
      const idx = aggregates.findIndex(a => a.segmento === metrics.segmento);
      if (idx >= 0) aggregates[idx] = metrics;
      else aggregates.push(metrics);
      window.localStorage.setItem(AGGREGATES_KEY, JSON.stringify(aggregates));
    }
    
  } catch (error) {
    console.error("Errore nell'aggiornamento degli aggregati:", error);
  }
}

export function loadAggregates(): AggregateMetrics[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AGGREGATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
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
