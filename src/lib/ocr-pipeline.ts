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
 */

import type { Quote } from "./quote-model";
import { extractPricesFromPDF, type PDFExtractionResult } from "./pdf-extractor";
import { preprocessImage, type PreprocessingResult } from "./ocr-preprocessing";
import { parseQuoteFromText, createQuoteFromParsedData, type ParsedQuoteData } from "./ocr-parser";

export type PDFClassification = "text" | "scanned" | "mixed" | "error";

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
};

/**
 * Step 1: Classifica il PDF
 * - "text": PDF nativo con testo estraibile
 * - "scanned": PDF scansionato, serve OCR
 * - "mixed": Contiene sia testo che immagini
 */
async function classifyPDF(file: File): Promise<{
  classification: PDFClassification;
  hasExtractableText: boolean;
  pageCount: number;
  error?: string;
}> {
  try {
    const { getDocument } = await import("pdfjs-dist");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer, useWorkerFetch: false }).promise;

    const pageCount = pdf.numPages;
    const samplePages = Math.min(3, pageCount);

    let totalTextLength = 0;
    let pagesWithImages = 0;

    for (let i = 1; i <= samplePages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const textLength = content.items.reduce((s: number, item: any) => s + (item.str?.length || 0), 0);
      totalTextLength += textLength;

      // Controlla operatori per immagini nel PDF stream
      const ops = await page.getOperatorList();
      if (ops.fnArray.some((fn: any) => fn === 37 || fn === 38)) { // EI, ID operator per immagini
        pagesWithImages++;
      }
    }

    const avgTextPerPage = totalTextLength / samplePages;
    const hasText = avgTextPerPage > 50;
    const hasImages = pagesWithImages > 0;

    let classification: PDFClassification;
    if (hasText && !hasImages) {
      classification = "text";
    } else if (!hasText && hasImages) {
      classification = "scanned";
    } else if (hasText && hasImages) {
      classification = "mixed";
    } else {
      classification = "error";
    }

    return {
      classification,
      hasExtractableText: hasText,
      pageCount,
    };
  } catch (err) {
    return {
      classification: "error",
      hasExtractableText: false,
      pageCount: 0,
      error: err instanceof Error ? err.message : "Errore nella classificazione",
    };
  }
}

/**
 * Step 2: Estrai testo da PDF nativo
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
    GlobalWorkerOptions.workerSrc = "";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer, useWorkerFetch: false }).promise;

    let fullText = "";
    const pageCount = Math.min(pdf.numPages, 10); // Max 10 pagine

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str || "")
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (err) {
    console.error("Text extraction error:", err);
    return "";
  }
}

/**
 * Step 3: Rendering per OCR (se necessario)
 * Nota: OCR vero richiede Tesseract.js, qui usiamo solo PDF text extraction
 */
async function renderPagesForOCR(file: File): Promise<HTMLCanvasElement[]> {
  try {
    const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
    GlobalWorkerOptions.workerSrc = "";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer, useWorkerFetch: false }).promise;

    const canvases: HTMLCanvasElement[] = [];
    const pagesToRender = Math.min(pdf.numPages, 3); // Max 3 pagine per OCR

    for (let i = 1; i <= pagesToRender; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      } as any).promise;

      canvases.push(canvas);
    }

    return canvases;
  } catch (err) {
    console.error("Page rendering error:", err);
    return [];
  }
}

/**
 * Pipeline principale
 */
export async function runOCRPipeline(file: File, userId: string): Promise<OCRPipelineResult> {
  const steps: string[] = [];
  const warnings: string[] = [];
  let confidence = 100;

  try {
    // Step 1: Classificazione
    steps.push("🔍 Classifica PDF...");
    const classification = await classifyPDF(file);

    if (classification.error) {
      return {
        success: false,
        classification: "error",
        confidence: 0,
        warnings: [classification.error],
        steps,
        error: classification.error,
      };
    }

    steps.push(`✓ Classificazione: ${classification.classification} (${classification.pageCount} pagine)`);

    if (classification.classification === "error") {
      return {
        success: false,
        classification: "error",
        confidence: 0,
        warnings: ["PDF non leggibile o danneggiato"],
        steps,
        error: "PDF non leggibile",
      };
    }

    // Step 2: Estrazione testo
    steps.push("📄 Estrai testo...");
    let extractedText = "";

    if (classification.hasExtractableText || classification.classification === "mixed") {
      extractedText = await extractTextFromPDF(file);
      if (extractedText.length > 100) {
        steps.push(`✓ Estratti ${extractedText.length} caratteri da PDF nativo`);
        confidence -= 5; // PDF nativo è affidabile
      } else {
        warnings.push("Poco testo estratto da PDF nativo, potrebbe essere scansionato");
        confidence -= 15;
      }
    }

    // Step 3: OCR se necessario
    if (extractedText.length < 100 && classification.classification !== "text") {
      steps.push("🖼️ Prepara per OCR...");
      const canvases = await renderPagesForOCR(file);

      if (canvases.length > 0) {
        steps.push(`✓ ${canvases.length} pagina(e) renderizzata(e)`);

        // Preprocessing primo canvas
        const canvas = canvases[0];
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const preprocessResult = preprocessImage(imageData);

          if (preprocessResult.success) {
            preprocessResult.steps.forEach((s) => steps.push(`  ${s}`));

            // Nota: Per OCR vero serve Tesseract.js
            // Per ora usiamo il testo che abbiamo
            warnings.push(
              "OCR completo richiede Tesseract.js (non incluso). Usare PDF nativo se possibile."
            );
            confidence -= 30;
          } else {
            warnings.push("Preprocessing fallito");
            confidence -= 40;
          }
        }
      } else {
        warnings.push("Rendering pagine fallito");
        confidence -= 50;
      }
    }

    if (extractedText.length === 0) {
      return {
        success: false,
        classification: classification.classification,
        confidence: 0,
        warnings: ["Nessun testo estraibile dal PDF"],
        steps,
        error: "Estrazione testo fallita",
      };
    }

    // Step 4: Parsing
    steps.push("🔎 Estrai struttura...");
    const parsingResult = parseQuoteFromText(extractedText, "pdf");

    if (parsingResult.warnings.length > 0) {
      parsingResult.warnings.forEach((w) => warnings.push(w));
    }

    confidence = Math.min(100, confidence + parsingResult.confidenceScore - 100);
    steps.push(
      `✓ Parsing completato (confidence: ${parsingResult.confidenceScore.toFixed(0)}%)`
    );

    // Step 5: Validazione
    steps.push("✅ Valida...");

    if (parsingResult.servizi.length === 0) {
      warnings.push("Nessun servizio estratto");
      confidence -= 30;
    }

    if (parsingResult.totale <= 0) {
      warnings.push("Totale non valido");
      confidence -= 40;
    }

    // Step 6: Crea Quote
    const quoteNumber = `${new Date().getFullYear()}-DRAFT`;
    const quote = createQuoteFromParsedData(parsingResult, userId, quoteNumber);

    steps.push("✓ Quote creato");

    return {
      success: confidence >= 50,
      classification: classification.classification,
      quote,
      extractedText: extractedText.slice(0, 1000),
      parsingResult,
      confidence: Math.max(0, Math.min(100, confidence)),
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
    };
  }
}
