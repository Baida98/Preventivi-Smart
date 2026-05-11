/**
 * AI Quote Extractor — Estrazione strutturata da testo PDF via LLM
 *
 * Sostituisce il parser regex per PDF complessi e scansionati.
 * Usa HF Router (Qwen 72B) per estrarre JSON strutturato con alta precisione.
 *
 * Flusso:
 *   extractedText → LLM → AIExtractedQuote (JSON) → used in ocr-pipeline
 */

import { callLLM } from "./llm-provider";

export interface AIExtractedQuote {
  /** Importo totale in € (IVA inclusa se indicata) */
  totalAmount: number;
  /** Categoria di lavoro rilevata */
  category: "edilizia" | "clima" | "infissi" | "fotovoltaico" | "idraulica" | "imbiancatura" | "elettrico" | "altro";
  /** Descrizione breve del lavoro principale */
  jobType: string;
  /** Voci del preventivo */
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    unit: string;
  }>;
  /** Regione italiana se menzionata */
  region: string | null;
  /** 0-1: quanto è affidabile l'estrazione */
  confidence: number;
  /** Sintesi in italiano del preventivo */
  rawSummary: string;
}

const SYSTEM_PROMPT = `Sei un esperto analizzatore di preventivi italiani per lavori edili e impiantistici.
Dato il testo estratto da un preventivo PDF, estrai le informazioni chiave in formato JSON.

Rispondi SOLO con un oggetto JSON valido con questa struttura esatta:
{
  "totalAmount": <number — importo totale in euro, 0 se non trovato>,
  "category": <"edilizia"|"clima"|"infissi"|"fotovoltaico"|"idraulica"|"imbiancatura"|"elettrico"|"altro">,
  "jobType": <string — descrizione breve del lavoro principale in italiano>,
  "items": [
    {"description": <string>, "quantity": <number>, "unitPrice": <number>, "total": <number>, "unit": <string>}
  ],
  "region": <string|null — regione italiana se menzionata, altrimenti null>,
  "confidence": <number 0.0-1.0>,
  "rawSummary": <string — sintesi in 1-2 frasi>
}

Regole:
- totalAmount: importo finale con IVA se presente, altrimenti imponibile
- category: scegli quella più vicina al lavoro descritto
- confidence: 0.9+ dati chiari, 0.7-0.9 buoni, 0.5-0.7 parziali, <0.5 incerti
- Se il testo NON è un preventivo: confidence < 0.3
- Normalizza numeri italiani: "1.200,50" → 1200.50, "€ 500" → 500
- Non inventare dati non presenti nel testo`;

/**
 * Estrae dati strutturati da testo PDF tramite LLM.
 * Ritorna null se il token non è configurato o se l'estrazione fallisce.
 */
export async function extractQuoteWithAI(
  extractedText: string
): Promise<AIExtractedQuote | null> {
  if (!extractedText || extractedText.trim().length < 30) return null;

  // Limita per non sprecare token (3000 caratteri coprono qualsiasi preventivo)
  const textSnippet = extractedText.slice(0, 3000);

  try {
    const response = await callLLM(
      [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analizza questo preventivo e restituisci il JSON:\n\n---\n${textSnippet}\n---`,
        },
      ],
      { model: "smart", temperature: 0.1, maxTokens: 1200, jsonMode: true }
    );

    const parsed = JSON.parse(response) as AIExtractedQuote;

    // Sanity checks
    if (typeof parsed.totalAmount !== "number" || parsed.totalAmount < 0) {
      parsed.totalAmount = 0;
    }
    const validCategories = ["edilizia", "clima", "infissi", "fotovoltaico", "idraulica", "imbiancatura", "elettrico", "altro"];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = "altro";
    }
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence ?? 0.5));
    if (!Array.isArray(parsed.items)) parsed.items = [];

    return parsed;
  } catch (err) {
    console.warn("[AIExtractor] Estrazione fallita:", err);
    return null;
  }
}
