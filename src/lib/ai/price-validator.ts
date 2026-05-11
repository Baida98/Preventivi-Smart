/**
 * AI Price Validator — Valida il prezzo in tempo reale prima dell'analisi
 *
 * Quando l'utente digita un prezzo, questa funzione (con debounce) chiede
 * all'AI se il prezzo ha senso per il lavoro/regione. Ritorna un feedback
 * istantaneo senza attendere l'analisi completa.
 */

import { callLLM } from "./llm-provider";

export type PriceValidationResult = {
  /** true se il prezzo sembra ragionevole */
  plausible: boolean;
  /** Feedback sintetico (1 riga) */
  feedback: string;
  /** Suggerimento di range se il prezzo sembra anomalo */
  suggestedRange?: { min: number; max: number };
  /** true se il prezzo sembra troppo basso (possibile truffa) */
  suspiciouslyLow?: boolean;
};

const SYSTEM_PROMPT = `Sei un esperto di prezzi per lavori edili italiani. 
Rispondi SOLO con JSON valido: {"plausible": bool, "feedback": "stringa breve in italiano", "suggestedRange": {"min": n, "max": n} | null, "suspiciouslyLow": bool}`;

/**
 * Valida il prezzo inserito dall'utente.
 * @param price Prezzo inserito in euro
 * @param jobLabel Tipo di lavoro (es. "Muratura generica")
 * @param regionLabel Regione (es. "Lombardia")
 * @param quantity Quantità (es. 20)
 * @param unitLabel Unità (es. "mq")
 */
export async function validatePriceWithAI(
  price: number,
  jobLabel: string,
  regionLabel: string,
  quantity: number,
  unitLabel: string
): Promise<PriceValidationResult | null> {
  if (price <= 0) return null;

  const pricePerUnit = quantity > 0 ? (price / quantity).toFixed(2) : "N/A";

  const msg = `Preventivo: ${jobLabel} in ${regionLabel}
Quantità: ${quantity} ${unitLabel}
Prezzo totale: €${price.toFixed(2)} (€${pricePerUnit}/${unitLabel})

Il prezzo è plausibile per il mercato italiano 2026? Rispondi in JSON.`;

  try {
    const response = await callLLM(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: msg },
      ],
      { model: "fast", temperature: 0.2, maxTokens: 200, jsonMode: true }
    );
    return JSON.parse(response) as PriceValidationResult;
  } catch {
    return null;
  }
}
