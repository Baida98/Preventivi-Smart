/**
 * COMMIT 8: Self-Tuning Batch - Auto-miglioramento controllato
 * 
 * Script batch che legge analytics e aggiorna i modelli
 * Regole: errore alto → range più largo, acceptance bassa → prezzo più basso
 */

import { getFirestoreInstance } from "./firebase-service";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { getAllSegmentMetrics } from "./analytics-core";
import type { DataSegment } from "./ai/segmenter-v2";

export interface TuningUpdate {
  segmento: string;
  reason: string;
  adjustments: {
    priceAdjustment: number; // % da applicare
    rangeExpansion: number; // % da applicare
    confidenceAdjustment: number; // delta 0-1
  };
}

/**
 * COMMIT 8: Analizza le metriche e genera suggerimenti di tuning
 */
export async function analyzeTuningNeeds(): Promise<TuningUpdate[]> {
  const updates: TuningUpdate[] = [];
  const metrics = await getAllSegmentMetrics();

  for (const [segmento, data] of Object.entries(metrics)) {
    const reasons: string[] = [];
    let priceAdjustment = 0;
    let rangeExpansion = 0;
    let confidenceAdjustment = 0;

    // Regola 1: Errore percentuale alto → allarga il range
    if (data.errore_percentuale_medio > 0.20) {
      rangeExpansion = Math.min(0.20, data.errore_percentuale_medio * 0.5);
      reasons.push(`Errore ${(data.errore_percentuale_medio * 100).toFixed(0)}% → allarga range +${(rangeExpansion * 100).toFixed(0)}%`);
    }

    // Regola 2: Acceptance rate bassa → abbassa il prezzo suggerito
    if (data.acceptance_rate < 0.60 && data.count >= 10) {
      priceAdjustment = -0.03; // Abbassa del 3%
      reasons.push(`Acceptance ${(data.acceptance_rate * 100).toFixed(0)}% bassa → abbassa prezzo -3%`);
    }

    // Regola 3: Accuracy range bassa → riduci confidence
    if (data.accuracy_range < 0.50 && data.count >= 10) {
      confidenceAdjustment = -0.10;
      reasons.push(`Accuracy range ${(data.accuracy_range * 100).toFixed(0)}% bassa → confidence -0.10`);
    }

    // Regola 4: Molti dati → aumenta confidence
    if (data.count >= 50) {
      confidenceAdjustment = Math.min(0.10, (data.count - 50) * 0.001);
      reasons.push(`${data.count} campioni → confidence +${confidenceAdjustment.toFixed(2)}`);
    }

    if (reasons.length > 0) {
      updates.push({
        segmento,
        reason: reasons.join("; "),
        adjustments: {
          priceAdjustment,
          rangeExpansion,
          confidenceAdjustment,
        },
      });
    }
  }

  return updates;
}

/**
 * COMMIT 8: Applica gli aggiustamenti ai modelli (SAFE: non modifica dati storici)
 */
export async function applyTuningUpdates(updates: TuningUpdate[]): Promise<void> {
  const db = getFirestoreInstance();
  if (!db) return;

  for (const update of updates) {
    try {
      // Salva il tuning update in una collezione separata (audit trail)
      const tuningRef = collection(db, "tuning_history");
      await updateDoc(doc(tuningRef, update.segmento), {
        lastUpdated: Date.now(),
        adjustments: update.adjustments,
        reason: update.reason,
      }).catch(() => {
        // Se il doc non esiste, lo crea
        const newDoc = doc(tuningRef, `${update.segmento}_${Date.now()}`);
        return updateDoc(newDoc, {
          segmento: update.segmento,
          createdAt: Date.now(),
          adjustments: update.adjustments,
          reason: update.reason,
        });
      });

      console.log(`Tuning: Applicato aggiustamento per ${update.segmento}`);
    } catch (err) {
      console.error(`Errore nell'applicare tuning per ${update.segmento}:`, err);
    }
  }
}

/**
 * COMMIT 8: Pipeline batch completa (da eseguire giornalmente)
 */
export async function runDailyTuningBatch(): Promise<{
  success: boolean;
  updates: TuningUpdate[];
  timestamp: number;
}> {
  console.log("🔄 Inizio batch tuning...");

  try {
    // Analizza le metriche
    const updates = await analyzeTuningNeeds();
    console.log(`📊 Analisi completata: ${updates.length} aggiustamenti suggeriti`);

    // Applica gli aggiustamenti
    await applyTuningUpdates(updates);
    console.log("✅ Tuning batch completato");

    return {
      success: true,
      updates,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error("❌ Errore nel batch tuning:", err);
    return {
      success: false,
      updates: [],
      timestamp: Date.now(),
    };
  }
}

/**
 * COMMIT 8: Recupera la storia dei tuning per un segmento
 */
export async function getTuningHistory(segmento: string): Promise<any[]> {
  try {
    const db = getFirestoreInstance();
    if (!db) return [];

    const q = query(
      collection(db, "tuning_history"),
      where("segmento", "==", segmento)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Errore nel recupero della storia tuning:", err);
    return [];
  }
}
