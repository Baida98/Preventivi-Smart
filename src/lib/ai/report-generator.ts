/**
 * AI Report Generator — Genera report testuale professionale del preventivo
 *
 * Usa Qwen 72B per produrre un report strutturato in italiano che l'utente
 * può copiare o stampare. Include analisi completa, comparazione mercato,
 * consigli pratici e clausole contrattuali suggerite.
 */

import { callLLM } from "./llm-provider";
import { fmtEUR } from "../format";
import type { Verdict } from "../verdict";

export interface AIReport {
  title: string;
  summary: string;
  marketAnalysis: string;
  riskAssessment: string;
  negotiationAdvice: string;
  contractClauses: string[];
  finalRecommendation: string;
  generatedAt: string;
}

const SYSTEM_PROMPT = `Sei un consulente professionista italiano specializzato in analisi di preventivi per lavori edili e impiantistici. 
Produci report formali, precisi e utili. Scrivi in italiano professionale ma accessibile. Rispondi SOLO con JSON valido.`;

export async function generateAIReport(params: {
  price: number;
  categoryId: string;
  jobLabel: string;
  regionLabel: string;
  quantity: number;
  unitLabel: string;
  verdict: Verdict;
  marketMin: number;
  marketMid: number;
  marketMax: number;
}): Promise<AIReport | null> {
  const {
    price, categoryId, jobLabel, regionLabel, quantity,
    unitLabel, verdict, marketMin, marketMid, marketMax,
  } = params;

  const diffPct = Math.round(((price - marketMid) / marketMid) * 100);
  const sign = diffPct >= 0 ? "+" : "";

  const userMsg = `Genera un report professionale completo per questo preventivo:

DATI PREVENTIVO:
- Lavoro: ${jobLabel}
- Categoria: ${categoryId}
- Regione: ${regionLabel}
- Quantità: ${quantity} ${unitLabel}
- Prezzo richiesto: ${fmtEUR(price)}
- Benchmark: min ${fmtEUR(marketMin)} — medio ${fmtEUR(marketMid)} — max ${fmtEUR(marketMax)}
- Scostamento: ${sign}${diffPct}%
- Verdetto: ${verdict.label} (${verdict.key})

Produci JSON con:
{
  "title": "<titolo del report>",
  "summary": "<sintesi esecutiva in 2-3 frasi>",
  "marketAnalysis": "<analisi del mercato locale per questa categoria in 3-4 frasi>",
  "riskAssessment": "<valutazione dei rischi in 2-3 frasi>",
  "negotiationAdvice": "<consigli di trattativa dettagliati in 3-4 frasi>",
  "contractClauses": ["<clausola 1 da inserire nel contratto>", "<clausola 2>", "<clausola 3>"],
  "finalRecommendation": "<raccomandazione finale in 1-2 frasi>"
}`;

  try {
    const response = await callLLM(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
      { model: "smart", temperature: 0.4, maxTokens: 1200, jsonMode: true }
    );

    const parsed = JSON.parse(response) as AIReport;
    return {
      ...parsed,
      generatedAt: new Date().toLocaleString("it-IT"),
      contractClauses: Array.isArray(parsed.contractClauses)
        ? parsed.contractClauses.slice(0, 5)
        : [],
    };
  } catch (err) {
    console.warn("[ReportGenerator] Generazione fallita:", err);
    return null;
  }
}

/**
 * Formatta il report come testo plain per copia/stampa
 */
export function formatReportAsText(report: AIReport, params: {
  jobLabel: string;
  regionLabel: string;
  price: number;
  verdict: Verdict;
}): string {
  const { jobLabel, regionLabel, price, verdict } = params;
  const lines = [
    `═══════════════════════════════════════════`,
    `REPORT ANALISI PREVENTIVO`,
    `${report.title}`,
    `Generato il ${report.generatedAt} da Preventivi Smart`,
    `═══════════════════════════════════════════`,
    ``,
    `LAVORO: ${jobLabel} | REGIONE: ${regionLabel}`,
    `PREZZO ANALIZZATO: ${fmtEUR(price)}`,
    `VERDETTO: ${verdict.label}`,
    ``,
    `─── SINTESI ESECUTIVA ───────────────────────`,
    report.summary,
    ``,
    `─── ANALISI DI MERCATO ──────────────────────`,
    report.marketAnalysis,
    ``,
    `─── VALUTAZIONE RISCHI ──────────────────────`,
    report.riskAssessment,
    ``,
    `─── CONSIGLI DI TRATTATIVA ──────────────────`,
    report.negotiationAdvice,
    ``,
    `─── CLAUSOLE CONTRATTUALI SUGGERITE ─────────`,
    ...report.contractClauses.map((c, i) => `${i + 1}. ${c}`),
    ``,
    `─── RACCOMANDAZIONE FINALE ──────────────────`,
    report.finalRecommendation,
    ``,
    `═══════════════════════════════════════════`,
    `Questo report è generato da AI a scopo informativo.`,
    `Non costituisce consulenza legale o contrattuale.`,
    `═══════════════════════════════════════════`,
  ];
  return lines.join("\n");
}
