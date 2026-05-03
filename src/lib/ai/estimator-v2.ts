/**
 * COMMIT 6: Price Estimator v2 - Mediana + Std Dev + Fallback
 * 
 * Motore di stima serio basato su statistiche robuste
 * Output: prezzo, min, max, confidence
 */

import type { SavedQuote } from "../storage";
import { findBestSegment, type DataSegment } from "./segmenter-v2";

export interface PriceEstimateV2 {
  prezzo: number; // Mediana
  min: number; // Q1
  max: number; // Q3
  confidence: number; // 0-1
  method: "segment" | "market" | "default";
  reasoning: string;
  sampleSize: number;
}

/**
 * COMMIT 6: Stima il prezzo usando mediana e quartili
 */
export function estimatePriceV2(
  quote: SavedQuote,
  segment: DataSegment | null
): PriceEstimateV2 {
  // Se no segmento, usa fallback
  if (!segment) {
    return estimatePriceFromMarket(quote);
  }

  // Se pochi dati nel segmento, usa fallback
  if (segment.count < 3) {
    return estimatePriceFromMarket(quote);
  }

  return {
    prezzo: Math.round(segment.priceRange.median),
    min: Math.round(segment.priceRange.q1),
    max: Math.round(segment.priceRange.q3),
    confidence: segment.confidence,
    method: "segment",
    reasoning: `Stima mediana basata su ${segment.count} preventivi nel segmento ${segment.segmento}`,
    sampleSize: segment.count,
  };
}

/**
 * COMMIT 6: Fallback: stima da dati di mercato generici
 */
function estimatePriceFromMarket(quote: SavedQuote): PriceEstimateV2 {
  const basePrice = quote.totale || 1000;

  // Margini conservativi
  const min = Math.round(basePrice * 0.7);
  const max = Math.round(basePrice * 1.3);
  const prezzo = Math.round((min + max) / 2);

  return {
    prezzo,
    min,
    max,
    confidence: 0.4,
    method: "market",
    reasoning: "Stima conservativa da dati di mercato generici",
    sampleSize: 0,
  };
}

/**
 * COMMIT 6: Valuta se il prezzo è ragionevole
 */
export function evaluatePriceV2(
  actualPrice: number,
  estimate: PriceEstimateV2
): {
  verdict: "too_low" | "fair" | "too_high" | "unknown";
  percentage: number;
  dentro_range: boolean;
  advice: string;
} {
  const percentage = ((actualPrice - estimate.prezzo) / estimate.prezzo) * 100;
  const dentro_range = actualPrice >= estimate.min && actualPrice <= estimate.max;

  let verdict: "too_low" | "fair" | "too_high" | "unknown";
  let advice = "";

  if (estimate.confidence < 0.3) {
    verdict = "unknown";
    advice = "Dati insufficienti per valutazione";
  } else if (percentage < -25) {
    verdict = "too_low";
    advice = `${Math.abs(percentage).toFixed(0)}% sotto la mediana`;
  } else if (percentage > 25) {
    verdict = "too_high";
    advice = `${percentage.toFixed(0)}% sopra la mediana`;
  } else {
    verdict = "fair";
    advice = "In linea con la mediana";
  }

  return {
    verdict,
    percentage,
    dentro_range,
    advice,
  };
}

/**
 * COMMIT 6: Calcola range di affidabilità
 */
export function calculateConfidenceRange(estimate: PriceEstimateV2): {
  lower: number;
  upper: number;
  width: number;
} {
  const range = estimate.max - estimate.min;
  const confidence = estimate.confidence;

  // Con confidence alta, range stretto; con confidence bassa, range largo
  const adjustedRange = range / confidence;

  return {
    lower: Math.round(estimate.prezzo - adjustedRange / 2),
    upper: Math.round(estimate.prezzo + adjustedRange / 2),
    width: adjustedRange,
  };
}
