/**
 * Sistema di tracking, analytics e feedback loop per il modello AI
 * 
 * Architettura:
 * - Events: traccia ogni azione importante
 * - Analytics: registra metriche normalizzate
 * - Pipeline Batch: ricalcola i modelli calibrati periodicamente
 */

import type { SavedQuote } from "./storage";
import {
  logEvent,
  closePreventivo,
  loadAnalytics,
  loadAggregates,
  getSegmentMetrics,
  updateAggregates,
} from "./storage";
import { detectMarketDrift } from "./model-tuner";

/**
 * Interfaccia per il feedback del modello
 */
export interface ModelFeedback {
  segmento: string;
  acceptance_rate: number;
  errore_medio: number;
  errore_percentuale_medio: number;
  accuracy_range: number;
  avg_confidence: number;
  suggested_price_adjustment: number;
  suggested_range_expansion: number;
  data_count: number;
  confidence_level: "low" | "medium" | "high";
  drift_detected: boolean;
}

/**
 * Registra un evento di cambio stato preventivo
 */
export function trackQuoteStateChange(
  preventivo: SavedQuote,
  newState: SavedQuote["outcome"],
  reason?: string
) {
  try {
    logEvent(
      newState === "accettato" ? "ACCEPTED" :
      newState === "rifiutato" ? "REJECTED" :
      newState === "modificato" ? "MODIFIED" :
      newState === "inviato" ? "SENT" :
      "UPDATED",
      preventivo.id,
      { previousState: preventivo.outcome, reason }
    );
  } catch (error) {
    console.error("Errore nel tracking dello stato:", error);
  }
}

/**
 * Chiude un preventivo e genera feedback per il modello
 */
export function completeQuoteTracking(preventivo: SavedQuote) {
  try {
    closePreventivo(preventivo);
    // Trigger batch update immediato per demo/piccoli volumi
    runBatchSelfTuning();
  } catch (error) {
    console.error("Errore nel completamento del tracking:", error);
  }
}

/**
 * 🔁 PIPELINE SELF-TUNING (BATCH)
 * Ricalcola gli aggregati e rileva i drift per tutti i segmenti
 */
export function runBatchSelfTuning() {
  try {
    const analytics = loadAnalytics();
    const segments = Array.from(new Set(analytics.map(a => a.segmento)));
    
    console.log(`[Batch Tuning] Avvio ricalcolo per ${segments.length} segmenti...`);
    
    for (const segmento of segments) {
      updateAggregates(segmento);
      
      // Controllo drift
      const metrics = getSegmentMetrics(segmento);
      if (metrics) {
        const drift = detectMarketDrift(segmento, metrics.errore_medio);
        if (drift) {
          console.warn(`[Drift Detection] Rilevato cambio mercato nel segmento: ${segmento}`);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Errore nella pipeline batch:", error);
    return false;
  }
}

/**
 * Genera feedback per il modello basato su un segmento
 */
export function generateModelFeedback(segmento: string): ModelFeedback | null {
  try {
    const metrics = getSegmentMetrics(segmento);
    if (!metrics || metrics.count < 5) return null;

    const drift = detectMarketDrift(segmento, metrics.errore_medio);

    let confidence_level: "low" | "medium" | "high" = "low";
    if (metrics.count >= 50) confidence_level = "high";
    else if (metrics.count >= 20) confidence_level = "medium";

    let suggested_price_adjustment = 0;
    if (metrics.acceptance_rate < 0.45) suggested_price_adjustment = -0.08;
    else if (metrics.acceptance_rate > 0.85) suggested_price_adjustment = 0.04;

    let suggested_range_expansion = 0;
    if (metrics.accuracy_range < 0.65) suggested_range_expansion = 0.12;

    return {
      segmento,
      acceptance_rate: metrics.acceptance_rate,
      errore_medio: metrics.errore_medio,
      errore_percentuale_medio: metrics.errore_percentuale_medio,
      accuracy_range: metrics.accuracy_range,
      avg_confidence: metrics.avg_confidence,
      suggested_price_adjustment,
      suggested_range_expansion,
      data_count: metrics.count,
      confidence_level,
      drift_detected: drift,
    };
  } catch (error) {
    console.error("Errore nel feedback:", error);
    return null;
  }
}

/**
 * Ottiene i dati puri per il training del modello (solo PDF validati)
 */
export function getTrainingDataset() {
  try {
    const analytics = loadAnalytics();
    return analytics.filter(a => a.errore_percentuale < 0.4);
  } catch (error) {
    console.error("Errore nel dataset training:", error);
    return [];
  }
}

/**
 * Calcola le metriche di performance del modello per segmento
 */
export function getModelPerformanceBySegment() {
  try {
    const aggregates = loadAggregates();
    return aggregates.map(agg => ({
      segmento: agg.segmento,
      accuracy: agg.accuracy_range,
      acceptance_rate: agg.acceptance_rate,
      avg_error_pct: agg.errore_percentuale_medio,
      data_points: agg.count,
      last_updated: new Date(agg.lastUpdated).toISOString(),
      drift: detectMarketDrift(agg.segmento, agg.errore_percentuale_medio)
    }));
  } catch (error) {
    console.error("Errore nelle performance:", error);
    return [];
  }
}

/**
 * Pulisce i dati di tracking vecchi
 */
export function cleanupTrackingData(daysToKeep: number = 90) {
  try {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const analytics = loadAnalytics();
    const filtered = analytics.filter(a => a.createdAt > cutoffTime);
    
    if (filtered.length < analytics.length) {
      window.localStorage.setItem("preventivi-smart-analytics-v1", JSON.stringify(filtered));
    }
  } catch (error) {
    console.error("Errore nella pulizia:", error);
  }
}
