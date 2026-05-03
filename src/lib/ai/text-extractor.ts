/**
 * Text Extractor - Estrae testo da PDF nativi e scansionati
 * Integra OCR con Tesseract.js per PDF scansionati
 */

export interface ExtractionResult {
  text: string;
  method: "native" | "ocr" | "hybrid";
  confidence: number; // 0-100
  pagesProcessed: number;
  warnings: string[];
}

/**
 * Estrae testo da PDF nativo (con testo estraibile)
 */
export async function extractTextFromNativePDF(file: File): Promise<ExtractionResult> {
  try {
    const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
    GlobalWorkerOptions.workerSrc = "";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer, useWorkerFetch: false }).promise;

    let fullText = "";
    const pageCount = Math.min(pdf.numPages, 10); // Max 10 pagine
    const warnings: string[] = [];

    for (let i = 1; i <= pageCount; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str || "")
          .join(" ");
        fullText += pageText + "\n";
      } catch (err) {
        warnings.push(`Errore nell'estrazione dalla pagina ${i}`);
      }
    }

    return {
      text: fullText,
      method: "native",
      confidence: fullText.length > 500 ? 95 : 70,
      pagesProcessed: pageCount,
      warnings,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Errore sconosciuto";
    return {
      text: "",
      method: "native",
      confidence: 0,
      pagesProcessed: 0,
      warnings: [errorMsg],
    };
  }
}

/**
 * Renderizza pagine PDF per OCR
 */
async function renderPagesForOCR(file: File, maxPages: number = 3): Promise<HTMLCanvasElement[]> {
  try {
    const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
    GlobalWorkerOptions.workerSrc = "";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer, useWorkerFetch: false }).promise;

    const canvases: HTMLCanvasElement[] = [];
    const pagesToRender = Math.min(pdf.numPages, maxPages);

    for (let i = 1; i <= pagesToRender; i++) {
      try {
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
      } catch (err) {
        console.warn(`Errore nel rendering della pagina ${i}:`, err);
      }
    }

    return canvases;
  } catch (err) {
    console.error("Errore nel rendering:", err);
    return [];
  }
}

/**
 * Esegue OCR su un canvas usando Tesseract.js
 */
async function performOCROnCanvas(canvas: HTMLCanvasElement): Promise<string> {
  try {
    const Tesseract = await import("tesseract.js");
    const worker = await Tesseract.createWorker(["ita", "eng"]);
    
    // Converti canvas in blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error("Impossibile convertire canvas in blob"));
          return;
        }

        try {
          const result = await worker.recognize(blob);
          await worker.terminate();
          resolve(result.data.text);
        } catch (err) {
          reject(err);
        }
      });
    });
  } catch (err) {
    console.error("Errore OCR:", err);
    return "";
  }
}

/**
 * Estrae testo da PDF scansionato usando OCR
 */
export async function extractTextFromScannedPDF(file: File): Promise<ExtractionResult> {
  try {
    const canvases = await renderPagesForOCR(file, 3);
    const warnings: string[] = [];

    if (canvases.length === 0) {
      return {
        text: "",
        method: "ocr",
        confidence: 0,
        pagesProcessed: 0,
        warnings: ["Impossibile renderizzare le pagine per OCR"],
      };
    }

    let fullText = "";
    for (let i = 0; i < canvases.length; i++) {
      try {
        const pageText = await performOCROnCanvas(canvases[i]);
        fullText += pageText + "\n";
      } catch (err) {
        warnings.push(`Errore OCR sulla pagina ${i + 1}`);
      }
    }

    return {
      text: fullText,
      method: "ocr",
      confidence: fullText.length > 300 ? 75 : 50,
      pagesProcessed: canvases.length,
      warnings,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Errore sconosciuto";
    return {
      text: "",
      method: "ocr",
      confidence: 0,
      pagesProcessed: 0,
      warnings: [errorMsg],
    };
  }
}

/**
 * Estrae testo da PDF (nativo o scansionato)
 * Sceglie automaticamente il metodo migliore
 */
export async function extractText(
  file: File,
  classification: "text" | "scanned" | "mixed" | "error"
): Promise<ExtractionResult> {
  let result: ExtractionResult;

  if (classification === "text") {
    result = await extractTextFromNativePDF(file);
  } else if (classification === "scanned") {
    result = await extractTextFromScannedPDF(file);
  } else if (classification === "mixed") {
    // Mixed: prova prima nativo, poi OCR se insufficiente
    const nativeResult = await extractTextFromNativePDF(file);
    if (nativeResult.text.length > 200) {
      result = nativeResult;
    } else {
      const ocrResult = await extractTextFromScannedPDF(file);
      result = {
        text: nativeResult.text + "\n" + ocrResult.text,
        method: "hybrid",
        confidence: Math.min(nativeResult.confidence, ocrResult.confidence),
        pagesProcessed: nativeResult.pagesProcessed + ocrResult.pagesProcessed,
        warnings: [...nativeResult.warnings, ...ocrResult.warnings],
      };
    }
  } else {
    throw new Error("Classificazione PDF non valida per estrazione");
  }

  // Fix: NON restituire testo vuoto o troppo corto
  if (!result.text || result.text.trim().length < 50) {
    throw new Error("Estrazione testo fallita: il documento non contiene testo sufficiente per l'analisi tecnica.");
  }

  return result;
}
