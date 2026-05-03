/**
 * Confidence Calculator - Calcola il livello di confidenza dei risultati
 * Combina multiple fonti di confidenza per un punteggio finale
 * Standardizzato su scala 0.0 - 1.0
 */

export interface ConfidenceFactors {
  extractionConfidence: number; // 0-100, qualità dell'estrazione testo
  parsingConfidence: number; // 0-100, qualità del parsing
  qualityConfidence: number; // 0-100, qualità dei dati
  datasetConfidence: number; // 0-100, disponibilità di dati storici
}

export interface ConfidenceResult {
  overall: number; // 0.0 - 1.0
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

  // Calcolo in base 100
  let overall =
    factors.extractionConfidence * weights.extractionConfidence +
    factors.parsingConfidence * weights.parsingConfidence +
    factors.qualityConfidence * weights.qualityConfidence +
    factors.datasetConfidence * weights.datasetConfidence;

  // Penalità se un fattore critico è molto basso
  if (factors.qualityConfidence < 50) overall *= 0.8;
  if (factors.parsingConfidence < 40) overall *= 0.7;

  let level: "very_low" | "low" | "medium" | "high" | "very_high";
  if (overall >= 85) level = "very_high";
  else if (overall >= 70) level = "high";
  else if (overall >= 50) level = "medium";
  else if (overall >= 30) level = "low";
  else level = "very_low";

  const trustworthy = level === "high" || level === "very_high";

  const warnings: string[] = [];
  if (factors.extractionConfidence < 50) warnings.push("Estrazione testo di bassa qualità");
  if (factors.parsingConfidence < 50) warnings.push("Parsing dei dati incerto");
  if (factors.qualityConfidence < 50) warnings.push("Qualità dei dati insufficiente");
  if (factors.datasetConfidence < 30) warnings.push("Dati storici insufficienti per una stima accurata");

  return {
    overall: Math.max(0, Math.min(1, overall / 100)), // Standardizzazione 0-1
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

  return geometricMean; // Restituisce 0-1
}

/**
 * Aggiusta la confidenza in base a fattori esterni
 */
export function adjustConfidence(
  baseConfidence: number,
  adjustments: {
    pdfQuality?: number; // -0.5 a +0.5
    userFeedback?: number; // -0.3 a +0.3
    dataAvailability?: number; // -0.2 a +0.2
  }
): number {
  let adjusted = baseConfidence;

  if (adjustments.pdfQuality) adjusted += adjustments.pdfQuality;
  if (adjustments.userFeedback) adjusted += adjustments.userFeedback;
  if (adjustments.dataAvailability) adjusted += adjustments.dataAvailability;

  return Math.max(0, Math.min(1, adjusted));
}

/**
 * Determina il livello di fiducia descrittivo
 */
export function getConfidenceDescription(confidence: number): string {
  const c = confidence > 1 ? confidence / 100 : confidence;
  if (c >= 0.85) return "Molto affidabile";
  if (c >= 0.70) return "Affidabile";
  if (c >= 0.50) return "Moderatamente affidabile";
  if (c >= 0.30) return "Poco affidabile";
  return "Non affidabile";
}

/**
 * Consiglia azioni basate sul livello di confidenza
 */
export function getConfidenceRecommendation(confidence: number): string {
  const c = confidence > 1 ? confidence / 100 : confidence;
  if (c >= 0.85) return "Puoi fidarti di questo risultato";
  if (c >= 0.70) return "Il risultato è generalmente affidabile, ma verifica i dettagli";
  if (c >= 0.50) return "Prendi questo risultato con cautela e verifica";
  if (c >= 0.30) return "Questo risultato è incerto, verifica accuratamente";
  return "Non fidarti di questo risultato, riprova con un PDF di migliore qualità";
}
