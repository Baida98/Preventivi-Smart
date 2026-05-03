/**
 * Sistema di self-tuning del modello AI
 * 
 * Adatta automaticamente i prezzi suggeriti e i range basati su feedback reale
 * Mantiene il dataset puro (solo PDF) mentre usa il feedback per aggiustare i pesi
 */

import type { MarketAnalysis } from "./pricing";
import { loadAnalytics, getSegmentMetrics, computeWeight } from "./storage";

export interface TuningParams {
  base_price: number;
  min_price: number;
  max_price: number;
  confidence: number;
}

export interface TuningResult {
  adjusted_price: number;
  adjusted_min: number;
  adjusted_max: number;
  adjusted_confidence: number;
  tuning_applied: boolean;
  reason: string;
}

/**
 * Applica il self-tuning a un'analisi di mercato basata su feedback
 */
export function applyModelTuning(
  analysis: MarketAnalysis,
  segmento: string
): TuningResult {
  try {
    const metrics = getSegmentMetrics(segmento);
    
    if (!metrics || metrics.count < 5) {
      // Insufficienti dati per tuning
      return {
        adjusted_price: analysis.marketMid,
        adjusted_min: analysis.marketMin,
        adjusted_max: analysis.marketMax,
        adjusted_confidence: analysis.confidence,
        tuning_applied: false,
        reason: "Dati insufficienti per tuning (< 5 record)",
      };
    }

    let adjusted_price = analysis.marketMid;
    let adjusted_min = analysis.marketMin;
    let adjusted_max = analysis.marketMax;
    let adjusted_confidence = analysis.confidence;
    let tuning_applied = false;
    let reason = "";

    // 1. Aggiusta il prezzo basato sul tasso di accettazione
    if (metrics.acceptance_rate < 0.5) {
      // Troppi rifiuti: il prezzo è troppo alto
      const reduction = 0.1 * (1 - metrics.acceptance_rate);
      adjusted_price = analysis.marketMid * (1 - reduction);
      tuning_applied = true;
      reason += `Prezzo ridotto del ${Math.round(reduction * 100)}% (basso tasso accettazione). `;
    } else if (metrics.acceptance_rate > 0.85) {
      // Quasi tutti accettati: potremmo aumentare il prezzo
      const increase = 0.05 * (metrics.acceptance_rate - 0.8);
      adjusted_price = analysis.marketMid * (1 + increase);
      tuning_applied = true;
      reason += `Prezzo aumentato del ${Math.round(increase * 100)}% (alto tasso accettazione). `;
    }

    // 2. Espandi il range se molti preventivi cadono fuori
    if (metrics.accuracy_range < 0.7) {
      const expansion = 0.15 * (1 - metrics.accuracy_range);
      adjusted_min = adjusted_price * (1 - (analysis.marketMid - analysis.marketMin) / analysis.marketMid * (1 + expansion));
      adjusted_max = adjusted_price * (1 + (analysis.marketMax - analysis.marketMid) / analysis.marketMid * (1 + expansion));
      tuning_applied = true;
      reason += `Range espanso del ${Math.round(expansion * 100)}% (bassa accuracy). `;
    }

    // 3. Aggiusta la confidenza basata su errore medio
    if (metrics.errore_percentuale_medio > 0.3) {
      // Errore alto: riduci la confidenza
      adjusted_confidence = Math.max(0.3, analysis.confidence * (1 - metrics.errore_percentuale_medio));
      tuning_applied = true;
      reason += `Confidenza ridotta (errore medio ${Math.round(metrics.errore_percentuale_medio * 100)}%). `;
    } else if (metrics.errore_percentuale_medio < 0.1 && metrics.count >= 20) {
      // Errore basso con molti dati: aumenta la confidenza
      adjusted_confidence = Math.min(0.95, analysis.confidence * 1.1);
      tuning_applied = true;
      reason += `Confidenza aumentata (errore medio basso). `;
    }

    return {
      adjusted_price,
      adjusted_min,
      adjusted_max,
      adjusted_confidence,
      tuning_applied,
      reason: reason.trim() || "Nessun tuning necessario",
    };
  } catch (error) {
    console.error("Errore nell'applicazione del tuning:", error);
    return {
      adjusted_price: analysis.marketMid,
      adjusted_min: analysis.marketMin,
      adjusted_max: analysis.marketMax,
      adjusted_confidence: analysis.confidence,
      tuning_applied: false,
      reason: "Errore nel tuning",
    };
  }
}

