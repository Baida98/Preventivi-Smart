/**
 * Embeddings — Gestione semantica locale
 * 
 * Implementa la Fase 3 della roadmap: similarity search e cosine comparison.
 * Inizialmente usa un modello leggero o un fallback se non disponibile.
 */

export async function getEmbedding(text: string): Promise<number[]> {
  // Placeholder: in una implementazione reale qui useremmo transformers.js
  // o un micro-servizio cloud. Per ora simuliamo un vettore basato su hash
  // per permettere lo sviluppo della logica di confronto.
  const vector = new Array(384).fill(0);
  for (let i = 0; i < text.length; i++) {
    vector[i % 384] += text.charCodeAt(i) / 255;
  }
  // Normalizzazione
  const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(v => v / (mag || 1));
}

export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
  }
  return dotProduct;
}

export const embeddingCache = new Map<string, number[]>();

export async function getCachedEmbedding(text: string): Promise<number[]> {
  if (embeddingCache.has(text)) return embeddingCache.get(text)!;
  const emb = await getEmbedding(text);
  embeddingCache.set(text, emb);
  return emb;
}
