/**
 * PDF Classifier - Determina il tipo di PDF (nativo, scansionato, misto)
 * Supporta classificazione rapida e accurata per ottimizzare il flusso OCR
 */

export type PDFClassification = "text" | "scanned" | "mixed" | "error";

export interface ClassificationResult {
  classification: PDFClassification;
  hasExtractableText: boolean;
  hasImages: boolean;
  pageCount: number;
  textDensity: number; // 0-100, percentuale di testo vs immagini
  confidence: number; // 0-100
  error?: string;
}

/**
 * Classifica un PDF analizzando un campione di pagine
 * Determina se è nativo (testo), scansionato (immagini) o misto
 */
export async function classifyPDF(file: File): Promise<ClassificationResult> {
  try {
    const { getDocument } = await import("pdfjs-dist");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer, useWorkerFetch: false }).promise;

    const pageCount = pdf.numPages;
    const samplePages = Math.min(3, pageCount);

    let totalTextLength = 0;
    let pagesWithImages = 0;
    let pagesAnalyzed = 0;

    for (let i = 1; i <= samplePages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const textLength = content.items.reduce((s: number, item: any) => s + (item.str?.length || 0), 0);
        totalTextLength += textLength;

        // Controlla operatori per immagini nel PDF stream
        const ops = await page.getOperatorList();
        if (ops.fnArray.some((fn: any) => fn === 37 || fn === 38)) {
          pagesWithImages++;
        }

        pagesAnalyzed++;
      } catch (err) {
        console.warn(`Errore nell'analisi della pagina ${i}:`, err);
      }
    }

    if (pagesAnalyzed === 0) {
      return {
        classification: "error",
        hasExtractableText: false,
        hasImages: false,
        pageCount,
        textDensity: 0,
        confidence: 0,
        error: "Impossibile analizzare il PDF",
      };
    }

    const avgTextPerPage = totalTextLength / pagesAnalyzed;
    const hasText = avgTextPerPage > 50;
    const hasImages = pagesWithImages > 0;

    // Calcola densità di testo
    const textDensity = hasText ? Math.min(100, (avgTextPerPage / 500) * 100) : 0;

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

    // Calcola confidence
    let confidence = 80;
    if (classification === "text") confidence = 95;
    if (classification === "scanned") confidence = 85;
    if (classification === "mixed") confidence = 75;
    if (classification === "error") confidence = 20;

    return {
      classification,
      hasExtractableText: hasText,
      hasImages,
      pageCount,
      textDensity,
      confidence,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Errore sconosciuto";
    return {
      classification: "error",
      hasExtractableText: false,
      hasImages: false,
      pageCount: 0,
      textDensity: 0,
      confidence: 0,
      error: errorMsg,
    };
  }
}
