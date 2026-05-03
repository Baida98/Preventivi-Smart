/**
 * PHASE 4: Validation — Multi-level Quality Filter
 * 
 * Livello 1: Errori impossibili
 * - Prezzo negativo, campi obbligatori mancanti, mq assurdi, totale assente
 * 
 * Livello 2: Coerenza interna
 * - Somma righe vs totale, unità di misura plausibili, servizi compatibili
 * 
 * Livello 3: Statistica
 * - Outlier, z-score, distanza dalla media, anomalie per segmento
 */

import type { Quote, Service } from "./quote-model";

export type ValidationLevel = 1 | 2 | 3;

export type ValidationError = {
  level: ValidationLevel;
  field: string;
  message: string;
  severity: "error" | "warning";
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
  qualityScore: number; // 0-100
  anomalyScore: number; // 0-100 (0 = normale, 100 = anomalo)
};

// ============================================================================
// LIVELLO 1: Errori impossibili
// ============================================================================

function validateLevel1(quote: Partial<Quote>): ValidationError[] {
  const errors: ValidationError[] = [];

  // ID e numero
  if (!quote.id) {
    errors.push({
      level: 1,
      field: "id",
      message: "ID preventivo mancante",
      severity: "error",
    });
  }

  if (!quote.numero) {
    errors.push({
      level: 1,
      field: "numero",
      message: "Numero preventivo mancante",
      severity: "error",
    });
  }

  if (!quote.uid) {
    errors.push({
      level: 1,
      field: "uid",
      message: "Proprietario non specificato",
      severity: "error",
    });
  }

  // Data
  if (!quote.data) {
    errors.push({
      level: 1,
      field: "data",
      message: "Data preventivo mancante",
      severity: "error",
    });
  } else {
    const date = new Date(quote.data);
    if (isNaN(date.getTime())) {
      errors.push({
        level: 1,
        field: "data",
        message: "Data non valida",
        severity: "error",
      });
    }
    // Non più di 2 anni fa
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 2);
    if (date < maxAge) {
      errors.push({
        level: 1,
        field: "data",
        message: "Data troppo vecchia (più di 2 anni)",
        severity: "warning",
      });
    }
  }

  // Cliente
  if (!quote.cliente || !quote.cliente.nome) {
    errors.push({
      level: 1,
      field: "cliente.nome",
      message: "Nome cliente obbligatorio",
      severity: "error",
    });
  }

  // Segmentazione
  if (!quote.ambito) {
    errors.push({
      level: 1,
      field: "ambito",
      message: "Ambito di lavoro mancante",
      severity: "error",
    });
  }

  if (!quote.sottotipo) {
    errors.push({
      level: 1,
      field: "sottotipo",
      message: "Tipo di lavoro mancante",
      severity: "error",
    });
  }

  // Stato e source
  const validStates = ["bozza", "finalizzato", "inviato", "accettato", "rifiutato", "archiviato"];
  if (!quote.stato || !validStates.includes(quote.stato)) {
    errors.push({
      level: 1,
      field: "stato",
      message: `Stato non valido. Ammessi: ${validStates.join(", ")}`,
      severity: "error",
    });
  }

  const validSources = ["manuale", "pdf", "ocr", "import"];
  if (!quote.source || !validSources.includes(quote.source)) {
    errors.push({
      level: 1,
      field: "source",
      message: `Sorgente non valida. Ammessi: ${validSources.join(", ")}`,
      severity: "error",
    });
  }

  // Servizi e totale
  if (!Array.isArray(quote.servizi) || quote.servizi.length === 0) {
    errors.push({
      level: 1,
      field: "servizi",
      message: "Almeno un servizio è obbligatorio",
      severity: "error",
    });
  } else {
    // Valida ogni servizio
    for (let i = 0; i < quote.servizi.length; i++) {
      const svc = quote.servizi[i];

      if (!svc.descrizione) {
        errors.push({
          level: 1,
          field: `servizi[${i}].descrizione`,
          message: "Descrizione servizio mancante",
          severity: "error",
        });
      }

      if (typeof svc.quantita !== "number" || svc.quantita <= 0) {
        errors.push({
          level: 1,
          field: `servizi[${i}].quantita`,
          message: "Quantità non valida (deve essere > 0)",
          severity: "error",
        });
      }

      if (typeof svc.prezzoUnitario !== "number" || svc.prezzoUnitario < 0) {
        errors.push({
          level: 1,
          field: `servizi[${i}].prezzoUnitario`,
          message: "Prezzo unitario non valido",
          severity: "error",
        });
      }

      if (typeof svc.totale !== "number" || svc.totale < 0) {
        errors.push({
          level: 1,
          field: `servizi[${i}].totale`,
          message: "Totale servizio non valido",
          severity: "error",
        });
      }
    }
  }

  if (typeof quote.totale !== "number" || quote.totale <= 0) {
    errors.push({
      level: 1,
      field: "totale",
      message: "Totale preventivo mancante o non valido",
      severity: "error",
    });
  }

  // Metratura
  if (quote.mq !== undefined && (typeof quote.mq !== "number" || quote.mq <= 0 || quote.mq > 1000000)) {
    errors.push({
      level: 1,
      field: "mq",
      message: "Metratura non plausibile",
      severity: "warning",
    });
  }

  return errors;
}

