/**
 * COMMIT 9: Report Generator - Trasforma dati in prodotto vendibile
 * 
 * Genera report professionale con:
 * - Verdict (titolo)
 * - Prezzo Giusto (numero grande)
 * - Range (min-max)
 * - Scostamento (% vs suggerito)
 * - Affidabilità (confidence)
 * - Rischio (se fuori range)
 * - Consiglio (azione)
 */

import type { SavedQuote } from "./storage";
import type { PriceEstimateV2 } from "./ai/estimator-v2";
import { evaluatePriceV2 } from "./ai/estimator-v2";

export type ReportVerdict = "ottimo" | "equo" | "alto" | "troppo-alto" | "sospetto";

export interface Report {
  verdict: ReportVerdict;
  verdictLabel: string;
  verdictColor: "green" | "blue" | "amber" | "red" | "purple";
  
  prezzo_giusto: number;
  prezzo_suggerito: number;
  prezzo_finale: number;
  
  range: {
    min: number;
    max: number;
    dentro: boolean;
  };
  
  scostamento: {
    assoluto: number;
    percentuale: number;
    direzione: "basso" | "alto" | "giusto";
  };
  
  affidabilita: {
    confidence: number; // 0-1
    confidencePercent: number; // 0-100
    livello: "bassa" | "media" | "alta" | "molto_alta";
  };
  
  rischio: {
    livello: "basso" | "medio" | "alto";
    descrizione: string;
  };
  
  consiglio: string;
  
  timestamp: number;
}

/**
 * COMMIT 9: Genera il verdetto basato sulla valutazione
 */
function generateVerdict(
  actualPrice: number,
  estimate: PriceEstimateV2
): { verdict: ReportVerdict; color: "green" | "blue" | "amber" | "red" | "purple" } {
  const evaluation = evaluatePriceV2(actualPrice, estimate);
  const percentage = evaluation.percentage;

  if (estimate.confidence < 0.3) {
    return { verdict: "sospetto", color: "purple" };
  }

  if (evaluation.verdict === "too_low") {
    return { verdict: "ottimo", color: "green" };
  }

  if (evaluation.verdict === "fair") {
    if (percentage > 10) {
      return { verdict: "equo", color: "blue" };
    }
    return { verdict: "equo", color: "blue" };
  }

  if (evaluation.verdict === "too_high") {
    if (percentage > 40) {
      return { verdict: "troppo-alto", color: "red" };
    }
    return { verdict: "alto", color: "amber" };
  }

  return { verdict: "equo", color: "blue" };
}

/**
 * COMMIT 9: Genera il livello di affidabilità
 */
function getConfidenceLevel(confidence: number): "bassa" | "media" | "alta" | "molto_alta" {
  if (confidence < 0.4) return "bassa";
  if (confidence < 0.65) return "media";
  if (confidence < 0.85) return "alta";
  return "molto_alta";
}

/**
 * COMMIT 9: Genera il livello di rischio
 */
function generateRisk(
  actualPrice: number,
  estimate: PriceEstimateV2,
  confidence: number
): { livello: "basso" | "medio" | "alto"; descrizione: string } {
  const evaluation = evaluatePriceV2(actualPrice, estimate);

  if (!evaluation.dentro_range) {
    return {
      livello: "alto",
      descrizione: "Prezzo fuori dal range stimato",
    };
  }

  if (confidence < 0.4) {
    return {
      livello: "alto",
      descrizione: "Dati insufficienti per valutazione affidabile",
    };
  }

  if (confidence < 0.65) {
    return {
      livello: "medio",
      descrizione: "Affidabilità media, consiglio ulteriore verifica",
    };
  }

  return {
    livello: "basso",
    descrizione: "Analisi affidabile",
  };
}

/**
 * COMMIT 9: Genera il consiglio
 */
function generateAdvice(
  verdict: ReportVerdict,
  actualPrice: number,
  estimate: PriceEstimateV2,
  confidence: number
): string {
  const evaluation = evaluatePriceV2(actualPrice, estimate);

  if (verdict === "sospetto") {
    return "Dati insufficienti. Consiglio di raccogliere più informazioni prima di decidere.";
  }

  if (verdict === "ottimo") {
    return `Prezzo molto conveniente (${Math.abs(evaluation.percentage).toFixed(0)}% sotto la mediana). Valuta se la qualità è coerente con il prezzo basso.`;
  }

  if (verdict === "equo") {
    return `Prezzo in linea con il mercato. Consiglio di procedere con fiducia.`;
  }

  if (verdict === "alto") {
    return `Prezzo ${evaluation.percentage.toFixed(0)}% sopra la mediana. Valuta se i servizi aggiuntivi giustificano il costo.`;
  }

  if (verdict === "troppo-alto") {
    return `Prezzo ${evaluation.percentage.toFixed(0)}% sopra la mediana. Consiglio di richiedere preventivi alternativi per il confronto.`;
  }

  return "Valuta attentamente il prezzo rispetto alle tue esigenze.";
}

/**
 * COMMIT 9: Genera il report completo
 */
export function generateReport(
  quote: SavedQuote,
  estimate: PriceEstimateV2
): Report {
  const actualPrice = quote.prezzo_finale || quote.totale || estimate.prezzo;
  const { verdict, color } = generateVerdict(actualPrice, estimate);
  const evaluation = evaluatePriceV2(actualPrice, estimate);

  const confidencePercent = Math.round(estimate.confidence * 100);
  const confidenceLevel = getConfidenceLevel(estimate.confidence);
  const risk = generateRisk(actualPrice, estimate, estimate.confidence);
  const advice = generateAdvice(verdict, actualPrice, estimate, estimate.confidence);

  return {
    verdict,
    verdictLabel: {
      ottimo: "Ottimo Prezzo",
      equo: "Prezzo Equo",
      alto: "Prezzo Alto",
      "troppo-alto": "Prezzo Troppo Alto",
      sospetto: "Dati Insufficienti",
    }[verdict],
    verdictColor: color,

    prezzo_giusto: estimate.prezzo,
    prezzo_suggerito: quote.prezzo_suggerito || estimate.prezzo,
    prezzo_finale: actualPrice,

    range: {
      min: estimate.min,
      max: estimate.max,
      dentro: evaluation.dentro_range,
    },

    scostamento: {
      assoluto: Math.round(actualPrice - estimate.prezzo),
      percentuale: evaluation.percentage,
      direzione: actualPrice < estimate.prezzo ? "basso" : actualPrice > estimate.prezzo ? "alto" : "giusto",
    },

    affidabilita: {
      confidence: estimate.confidence,
      confidencePercent,
      livello: confidenceLevel,
    },

    rischio: risk,

    consiglio: advice,

    timestamp: Date.now(),
  };
}

/**
 * COMMIT 9: Formatta il report per la visualizzazione
 */
export function formatReportForDisplay(report: Report): {
  title: string;
  subtitle: string;
  mainPrice: string;
  range: string;
  confidence: string;
  advice: string;
  color: string;
} {
  return {
    title: report.verdictLabel,
    subtitle: `${Math.abs(report.scostamento.percentuale).toFixed(0)}% ${report.scostamento.direzione === "basso" ? "sotto" : report.scostamento.direzione === "alto" ? "sopra" : "al"} prezzo mediano`,
    mainPrice: `€${report.prezzo_giusto.toLocaleString("it-IT")}`,
    range: `€${report.range.min.toLocaleString("it-IT")} - €${report.range.max.toLocaleString("it-IT")}`,
    confidence: `${report.affidabilita.confidencePercent}% (${report.affidabilita.livello})`,
    advice: report.consiglio,
    color: report.verdictColor,
  };
}
