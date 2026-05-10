/**
 * AI Negotiation Tips — Suggerimenti di negoziazione sul preventivo
 *
 * Analizza il verdetto e il prezzo e suggerisce tattiche di negoziazione
 * specifiche per la regione e categoria di lavoro.
 */

import { callLLM } from "./llm-provider";

export interface NegotiationTip {
  tactic: string;
  effect: string;
  difficulty: "facile" | "media" | "difficile";
  savingRange?: string; // es. "5-10%"
}

export interface NegotiationAdvice {
  overallStrategy: string;
  tips: NegotiationTip[];
  keyPhrase: string; // frase chiave da usare col fornitore
}

export async function getNegotiationAdvice(params: {
  verdict: string; // ottimo | equo | alto | troppo-alto | sospetto
  price: number;
  marketMid: number;
  jobLabel: string;
  categoryId: string;
  regionLabel: string;
}): Promise<NegotiationAdvice | null> {
  const { verdict, price, marketMid, jobLabel, categoryId, regionLabel } = params;
  const gap = Math.round(((price - marketMid) / marketMid) * 100);

  const msg = `Preventivo ricevuto:
Lavoro: ${jobLabel} (${categoryId})
Regione: ${regionLabel}
Prezzo offerto: €${price.toLocaleString("it-IT")}
Prezzo medio di mercato: €${marketMid.toLocaleString("it-IT")}
Scostamento: ${gap > 0 ? "+" : ""}${gap}%
Verdetto analisi: ${verdict}

Fornisci 3 tattiche di negoziazione pratiche e specifiche per il mercato italiano.
Considera: stagionalità, concorrenza locale, volume di lavoro, referenze.

Rispondi in JSON: {
  "overallStrategy": "strategia generale in 1 frase",
  "tips": [
    {
      "tactic": "nome della tattica",
      "effect": "effetto atteso (1 frase)",
      "difficulty": "facile|media|difficile",
      "savingRange": "X-Y% (o null)"
    }
  ],
  "keyPhrase": "frase chiave letterale da dire al fornitore"
}`;

  try {
    const response = await callLLM(
      [
        {
          role: "system",
          content:
            "Sei un esperto negoziatore nel settore edile italiano con 20 anni di esperienza. Dai consigli pratici e specifici. Rispondi SOLO con JSON valido.",
        },
        { role: "user", content: msg },
      ],
      { model: "fast", temperature: 0.5, maxTokens: 600, jsonMode: true }
    );
    const parsed = JSON.parse(response) as NegotiationAdvice;
    // Keep only up to 3 tips
    if (parsed.tips?.length > 3) parsed.tips = parsed.tips.slice(0, 3);
    return parsed;
  } catch {
    return null;
  }
}
