/**
 * COMMIT 7: Analytics Core - Tracking e Feedback Loop
 * 
 * Salva analytics per ogni preventivo chiuso
 * Abilita il feedback loop per l'auto-miglioramento del modello
 */

import type { SavedQuote } from "./storage";
import { getFirestoreInstance } from "./firebase-service";
import { collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export interface AnalyticsEntry {
  id?: string;
  preventivoId: string;
  userId: string;
  segmento: string;
  prezzo_suggerito: number;
  prezzo_finale: number;
  errore_assoluto: number;
  errore_percentuale: number;
  dentro_range: boolean;
  outcome: string; // "accettato" | "rifiutato" | "modificato"
  confidence: number; // 0-1
  model_version: string;
  createdAt: number;
  timestamp: number;
}

/**
 * COMMIT 7: Registra analytics quando un preventivo viene chiuso
 */
export async function recordAnalytics(quote: SavedQuote): Promise<string | null> {
  // Valida i dati necessari
  if (!quote.prezzo_suggerito || !quote.prezzo_finale || !quote.segmento) {
    console.warn("Analytics: Dati insufficienti per registrare", quote.id);
    return null;
  }

  try {
    const db = getFirestoreInstance();
    if (!db) return null;

    const errore_assoluto = Math.abs(quote.prezzo_finale - quote.prezzo_suggerito);
    const errore_percentuale = errore_assoluto / quote.prezzo_suggerito;
    const dentro_range =
      quote.prezzo_finale >= (quote.range_min || 0) &&
      quote.prezzo_finale <= (quote.range_max || Infinity);

    const entry: Omit<AnalyticsEntry, "id"> = {
      preventivoId: quote.id,
      userId: quote.uid || "guest",
      segmento: quote.segmento,
      prezzo_suggerito: quote.prezzo_suggerito,
      prezzo_finale: quote.prezzo_finale,
      errore_assoluto,
      errore_percentuale,
      dentro_range,
      outcome: quote.outcome || "bozza",
      confidence: quote.confidence || 0.5,
      model_version: quote.model_version || "v1.0",
      createdAt: Date.now(),
      timestamp: Date.now(),
    };

    const docRef = await addDoc(collection(db, "analytics"), entry);
    console.log(`Analytics: Registrato entry ${docRef.id} per segmento ${quote.segmento}`);
    return docRef.id;
  } catch (err) {
    console.error("Errore nel registrare analytics:", err);
    return null;
  }
}

/**
 * COMMIT 7: Recupera analytics per un segmento
 */
export async function getAnalyticsBySegment(
  segmento: string,
  limit_: number = 100
): Promise<AnalyticsEntry[]> {
  try {
    const db = getFirestoreInstance();
    if (!db) return [];

    const q = query(
      collection(db, "analytics"),
      where("segmento", "==", segmento),
      orderBy("createdAt", "desc"),
      limit(limit_)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as AnalyticsEntry));
  } catch (err) {
    console.error("Errore nel recupero analytics per segmento:", err);
    return [];
  }
}

/**
 * COMMIT 7: Calcola metriche aggregate per un segmento
 */
export async function getSegmentMetrics(segmento: string): Promise<{
  count: number;
  errore_medio: number;
  errore_percentuale_medio: number;
  accuracy_range: number;
  acceptance_rate: number;
  avg_confidence: number;
}> {
  try {
    const analytics = await getAnalyticsBySegment(segmento, 1000);

    if (analytics.length === 0) {
      return {
        count: 0,
        errore_medio: 0,
        errore_percentuale_medio: 0,
        accuracy_range: 0,
        acceptance_rate: 0,
        avg_confidence: 0,
      };
    }

    const count = analytics.length;
    const errore_medio = analytics.reduce((a, x) => a + x.errore_assoluto, 0) / count;
    const errore_percentuale_medio = analytics.reduce((a, x) => a + x.errore_percentuale, 0) / count;
    const accuracy_range = analytics.filter((x) => x.dentro_range).length / count;
    const acceptance_rate = analytics.filter((x) => x.outcome === "accettato").length / count;
    const avg_confidence = analytics.reduce((a, x) => a + x.confidence, 0) / count;

    return {
      count,
      errore_medio,
      errore_percentuale_medio,
      accuracy_range,
      acceptance_rate,
      avg_confidence,
    };
  } catch (err) {
    console.error("Errore nel calcolo metriche:", err);
    return {
      count: 0,
      errore_medio: 0,
      errore_percentuale_medio: 0,
      accuracy_range: 0,
      acceptance_rate: 0,
      avg_confidence: 0,
    };
  }
}

/**
 * COMMIT 7: Recupera tutti i segmenti con analytics
 */
export async function getAllSegmentMetrics(): Promise<
  Record<
    string,
    {
      count: number;
      errore_medio: number;
      errore_percentuale_medio: number;
      accuracy_range: number;
      acceptance_rate: number;
      avg_confidence: number;
    }
  >
> {
  try {
    const db = getFirestoreInstance();
    if (!db) return {};

    const q = query(collection(db, "analytics"));
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map((doc) => doc.data() as AnalyticsEntry);

    const segmenti = new Set(entries.map((e) => e.segmento));
    const result: Record<string, any> = {};

    for (const segmento of segmenti) {
      const segmentAnalytics = entries.filter((e) => e.segmento === segmento);
      const count = segmentAnalytics.length;

      result[segmento] = {
        count,
        errore_medio: segmentAnalytics.reduce((a, x) => a + x.errore_assoluto, 0) / count,
        errore_percentuale_medio: segmentAnalytics.reduce((a, x) => a + x.errore_percentuale, 0) / count,
        accuracy_range: segmentAnalytics.filter((x) => x.dentro_range).length / count,
        acceptance_rate: segmentAnalytics.filter((x) => x.outcome === "accettato").length / count,
        avg_confidence: segmentAnalytics.reduce((a, x) => a + x.confidence, 0) / count,
      };
    }

    return result;
  } catch (err) {
    console.error("Errore nel recupero metriche globali:", err);
    return {};
  }
}
