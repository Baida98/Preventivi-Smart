/**
 * OCR Pipeline — Orchestrazione completa con AI extraction
 *
 * Flusso end-to-end:
 *   1. Classificazione PDF (nativo vs scansionato)
 *   2. Estrazione testo (PDF nativo o OCR Tesseract)
 *   3. [NEW] AI Extraction (se token HF disponibile) → parsing LLM più preciso
 *   4. Parsing strutturato (regex — fallback se AI non disponibile)
 *   5. Validazione multi-livello
 *   6. Calcolo confidenza finale
 *
 * FALLBACK: Se confidence < 0.70 → form manuale
 */

import type { Quote } from "./quote-model";
import { preprocessImage, type PreprocessingResult } from "./ocr-preprocessing";
import {
  parseQuoteFromText,
  createQuoteFromParsedData,
  type ParsedQuoteData,
} from "./ocr-parser";
import { classifyPDF, type PDFClassification } from "./ai/pdf-classifier";
import { extractText, type ExtractionResult } from "./ai/text-extractor";
import { calculateQualityScore, isQualityAcceptable } from "./ai/quality-score";
import { calculateConfidence, type ConfidenceFactors } from "./ai/confidence";
import { llmKeys } from "./ai/llm-provider";
import {
  extractQuoteWithAI,
  type AIExtractedQuote,
} from "./ai/quote-extractor-ai";

/** Soglia minima di confidenza — sotto questa soglia si attiva il fallback manuale */
export const OCR_CONFIDENCE_THRESHOLD = 0.70;

/** Timeout OCR in ms — oltre questo limite si mostra il form manuale */
export const OCR_TIMEOUT_MS = 30_000;

export type OCRPipelineResult = {
  success: boolean;
  classification: PDFClassification;
  quote?: Partial<Quote>;
  extractedText?: string;
  preprocessingResult?: PreprocessingResult;
  parsingResult?: ParsedQuoteData;
  confidence: number;
  warnings: string[];
  steps: string[];
  error?: string;
  /** Se true: confidence troppo bassa o timeout → mostra form manuale */
  requiresManualFallback?: boolean;
  fallbackReason?: string;
  /** Categoria rilevata dall'AI (se disponibile) */
  detectedCategory?: string;
  /** Riepilogo AI del documento */
  aiSummary?: string;
};

/**
 * Converte un AIExtractedQuote nel formato ParsedQuoteData richiesto dalla pipeline.
 */
function aiResultToParsedData(ai: AIExtractedQuote): ParsedQuoteData {
  const servizi = ai.items.map((item, i) => ({
    id: `svc-ai-${i + 1}`,
    descrizione: item.description || "Voce preventivo",
    quantita: item.quantity > 0 ? item.quantity : 1,
    unitaMisura: item.unit || "unità",
    prezzoUnitario: item.unitPrice,
    totale: item.total > 0 ? item.total : item.quantity * item.unitPrice,
  }));

  return {
    cliente: { nome: "Da PDF" },
    data: new Date().toISOString().split("T")[0],
    servizi,
    totale: ai.totalAmount,
    note: ai.rawSummary,
    confidenceScore: ai.confidence,
    warnings: [],
  };
}

/**
 * Esegue la pipeline OCR con timeout integrato.
 */
export async function runOCRPipeline(
  file: File,
  userId: string
): Promise<OCRPipelineResult> {
  const timeoutPromise: Promise<OCRPipelineResult> = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: false,
        classification: "error",
        confidence: 0,
        warnings: ["Timeout OCR superato (30s)"],
        steps: ["⏱ Timeout raggiunto"],
        requiresManualFallback: true,
        fallbackReason:
          "L'analisi automatica ha impiegato troppo tempo. Inserisci i dati manualmente.",
      });
    }, OCR_TIMEOUT_MS);
  });

  return Promise.race([_runOCRPipelineInternal(file, userId), timeoutPromise]);
}

