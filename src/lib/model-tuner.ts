/**
   * @module model-tuner
   * @description Sistema di self-tuning adattivo del modello di pricing.
   *
   * ## Come funziona
   *
   * Il tuner opera in tre fasi:
   *
   * ### 1. Pesi Dinamici (computeDynamicWeight)
   * Ogni record storico riceve un peso w ∈ [0, 1] basato su:
   * - **Qualità del dato**: `qualityScore / 100` (proviene dall'OCR pipeline)
   * - **Esito reale** (outcome weighting):
   *   - `accettato` → ×1.4 (dato più affidabile)
   *   - `modificato` → ×0.8
   *   - `rifiutato` → ×0.6
   * - **Recency decay**: `exp(-giorni / 180)` — il peso si dimezza ogni ~180 giorni
   *
   * ### 2. Calibrazione (calibrateModel)
   * Aggiusta `marketMid`, `marketMin`, `marketMax` e `confidence` basandosi
   * sulle metriche aggregate del segmento (categoria × regione):
   * - Se `errore_percentuale_medio > 0.20` → allarga range proporzionalmente
   * - Se `accuracy_range < 0.60` → espande range del ±10%
   * - Se `acceptance_rate < 0.45` → abbassa prezzo suggerito del 5%
   * - Se `acceptance_rate > 0.80` → alza prezzo del 3%
   *
   * **Limite di distorsione**: ogni aggiustamento è capped a ±30% rispetto
   * al valore originale per evitare derive incontrollate del modello.
   *
   * ### 3. Drift Detection (detectMarketDrift)
   * Confronta la mediana degli ultimi 10 record con il valore corrente.
   * Se lo scostamento supera il 25% segnala un cambio strutturale di mercato.
   *
   * ## Segmento
   * Il segmento è la chiave `{categoryId}_{regionId}` usata per raggruppare
   * i dati storici (es. `edilizia_lombardia`).
   *
   * ## Few-shot fallback
   * Se il segmento ha meno di 5 record, il tuner allarga il range del ±10%
   * e riduce la confidence dell'20% per segnalare incertezza alta.
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

  /** Massima distorsione ammessa rispetto al valore originale (±30%) */
  const MAX_DISTORTION = 0.30;

  /**
   * Applica il cap di distorsione: impedisce che il valore aggiustato
   * si allontani più di MAX_DISTORTION (30%) dal valore originale.
   */
  function clampDistortion(adjusted: number, original: number): number {
    const maxVal = original * (1 + MAX_DISTORTION);
    const minVal = original * (1 - MAX_DISTORTION);
    return Math.min(maxVal, Math.max(minVal, adjusted));
  }

  /**
   * 1) SISTEMA DI PESI DINAMICI (Weighting)
   *
   * Calcola il peso di un singolo record nel modello.
   *
   * @param record - Record storico con campi: qualityScore, outcome, createdAt
   * @returns Peso w ∈ [0, ~1.4] (può superare 1 per record di alta qualità recenti)
   */
  export function computeDynamicWeight(record: {
    qualityScore?: number;
    outcome?: "accettato" | "rifiutato" | "modificato";
    createdAt: number;
  }): number {
    let w = 1.0;

    // Qualità del dato (PDF quality score 0–100)
    if (record.qualityScore) {
      w *= record.qualityScore / 100;
    }

    // Esito reale (Outcome weighting)
    if (record.outcome === "accettato") w *= 1.4;
    if (record.outcome === "rifiutato") w *= 0.6;
    if (record.outcome === "modificato") w *= 0.8;

    // Recency Decay: dimezza il peso ogni 180 giorni
    const ageDays = (Date.now() - record.createdAt) / (1000 * 60 * 60 * 24);
    const decay = Math.exp(-ageDays / 180);
    w *= decay;

    return w;
  }

  /**
   * 2) CALIBRAZIONE MODELLO (Calibration)
   *
   * Applica le metriche di segmento per calibrare i parametri base.
   * Ogni aggiustamento è limitato a ±30% del valore originale (MAX_DISTORTION).
   *
   * @param analysis - Analisi di mercato corrente
   * @param metrics  - Metriche aggregate del segmento (da getSegmentMetrics)
   * @returns TuningResult con valori aggiustati e log delle ragioni
   */
  export function calibrateModel(analysis: MarketAnalysis, metrics: {
    count: number;
    errore_percentuale_medio: number;
    accuracy_range: number;
    acceptance_rate: number;
    errore_medio?: number;
  }): TuningResult {
    let median = analysis.marketMid;
    let min = analysis.marketMin;
    let max = analysis.marketMax;
    let confidence = analysis.confidence;
    let applied = false;
    const reasons: string[] = [];

    // Errore alto → Allarga range (Std expansion)
    if (metrics.errore_percentuale_medio > 0.2) {
      const expansion = 1 + metrics.errore_percentuale_medio * 0.5;
      min = median - (median - min) * expansion;
      max = median + (max - median) * expansion;
      applied = true;
      reasons.push(`Range espanso (errore medio ${Math.round(metrics.errore_percentuale_medio * 100)}%)`);
    }

    // Bassa accuracy → Allarga range
    if (metrics.accuracy_range < 0.6) {
      min *= 0.9;
      max *= 1.1;
      applied = true;
      reasons.push("Range calibrato per bassa accuracy");
    }

    // Bassa acceptance → Abbassa prezzo suggerito
    if (metrics.acceptance_rate < 0.45) {
      median *= 0.95;
      applied = true;
      reasons.push("Prezzo calibrato al ribasso (bassa accettazione)");
    }

    // Alta acceptance → Leggero aumento
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

    // CAP: nessun valore può discostarsi più di MAX_DISTORTION dall'originale
    median = clampDistortion(median, analysis.marketMid);
    min = clampDistortion(min, analysis.marketMin);
    max = clampDistortion(max, analysis.marketMax);

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
   *
   * Rileva se i nuovi dati indicano un cambiamento strutturale del mercato
   * confrontando la mediana degli ultimi 10 record con il valore corrente.
   *
   * @param segmento      - Chiave segmento (es. "edilizia_lombardia")
   * @param currentMedian - Valore mediano corrente del modello
   * @returns true se è stato rilevato un drift > 25%
   */
  export function detectMarketDrift(segmento: string, currentMedian: number): boolean {
    const analytics = loadAnalytics();
    const recentData = analytics
      .filter((a) => a.segmento === segmento)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    if (recentData.length < 5) return false;

    const recentMedian = recentData.reduce((a, b) => a + b.prezzo_finale, 0) / recentData.length;
    const drift = Math.abs(recentMedian - currentMedian) / currentMedian;

    return drift > 0.25; // Drift rilevato se scostamento > 25%
  }

  /**
   * Entry point per l'applicazione del tuning.
   *
   * @param analysis  - Analisi di mercato da calibrare
   * @param segmento  - Chiave segmento (es. "edilizia_lombardia")
   * @returns TuningResult con valori aggiustati (distorsione massima ±30%)
   */
  export function applyModelTuning(
    analysis: MarketAnalysis,
    segmento: string
  ): TuningResult {
    try {
      const metrics = getSegmentMetrics(segmento);

      // Few-shot fallback: dati insufficienti per calibrazione puntuale
      if (!metrics || metrics.count < 5) {
        return {
          adjusted_price: analysis.marketMid,
          adjusted_min: analysis.marketMin * 0.9,  // Range più largo per incertezza
          adjusted_max: analysis.marketMax * 1.1,
          adjusted_confidence: analysis.confidence * 0.8,
          tuning_applied: true,
          reason: "Fallback: dati insufficienti per calibrazione puntuale",
        };
      }

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
   * Esporta report di performance per la dashboard analytics.
   *
   * @returns Array di oggetti con metriche per ogni segmento attivo
   */
  export function getModelPerformanceReport() {
    const analytics = loadAnalytics();
    const segments = Array.from(new Set(analytics.map((a) => a.segmento)));

    return segments.map((seg) => {
      const metrics = getSegmentMetrics(seg);
      const drift = detectMarketDrift(seg, metrics?.errore_medio || 0);
      return {
        segmento: seg,
        metrics,
        drift_detected: drift,
        status: (metrics?.accuracy_range || 0) > 0.8 ? "stable" : "learning",
      };
    });
  }
  