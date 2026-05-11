/**
 * AI Seasonal Advisor — Consigli stagionali per il timing del preventivo
 *
 * Analizza il mese corrente + la categoria di lavoro e suggerisce
 * se è il momento giusto per procedere o aspettare una stagione migliore.
 * (Es: estate = alta stagione per clima, inverno = bassa stagione per edilizia)
 */

import { callLLM } from "./llm-provider";

export interface SeasonalAdvice {
  season: "ottima" | "buona" | "media" | "sfavorevole";
  shortReason: string;
  waitSuggestion?: string;
  savingsPotential?: string; // es "10-15% di sconto a febbraio"
  urgencyIndicator: "urgente" | "normale" | "posticipabile";
}

const MONTH_NAMES = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

export async function getSeasonalAdvice(
  categoryId: string,
  jobLabel: string,
  price: number
): Promise<SeasonalAdvice | null> {
  const month = MONTH_NAMES[new Date().getMonth()];
  const msg = `Categoria: ${categoryId} (${jobLabel})
Mese corrente: ${month}
Prezzo preventivo: €${price.toLocaleString("it-IT")}

È una buona stagione per far eseguire questo tipo di lavoro in Italia?
Considera: domanda stagionale, disponibilità delle imprese, costi materiali, meteo.

Rispondi in JSON: {
  "season": "ottima|buona|media|sfavorevole",
  "shortReason": "motivazione breve (max 100 caratteri)",
  "waitSuggestion": "suggerimento su quando aspettare (o null se conviene ora)",
  "savingsPotential": "risparmio potenziale aspettando (o null)",
  "urgencyIndicator": "urgente|normale|posticipabile"
}`;

  try {
    const response = await callLLM(
      [
        {
          role: "system",
          content:
            "Sei un esperto di mercato italiano per lavori edili e impiantistici. Rispondi SOLO con JSON valido.",
        },
        { role: "user", content: msg },
      ],
      { model: "fast", temperature: 0.3, maxTokens: 250, jsonMode: true }
    );
    return JSON.parse(response) as SeasonalAdvice;
  } catch {
    return null;
  }
}