// ============================================================================
// LIVELLO 2: Coerenza interna
// ============================================================================

function validateLevel2(quote: Partial<Quote>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!quote.servizi || quote.servizi.length === 0 || typeof quote.totale !== "number") {
    return errors;
  }

  // Somma righe vs totale
  const sumServices = quote.servizi.reduce((s, svc) => s + (svc.totale || 0), 0);
  const tolerance = Math.max(quote.totale * 0.05, 5); // 5% o €5 minimo

  if (Math.abs(sumServices - quote.totale) > tolerance) {
    errors.push({
      level: 2,
      field: "totale",
      message: `Totale incoerente: servizi €${sumServices.toFixed(2)}, dichiarato €${quote.totale.toFixed(2)} (diff: €${Math.abs(sumServices - quote.totale).toFixed(2)})`,
      severity: "error",
    });
  }

  // Ogni servizio: quantita * prezzoUnitario ≈ totale
  for (let i = 0; i < quote.servizi.length; i++) {
    const svc = quote.servizi[i];
    if (svc.quantita > 0 && svc.prezzoUnitario > 0) {
      const calculated = svc.quantita * svc.prezzoUnitario;
      const svcTolerance = Math.max(calculated * 0.02, 1); // 2%

      if (Math.abs(calculated - svc.totale) > svcTolerance) {
        errors.push({
          level: 2,
          field: `servizi[${i}].totale`,
          message: `Totale servizio incoerente: ${svc.quantita} × €${svc.prezzoUnitario.toFixed(2)} = €${calculated.toFixed(2)}, dichiarato €${svc.totale.toFixed(2)}`,
          severity: "warning",
        });
      }
    }
  }

  // Unità di misura plausibili
  const plausibleUnits = [
    "mq",
    "m²",
    "m",
    "pz",
    "pezzo",
    "ora",
    "h",
    "giorno",
    "gg",
    "kg",
    "litro",
    "l",
    "unità",
    "forfettario",
  ];
  for (let i = 0; i < quote.servizi.length; i++) {
    const unit = quote.servizi[i].unitaMisura?.toLowerCase() || "";
    if (unit && !plausibleUnits.some((u) => unit.includes(u))) {
      errors.push({
        level: 2,
        field: `servizi[${i}].unitaMisura`,
        message: `Unità di misura inusuale: "${quote.servizi[i].unitaMisura}"`,
        severity: "warning",
      });
    }
  }

  // Compatibilità servizi con ambito (validazione soft)
  const ambitoLower = (quote.ambito || "").toLowerCase();
  const serviziBasses = quote.servizi.map((s) => s.descrizione.toLowerCase());

  // Esempi di incompatibilità
  if (ambitoLower.includes("impianti") && serviziBasses.some((s) => s.includes("piastrella"))) {
    errors.push({
      level: 2,
      field: "servizi",
      message: "Possibile incoerenza: servizio posa piastrelle in ambito impianti",
      severity: "warning",
    });
  }

  return errors;
}

