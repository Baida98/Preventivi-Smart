/**
 * Sistema di self-tuning avanzato del modello AI
 * 
 * Basato su:
 * - PDF-only training (dataset puro)
 * - Weighting dinamico (accettazione, qualità, recency)
 * - Calibrazione automatica dei range
 * - Drift detection (rilevamento cambi mercato)
 */

import type { MarketAnalysis } from "./pricing";
import { loadAnalytics, getSegmentMetrics } from "./storage";

export interface TuningResult {
  adjusted_price: number;
  adjusted_min: number;
  adjusted_max: number;
  adjusted_confidence: number;
  tuning_applied: boolean;
  reason: string;
}

/**
 * 1) SISTEMA DI PESI DINAMICI (Weighting)
 * Calcola il peso di un singolo record nel modello
 */
export function computeDynamicWeight(record: any) {
  let w = 1.0;
  
  // Qualità del dato (PDF quality score)
  if (record.qualityScore) {
    w *= (record.qualityScore / 100);
  }
  
  // Esito reale (Outcome weighting)
  if (record.outcome === "accettato") w *= 1.4;
  if (record.outcome === "rifiutato") w *= 0.6;
  if (record.outcome === "modificato") w *= 0.8;
  
  // Recency Decay (più recente = più peso)
  // Dimezza il peso ogni 180 giorni
  const ageDays = (Date.now() - record.createdAt) / (1000 * 60 * 60 * 24);
  const decay = Math.exp(-ageDays / 180);
  w *= decay;
  
  return w;
}

/**
 * 2) CALIBRAZIONE MODELLO (Calibration)
 * Applica le metriche di segmento per calibrare i parametri base
 */
export function calibrateModel(analysis: MarketAnalysis, metrics: any): TuningResult {
  let median = analysis.marketMid;
  let min = analysis.marketMin;
  let max = analysis.marketMax;
  let confidence = analysis.confidence;
  let applied = false;
  let reasons: string[] = [];

  // Errore alto -> Allarga range (Std expansion)
  if (metrics.errore_percentuale_medio > 0.2) {
    const expansion = 1 + (metrics.errore_percentuale_medio * 0.5);
    min = median - (median - min) * expansion;
    max = median + (max - median) * expansion;
    applied = true;
    reasons.push(`Range espanso (errore medio ${Math.round(metrics.errore_percentuale_medio * 100)}%)`);
  }

  // Bassa accuracy -> Allarga range
  if (metrics.accuracy_range < 0.6) {
    min *= 0.9;
    max *= 1.1;
    applied = true;
    reasons.push("Range calibrato per bassa accuracy");
  }

  // Bassa acceptance -> Abbassa prezzo suggerito
  if (metrics.acceptance_rate < 0.45) {
    median *= 0.95;
    applied = true;
    reasons.push("Prezzo calibrato al ribasso (bassa accettazione)");
  }
  
  // Alta acceptance -> Leggero aumento
  if (metrics.acceptance_rate > 0.8) {
    median *= 1.03;
    applied = true;
    reasons.push("Ottimizzazione margine (alta accettazione)");
  }

  // Aggiusta confidenza basata su volume dati e errore
  if (metrics.count >= 20 && metrics.errore_percentuale_medio < 0.15) {
    confidence = Math.min(0.98, confidence * 1.1);
  } else if (metrics.errore_percentuale_medio > 0.3) {
    confidence *= 0.8;
  }

  return {
    adjusted_price: median,
    adjusted_min: min,
    adjusted_max: max,
    adjusted_confidence: confidence,
    tuning_applied: applied,
    reason: reasons.join(", ") || "Nessun tuning necessario",
  };
}

/**
 * 3) DRIFT DETECTION (Cambi Mercato)
 * Rileva se i nuovi dati indicano un cambiamento strutturale del mercato
 */
export function detectMarketDrift(segmento: string, currentMedian: number): boolean {
  const analytics = loadAnalytics();
  const recentData = analytics
    .filter(a => a.segmento === segmento)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  if (recentData.length < 5) return false;

  const recentMedian = recentData.reduce((a, b) => a + b.prezzo_finale, 0) / recentData.length;
  const drift = Math.abs(recentMedian - currentMedian) / currentMedian;

  return drift > 0.25; // Drift rilevato se scostamento > 25%
}

/**
 * Entry point per l'applicazione del tuning
 */
export function applyModelTuning(
  analysis: MarketAnalysis,
  segmento: string
): TuningResult {
  try {
    const metrics = getSegmentMetrics(segmento);
    
    // Gestione segmenti deboli (Few-shot fallback)
    if (!metrics || metrics.count < 5) {
      return {
        adjusted_price: analysis.marketMid,
        adjusted_min: analysis.marketMin * 0.9, // Range più largo per incertezza
        adjusted_max: analysis.marketMax * 1.1,
        adjusted_confidence: analysis.confidence * 0.8,
        tuning_applied: true,
        reason: "Fallback: dati insufficienti per calibrazione puntuale",
      };
    }

    // Calibrazione batch basata su metriche reali
    return calibrateModel(analysis, metrics);
    
  } catch (error) {
    console.error("Errore nel tuning:", error);
    return {
      adjusted_price: analysis.marketMid,
      adjusted_min: analysis.marketMin,
      adjusted_max: analysis.marketMax,
      adjusted_confidence: analysis.confidence,
      tuning_applied: false,
      reason: "Errore interno tuning",
    };
  }
}

/**
 * Esporta report di performance per la dashboard
 */
export function getModelPerformanceReport() {
  const analytics = loadAnalytics();
  const segments = Array.from(new Set(analytics.map(a => a.segmento)));
  
  return segments.map(seg => {
    const metrics = getSegmentMetrics(seg);
    const drift = detectMarketDrift(seg, metrics?.errore_medio || 0); // placeholder per median reale
    return {
      segmento: seg,
      metrics,
      drift_detected: drift,
      status: (metrics?.accuracy_range || 0) > 0.8 ? "stable" : "learning"
    };
  });
}
