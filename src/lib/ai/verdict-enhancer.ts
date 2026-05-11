/**
 * Verdict Enhancer — Approfondimento AI del verdetto standard
 *
 * Dopo l'analisi statistica di judge(), usa il LLM per generare
 * un'analisi contestuale personalizzata in italiano:
 *   - deepAnalysis: paragrafo di analisi (2-3 frasi)
 *   - keyRisks: rischi specifici per categoria e regione
 *   - negotiationTips: consiglio di trattativa pratico
 *   - redFlags: segnali d'allarme se il prezzo è anomalo
 */

import { callLLM } from "./llm-provider";
import type { Verdict } from "../verdict";
import { fmtEUR } from "../format";

export interface AIVerdictInsight {
  deepAnalysis: string;
  keyRisks: string[];
  negotiationTips: string;
  redFlags: string[];
}

const SYSTEM_PROMPT = `Sei un esperto consulente italiano di prezzi per lavori edili e impiantistici.
Analizza il preventivo e fornisci un'analisi professionale concisa.
Rispondi SOLO con un oggetto JSON valido. Usa italiano chiaro e diretto.`;

/**
 * Chiama il LLM per approfondire il verdetto statico con analisi contestuale.
 * Ritorna null se il token non è configurato o l'LLM fallisce.
 */
export async function enhanceVerdictWithAI(params: {
  price: number;
  category: string;
  jobLabel: string;
  region: string;
  quantity: number;
  unitLabel: string;
  verdict: Verdict;
  marketMin: number;
  marketMid: number;
  marketMax: number;
}): Promise<AIVerdictInsight | null> {
  const {
    price,
    category,
    jobLabel,
    region,
    quantity,
    unitLabel,
    verdict,
    marketMin,
    marketMid,
    marketMax,
  } = params;

  const diffPct = Math.round(((price - marketMid) / marketMid) * 100);
  const sign = diffPct >= 0 ? "+" : "";

  const userMsg = `Preventivo da analizzare:
- Lavoro: ${jobLabel}
- Categoria: ${category}
- Regione: ${region}
- Quantità: ${quantity} ${unitLabel}
- Prezzo richiesto: ${fmtEUR(price)}
- Benchmark mercato: min ${fmtEUR(marketMin)} — medio ${fmtEUR(marketMid)} — max ${fmtEUR(marketMax)}
- Scostamento dalla media: ${sign}${diffPct}%
- Verdetto automatico: ${verdict.label} (${verdict.key})

Rispondi con JSON:
{
  "deepAnalysis": "<2-3 frasi di analisi contestuale per questo tipo di lavoro in questa regione>",
  "keyRisks": ["<rischio 1>", "<rischio 2>"],
  "negotiationTips": "<un consiglio pratico e specifico per la trattativa con l'impresa>",
  "redFlags": ["<segnale d'allarme se presente — lascia array vuoto se tutto ok>"]
}`;

  try {
    const response = await callLLM(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
      { model: "smart", temperature: 0.3, maxTokens: 600, jsonMode: true }
    );

    const parsed = JSON.parse(response) as AIVerdictInsight;

    return {
      deepAnalysis: parsed.deepAnalysis ?? "",
      keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks.slice(0, 3) : [],
      negotiationTips: parsed.negotiationTips ?? "",
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags.slice(0, 3) : [],
    };
  } catch (err) {
    console.warn("[VerdictEnhancer] Arricchimento AI fallito:", err);
    return null;
  }
}