// ============================================================================
// LIVELLO 3: Statistica (richiede dataset di riferimento)
// ============================================================================

export type StatisticalContext = {
  averagePrice: number;
  stdDev: number;
  minPrice: number;
  maxPrice: number;
  countBySegment: Record<string, number>;
  avgBySegment: Record<string, number>;
};

function validateLevel3(quote: Partial<Quote>, context?: StatisticalContext): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!context || typeof quote.totale !== "number") {
    return errors;
  }

  // Z-score: quante standard deviation dal media?
  const zScore = Math.abs((quote.totale - context.averagePrice) / (context.stdDev || 1));

  if (zScore > 3) {
    errors.push({
      level: 3,
      field: "totale",
      message: `Prezzo anomalo (z-score: ${zScore.toFixed(2)}). Media: €${context.averagePrice.toFixed(0)}, Questo: €${quote.totale.toFixed(0)}`,
      severity: "warning",
    });
  }

  // Outlier range (IQR method)
  if (quote.totale < context.minPrice * 0.1 || quote.totale > context.maxPrice * 10) {
    errors.push({
      level: 3,
      field: "totale",
      message: `Prezzo fuori range statistico [${context.minPrice}, ${context.maxPrice}]`,
      severity: "warning",
    });
  }

  // Controllo per segmento
  if (quote.sottotipo && context.avgBySegment[quote.sottotipo]) {
    const segmentAvg = context.avgBySegment[quote.sottotipo];
    const deviation = Math.abs((quote.totale - segmentAvg) / segmentAvg);

    if (deviation > 0.5) {
      // ±50% dal segmento
      errors.push({
        level: 3,
        field: "totale",
        message: `Prezzo ${deviation > 0 ? "superiore" : "inferiore"} alla media del segmento "${quote.sottotipo}" (segmento avg: €${segmentAvg.toFixed(0)})`,
        severity: "warning",
      });
    }
  }

  return errors;
}

// ============================================================================
// API Principale
// ============================================================================

/**
 * Valida un preventivo su tutti e 3 i livelli
 */
export function validateQuoteMultiLevel(
  quote: Partial<Quote>,
  context?: StatisticalContext
): ValidationResult {
  const allErrors: ValidationError[] = [];

  // Livello 1
  allErrors.push(...validateLevel1(quote));

  // Livello 2 (solo se Livello 1 passa)
  if (!allErrors.some((e) => e.level === 1 && e.severity === "error")) {
    allErrors.push(...validateLevel2(quote));
  }

  // Livello 3 (statistico)
  if (context) {
    allErrors.push(...validateLevel3(quote, context));
  }

  // Calcola quality score (100 - penalty)
  let qualityScore = 100;
  allErrors.forEach((err) => {
    if (err.severity === "error") qualityScore -= 25;
    else if (err.level === 1) qualityScore -= 10;
    else if (err.level === 2) qualityScore -= 5;
    else qualityScore -= 3; // Livello 3
  });
  qualityScore = Math.max(0, Math.min(100, qualityScore));

  // Calcola anomaly score
  let anomalyScore = 0;
  const level3Errors = allErrors.filter((e) => e.level === 3);
  if (level3Errors.length > 0) {
    anomalyScore = Math.min(100, level3Errors.length * 20);
  }

  return {
    valid: !allErrors.some((e) => e.severity === "error"),
    errors: allErrors,
    qualityScore,
    anomalyScore,
  };
}

/**
 * Determina se una quote è pronta per training (confidenza > soglia)
 */
export function isQuoteValidForTraining(result: ValidationResult, threshold: number = 70): boolean {
  return result.qualityScore >= threshold && !result.errors.some((e) => e.severity === "error");
}

/**
 * Classifica quote per severità
 */
export function classifyQuoteStatus(result: ValidationResult): "accepted" | "review" | "rejected" {
  if (result.qualityScore >= 80 && !result.errors.some((e) => e.severity === "error")) {
    return "accepted";
  } else if (result.qualityScore >= 50) {
    return "review";
  } else {
    return "rejected";
  }
}
