/**
 * Sistema di tracking, analytics e feedback loop per il modello AI
 * 
 * Architettura:
 * - Events: traccia ogni azione importante (CREATED, UPDATED, SENT, ACCEPTED, REJECTED, MODIFIED, CLOSED)
 * - Analytics: registra metriche normalizzate per ogni preventivo chiuso
 * - Aggregates: statistiche pre-calcolate per segmento
 * - Feedback: modifica i pesi del modello basato su outcome reale
 */

import type { SavedQuote, AnalyticsRecord, AggregateMetrics } from "./storage";
import {
  logEvent,
  closePreventivo,
  loadAnalytics,
  loadAggregates,
  getSegmentMetrics,
  computeWeight,
  updateAggregates,
} from "./storage";

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
  suggested_price_adjustment: number; // -1 to 1 (% adjustment)
  suggested_range_expansion: number; // 0 to 1 (% expansion)
  data_count: number;
  confidence_level: "low" | "medium" | "high";
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
  } catch (error) {
    console.error("Errore nel completamento del tracking:", error);
  }
}

/**
 * Genera feedback per il modello basato su un segmento
 */
export function generateModelFeedback(segmento: string): ModelFeedback | null {
  try {
    const metrics = getSegmentMetrics(segmento);
    if (!metrics || metrics.count < 5) {
      // Insufficienti dati per feedback affidabile
      return null;
    }

    // Determina il livello di confidenza basato sul numero di dati
    let confidence_level: "low" | "medium" | "high" = "low";
    if (metrics.count >= 50) confidence_level = "high";
    else if (metrics.count >= 20) confidence_level = "medium";

    // Calcola l'aggiustamento del prezzo suggerito
    let suggested_price_adjustment = 0;
    if (metrics.acceptance_rate < 0.5) {
      // Troppi rifiuti: prezzo troppo alto
      suggested_price_adjustment = -0.1;
    } else if (metrics.acceptance_rate > 0.8) {
      // Troppi accettati: potremmo aumentare il prezzo
      suggested_price_adjustment = 0.05;
    }

    // Calcola l'espansione del range suggerita
    let suggested_range_expansion = 0;
    if (metrics.accuracy_range < 0.7) {
      // Molti preventivi fuori range: allarga il range
      suggested_range_expansion = 0.15;
    }

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
    };
  } catch (error) {
    console.error("Errore nella generazione del feedback:", error);
    return null;
  }
}

/**
 * Ottiene i dati puri per il training del modello (solo PDF validati)
 */
export function getTrainingDataset() {
  try {
    const analytics = loadAnalytics();
    // Filtra solo i dati da PDF con alta qualità
    return analytics.filter(a => {
      // In futuro, quando avremo il campo source, filtreremo qui
      // Per ora, ritorniamo tutti i dati con errore ragionevole
      return a.errore_percentuale < 0.5; // Scarta outlier estremi
    });
  } catch (error) {
    console.error("Errore nel recupero del dataset di training:", error);
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
    }));
  } catch (error) {
    console.error("Errore nel calcolo delle performance:", error);
    return [];
  }
}

/**
 * Esporta i dati analytics per analisi esterna
 */
export function exportAnalyticsData() {
  try {
    const analytics = loadAnalytics();
    const aggregates = loadAggregates();
    
    return {
      timestamp: new Date().toISOString(),
      total_records: analytics.length,
      segments: aggregates.length,
      analytics: analytics.slice(0, 100), // Limita per evitare payload troppo grandi
      aggregates,
    };
  } catch (error) {
    console.error("Errore nell'esportazione dei dati:", error);
    return null;
  }
}

/**
 * Pulisce i dati di tracking (mantieni solo ultimi N mesi)
 */
export function cleanupTrackingData(daysToKeep: number = 90) {
  try {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const analytics = loadAnalytics();
    const filtered = analytics.filter(a => a.createdAt > cutoffTime);
    
    if (filtered.length < analytics.length) {
      window.localStorage.setItem("preventivi-smart-analytics-v1", JSON.stringify(filtered));
      console.log(`Cleanup: rimossi ${analytics.length - filtered.length} record vecchi`);
    }
  } catch (error) {
    console.error("Errore nella pulizia dei dati:", error);
  }
}
