/**
 * Price Estimator - Stima i prezzi basati su dati storici
 * Utilizza segmentazione e analisi statistica
 */

import type { Quote } from "../quote-model";
import { segmentQuotes, findBestSegment, determineComplexity } from "./segmenter";

export interface PriceEstimate {
  estimatedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number; // 0-100
  method: "segment" | "market" | "default";
  reasoning: string;
}

/**
 * Stima il prezzo di una quote basato su dati storici
 */
export function estimatePrice(
  quote: Partial<Quote>,
  historicalQuotes: Partial<Quote>[]
): PriceEstimate {
  // Se non ci sono dati storici, usa il prezzo di mercato
  if (historicalQuotes.length === 0) {
    return estimatePriceFromMarket(quote);
  }

  // Segmenta i dati storici
  const segments = segmentQuotes(historicalQuotes);

  // Trova il segmento migliore
  const segment = findBestSegment(quote, segments);

  if (!segment) {
    return estimatePriceFromMarket(quote);
  }

  // Calcola stima basata sul segmento
  const complexity = determineComplexity(quote);
  const complexityMultiplier = {
    low: 0.8,
    medium: 1.0,
    high: 1.3,
  }[complexity];

  const basePrice = segment.priceRange.average;
  const estimatedPrice = basePrice * complexityMultiplier;

  return {
    estimatedPrice: Math.round(estimatedPrice),
    minPrice: Math.round(segment.priceRange.min * 0.9),
    maxPrice: Math.round(segment.priceRange.max * 1.1),
    confidence: segment.confidence,
    method: "segment",
    reasoning: `Stima basata su ${segment.sampleSize} preventivi simili nel ${quote.ambito} in ${quote.regionLabel}`,
  };
}

/**
 * Stima il prezzo basato su dati di mercato
 */
function estimatePriceFromMarket(quote: Partial<Quote>): PriceEstimate {
  // Calcola stima base dal numero di servizi
  const basePrice = (quote.servizi || []).reduce((sum, service) => sum + (service.totale || 0), 0);

  // Applica margini di mercato
  const minPrice = Math.round(basePrice * 0.7);
  const maxPrice = Math.round(basePrice * 1.5);
  const estimatedPrice = Math.round((minPrice + maxPrice) / 2);

  return {
    estimatedPrice,
    minPrice,
    maxPrice,
    confidence: 40,
    method: "market",
    reasoning: "Stima basata su dati di mercato generici",
  };
}

/**
 * Valuta se il prezzo della quote è ragionevole
 */
export function evaluatePriceReasonableness(
  quote: Partial<Quote>,
  estimate: PriceEstimate
): {
  isReasonable: boolean;
  verdict: "too_low" | "fair" | "too_high" | "unknown";
  percentage: number; // Differenza percentuale dal prezzo stimato
  advice: string;
} {
  const actualPrice = quote.totale || 0;
  const percentage = ((actualPrice - estimate.estimatedPrice) / estimate.estimatedPrice) * 100;

  let verdict: "too_low" | "fair" | "too_high" | "unknown";
  let advice = "";

  if (estimate.confidence < 30) {
    verdict = "unknown";
    advice = "Dati insufficienti per una valutazione accurata";
  } else if (percentage < -20) {
    verdict = "too_low";
    advice = `Il prezzo è ${Math.abs(percentage).toFixed(0)}% sotto la media di mercato`;
  } else if (percentage > 30) {
    verdict = "too_high";
    advice = `Il prezzo è ${percentage.toFixed(0)}% sopra la media di mercato`;
  } else {
    verdict = "fair";
    advice = "Il prezzo è in linea con la media di mercato";
  }

  return {
    isReasonable: verdict === "fair" || verdict === "unknown",
    verdict,
    percentage,
    advice,
  };
}

/**
 * Calcola il punteggio di convenienza (0-100)
 */
export function calculateValueScore(
  quote: Partial<Quote>,
  estimate: PriceEstimate
): number {
  const evaluation = evaluatePriceReasonableness(quote, estimate);

  let score = 50; // Base score

  // Aggiusta in base al verdict
  if (evaluation.verdict === "too_low") {
    score = Math.min(100, 50 + Math.abs(evaluation.percentage) / 2);
  } else if (evaluation.verdict === "fair") {
    score = 70;
  } else if (evaluation.verdict === "too_high") {
    score = Math.max(0, 50 - evaluation.percentage / 2);
  }

  // Aggiusta in base alla confidence
  score = score * (estimate.confidence / 100);

  return Math.round(score);
}
