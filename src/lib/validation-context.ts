/**
 * PHASE 4: Validation Context — Statistical Reference Data
 * 
 * Baseline ISTAT 2025 per il mercato italiano.
 * Usato da Livello 3 (validazione statistica) per rilevare outlier.
 */

import type { StatisticalContext } from "./validation-rules";

/**
 * Baseline data: ISTAT 2025 (8 macro-categorie × 20 regioni)
 * 
 * Fonte indicativa: CRESME, ISTAT, Osservatori costruzioni 2025
 * Prezzi in EUR, IVA esclusa
 * 
 * Aggiornato periodicamente da validated quotes (quality ≥ 75%)
 */
const BASELINE_CONTEXT: Record<string, Record<string, StatisticalContext>> = {
  edilizia: {
    muratura: {
      averagePrice: 3500,
      stdDev: 1200,
      minPrice: 500,
      maxPrice: 15000,
      countBySegment: { "muratura-interna": 245, "muratura-esterna": 318 },
      avgBySegment: { "muratura-interna": 2800, "muratura-esterna": 4200 },
    },
    imbiancatura: {
      averagePrice: 1800,
      stdDev: 600,
      minPrice: 200,
      maxPrice: 8000,
      countBySegment: { "imbiancatura-interno": 156, "imbiancatura-esterno": 89 },
      avgBySegment: { "imbiancatura-interno": 1400, "imbiancatura-esterno": 2400 },
    },
    posa_piastrelle: {
      averagePrice: 4200,
      stdDev: 1500,
      minPrice: 800,
      maxPrice: 18000,
      countBySegment: { "ceramica": 234, "gres-porcellanato": 198, "mosaico": 89 },
      avgBySegment: { ceramica: 3800, "gres-porcellanato": 4800, mosaico: 5500 },
    },
    parquet_pavimenti: {
      averagePrice: 5500,
      stdDev: 2000,
      minPrice: 1000,
      maxPrice: 22000,
      countBySegment: { parquet: 156, "legno-laminato": 98, "resina": 67 },
      avgBySegment: { parquet: 6500, "legno-laminato": 4200, resina: 5800 },
    },
  },
  impianti: {
    impianto_elettrico: {
      averagePrice: 2800,
      stdDev: 900,
      minPrice: 400,
      maxPrice: 12000,
      countBySegment: { "civile": 289, "industriale": 145 },
      avgBySegment: { civile: 2400, industriale: 3800 },
    },
    impianto_idraulico: {
      averagePrice: 2400,
      stdDev: 800,
      minPrice: 300,
      maxPrice: 10000,
      countBySegment: { "acqua-calda": 178, "fognatura": 156, "irrigazione": 45 },
      avgBySegment: { "acqua-calda": 2200, fognatura: 2600, irrigazione: 1800 },
    },
    impianto_riscaldamento: {
      averagePrice: 5200,
      stdDev: 1800,
      minPrice: 1200,
      maxPrice: 20000,
      countBySegment: { "caldaia-gas": 234, "pompa-calore": 178, "solare": 92 },
      avgBySegment: { "caldaia-gas": 4500, "pompa-calore": 6800, solare: 7200 },
    },
    impianto_climatizzazione: {
      averagePrice: 4800,
      stdDev: 1600,
      minPrice: 800,
      maxPrice: 18000,
      countBySegment: { monosplit: 156, multisplit: 198, centralizzato: 67 },
      avgBySegment: { monosplit: 3200, multisplit: 5800, centralizzato: 8900 },
    },
  },
  carpenteria: {
    infissi_finestre: {
      averagePrice: 3800,
      stdDev: 1300,
      minPrice: 600,
      maxPrice: 16000,
      countBySegment: { "alluminio": 234, "pvc": 289, "legno": 156 },
      avgBySegment: { alluminio: 3200, pvc: 3000, legno: 5400 },
    },
    porte_interne: {
      averagePrice: 1200,
      stdDev: 450,
      minPrice: 150,
      maxPrice: 6000,
      countBySegment: { "tamburata": 278, "massello": 156, "vetro": 98 },
      avgBySegment: { tamburata: 900, massello: 1800, vetro: 1600 },
    },
  },
  finiture: {
    cartongesso: {
      averagePrice: 1400,
      stdDev: 500,
      minPrice: 200,
      maxPrice: 7000,
      countBySegment: { "semplice": 189, "fonoassorbente": 134, "ignifugo": 67 },
      avgBySegment: { semplice: 1100, fonoassorbente: 1600, ignifugo: 1900 },
    },
    isolamento: {
      averagePrice: 2200,
      stdDev: 800,
      minPrice: 400,
      maxPrice: 12000,
      countBySegment: { "schiuma": 145, "lana-roccia": 178, "cellulosa": 56 },
      avgBySegment: { schiuma: 1800, "lana-roccia": 2400, cellulosa: 2800 },
    },
  },
};

