/**
 * AI Payment Schedule — Piano pagamenti suggerito per il lavoro
 *
 * Genera un piano di pagamenti a rate personalizzato per il tipo
 * di lavoro e importo, seguendo le best practice italiane.
 */

import { callLLM } from "./llm-provider";

export interface PaymentScheduleEntry {
  phase: string; // "Acconto", "SAL 1", "Saldo", ecc.
  percentage: number; // 0-100
  amount: number; // calcolato
  timing: string; // "all'ordine", "a metà lavori", "a completamento"
  tip: string; // consiglio per questa tranche
}

export interface PaymentSchedule {
  entries: PaymentScheduleEntry[];
  totalProtection: string; // descrizione della protezione
  keyAdvice: string; // consiglio principale
}

export async function generatePaymentSchedule(params: {
  price: number;
  jobLabel: string;
  categoryId: string;
  duration?: string; // es "2 settimane"
}): Promise<PaymentSchedule | null> {
  const { price, jobLabel, categoryId, duration } = params;

  const msg = `Genera un piano pagamenti ottimale per:
Lavoro: ${jobLabel} (${categoryId})
Importo totale: €${price.toLocaleString("it-IT")}
${duration ? `Durata stimata: ${duration}` : ""}

Segui le best practice italiane: mai pagare tutto in anticipo,
tenere una % a garanzia fino a completamento.

Rispondi in JSON: {
  "entries": [
    {
      "phase": "Acconto",
      "percentage": 20,
      "amount": ${Math.round(price * 0.2)},
      "timing": "all'ordine del lavoro",
      "tip": "consiglio breve"
    }
  ],
  "totalProtection": "descrizione protezione cliente in 1 frase",
  "keyAdvice": "consiglio principale in 1 frase"
}

Usa 3-4 fasi. Le percentuali devono sommare a 100.`;

  try {
    const response = await callLLM(
      [
        {
          role: "system",
          content:
            "Sei un esperto finanziario specializzato in contratti edili italiani. Rispondi SOLO con JSON valido.",
        },
        { role: "user", content: msg },
      ],
      { model: "fast", temperature: 0.3, maxTokens: 500, jsonMode: true }
    );
    const parsed = JSON.parse(response) as PaymentSchedule;
    // Recalculate amounts from percentages
    parsed.entries = parsed.entries.map(e => ({
      ...e,
      amount: Math.round((price * e.percentage) / 100),
    }));
    return parsed;
  } catch {
    return null;
  }
}
