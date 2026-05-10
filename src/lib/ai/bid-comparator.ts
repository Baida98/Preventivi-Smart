/**
 * AI Bid Comparator — Confronto tra più preventivi dello stesso lavoro
 *
 * L'utente può inserire i prezzi di N preventivi ricevuti e l'AI
 * suggerisce quale scegliere e perché, basandosi su prezzo e contesto.
 */

import { callLLM } from "./llm-provider";

export interface BidEntry {
  name: string; // "Preventivo A", "Mario Rossi Impianti", ecc.
  price: number;
  notes?: string; // note opzionali
}

export interface BidComparison {
  winner: string; // nome del vincitore
  winnerReason: string; // motivazione
  rankings: {
    name: string;
    rank: number;
    assessment: string;
    flagged?: boolean; // troppo basso o troppo alto
  }[];
  recommendation: string;
  warningIfAny?: string;
}

export async function compareBids(params: {
  bids: BidEntry[];
  jobLabel: string;
  marketMid: number;
  marketMin: number;
  marketMax: number;
  regionLabel: string;
}): Promise<BidComparison | null> {
  const { bids, jobLabel, marketMid, marketMin, marketMax, regionLabel } = params;
  if (bids.length < 2) return null;

  const bidsText = bids.map((b, i) =>
    `${i + 1}. ${b.name}: €${b.price.toLocaleString("it-IT")}${b.notes ? ` (note: ${b.notes})` : ""}`
  ).join("\n");

  const msg = `Lavoro: ${jobLabel} in ${regionLabel}
Range di mercato verificato: €${marketMin.toLocaleString("it-IT")} – €${marketMax.toLocaleString("it-IT")}
Media di mercato: €${marketMid.toLocaleString("it-IT")}

Preventivi ricevuti:
${bidsText}

Analizza i preventivi e indica il migliore. Considera: distanza dal mercato, bandiere rosse (troppo basso = qualità dubbia, troppo alto = gonfiato).

Rispondi in JSON: {
  "winner": "nome del vincitore",
  "winnerReason": "motivazione in 1 frase",
  "rankings": [
    {"name": "...", "rank": 1, "assessment": "valutazione breve", "flagged": false}
  ],
  "recommendation": "consiglio finale in 1 frase",
  "warningIfAny": "avvertimento se uno è sospetto (o null)"
}`;

  try {
    const response = await callLLM(
      [
        {
          role: "system",
          content:
            "Sei un esperto di valutazione preventivi edili italiani. Rispondi SOLO con JSON valido.",
        },
        { role: "user", content: msg },
      ],
      { model: "fast", temperature: 0.3, maxTokens: 600, jsonMode: true }
    );
    return JSON.parse(response) as BidComparison;
  } catch {
    return null;
  }
}