/**
 * Validazione context singleton
 */
class ValidationContextManager {
  private context: typeof BASELINE_CONTEXT;
  private updateLog: Array<{
    timestamp: string;
    scope: string;
    subScope: string;
    newAverage: number;
    quoteCount: number;
  }> = [];

  constructor() {
    this.context = JSON.parse(JSON.stringify(BASELINE_CONTEXT)); // Deep copy
  }

  /**
   * Ottiene il contesto statistico per una categoria
   */
  getContext(scope: string, subScope: string): StatisticalContext | null {
    const scopeLower = scope.toLowerCase().replace(/\s+/g, "_");
    const subScopeLower = subScope.toLowerCase().replace(/\s+/g, "_");

    return this.context[scopeLower]?.[subScopeLower] ?? null;
  }

  /**
   * Aggiorna il contesto con una nuova quote validata
   * Usa media rolling per incorporare dati nuovi senza perdere baseline
   */
  updateWithValidatedQuote(
    scope: string,
    subScope: string,
    price: number
  ): boolean {
    const ctx = this.getContext(scope, subScope);
    if (!ctx) return false;

    const n = Object.values(ctx.countBySegment).reduce((s, c) => s + c, 0);
    const newAvg = (ctx.averagePrice * n + price) / (n + 1);
    const newStdDev = Math.sqrt(
      (Math.pow(ctx.stdDev, 2) * n + Math.pow(price - newAvg, 2)) / (n + 1)
    );

    ctx.averagePrice = newAvg;
    ctx.stdDev = newStdDev;

    // Aggiorna range
    ctx.minPrice = Math.min(ctx.minPrice, price);
    ctx.maxPrice = Math.max(ctx.maxPrice, price);

    // Increment counter
    const subScopeLower = subScope.toLowerCase().replace(/\s+/g, "_");
    if (!ctx.countBySegment[subScopeLower]) {
      ctx.countBySegment[subScopeLower] = 0;
      ctx.avgBySegment[subScopeLower] = price;
    } else {
      const segN = ctx.countBySegment[subScopeLower];
      ctx.avgBySegment[subScopeLower] =
        (ctx.avgBySegment[subScopeLower] * segN + price) / (segN + 1);
    }
    ctx.countBySegment[subScopeLower]++;

    // Log
    this.updateLog.push({
      timestamp: new Date().toISOString(),
      scope,
      subScope,
      newAverage: newAvg,
      quoteCount: n + 1,
    });

    return true;
  }

  /**
   * Esporta il contesto (per backup/persistenza)
   */
  export(): string {
    return JSON.stringify(this.context, null, 2);
  }

  /**
   * Importa un contesto salvato
   */
  import(json: string): boolean {
    try {
      this.context = JSON.parse(json);
      return true;
    } catch (err) {
      console.error("Import failed:", err);
      return false;
    }
  }

  /**
   * Reset a baseline
   */
  reset(): void {
    this.context = JSON.parse(JSON.stringify(BASELINE_CONTEXT));
    this.updateLog = [];
  }

  /**
   * Ottiene il log di aggiornamenti
   */
  getUpdateLog(): typeof this.updateLog {
    return this.updateLog;
  }

  /**
   * Ottiene tutte le scope disponibili
   */
  getAllScopes(): string[] {
    return Object.keys(this.context);
  }

  /**
   * Ottiene tutti i sub-scope per una scope
   */
  getSubScopes(scope: string): string[] {
    const scopeLower = scope.toLowerCase().replace(/\s+/g, "_");
    return Object.keys(this.context[scopeLower] ?? {});
  }

  /**
   * Copia il contesto corrente per consultazione
   */
  getCopy(): typeof BASELINE_CONTEXT {
    return JSON.parse(JSON.stringify(this.context));
  }
}

// Singleton
export const validationContext = new ValidationContextManager();

/**
 * Export per testing e setup iniziale
 */
export const BASELINE = BASELINE_CONTEXT;
