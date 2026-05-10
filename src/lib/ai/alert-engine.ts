/**
 * AI Alert Engine — Analisi proattiva di bandiere rosse nel testo del preventivo
 *
 * Dato il testo estratto da PDF (o note manuali), l'AI identifica:
 * - Clausole problematiche (acconto eccessivo, mancanza garanzie, penali unilaterali)
 * - Ambiguità pericoli (lavori "in opera" senza specifiche)
 * - Segnali di preventivo gonfiato o di qualità scadente
 *
 * Usato da: AIInsightCard, AIPriceHint, ocr-pipeline
 */

import { callLLM } from "./llm-provider";

export interface AlertEntry {
  level: "info" | "warning" | "danger";
  message: string;
  suggestion: string;
}

export interface AlertAnalysis {
  alerts: AlertEntry[];
  overallRisk: "basso" | "medio" | "alto";
  trustScore: number; // 0-100
}

const SYSTEM_PROMPT = `Sei un avvocato e consulente specializzato in contratti per lavori edili italiani.
Analizza il testo di un preventivo e individua problemi, clausole pericolose, ambiguità.
Rispondi SOLO con JSON valido: {"alerts": [{"level": "info|warning|danger", "message": "...", "suggestion": "..."}], "overallRisk": "basso|medio|alto", "trustScore": 0-100}`;

export async function analyzeAlerts(
  text: string,
  price: number
): Promise<AlertAnalysis | null> {
  if (!text || text.trim().length < 30) return null;

  const truncated = text.slice(0, 2000);
  const msg = `Analizza questo preventivo (importo: €${price.toLocaleString("it-IT")}):

${truncated}

Identifica fino a 5 problemi/bandiere rosse critici. Sii conciso.`;

  try {
    const response = await callLLM(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: msg },
      ],
      { model: "fast", temperature: 0.2, maxTokens: 600, jsonMode: true }
    );
    const parsed = JSON.parse(response) as AlertAnalysis;
    return {
      ...parsed,
      alerts: (parsed.alerts || []).slice(0, 5),
      trustScore: Math.min(100, Math.max(0, parsed.trustScore || 50)),
    };
  } catch {
    return null;
  }
}
