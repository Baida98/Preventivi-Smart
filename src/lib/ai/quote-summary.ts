/**
 * AI Quote Summary — Genera un riepilogo esecutivo del preventivo
 *
 * Crea un sommario in linguaggio semplice per l'utente finale,
 * spiegando il verdetto e le azioni consigliate.
 */

import { callLLM } from "./llm-provider";

export interface QuoteSummary {
  headline: string; // una frase incisiva sul preventivo
  pros: string[]; // 2-3 punti positivi
  cons: string[]; // 2-3 punti critici
  actionItems: string[]; // 2-3 azioni concrete da fare
  tldr: string; // riassunto in 30 parole
}

export async function generateQuoteSummary(params: {
  verdict: string;
  price: number;
  marketMin: number;
  marketMid: number;
  marketMax: number;
  jobLabel: string;
  categoryId: string;
  regionLabel: string;
}): Promise<QuoteSummary | null> {
  const { verdict, price, marketMin, marketMid, marketMax, jobLabel, categoryId, regionLabel } = params;
  const pct = Math.round(((price - marketMid) / marketMid) * 100);

  const msg = `Preventivo ricevuto per: ${jobLabel} (${categoryId}) in ${regionLabel}
Prezzo offerto: €${price.toLocaleString("it-IT")}
Range di mercato: €${marketMin.toLocaleString("it-IT")} – €${marketMax.toLocaleString("it-IT")}
Media di mercato: €${marketMid.toLocaleString("it-IT")}
Scostamento: ${pct > 0 ? "+" : ""}${pct}%
Verdetto analisi: ${verdict}

Genera un riepilogo esecutivo in italiano per il cliente (non tecnico).

Rispondi in JSON: {
  "headline": "titolo incisivo in 8-10 parole",
  "pros": ["punto positivo 1", "punto positivo 2"],
  "cons": ["punto critico 1", "punto critico 2"],
  "actionItems": ["azione concreta 1", "azione concreta 2", "azione concreta 3"],
  "tldr": "riassunto in max 30 parole"
}`;

  try {
    const response = await callLLM(
      [
        {
          role: "system",
          content:
            "Sei un consulente immobiliare che spiega analisi di preventivi in modo semplice e diretto. Rispondi SOLO con JSON valido.",
        },
        { role: "user", content: msg },
      ],
      { model: "fast", temperature: 0.4, maxTokens: 500, jsonMode: true }
    );
    return JSON.parse(response) as QuoteSummary;
  } catch {
    return null;
  }
}
