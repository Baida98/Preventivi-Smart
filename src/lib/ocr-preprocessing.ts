/**
 * PHASE 3: OCR Preprocessing — Image Quality Enhancement
 * 
 * Prepara immagini scansionate per OCR accurato.
 * I preventivi scansionati spesso hanno: numeri piccoli, tabelle, loghi, timbri, testo inclinato.
 * Senza preprocessing, l'OCR perde soprattutto i numeri (parte più importante).
 */

export type PreprocessingResult = {
  success: boolean;
  processedImageData?: ImageData;
  width?: number;
  height?: number;
  originalSize?: number;
  steps: string[];
  error?: string;
};

/**
 * Converte PDF page a canvas per image processing
 */
export function pdfPageToCanvas(
  page: any, // PDFPageProxy
  scale: number = 2
): Promise<HTMLCanvasElement> {
  return new Promise(async (resolve, reject) => {
    try {
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context non disponibile");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
      });

      renderTask.promise.then(() => resolve(canvas)).catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Converte canvas a ImageData per processing
 */
export function canvasToImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context non disponibile");
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Converte ImageData a canvas per visualizzazione
 */
export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context non disponibile");
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Step 1: Denoise — Riduce rumore mantenendo spigoli
 */
export function denoise(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const result = new ImageData(width, height);
  const resultData = result.data;

  // Copia dati
  resultData.set(data);

  // Filtro mediano 3x3 semplice (riduce salt-and-pepper)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const pixels: number[] = [];

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nidx = ((y + dy) * width + (x + dx)) * 4;
          // Usa luminosità per la mediana
          const luminance = 0.299 * data[nidx] + 0.587 * data[nidx + 1] + 0.114 * data[nidx + 2];
          pixels.push(luminance);
        }
      }

      pixels.sort((a, b) => a - b);
      const median = pixels[4]; // mediana di 9 valori

      resultData[idx] = median;
      resultData[idx + 1] = median;
      resultData[idx + 2] = median;
    }
  }

  return result;
}

/**
 * Step 2: Contrast Enhancement — Aumenta contrasto per testo piccolo
 */
export function enhanceContrast(imageData: ImageData, strength: number = 1.5): ImageData {
  const { data } = imageData;
  const result = new ImageData(imageData.width, imageData.height);
  const resultData = result.data;

  // Calcola min/max per normalizzazione
  let min = 255,
    max = 0;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    min = Math.min(min, gray);
    max = Math.max(max, gray);
  }

  const range = max - min || 1;

  // Applica contrast stretching
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const normalized = ((gray - min) / range) * 255;
    const enhanced = Math.pow(normalized / 255, 1 / strength) * 255;

    resultData[i] = enhanced;
    resultData[i + 1] = enhanced;
    resultData[i + 2] = enhanced;
    resultData[i + 3] = data[i + 3];
  }

  return result;
}

/**
 * Step 3: Sharpening — Migliora definizione bordi (numeri, testo)
 */
export function sharpen(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const result = new ImageData(width, height);
  const resultData = result.data;

  // Kernel sharpen
  const kernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      let idx = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nidx = ((y + dy) * width + (x + dx)) * 4;
          const gray = 0.299 * data[nidx] + 0.587 * data[nidx + 1] + 0.114 * data[nidx + 2];
          sum += gray * kernel[idx++];
        }
      }

      const pidx = (y * width + x) * 4;
      const final = Math.max(0, Math.min(255, sum));

      resultData[pidx] = final;
      resultData[pidx + 1] = final;
      resultData[pidx + 2] = final;
      resultData[pidx + 3] = data[pidx + 3];
    }
  }

  return result;
}

/**
 * Step 4: Binarization — Converte a bianco/nero (migliora OCR)
 */
export function binarize(imageData: ImageData, threshold?: number): ImageData {
  const { data } = imageData;
  const result = new ImageData(imageData.width, imageData.height);
  const resultData = result.data;

  // Se no threshold, calcola Otsu's threshold
  let t = threshold;
  if (t === undefined) {
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      histogram[Math.floor(gray)]++;
    }

    let maxVar = 0;
    let bestT = 128;
    const total = data.length / 4;

    for (let k = 0; k < 256; k++) {
      let w0 = 0,
        mu0 = 0;
      for (let i = 0; i <= k; i++) {
        w0 += histogram[i];
        mu0 += i * histogram[i];
      }

      if (w0 === 0 || w0 === total) continue;

      const w1 = total - w0;
      const mu1 = (histogram.reduce((s, h, i) => s + i * h, 0) - mu0) / w1;
      mu0 /= w0;

      const variance = w0 * w1 * Math.pow(mu0 - mu1, 2);
      if (variance > maxVar) {
        maxVar = variance;
        bestT = k;
      }
    }

    t = bestT;
  }

  // Applica threshold
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const binary = gray > t ? 255 : 0;

    resultData[i] = binary;
    resultData[i + 1] = binary;
    resultData[i + 2] = binary;
    resultData[i + 3] = data[i + 3];
  }

  return result;
}

/**
 * Step 5: Rimozione bordi inutili
 */
export function cropBorders(imageData: ImageData, borderThreshold: number = 240): ImageData {
  const { data, width, height } = imageData;

  // Trova rettangolo di content
  let minY = height,
    maxY = 0,
    minX = width,
    maxX = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (gray < borderThreshold) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
  }

  if (minY >= maxY || minX >= maxX) return imageData;

  // Crop con margine piccolo
  const margin = 10;
  const cropY = Math.max(0, minY - margin);
  const cropX = Math.max(0, minX - margin);
  const cropW = Math.min(width, maxX - minX + margin * 2);
  const cropH = Math.min(height, maxY - minY + margin * 2);

  const cropped = new ImageData(cropW, cropH);
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcIdx = ((cropY + y) * width + (cropX + x)) * 4;
      const dstIdx = (y * cropW + x) * 4;
      cropped.data[dstIdx] = data[srcIdx];
      cropped.data[dstIdx + 1] = data[srcIdx + 1];
      cropped.data[dstIdx + 2] = data[srcIdx + 2];
      cropped.data[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  return cropped;
}

/**
 * Pipeline completa di preprocessing
 */
export function preprocessImage(imageData: ImageData): PreprocessingResult {
  const steps: string[] = [];

  try {
    const originalSize = imageData.data.length;
    steps.push(`Immagine originale: ${imageData.width}x${imageData.height}`);

    let processed = imageData;

    // Step 1: Denoise
    processed = denoise(processed);
    steps.push("✓ Denoise");

    // Step 2: Enhance contrast
    processed = enhanceContrast(processed, 1.5);
    steps.push("✓ Aumento contrasto");

    // Step 3: Sharpen
    processed = sharpen(processed);
    steps.push("✓ Sharpening");

    // Step 4: Binarize
    processed = binarize(processed);
    steps.push("✓ Binarizzazione");

    // Step 5: Crop borders
    processed = cropBorders(processed);
    steps.push(`✓ Crop bordi: ${processed.width}x${processed.height}`);

    return {
      success: true,
      processedImageData: processed,
      width: processed.width,
      height: processed.height,
      originalSize,
      steps,
    };
  } catch (err) {
    return {
      success: false,
      steps,
      error: err instanceof Error ? err.message : "Errore nel preprocessing",
    };
  }
}