/**
 * Calcola i pesi per il training del modello da feedback
 */
export function computeTrainingWeights(segmento: string): Record<string, number> {
  try {
    const analytics = loadAnalytics();
    const segmentData = analytics.filter(a => a.segmento === segmento);

    if (segmentData.length === 0) {
      return { base_weight: 1.0 };
    }

    // Calcola il peso medio per outcome
    const weights: Record<string, number> = {
      accettato: 1.5,
      rifiutato: 0.5,
      modificato: 0.8,
      bozza: 0.3,
    };

    // Aggiusta i pesi basati su errore
    const avgError = segmentData.reduce((a, x) => a + x.errore_percentuale, 0) / segmentData.length;
    const errorFactor = Math.max(0.5, 1 - avgError);

    // Calcola il peso composito per ogni record
    const compositeWeights = segmentData.map(record => {
      const baseWeight = weights[record.outcome] || 1.0;
      const confidenceWeight = record.confidence;
      const errorWeight = errorFactor;
      return baseWeight * confidenceWeight * errorWeight;
    });

    // Normalizza i pesi
    const maxWeight = Math.max(...compositeWeights);
    const normalizedWeights = compositeWeights.map(w => w / maxWeight);

    return {
      base_weight: normalizedWeights.reduce((a, w) => a + w, 0) / normalizedWeights.length,
      error_factor: errorFactor,
      confidence_avg: segmentData.reduce((a, x) => a + x.confidence, 0) / segmentData.length,
    };
  } catch (error) {
    console.error("Errore nel calcolo dei pesi:", error);
    return { base_weight: 1.0 };
  }
}

/**
 * Genera una versione aggiornata del modello con i nuovi pesi
 */
export function generateModelUpdate(segmento: string) {
  try {
    const metrics = getSegmentMetrics(segmento);
    const weights = computeTrainingWeights(segmento);

    if (!metrics) {
      return null;
    }

    return {
      timestamp: new Date().toISOString(),
      segmento,
      model_version: `v${Date.now()}`,
      metrics: {
        accuracy: metrics.accuracy_range,
        acceptance_rate: metrics.acceptance_rate,
        avg_error: metrics.errore_percentuale_medio,
        data_points: metrics.count,
      },
      weights,
      recommendations: generateRecommendations(metrics),
    };
  } catch (error) {
    console.error("Errore nella generazione dell'update del modello:", error);
    return null;
  }
}

/**
 * Genera raccomandazioni per il miglioramento del modello
 */
function generateRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];

  if (metrics.accuracy_range < 0.6) {
    recommendations.push("Accuracy bassa: considera di ampliare il range di prezzo");
  }

  if (metrics.acceptance_rate < 0.5) {
    recommendations.push("Tasso di accettazione basso: i prezzi suggeriti potrebbero essere troppo alti");
  }

  if (metrics.errore_percentuale_medio > 0.25) {
    recommendations.push("Errore medio alto: raccogli più dati PDF validati per questo segmento");
  }

  if (metrics.count < 10) {
    recommendations.push("Dati insufficienti: accumula almeno 10 record prima di fare tuning aggressivo");
  }

  if (metrics.accuracy_range > 0.85 && metrics.acceptance_rate > 0.8) {
    recommendations.push("Modello performante: considera di aumentare leggermente i prezzi suggeriti");
  }

  return recommendations;
}

/**
 * Esporta i dati di tuning per audit e debugging
 */
export function exportTuningData() {
  try {
    const analytics = loadAnalytics();
    const segments = new Set(analytics.map(a => a.segmento));

    const tuningData = Array.from(segments).map(seg => {
      const update = generateModelUpdate(seg);
      return update;
    });

    return {
      timestamp: new Date().toISOString(),
      total_segments: tuningData.length,
      updates: tuningData.filter(Boolean),
    };
  } catch (error) {
    console.error("Errore nell'esportazione dei dati di tuning:", error);
    return null;
  }
}
