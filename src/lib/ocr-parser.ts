/**
 * PHASE 3: OCR Parsing — Estrazione strutturata dai preventivi
 * 
 * Dalla stringa OCR/estratta al modello Quote strutturato.
 * Estrae: cliente, data, servizi, quantità, prezzo unitario, totale.
 * 
 * Regola fondamentale: il totale deve coerere con le righe.
 * Se non torna, il documento va in revisione o viene scartato.
 */

import type { Service, Quote } from "./quote-model";

export type ParsedQuoteData = {
  cliente: {
    nome: string;
    cognome?: string;
    indirizzo?: string;
  };
  data?: string; // ISO 8601
  servizi: Service[];
  totale: number;
  mq?: number;
  note?: string;
  confidenceScore: number; // 0-100
  warnings: string[];
  invalid?: boolean;
};

/**
 * Regex patterns per estrazione campi
 */
const PATTERNS = {
  // Data: 12/05/2026 o 12-05-2026 o 12 maggio 2026
  date: /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})|(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/i,

  // Metratura: "123 mq" o "123 m²" o "123 m2"
  squareMeters: /(\d+(?:[.,]\d+)?)\s*(?:mq|m²|m2)/i,

  // Prezzi: €123,45 o 123,45 EUR ecc
  price: /(?:€|EUR)?\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\s*(?:€|EUR)?/gi,

  // Nome cliente: di solito seguito da "Sig." o all'inizio
  clientName: /(?:Sig\.?\s+)?([A-Z][a-zàèéìòù]+(?:\s+[A-Z][a-zàèéìòù]+)*)/i,

  // Righe di servizio (pattern semplice)
  serviceLine: /^(.{5,80}?)\s+(\d+(?:[.,]\d+)?)\s+(?:x|×)\s*(\d+(?:[.,]\d+)?)\s*(?:€|EUR)?\s*=?\s*(\d+(?:[.,]\d+)?)/gim,
};

const MONTHS_IT = {
  gennaio: 1,
  febbraio: 2,
  marzo: 3,
  aprile: 4,
  maggio: 5,
  giugno: 6,
  luglio: 7,
  agosto: 8,
  settembre: 9,
  ottobre: 10,
  novembre: 11,
  dicembre: 12,
};

/**
 * Normalizza importo da stringa a numero
 */
function normalizePrice(str: string): number {
  let s = str.replace(/[€EUR]/gi, "").trim();

  // Italian format: 1.234,56
  if (s.match(/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/)) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.match(/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/)) {
    // English format: 1,234.56
    s = s.replace(/,/g, "");
  } else {
    s = s.replace(",", ".");
  }

  return parseFloat(s) || 0;
}

/**
 * Estrae data dalla stringa
 */
function extractDate(text: string): string | undefined {
  const match = text.match(PATTERNS.date);
  if (!match) return undefined;

  try {
    let day, month, year;

    if (match[1]) {
      // Formato numerico: 12/05/2026
      day = parseInt(match[1]);
      month = parseInt(match[2]);
      year = parseInt(match[3]);
    } else if (match[4]) {
      // Formato testo: 12 maggio 2026
      day = parseInt(match[4]);
      const monthName = match[5].toLowerCase() as keyof typeof MONTHS_IT;
      month = MONTHS_IT[monthName];
      year = parseInt(match[6]);
    } else {
      return undefined;
    }

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000 || year > 2099) {
      return undefined;
    }

    const date = new Date(year, month - 1, day);
    return date.toISOString().split("T")[0];
  } catch {
    return undefined;
  }
}

/**
 * Estrae metratura
 */
function extractSquareMeters(text: string): number | undefined {
  const match = text.match(PATTERNS.squareMeters);
  if (!match) return undefined;
  return parseFloat(match[1].replace(",", "."));
}

/**
 * Estrae nome cliente
 */
function extractClientName(text: string): { nome: string; cognome?: string } | null {
  // Cerca "Sig. Mario Rossi" o simile
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.toLowerCase().includes("sig") || line.toLowerCase().includes("cliente")) {
      const match = line.match(PATTERNS.clientName);
      if (match) {
        const parts = match[1].split(/\s+/);
        return {
          nome: parts[0],
          cognome: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
        };
      }
    }
  }
  return null;
}

/**
 * Estrae righe di servizio
 */
