/**
 * COMMIT 5: Data Segmenter v2 - Segmentazione size-based
 * 
 * Segmenta i dati per: ambito + tipo + size
 * Size: small (<€500), medium (€500-€5000), large (>€5000)
 */

import type { SavedQuote } from "../storage";

export type SegmentSize = "small" | "medium" | "large";

export interface DataSegment {
  segmento: string; // ambito_tipo_size
  ambito: string;
  tipo: string;
  size: SegmentSize;
  count: number;
  priceRange: {
    min: number;
    max: number;
    median: number;
    q1: number;
    q3: number;
  };
  stdDev: number;
  confidence: number; // 0-1
}

/**
 * Determina la size di un preventivo
 */
export function determineSize(totale: number): SegmentSize {
  if (totale < 500) return "small";
  if (totale < 5000) return "medium";
  return "large";
}

/**
 * Crea ID segmento: ambito_tipo_size
 */
export function createSegmentId(ambito: string, tipo: string, size: SegmentSize): string {
  return `${ambito}_${tipo}_${size}`;
}

/**
 * COMMIT 5: Calcola statistiche per un array di prezzi
 */
function calculateStats(prices: number[]): {
  median: number;
  q1: number;
  q3: number;
  stdDev: number;
  min: number;
  max: number;
} {
  if (prices.length === 0) {
    return { median: 0, q1: 0, q3: 0, stdDev: 0, min: 0, max: 0 };
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const n = sorted.length;

  // Mediana
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  // Quartili
  const q1Idx = Math.floor(n / 4);
  const q3Idx = Math.floor((3 * n) / 4);
  const q1 = sorted[q1Idx];
  const q3 = sorted[q3Idx];

  // Std Dev
  const mean = prices.reduce((a, b) => a + b, 0) / n;
  const variance = prices.reduce((a, x) => a + Math.pow(x - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  return {
    median,
    q1,
    q3,
    stdDev,
    min: sorted[0],
    max: sorted[n - 1],
  };
}

/**
 * COMMIT 5: Calcola confidence basato su sample size
 */
function calculateConfidence(sampleSize: number): number {
  // Con 10 campioni: 0.7, con 50: 0.85, con 100+: 0.95
  if (sampleSize < 3) return 0.3;
  if (sampleSize < 5) return 0.5;
  if (sampleSize < 10) return 0.65;
  if (sampleSize < 20) return 0.75;
  if (sampleSize < 50) return 0.85;
  return 0.95;
}

/**
 * COMMIT 5: Segmenta un array di quote
 */
export function segmentQuotes(quotes: SavedQuote[]): Map<string, DataSegment> {
  const segments = new Map<string, DataSegment>();
  const segmentPrices = new Map<string, number[]>();

  // Raccoglie prezzi per segmento
  quotes.forEach((quote) => {
    if (!quote.totale || quote.totale <= 0) return;

    const ambito = quote.ambito || "unknown";
    const tipo = quote.sottotipo || "unknown";
    const size = determineSize(quote.totale);
    const segmentId = createSegmentId(ambito, tipo, size);

    if (!segmentPrices.has(segmentId)) {
      segmentPrices.set(segmentId, []);
    }
    segmentPrices.get(segmentId)!.push(quote.totale);
  });

  // Calcola statistiche per ogni segmento
  segmentPrices.forEach((prices, segmentId) => {
    const [ambito, tipo, size] = segmentId.split("_");
    const stats = calculateStats(prices);
    const confidence = calculateConfidence(prices.length);

    segments.set(segmentId, {
      segmento: segmentId,
      ambito,
      tipo,
      size: size as SegmentSize,
      count: prices.length,
      priceRange: {
        min: stats.min,
        max: stats.max,
        median: stats.median,
        q1: stats.q1,
        q3: stats.q3,
      },
      stdDev: stats.stdDev,
      confidence,
    });
  });

  return segments;
}

/**
 * COMMIT 5: Trova il segmento migliore per una quote
 */
export function findBestSegment(
  quote: SavedQuote,
  segments: Map<string, DataSegment>
): DataSegment | null {
  if (!quote.totale || quote.totale <= 0) return null;

  const ambito = quote.ambito || "unknown";
  const tipo = quote.sottotipo || "unknown";
  const size = determineSize(quote.totale);
  const segmentId = createSegmentId(ambito, tipo, size);

  // Exact match
  if (segments.has(segmentId)) {
    return segments.get(segmentId)!;
  }

  // Fallback: stesso ambito e size, qualsiasi tipo
  for (const [, segment] of segments) {
    if (segment.ambito === ambito && segment.size === size) {
      return segment;
    }
  }

  // Fallback: stesso ambito, qualsiasi size
  for (const [, segment] of segments) {
    if (segment.ambito === ambito) {
      return segment;
    }
  }

  return null;
}

/**
 * COMMIT 5: Assegna segmento a una quote
 */
export function assignSegment(quote: SavedQuote): string {
  if (!quote.totale || quote.totale <= 0) {
    return "unknown_unknown_unknown";
  }

  const ambito = quote.ambito || "unknown";
  const tipo = quote.sottotipo || "unknown";
  const size = determineSize(quote.totale);

  return createSegmentId(ambito, tipo, size);
}
