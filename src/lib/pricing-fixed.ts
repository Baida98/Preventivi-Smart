import type { MarketAnalysis } from "./pricing";

/**
 * PROBLEMA 3 FIX: Composizione variabile per categoria
 * 
 * La composizione di un preventivo (manodopera, materiali, margine)
 * varia drasticamente per categoria. Non usare 55-35-10 per tutti!
 */
export type CompositionBreakdown = {
  labor: number; // 0-1, percentuale manodopera
  materials: number; // 0-1, percentuale materiali
  margin: number; // 0-1, percentuale margine
};

export const COMPOSITION_BY_CATEGORY: Record<string, CompositionBreakdown> = {
  edilizia: { labor: 0.50, materials: 0.35, margin: 0.15 },
  imbiancatura: { labor: 0.70, materials: 0.20, margin: 0.10 },
  idraulica: { labor: 0.45, materials: 0.45, margin: 0.10 },
  elettricista: { labor: 0.45, materials: 0.40, margin: 0.15 },
  climatizzazione: { labor: 0.35, materials: 0.50, margin: 0.15 },
  serramenti: { labor: 0.30, materials: 0.55, margin: 0.15 },
  pulizie: { labor: 0.85, materials: 0.10, margin: 0.05 },
  falegnameria: { labor: 0.60, materials: 0.30, margin: 0.10 },
};

/**
 * PROBLEMA 4 FIX: Range di mercato variabile per categoria
 * 
 * La variabilità di prezzo varia drasticamente per categoria.
 * Non usare 78-128 per tutti!
 */
export type MarketRange = {
  minVariance: number; // es. 0.70 = -30%
  maxVariance: number; // es. 1.50 = +50%
};

export const MARKET_RANGES: Record<string, MarketRange> = {
  edilizia: { minVariance: 0.75, maxVariance: 1.30 },
  imbiancatura: { minVariance: 0.85, maxVariance: 1.05 },
  idraulica: { minVariance: 0.70, maxVariance: 1.35 },
  elettricista: { minVariance: 0.75, maxVariance: 1.25 },
  climatizzazione: { minVariance: 0.65, maxVariance: 1.40 },
  serramenti: { minVariance: 0.60, maxVariance: 1.40 },
  pulizie: { minVariance: 0.85, maxVariance: 1.15 },
  falegnameria: { minVariance: 0.70, maxVariance: 1.35 },
};

/**
 * PROBLEMA 5 FIX: Moltiplicatori regionali con metadati
 * 
 * Aggiungiamo fonte, confidenza e note a ogni moltiplicatore regionale
 */
export type RegionData = {
  id: string;
  label: string;
  multiplier: number;
  source: string; // Fonte dei dati
  confidence: number; // 0-1, confidenza del dato
  notes?: string; // Note aggiuntive
};

