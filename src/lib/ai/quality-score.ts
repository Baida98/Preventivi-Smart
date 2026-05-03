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
function calculateCompletenessScore(quote: Partial<Quote>): number {
  let filledFields = 0;
  let totalFields = 0;

  // Campi obbligatori
  const requiredFields = [
    quote.numero,
    quote.cliente?.nome,
    quote.ambito,
    quote.totale,
  ];

  requiredFields.forEach((field) => {
    totalFields++;
    if (field && field !== "" && field !== 0) filledFields++;
  });

  // Servizi
  // Fix: meno rigida sui piccoli lavori (almeno 1 servizio valido dà punteggio pieno)
  const serviceCount = quote.servizi?.length || 0;
  if (serviceCount >= 1 && quote.totale && quote.totale > 0) {
    totalFields += 1;
    filledFields += 1;
  } else {
    totalFields += 5; // Min 5 servizi per completezza se non ha totale
    filledFields += Math.min(5, serviceCount);
  }

  return (filledFields / totalFields) * 100;
}

/**
 * Calcola il punteggio di coerenza
 */
function calculateConsistencyScore(quote: Partial<Quote>): number {
  let issues = 0;

  // Controlla che il totale corrisponda alla somma dei servizi
  const servicesTotal = (quote.servizi || []).reduce((sum, s) => sum + (s.totale || 0), 0);
  if (Math.abs(servicesTotal - (quote.totale || 0)) > 1) {
    issues++;
  }

  // Controlla che i servizi abbiano prezzi positivi
  (quote.servizi || []).forEach((service) => {
    if ((service.totale || 0) <= 0) issues++;
  });

  // Controlla che il numero di servizi sia ragionevole
  const serviceCount = quote.servizi?.length || 0;
  if (serviceCount === 0 || serviceCount > 50) {
    issues++;
  }

  // Controlla che il totale sia ragionevole
  const total = quote.totale || 0;
  if (total < 50 || total > 1000000) {
    issues++;
  }

  return Math.max(0, 100 - issues * 20);
}

/**
 * Calcola il punteggio di validità
 */
function calculateValidityScore(quote: Partial<Quote>): number {
  let issues = 0;

  // Controlla formato del numero di preventivo
  if (!quote.numero || quote.numero.length < 3) {
    issues++;
  }

  // Controlla lunghezza del nome cliente
  if (!quote.cliente?.nome || quote.cliente.nome.length < 2) {
    issues++;
  }

  // Controlla ambito valido
  const validAmbiti = [
    "edilizia",
    "impianti",
    "serramenti",
    "riscaldamento",
    "condizionamento",
    "fotovoltaico",
    "altro",
  ];
  if (!validAmbiti.includes((quote.ambito || "").toLowerCase())) {
    issues++;
  }

  // Controlla data
  if (quote.data) {
    const quoteDate = new Date(quote.data);
    if (isNaN(quoteDate.getTime())) {
      issues++;
    }
  }

  return Math.max(0, 100 - issues * 15);
}

/**
 * Calcola il punteggio di qualità complessivo
 */
export function calculateQualityScore(quote: Partial<Quote>): QualityScoreResult {
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

  if ((quote.servizi?.length || 0) === 0) {
    issues.push("Nessun servizio specificato");
    recommendations.push("Aggiungere almeno un servizio alla quote");
  }

  if ((quote.totale || 0) === 0) {
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