async function _runOCRPipelineInternal(
  file: File,
  userId: string
): Promise<OCRPipelineResult> {
  const steps: string[] = [];
  const warnings: string[] = [];
  let detectedCategory: string | undefined;
  let aiSummary: string | undefined;

  try {
    // Step 1: Classificazione
    steps.push("🔍 Classifica PDF...");
    const classificationResult = await classifyPDF(file);

    if (classificationResult.error) {
      return {
        success: false,
        classification: "error",
        confidence: 0,
        warnings: [classificationResult.error],
        steps,
        error: classificationResult.error,
        requiresManualFallback: true,
        fallbackReason:
          "Il file non è leggibile. Prova a inserire i dati manualmente.",
      };
    }

    steps.push(
      `✓ Classificazione: ${classificationResult.classification} (${classificationResult.pageCount} pagine, densità testo: ${classificationResult.textDensity.toFixed(0)}%)`
    );

    if (classificationResult.classification === "error") {
      return {
        success: false,
        classification: "error",
        confidence: 0,
        warnings: ["PDF non leggibile o danneggiato"],
        steps,
        error: "PDF non leggibile",
        requiresManualFallback: true,
        fallbackReason:
          "Il PDF è danneggiato o non leggibile. Inserisci i dati manualmente.",
      };
    }

    // Step 2: Estrazione testo
    steps.push("📄 Estrai testo...");
    const extractionResult = await extractText(
      file,
      classificationResult.classification
    );

    if (extractionResult.warnings.length > 0) {
      extractionResult.warnings.forEach((w) => warnings.push(w));
    }

    steps.push(
      `✓ Estrazione (${extractionResult.method}): ${extractionResult.text.length} caratteri, confidence: ${extractionResult.confidence.toFixed(0)}%`
    );

    if (extractionResult.text.length === 0) {
      return {
        success: false,
        classification: classificationResult.classification,
        confidence: 0,
        warnings: ["Nessun testo estraibile dal PDF"],
        steps,
        error: "Estrazione testo fallita",
        requiresManualFallback: true,
        fallbackReason:
          "Non è stato possibile estrarre testo dal file. Inserisci i dati manualmente.",
      };
    }

    // Step 3: AI Extraction (se token HF disponibile — più precisa del regex)
    let parsingResult: ParsedQuoteData | null = null;
    let aiExtracted = false;

    if (llmKeys.hasToken()) {
      steps.push("🤖 AI extraction (Qwen 72B)...");
      try {
        const aiResult = await extractQuoteWithAI(extractionResult.text);
        if (aiResult && aiResult.confidence >= 0.60 && aiResult.totalAmount > 0) {
          parsingResult = aiResultToParsedData(aiResult);
          detectedCategory = aiResult.category;
          aiSummary = aiResult.rawSummary;
          aiExtracted = true;
          steps.push(
            `✓ AI extraction OK: ${aiResult.category} · €${aiResult.totalAmount.toLocaleString("it-IT")} · items: ${aiResult.items.length} · confidence: ${(aiResult.confidence * 100).toFixed(0)}%`
          );
        } else if (aiResult) {
          steps.push(
            `⚠️ AI confidence bassa (${((aiResult?.confidence ?? 0) * 100).toFixed(0)}%) — uso parser regex`
          );
        }
      } catch {
        steps.push("⚠️ AI extraction fallita — uso parser regex");
      }
    }

    // Step 4: Parsing regex (se AI non disponibile o fallita)
    if (!parsingResult) {
      steps.push("🔎 Parsing regex...");
      const regexResult = parseQuoteFromText(extractionResult.text, "pdf");
      if (regexResult.warnings.length > 0) {
        regexResult.warnings.forEach((w) => warnings.push(w));
      }
      parsingResult = regexResult;
      steps.push(
        `✓ Parsing regex completato (confidence: ${parsingResult.confidenceScore.toFixed(0)}%)`
      );
    }

    // Step 5: Crea Quote
    const quoteNumber = `${new Date().getFullYear()}-DRAFT`;
    const quote = createQuoteFromParsedData(parsingResult, userId, quoteNumber);

    if (!quote) {
      return {
        success: false,
        classification: classificationResult.classification,
        quote: undefined,
        extractedText: extractionResult.text.slice(0, 1000),
        parsingResult,
        confidence: 0,
        warnings: [
          ...warnings,
          "Documento rifiutato: dati invalidi o incoerenti",
        ],
        steps,
        requiresManualFallback: true,
        fallbackReason:
          "Il documento non contiene dati validi. Inserisci i valori manualmente.",
        detectedCategory,
        aiSummary,
      };
    }

    // Step 6: Validazione qualità
    steps.push("✅ Valida qualità...");
    const qualityScore = calculateQualityScore(quote);
    steps.push(
      `✓ Qualità: ${qualityScore.overall.toFixed(0)}% (completezza: ${qualityScore.completeness.toFixed(0)}%, coerenza: ${qualityScore.consistency.toFixed(0)}%, validità: ${qualityScore.validity.toFixed(0)}%)`
    );

    if (qualityScore.issues.length > 0) {
      qualityScore.issues.forEach((issue) => warnings.push(issue));
    }

    // Step 7: Calcola confidenza finale
    // AI extraction boost: +5% sulla confidenza extraction se ha usato AI
    const extractionConf = aiExtracted
      ? Math.min(100, extractionResult.confidence + 5)
      : extractionResult.confidence;

    const confidenceFactors: ConfidenceFactors = {
      extractionConfidence: extractionConf,
      parsingConfidence: parsingResult.confidenceScore,
      qualityConfidence: qualityScore.overall,
      datasetConfidence: aiExtracted ? 60 : 50,
    };

    const confidenceResult = calculateConfidence(confidenceFactors);
    steps.push(
      `✓ Confidenza: ${confidenceResult.overall.toFixed(0)}% (${confidenceResult.level})${aiExtracted ? " [AI boost]" : ""}`
    );

    if (confidenceResult.warnings.length > 0) {
      confidenceResult.warnings.forEach((w) => warnings.push(w));
    }

    const normalizedConfidence = confidenceResult.overall / 100;
    if (normalizedConfidence < OCR_CONFIDENCE_THRESHOLD) {
      steps.push(
        `⚠️ Confidenza insufficiente (${confidenceResult.overall.toFixed(0)}%) — fallback manuale`
      );
      return {
        success: false,
        classification: classificationResult.classification,
        quote,
        extractedText: extractionResult.text.slice(0, 1000),
        parsingResult,
        confidence: confidenceResult.overall,
        warnings,
        steps,
        requiresManualFallback: true,
        fallbackReason: `Lettura automatica imprecisa (${confidenceResult.overall.toFixed(0)}% < 70%). Controlla i dati pre-compilati.`,
        detectedCategory,
        aiSummary,
      };
    }

    const success =
      isQualityAcceptable(qualityScore) && confidenceResult.trustworthy;

    return {
      success,
      classification: classificationResult.classification,
      quote,
      extractedText: extractionResult.text.slice(0, 1000),
      parsingResult,
      confidence: confidenceResult.overall,
      warnings,
      steps,
      detectedCategory,
      aiSummary,
    };
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Errore sconosciuto";
    steps.push(`❌ Errore: ${errorMsg}`);

    return {
      success: false,
      classification: "error",
      confidence: 0,
      warnings,
      steps,
      error: errorMsg,
      requiresManualFallback: true,
      fallbackReason:
        "Errore imprevisto durante l'analisi. Inserisci i dati manualmente.",
    };
  }
}
