/**
 * Confidence Calculator - Calcola il livello di confidenza dei risultati
 * Combina multiple fonti di confidenza per un punteggio finale
 */

export interface ConfidenceFactors {
  extractionConfidence: number; // 0-100, qualità dell'estrazione testo
  parsingConfidence: number; // 0-100, qualità del parsing
  qualityConfidence: number; // 0-100, qualità dei dati
  datasetConfidence: number; // 0-100, disponibilità di dati storici
}

export interface ConfidenceResult {
  overall: number; // 0-100
  factors: ConfidenceFactors;
  level: "very_low" | "low" | "medium" | "high" | "very_high";
  trustworthy: boolean;
  warnings: string[];
}

/**
 * Calcola il livello di confidenza complessivo
 */
export function calculateConfidence(factors: ConfidenceFactors): ConfidenceResult {
  // Media ponderata
  const weights = {
    extractionConfidence: 0.25,
    parsingConfidence: 0.35,
    qualityConfidence: 0.25,
    datasetConfidence: 0.15,
  };

  const overall =
    factors.extractionConfidence * weights.extractionConfidence +
    factors.parsingConfidence * weights.parsingConfidence +
    factors.qualityConfidence * weights.qualityConfidence +
    factors.datasetConfidence * weights.datasetConfidence;

  let level: "very_low" | "low" | "medium" | "high" | "very_high";
  if (overall >= 85) level = "very_high";
  else if (overall >= 70) level = "high";
  else if (overall >= 50) level = "medium";
  else if (overall >= 30) level = "low";
  else level = "very_low";

  const trustworthy = level === "high" || level === "very_high";

  const warnings: string[] = [];

  if (factors.extractionConfidence < 50) {
    warnings.push("Estrazione testo di bassa qualità");
  }

  if (factors.parsingConfidence < 50) {
    warnings.push("Parsing dei dati incerto");
  }

  if (factors.qualityConfidence < 50) {
    warnings.push("Qualità dei dati insufficiente");
  }

  if (factors.datasetConfidence < 30) {
    warnings.push("Dati storici insufficienti per una stima accurata");
  }

  return {
    overall: Math.round(overall),
    factors,
    level,
    trustworthy,
    warnings,
  };
}

/**
 * Combina confidenze da multiple fonti
 */
export function combineConfidences(confidences: number[]): number {
  if (confidences.length === 0) return 0;

  // Media geometrica per evitare che un valore basso domini
  const product = confidences.reduce((p, c) => p * (c / 100), 1);
  const geometricMean = Math.pow(product, 1 / confidences.length);

  return Math.round(geometricMean * 100);
}

/**
 * Aggiusta la confidenza in base a fattori esterni
 */
export function adjustConfidence(
  baseConfidence: number,
  adjustments: {
    pdfQuality?: number; // -50 a +50
    userFeedback?: number; // -30 a +30
    dataAvailability?: number; // -20 a +20
  }
): number {
  let adjusted = baseConfidence;

  if (adjustments.pdfQuality) {
    adjusted += adjustments.pdfQuality;
  }

  if (adjustments.userFeedback) {
    adjusted += adjustments.userFeedback;
  }

  if (adjustments.dataAvailability) {
    adjusted += adjustments.dataAvailability;
  }

  return Math.max(0, Math.min(100, adjusted));
}

/**
 * Determina il livello di fiducia descrittivo
 */
export function getConfidenceDescription(confidence: number): string {
  if (confidence >= 85) return "Molto affidabile";
  if (confidence >= 70) return "Affidabile";
  if (confidence >= 50) return "Moderatamente affidabile";
  if (confidence >= 30) return "Poco affidabile";
  return "Non affidabile";
}

/**
 * Consiglia azioni basate sul livello di confidenza
 */
export function getConfidenceRecommendation(confidence: number): string {
  if (confidence >= 85) return "Puoi fidarti di questo risultato";
  if (confidence >= 70) return "Il risultato è generalmente affidabile, ma verifica i dettagli";
  if (confidence >= 50) return "Prendi questo risultato con cautela e verifica";
  if (confidence >= 30) return "Questo risultato è incerto, verifica accuratamente";
  return "Non fidarti di questo risultato, riprova con un PDF di migliore qualità";
}
