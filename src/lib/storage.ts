// src/lib/storage.ts
import { getFirestoreInstance, getCurrentUser } from "./firebase-service";
import { doc, collection, addDoc, setDoc, getDocs, query, orderBy, limit, Timestamp, deleteDoc } from "firebase/firestore";
import CryptoJS from 'crypto-js';
import type { VerdictKey } from "./verdict";

const KEY = "preventivi-smart-archive-v1";
export const GUEST_QUOTE_LIMIT = 5;
export const FIREBASE_ENABLED = import.meta.env.VITE_FIREBASE_ENABLED === 'true';

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

  // Tracking & Analytics
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
  uid?: string;
  fingerprint?: string;     // ← Aggiunto dal pattern AI
  deviceId?: string;        // ← Aggiunto dal pattern AI
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

// ==================== MEMORY SYNC PROTOCOL (dal repo AI) ====================
function generateFingerprint(quote: Partial<SavedQuote>): string {
  const keyData = {
    id: quote.id,
    receivedPrice: quote.receivedPrice,
    marketMin: quote.marketMin,
    marketMax: quote.marketMax,
    totale: quote.totale,
    updatedAt: quote.updatedAt,
    jobId: quote.jobId,
    fieldValues: quote.fieldValues,
  };
  return CryptoJS.SHA256(JSON.stringify(keyData)).toString();
}

const DEVICE_ID = `device_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;

// ==================== FUNZIONI PRINCIPALI ====================

export async function loadArchive(): Promise<SavedQuote[]> {
  const user = getCurrentUser();
  const db = getFirestoreInstance();

  if (FIREBASE_ENABLED && user && db) {
    try {
      const col = collection(db, "users", user.uid, "quotes");
      const q = query(col, orderBy("updatedAt", "desc"), limit(100));
      const snap = await getDocs(q);
      const cloudQuotes = snap.docs.map(d => d.data() as SavedQuote);
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEY, JSON.stringify(cloudQuotes));
      }
      return cloudQuotes;
    } catch (error) {
      console.error("Errore nel caricamento da Firestore:", error);
    }
  }

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

export async function saveQuote(q: SavedQuote) {
  const user = getCurrentUser();
  const db = getFirestoreInstance();
  
  const fingerprint = generateFingerprint(q);
  const quoteWithMeta = {
    ...q,
    fingerprint,
    deviceId: DEVICE_ID,
    updatedAt: new Date().toISOString(),
    uid: user?.uid || "guest"
  };

  try {
    if (FIREBASE_ENABLED && db) {
      let quoteRef;
      if (user) {
        const col = collection(db, "users", user.uid, "quotes");
        quoteRef = doc(col, q.id);
      } else {
        quoteRef = doc(db, "guests", "guest", "quotes", q.id);
      }
      await setDoc(quoteRef, quoteWithMeta, { merge: true });
    }

    if (typeof window !== "undefined") {
      const all = await loadArchive();
      const existingIdx = all.findIndex(item => item.id === q.id);
      if (existingIdx >= 0) {
        all[existingIdx] = quoteWithMeta;
      } else {
        all.unshift(quoteWithMeta);
      }
      window.localStorage.setItem(KEY, JSON.stringify(all.slice(0, 100)));
    }

    logEvent(q.id ? "UPDATED" : "CREATED", q.id);
  } catch (error) {
    console.error("Errore nel salvataggio del preventivo:", error);
    throw new Error("Impossibile salvare il preventivo.");
  }
}

export async function syncArchiveWithCloud(): Promise<SavedQuote[]> {
  const user = getCurrentUser();
  const db = getFirestoreInstance();

  if (!FIREBASE_ENABLED || !user || !db) return loadArchive();

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
    if (FIREBASE_ENABLED && db) {
      let quoteRef;
      if (user) {
        quoteRef = doc(db, "users", user.uid, "quotes", id);
      } else {
        quoteRef = doc(db, "guests", "guest", "quotes", id);
      }
      await deleteDoc(quoteRef);
    }

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
  if (user) return false;
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

// TRACKING & ANALYTICS (invariate)
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
    if (FIREBASE_ENABLED && db) {
      await addDoc(collection(db, "events"), event);
    }

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
      confidence: preventivo.confidence || 0.5,
      model_version: preventivo.model_version || "v1.0",
      createdAt: Date.now(),
    };

    if (db) {
      await setDoc(doc(db, "analytics", preventivo.id), record);
    }

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

export function getSegmentMetrics(segmento: string): AggregateMetrics | null {
  try {
    const aggregates = loadAggregates();
    return aggregates.find(a => a.segmento === segmento) || null;
  } catch (error) {
    console.error("Errore nel recupero delle metriche del segmento:", error);
    return null;
  }
}