function extractServices(text: string): Service[] {
  const services: Service[] = [];
  const seen = new Set<string>();
  let counter = 1;

  const regex = new RegExp(PATTERNS.serviceLine.source, PATTERNS.serviceLine.flags);
  let match;

  while ((match = regex.exec(text)) !== null) {
    const descrizione = match[1].trim();
    const quantita = parseFloat(match[2].replace(",", "."));
    const prezzoUnitario = parseFloat(match[3].replace(",", "."));
    const totale = parseFloat(match[4].replace(",", "."));

    // Skip duplicates
    const key = `${descrizione}|${quantita}|${prezzoUnitario}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (descrizione && quantita > 0 && prezzoUnitario >= 0) {
      services.push({
        id: `svc-${counter++}`,
        descrizione,
        quantita,
        unitaMisura: "unità",
        prezzoUnitario,
        totale: totale || quantita * prezzoUnitario,
      });
    }
  }

  return services;
}

/**
 * Estrae il totale dal testo
 */
function extractTotal(text: string): number | null {
  // Cerca riga con "Totale: €X.XXX,XX"
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.toLowerCase().includes("totale") || line.toLowerCase().includes("importo")) {
      const match = line.match(PATTERNS.price);
      if (match) {
        return normalizePrice(match[0]);
      }
    }
  }

  // Fallback: prezzo più grande
  const matches = Array.from(text.matchAll(PATTERNS.price));
  if (matches.length > 0) {
    return normalizePrice(matches[matches.length - 1][0]);
  }

  return null;
}

/**
 * Valida coerenza: totale deve corrispondere a somma servizi (±5%)
 */
function validateTotalCoherence(servizi: Service[], totale: number): {
  valid: boolean;
  warning?: string;
} {
  if (servizi.length === 0) {
    return { valid: false, warning: "Nessun servizio trovato" };
  }

  const sumServices = servizi.reduce((s, svc) => s + svc.totale, 0);
  const tolerance = Math.max(totale * 0.05, 5); // 5% o €5

  if (Math.abs(sumServices - totale) > tolerance) {
    return {
      valid: false,
      warning: `Totale non coerente: servizi €${sumServices.toFixed(2)}, dichiarato €${totale.toFixed(2)}`,
    };
  }

  return { valid: true };
}

/**
 * Pipeline principale di parsing
 */
export function parseQuoteFromText(text: string, source: "ocr" | "pdf" = "ocr"): ParsedQuoteData {
  const warnings: string[] = [];
  let confidenceScore = 100;
  let invalid = false;

  // Estrai campi
  const clientData = extractClientName(text);
  if (!clientData) {
    warnings.push("Nome cliente non trovato o poco chiaro");
    confidenceScore -= 15;
  }

  const data = extractDate(text);
  if (!data) {
    warnings.push("Data non trovata");
    confidenceScore -= 10;
  }

  const mq = extractSquareMeters(text);

  const servizi = extractServices(text);
  if (servizi.length === 0) {
    warnings.push("Nessun servizio trovato nella struttura attesa");
    confidenceScore -= 25;
  }

  const totalPrice = extractTotal(text);
  // Fix: Controlla sempre totale
  if (totalPrice === null || totalPrice <= 0) {
    warnings.push("Totale non trovato o non valido");
    confidenceScore -= 20;
    invalid = true;
  }

  // Valida coerenza
  if (servizi.length > 0 && totalPrice) {
    const coherenceCheck = validateTotalCoherence(servizi, totalPrice);
    if (!coherenceCheck.valid && coherenceCheck.warning) {
      warnings.push(coherenceCheck.warning);
      confidenceScore -= 20;
    }
  }

  // Source impact
  if (source === "ocr") {
    confidenceScore -= 10; // OCR è meno affidabile di PDF nativo
  }

  // Applica peso warning
  confidenceScore = Math.max(0, Math.min(100, confidenceScore));

  return {
    cliente: clientData || { nome: "Non identificato" },
    data,
    servizi,
    totale: totalPrice || 0,
    mq,
    confidenceScore,
    warnings,
    invalid
  };
}

/**
 * Converte ParsedQuoteData a Quote (parziale, serve ancora uid, numero, etc.)
 */
export function createQuoteFromParsedData(
  parsed: ParsedQuoteData,
  userId: string,
  quoteNumber: string
): Partial<Quote> {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  // Fix: Distinzione reale tra sorgente PDF e OCR e standardizzazione qualityScore
  return {
    uid: userId,
    numero: quoteNumber,
    data: parsed.data || today,
    createdAt: now,
    updatedAt: now,
    cliente: parsed.cliente,
    ambito: "da-determinare",
    sottotipo: "da-determinare",
    mq: parsed.mq,
    servizi: parsed.servizi,
    totale: parsed.totale,
    stato: "bozza",
    source: "pdf", // Assumiamo PDF se estratto tramite questa pipeline
    note: parsed.warnings.length > 0 ? `Avvertimenti: ${parsed.warnings.join("; ")}` : undefined,
    qualityScore: parsed.confidenceScore / 100, // Standardizza 0-1
    validated: parsed.confidenceScore >= 70 && !parsed.invalid,
  };
}
