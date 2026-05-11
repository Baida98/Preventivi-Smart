/**
 * Multi-Quote Comparator — Confronta più preventivi per lo stesso lavoro
 *
 * L'utente può inserire più preventivi ricevuti e l'AI li confronta,
 * segnala anomalie e raccomanda quale accettare.
 */

import { callLLM } from "./llm-provider";
import { fmtEUR } from "../format";

export interface QuoteEntry {
  name: string; // es. "Impresa Rossi"
  price: number;
  notes?: string;
}

export interface MultiQuoteAnalysis {
  recommended: string; // nome del preventivo consigliato
  reason: string;
  warning?: string;
  ranking: Array<{
    name: string;
    verdict: "ottimo" | "buono" | "accettabile" | "caro" | "sospetto";
    note: string;
  }>;
  negotiationTips: string[];
}

export async function compareQuotesWithAI(
  quotes: QuoteEntry[],
  jobLabel: string,
  regionLabel: string,
  marketMid: number
): Promise<MultiQuoteAnalysis | null> {
  if (quotes.length < 2) return null;

  const quotesText = quotes
    .map((q, i) => `${i + 1}. ${q.name}: ${fmtEUR(q.price)}${q.notes ? ` (note: ${q.notes})` : ""}`)
    .join("\n");

  const spread = ((Math.max(...quotes.map(q => q.price)) - Math.min(...quotes.map(q => q.price))) /
    Math.min(...quotes.map(q => q.price)) * 100).toFixed(0);

  const userMsg = `Confronta questi ${quotes.length} preventivi per "${jobLabel}" in ${regionLabel}:
${quotesText}

Prezzo medio di mercato: ${fmtEUR(marketMid)}
Spread tra preventivi: ${spread}%

Rispondi con JSON:
{
  "recommended": "nome impresa consigliata",
  "reason": "spiegazione breve in italiano",
  "warning": "eventuale allerta o null",
  "ranking": [
    {"name": "...", "verdict": "ottimo|buono|accettabile|caro|sospetto", "note": "..."}
  ],
  "negotiationTips": ["consiglio 1", "consiglio 2", "consiglio 3"]
}`;

  try {
    const response = await callLLM(
      [
        {
          role: "system",
          content:
            "Sei un consulente italiano esperto di preventivi edili. Analizza i preventivi e rispondi SOLO con JSON valido.",
        },
        { role: "user", content: userMsg },
      ],
      { model: "smart", temperature: 0.3, maxTokens: 800, jsonMode: true }
    );
    return JSON.parse(response) as MultiQuoteAnalysis;
  } catch {
    return null;
  }
}
