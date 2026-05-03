/**
 * Data Segmenter - Segmenta i dati per migliorare la stima dei prezzi
 * Raggruppa quote per settore, regione e complessità
 */

import type { Quote } from "../quote-model";

export interface DataSegment {
  sector: string;
  region: string;
  complexity: "low" | "medium" | "high";
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  sampleSize: number;
  confidence: number;
}

/**
 * Determina la complessità di una quote basata sul numero di servizi
 */
export function determineComplexity(quote: Quote): "low" | "medium" | "high" {
  const serviceCount = quote.services.length;

  if (serviceCount <= 2) return "low";
  if (serviceCount <= 5) return "medium";
  return "high";
}

/**
 * Segmenta un array di quote per settore, regione e complessità
 */
export function segmentQuotes(quotes: Quote[]): Map<string, DataSegment> {
  const segments = new Map<string, DataSegment>();

  quotes.forEach((quote) => {
    const complexity = determineComplexity(quote);
    const key = `${quote.sector}|${quote.region}|${complexity}`;

    if (!segments.has(key)) {
      segments.set(key, {
        sector: quote.sector,
        region: quote.region,
        complexity,
        priceRange: {
          min: quote.total,
          max: quote.total,
          average: quote.total,
        },
        sampleSize: 1,
        confidence: 50,
      });
    } else {
      const segment = segments.get(key)!;
      segment.priceRange.min = Math.min(segment.priceRange.min, quote.total);
      segment.priceRange.max = Math.max(segment.priceRange.max, quote.total);
      segment.priceRange.average =
        (segment.priceRange.average * segment.sampleSize + quote.total) / (segment.sampleSize + 1);
      segment.sampleSize++;

      // Aumenta confidence con più campioni
      segment.confidence = Math.min(95, 50 + segment.sampleSize * 5);
    }
  });

  return segments;
}

/**
 * Trova il segmento più appropriato per una quote
 */
export function findBestSegment(
  quote: Quote,
  segments: Map<string, DataSegment>
): DataSegment | null {
  const complexity = determineComplexity(quote);
  const key = `${quote.sector}|${quote.region}|${complexity}`;

  if (segments.has(key)) {
    return segments.get(key)!;
  }

  // Se non trovato, cerca per settore e regione (ignora complessità)
  for (const [, segment] of segments) {
    if (segment.sector === quote.sector && segment.region === quote.region) {
      return segment;
    }
  }

  // Se ancora non trovato, cerca per settore
  for (const [, segment] of segments) {
    if (segment.sector === quote.sector) {
      return segment;
    }
  }

  return null;
}

/**
 * Calcola statistiche per un segmento
 */
export function getSegmentStats(segment: DataSegment): {
  priceRange: string;
  confidence: string;
  recommendation: string;
} {
  const priceRange = `€${segment.priceRange.min.toFixed(0)} - €${segment.priceRange.max.toFixed(0)}`;
  const confidence = `${segment.confidence.toFixed(0)}%`;

  let recommendation = "Prezzo non determinato";
  if (segment.sampleSize >= 10) {
    recommendation = `Prezzo medio: €${segment.priceRange.average.toFixed(0)}`;
  } else if (segment.sampleSize >= 3) {
    recommendation = `Intervallo stimato: ${priceRange}`;
  }

  return {
    priceRange,
    confidence,
    recommendation,
  };
}