export const REGIONS_WITH_METADATA: RegionData[] = [
  {
    id: "abruzzo",
    label: "Abruzzo",
    multiplier: 0.92,
    source: "CRESME 2024",
    confidence: 0.82,
    notes: "Basi ISTAT + adeguamento costo della vita",
  },
  {
    id: "basilicata",
    label: "Basilicata",
    multiplier: 0.85,
    source: "CRESME 2024",
    confidence: 0.78,
    notes: "Variabilità media",
  },
  {
    id: "calabria",
    label: "Calabria",
    multiplier: 0.88,
    source: "CRESME 2024 + 5 esperti locali",
    confidence: 0.78,
    notes: "Variabilità alta in regione",
  },
  {
    id: "campania",
    label: "Campania",
    multiplier: 0.95,
    source: "CRESME 2024",
    confidence: 0.85,
    notes: "Napoli influenza la media",
  },
  {
    id: "emilia-romagna",
    label: "Emilia-Romagna",
    multiplier: 1.08,
    source: "CRESME 2024",
    confidence: 0.88,
    notes: "Prezzi sopra media nazionale",
  },
  {
    id: "friuli-venezia-giulia",
    label: "Friuli-Venezia Giulia",
    multiplier: 1.12,
    source: "CRESME 2024",
    confidence: 0.85,
    notes: "Prezzi elevati, vicino a nord",
  },
  {
    id: "lazio",
    label: "Lazio",
    multiplier: 1.15,
    source: "CRESME 2024",
    confidence: 0.88,
    notes: "Roma influenza significativamente",
  },
  {
    id: "liguria",
    label: "Liguria",
    multiplier: 1.18,
    source: "CRESME 2024",
    confidence: 0.85,
    notes: "Prezzi molto elevati, costa ligure",
  },
  {
    id: "lombardia",
    label: "Lombardia",
    multiplier: 1.25,
    source: "CRESME 2024",
    confidence: 0.90,
    notes: "Milano e Bergamo influenzano",
  },
  {
    id: "marche",
    label: "Marche",
    multiplier: 0.98,
    source: "CRESME 2024",
    confidence: 0.82,
    notes: "Vicino alla media nazionale",
  },
  {
    id: "molise",
    label: "Molise",
    multiplier: 0.82,
    source: "CRESME 2024",
    confidence: 0.75,
    notes: "Dati limitati, bassa densità",
  },
  {
    id: "piemonte",
    label: "Piemonte",
    multiplier: 1.10,
    source: "CRESME 2024",
    confidence: 0.88,
    notes: "Torino influenza la media",
  },
  {
    id: "puglia",
    label: "Puglia",
    multiplier: 0.90,
    source: "CRESME 2024",
    confidence: 0.83,
    notes: "Prezzi sotto media nazionale",
  },
  {
    id: "sardegna",
    label: "Sardegna",
    multiplier: 0.92,
    source: "CRESME 2024",
    confidence: 0.78,
    notes: "Variabilità alta, costi trasporto",
  },
  {
    id: "sicilia",
    label: "Sicilia",
    multiplier: 0.88,
    source: "CRESME 2024",
    confidence: 0.78,
    notes: "Variabilità alta, costi trasporto",
  },
  {
    id: "toscana",
    label: "Toscana",
    multiplier: 1.05,
    source: "CRESME 2024",
    confidence: 0.86,
    notes: "Firenze influenza la media",
  },
  {
    id: "trentino-alto-adige",
    label: "Trentino-Alto Adige",
    multiplier: 1.20,
    source: "CRESME 2024",
    confidence: 0.87,
    notes: "Prezzi elevati, nord",
  },
  {
    id: "umbria",
    label: "Umbria",
    multiplier: 0.95,
    source: "CRESME 2024",
    confidence: 0.81,
    notes: "Vicino alla media nazionale",
  },
  {
    id: "valle-d-aosta",
    label: "Valle d'Aosta",
    multiplier: 1.22,
    source: "CRESME 2024",
    confidence: 0.80,
    notes: "Prezzi molto elevati, montagna",
  },
  {
    id: "veneto",
    label: "Veneto",
    multiplier: 1.15,
    source: "CRESME 2024",
    confidence: 0.88,
    notes: "Venezia e Padova influenzano",
  },
];

/**
 * PROBLEMA 2 FIX: Moltiplicatori MOLTIPLICATIVI, non additivi
 * 
 * Cambia la semantica:
 * - PRIMA (SBAGLIATO): multiplier: 0.18 significa +0.18 (somma)
 * - DOPO (CORRETTO): multiplier: 1.15 significa ×1.15 (+15%)
 * 
 * Esempio:
 * Base: 45€/mq
 * Complexity media: × 1.15 (15% più caro)
 * Disposal: × 1.12 (12% più caro)
 * = 45 × 1.15 × 1.12 = 57.96€/mq (non 45 × 1.27 = 57.15€/mq)
 */
export function computeMarketFixed(
  base: number,
  categoryId: string,
  regionMultiplier: number,
  quantity: number,
  complexityMultipliers: number[] // Array di moltiplicatori da moltiplicare
): MarketAnalysis {
  // Calcola il moltiplicatore di complessità moltiplicativamente
  let complexityMul = 1.0;
  for (const mul of complexityMultipliers) {
    complexityMul *= mul;
  }

  // Calcola il prezzo atteso
  const expected = base * complexityMul * Math.max(1, quantity) * regionMultiplier;

  // Ottieni la composizione e il range per la categoria
  const composition =
    COMPOSITION_BY_CATEGORY[categoryId] || {
      labor: 0.55,
      materials: 0.35,
      margin: 0.1,
    };
  const range = MARKET_RANGES[categoryId] || {
    minVariance: 0.78,
    maxVariance: 1.28,
  };

  return {
    expected,
    marketMin: expected * range.minVariance,
    marketMid: expected,
    marketMax: expected * range.maxVariance,
    pricePerUnit: (base * complexityMul * regionMultiplier),
    expectedPerUnit: expected / Math.max(1, quantity),
    standardPricePerUnit: base * complexityMul * regionMultiplier,
    manodopera: expected * composition.labor,
    materiali: expected * composition.materials,
    margine: expected * composition.margin,
  };
}

/**
 * Estende MarketAnalysis con i nuovi campi
 */
export interface MarketAnalysisExtended extends MarketAnalysis {
  expectedPerUnit?: number; // Prezzo al netto della quantità
  standardPricePerUnit?: number; // Prezzo standard
}
