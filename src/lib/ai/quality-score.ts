/**
 * Quality Score Calculator - Calcola il punteggio di qualità di una quote
 * Valuta completezza, coerenza e validità dei dati
 */

import type { Quote } from "../quote-model";

export interface QualityScoreResult {
  overall: number; // 0-100
  completeness: number; // Quanti campi sono compilati
  consistency: number; // Coerenza tra i dati
  validity: number; // Validità dei dati
  issues: string[];
  recommendations: string[];
}

/**
 * Calcola il punteggio di completezza
 */
function calculateCompletenessScore(quote: Quote): number {
  let filledFields = 0;
  let totalFields = 0;

  // Campi obbligatori
  const requiredFields = [
    quote.quoteNumber,
    quote.clientName,
    quote.sector,
    quote.region,
    quote.total,
  ];

  requiredFields.forEach((field) => {
    totalFields++;
    if (field && field !== "" && field !== 0) filledFields++;
  });

  // Servizi
  totalFields += 5; // Min 5 servizi per completezza
  filledFields += Math.min(5, quote.services.length);

  return (filledFields / totalFields) * 100;
}

/**
 * Calcola il punteggio di coerenza
 */
function calculateConsistencyScore(quote: Quote): number {
  let issues = 0;

  // Controlla che il totale corrisponda alla somma dei servizi
  const servicesTotal = quote.services.reduce((sum, s) => sum + s.price, 0);
  if (Math.abs(servicesTotal - quote.total) > 1) {
    issues++;
  }

  // Controlla che i servizi abbiano prezzi positivi
  quote.services.forEach((service) => {
    if (service.price <= 0) issues++;
  });

  // Controlla che il numero di servizi sia ragionevole
  if (quote.services.length === 0 || quote.services.length > 50) {
    issues++;
  }

  // Controlla che il totale sia ragionevole
  if (quote.total < 50 || quote.total > 1000000) {
    issues++;
  }

  return Math.max(0, 100 - issues * 20);
}

/**
 * Calcola il punteggio di validità
 */
function calculateValidityScore(quote: Quote): number {
  let issues = 0;

  // Controlla formato del numero di preventivo
  if (!quote.quoteNumber || quote.quoteNumber.length < 3) {
    issues++;
  }

  // Controlla lunghezza del nome cliente
  if (!quote.clientName || quote.clientName.length < 2) {
    issues++;
  }

  // Controlla settore valido
  const validSectors = [
    "idraulica",
    "elettricista",
    "muratura",
    "carpenteria",
    "pittura",
    "piastrellista",
    "serramenti",
    "riscaldamento",
    "condizionamento",
    "fotovoltaico",
    "altro",
  ];
  if (!validSectors.includes(quote.sector.toLowerCase())) {
    issues++;
  }

  // Controlla regione valida
  const validRegions = [
    "nord-ovest",
    "nord-est",
    "centro",
    "sud",
    "isole",
  ];
  if (!validRegions.includes(quote.region.toLowerCase())) {
    issues++;
  }

  // Controlla data
  const quoteDate = new Date(quote.createdAt);
  if (isNaN(quoteDate.getTime())) {
    issues++;
  }

  return Math.max(0, 100 - issues * 15);
}

/**
 * Calcola il punteggio di qualità complessivo
 */
export function calculateQualityScore(quote: Quote): QualityScoreResult {
  const completeness = calculateCompletenessScore(quote);
  const consistency = calculateConsistencyScore(quote);
  const validity = calculateValidityScore(quote);

  const overall = (completeness + consistency + validity) / 3;

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Identifica problemi
  if (completeness < 70) {
    issues.push("Quote incompleta: mancano alcuni campi");
    recommendations.push("Compilare tutti i campi obbligatori");
  }

  if (consistency < 70) {
    issues.push("Incoerenza nei dati: il totale non corrisponde alla somma dei servizi");
    recommendations.push("Verificare che il totale corrisponda alla somma dei servizi");
  }

  if (validity < 70) {
    issues.push("Dati non validi: alcuni campi non superano la validazione");
    recommendations.push("Verificare il formato dei dati inseriti");
  }

  if (quote.services.length === 0) {
    issues.push("Nessun servizio specificato");
    recommendations.push("Aggiungere almeno un servizio alla quote");
  }

  if (quote.total === 0) {
    issues.push("Prezzo totale non specificato");
    recommendations.push("Inserire il prezzo totale del preventivo");
  }

  return {
    overall: Math.round(overall),
    completeness: Math.round(completeness),
    consistency: Math.round(consistency),
    validity: Math.round(validity),
    issues,
    recommendations,
  };
}

/**
 * Determina se una quote è di qualità sufficiente per essere salvata
 */
export function isQualityAcceptable(score: QualityScoreResult): boolean {
  return score.overall >= 60 && score.issues.length <= 2;
}
