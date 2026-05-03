/**
 * Dataset Manager - Gestisce il dataset di preventivi validati
 * Salva quote validate per migliorare i modelli AI
 */

import type { Quote } from "../quote-model";
import { db } from "../firebase-service";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export interface DatasetEntry {
  id?: string;
  quoteId: string;
  userId: string;
  extractedText: string;
  parsedData: Record<string, any>;
  actualQuote: Quote;
  confidence: number;
  accuracy: number; // 0-100, quanto bene il parsing ha riconosciuto i dati
  timestamp: number;
  sector: string;
  region: string;
  validated: boolean;
}

/**
 * Salva una quote validata nel dataset
 */
export async function saveToDataset(
  quoteId: string,
  userId: string,
  extractedText: string,
  parsedData: Record<string, any>,
  actualQuote: Quote,
  confidence: number
): Promise<string | null> {
  try {
    const entry: DatasetEntry = {
      quoteId,
      userId,
      extractedText,
      parsedData,
      actualQuote,
      confidence,
      accuracy: 0, // Calcolato dopo la validazione
      timestamp: Date.now(),
      sector: actualQuote.sector,
      region: actualQuote.region,
      validated: true,
    };

    const docRef = await addDoc(collection(db, "datasets"), entry);
    return docRef.id;
  } catch (err) {
    console.error("Errore nel salvataggio del dataset:", err);
    return null;
  }
}

/**
 * Recupera dataset entries per un settore specifico
 */
export async function getDatasetByRegion(region: string): Promise<DatasetEntry[]> {
  try {
    const q = query(collection(db, "datasets"), where("region", "==", region));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as DatasetEntry));
  } catch (err) {
    console.error("Errore nel recupero del dataset:", err);
    return [];
  }
}

/**
 * Recupera dataset entries per un settore
 */
export async function getDatasetBySector(sector: string): Promise<DatasetEntry[]> {
  try {
    const q = query(collection(db, "datasets"), where("sector", "==", sector));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as DatasetEntry));
  } catch (err) {
    console.error("Errore nel recupero del dataset:", err);
    return [];
  }
}

/**
 * Aggiorna l'accuratezza di un entry del dataset
 */
export async function updateDatasetAccuracy(
  entryId: string,
  accuracy: number
): Promise<boolean> {
  try {
    await updateDoc(doc(db, "datasets", entryId), {
      accuracy: Math.min(100, Math.max(0, accuracy)),
    });
    return true;
  } catch (err) {
    console.error("Errore nell'aggiornamento dell'accuratezza:", err);
    return false;
  }
}

/**
 * Calcola statistiche del dataset
 */
export async function getDatasetStats(sector?: string): Promise<{
  totalEntries: number;
  averageConfidence: number;
  averageAccuracy: number;
  entriesBySector: Record<string, number>;
}> {
  try {
    let q;
    if (sector) {
      q = query(collection(db, "datasets"), where("sector", "==", sector));
    } else {
      q = query(collection(db, "datasets"));
    }

    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map((doc) => doc.data() as DatasetEntry);

    const totalEntries = entries.length;
    const averageConfidence =
      entries.reduce((sum, e) => sum + e.confidence, 0) / totalEntries || 0;
    const averageAccuracy = entries.reduce((sum, e) => sum + e.accuracy, 0) / totalEntries || 0;

    const entriesBySector: Record<string, number> = {};
    entries.forEach((e) => {
      entriesBySector[e.sector] = (entriesBySector[e.sector] || 0) + 1;
    });

    return {
      totalEntries,
      averageConfidence,
      averageAccuracy,
      entriesBySector,
    };
  } catch (err) {
    console.error("Errore nel calcolo delle statistiche:", err);
    return {
      totalEntries: 0,
      averageConfidence: 0,
      averageAccuracy: 0,
      entriesBySector: {},
    };
  }
}
