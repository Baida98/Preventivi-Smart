/**
 * ConsensusMode — Orchestrazione Multi-Provider
 * 
 * Implementa la Fase 5: mantiene la qualità alta senza saturare l'iPhone.
 * Usa Gemini come judge principale per sintetizzare le risposte.
 */

import { callLLM, streamLLM, type LLMMessage, PROVIDERS, MODELS } from './llm-provider';

export interface ConsensusResult {
  finalAnswer: string;
  sources: { provider: string; content: string }[];
  confidence: number;
}

export async function runConsensus(
  messages: LLMMessage[],
  onChunk?: (chunk: string) => void
): Promise<ConsensusResult> {
  // 1. Ottieni risposte da più provider veloci in parallelo (limitato a 2 per iPhone)
  const providersToTry = [PROVIDERS.GROQ, PROVIDERS.HF];
  const responses = await Promise.allSettled(
    providersToTry.map(p => callLLM(messages, { model: MODELS[p].fast, maxTokens: 500 }))
  );

  const sources = responses
    .map((r, i) => ({
      provider: providersToTry[i],
      content: r.status === 'fulfilled' ? r.value : ''
    }))
    .filter(s => s.content.length > 0);

  if (sources.length === 0) {
    throw new Error("Tutti i provider di consensus hanno fallito.");
  }

  // 2. Usa Gemini come Judge per la sintesi finale
  const judgePrompt: LLMMessage[] = [
    {
      role: "system",
      content: "Sei un esperto coordinatore. Hai ricevuto diverse analisi di un preventivo. Il tuo compito è sintetizzarle in una risposta unica, coerente e professionale in italiano. Se ci sono discordanze, privilegia il dato più conservativo."
    },
    {
      role: "user",
      content: `Analisi ricevute:\n${sources.map(s => `[Provider ${s.provider}]: ${s.content}`).join('\n\n')}\n\nSintetizza ora:`
    }
  ];

  let finalAnswer = "";
  if (onChunk) {
    finalAnswer = await streamLLM(judgePrompt, onChunk, { model: MODELS.gemini.smart });
  } else {
    finalAnswer = await callLLM(judgePrompt, { model: MODELS.gemini.smart });
  }

  return {
    finalAnswer,
    sources,
    confidence: sources.length / providersToTry.length
  };
}
