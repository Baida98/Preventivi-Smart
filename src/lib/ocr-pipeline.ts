/**
   * PHASE 3: OCR Pipeline — Orchestrazione completa
   *
   * Flusso end-to-end:
   * 1. Classificazione PDF (nativo vs scansionato)
   * 2. Estrazione testo (PDF nativo se possibile)
   * 3. OCR (solo se necessario)
   * 4. Preprocessing immagine
   * 5. Parsing strutturato
   * 6. Validazione multi-livello
   * 7. Salvataggio solo se validato
   *
   * FALLBACK: Se confidence < 0.70 l'utente viene reindirizzato
   * al form manuale di inserimento dati invece di ricevere un
   * risultato parziale o errato.
   */

  import type { Quote } from "./quote-model";
  import { extractPricesFromPDF, type PDFExtractionResult } from "./pdf-extractor";
  import { preprocessImage, type PreprocessingResult } from "./ocr-preprocessing";
  import { parseQuoteFromText, createQuoteFromParsedData, type ParsedQuoteData } from "./ocr-parser";
  import { classifyPDF, type PDFClassification } from "./ai/pdf-classifier";
  import { extractText, type ExtractionResult } from "./ai/text-extractor";
  import { calculateQualityScore, isQualityAcceptable } from "./ai/quality-score";
  import { calculateConfidence, type ConfidenceFactors } from "./ai/confidence";

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
    confidence: number; // 0-100
    warnings: string[];
    steps: string[];
    error?: string;
    /**
     * Se true, la confidence è troppo bassa (< OCR_CONFIDENCE_THRESHOLD) oppure
     * si è verificato un timeout. Il componente chiamante deve mostrare il form
     * manuale di inserimento dati invece del risultato automatico.
     */
    requiresManualFallback?: boolean;
    /** Motivo per cui è stato richiesto il fallback manuale, da mostrare all'utente */
    fallbackReason?: string;
  };

  /**
   * Esegue la pipeline OCR con un timeout integrato.
   * Se la pipeline supera OCR_TIMEOUT_MS, restituisce requiresManualFallback=true.
   */
  export async function runOCRPipeline(file: File, userId: string): Promise<OCRPipelineResult> {
    const timeoutPromise: Promise<OCRPipelineResult> = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          classification: "error",
          confidence: 0,
          warnings: ["Timeout OCR superato (30s)"],
          steps: ["⏱ Timeout raggiunto"],
          requiresManualFallback: true,
          fallbackReason: "L'analisi automatica ha impiegato troppo tempo. Inserisci i dati manualmente.",
        });
      }, OCR_TIMEOUT_MS);
    });

    return Promise.race([_runOCRPipelineInternal(file, userId), timeoutPromise]);
  }

  /**
   * Pipeline principale (interna — usa runOCRPipeline per il timeout)
   */
  async function _runOCRPipelineInternal(file: File, userId: string): Promise<OCRPipelineResult> {
    const steps: string[] = [];
    const warnings: string[] = [];

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
          fallbackReason: "Il file non è leggibile. Prova a inserire i dati manualmente.",
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
          fallbackReason: "Il PDF è danneggiato o non leggibile. Inserisci i dati manualmente.",
        };
      }

      // Step 2: Estrazione testo
      steps.push("📄 Estrai testo...");
      const extractionResult = await extractText(file, classificationResult.classification);

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
          fallbackReason: "Non è stato possibile estrarre testo dal file. Inserisci i dati manualmente.",
        };
      }

      // Step 3: Parsing
      steps.push("🔎 Estrai struttura...");
      const parsingResult = parseQuoteFromText(extractionResult.text, "pdf");

      if (parsingResult.warnings.length > 0) {
        parsingResult.warnings.forEach((w) => warnings.push(w));
      }

      steps.push(
        `✓ Parsing completato (confidence: ${parsingResult.confidenceScore.toFixed(0)}%)`
      );

      // Step 4: Crea Quote
      const quoteNumber = `${new Date().getFullYear()}-DRAFT`;
      const quote = createQuoteFromParsedData(parsingResult, userId, quoteNumber);

      // HARDENING: Se il documento è invalido, rifiuta subito
      if (!quote) {
        return {
          success: false,
          classification: classificationResult.classification,
          quote: undefined,
          extractedText: extractionResult.text.slice(0, 1000),
          parsingResult,
          confidence: 0,
          warnings: [...warnings, "Documento rifiutato: dati invalidi o incoerenti"],
          steps,
          requiresManualFallback: true,
          fallbackReason: "Il documento non contiene dati validi. Inserisci i valori manualmente.",
        };
      }

      // Step 5: Validazione qualità
      steps.push("✅ Valida qualità...");
      const qualityScore = calculateQualityScore(quote);

      steps.push(
        `✓ Qualità: ${qualityScore.overall.toFixed(0)}% (completezza: ${qualityScore.completeness.toFixed(0)}%, coerenza: ${qualityScore.consistency.toFixed(0)}%, validità: ${qualityScore.validity.toFixed(0)}%)`
      );

      if (qualityScore.issues.length > 0) {
        qualityScore.issues.forEach((issue) => warnings.push(issue));
      }

      // Step 6: Calcola confidenza
      const confidenceFactors: ConfidenceFactors = {
        extractionConfidence: extractionResult.confidence,
        parsingConfidence: parsingResult.confidenceScore,
        qualityConfidence: qualityScore.overall,
        datasetConfidence: 50, // Placeholder
      };

      const confidenceResult = calculateConfidence(confidenceFactors);
      steps.push(`✓ Confidenza complessiva: ${confidenceResult.overall.toFixed(0)}% (${confidenceResult.level})`);

      if (confidenceResult.warnings.length > 0) {
        confidenceResult.warnings.forEach((w) => warnings.push(w));
      }

      // FALLBACK MANUALE: confidence normalizzata < OCR_CONFIDENCE_THRESHOLD
      const normalizedConfidence = confidenceResult.overall / 100;
      if (normalizedConfidence < OCR_CONFIDENCE_THRESHOLD) {
        steps.push(`⚠️ Confidenza insufficiente (${confidenceResult.overall.toFixed(0)}%) — attivazione fallback manuale`);
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
          fallbackReason:
            `Confidenza bassa (${(normalizedConfidence * 100).toFixed(0)}%). Inserisci il prezzo manualmente.`,
        };
      }

      // Determina successo
      const success = isQualityAcceptable(qualityScore) && confidenceResult.trustworthy;

      return {
        success,
        classification: classificationResult.classification,
        quote,
        extractedText: extractionResult.text.slice(0, 1000),
        parsingResult,
        confidence: confidenceResult.overall,
        warnings,
        steps,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Errore sconosciuto";
      steps.push(`❌ Errore: ${errorMsg}`);

      return {
        success: false,
        classification: "error",
        confidence: 0,
        warnings,
        steps,
        error: errorMsg,
        requiresManualFallback: true,
        fallbackReason: "Errore imprevisto durante l'analisi. Inserisci i dati manualmente.",
      };
    }
  }
  