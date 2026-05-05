/**
 * Configurazione di sicurezza per l'applicazione
 * Include header di sicurezza e best practices
 */

/**
 * Headers di sicurezza HTTP per prevenire attacchi comuni
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

/**
 * Content Security Policy per prevenire XSS
 * Include domini necessari per Firebase Auth e Firestore
 */
export const CSP_HEADER = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com",
    "frame-ancestors 'none'",
    "frame-src 'self' https://*.firebaseapp.com https://*.google.com",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

/**
 * Applica gli header di sicurezza al documento tramite meta tag
 * Previene la duplicazione in caso di chiamate multiple
 */
export function applySecurityHeaders() {
  if (typeof document === 'undefined') return;

  // 1. Gestione CSP
  let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!cspMeta) {
    cspMeta = document.createElement('meta');
    (cspMeta as HTMLMetaElement).httpEquiv = 'Content-Security-Policy';
    document.head.appendChild(cspMeta);
  }
  (cspMeta as HTMLMetaElement).content = CSP_HEADER['Content-Security-Policy'];

  // 2. Gestione Referrer Policy
  let refMeta = document.querySelector('meta[name="referrer"]');
  if (!refMeta) {
    refMeta = document.createElement('meta');
    (refMeta as HTMLMetaElement).name = 'referrer';
    document.head.appendChild(refMeta);
  }
  (refMeta as HTMLMetaElement).content = 'strict-origin-when-cross-origin';
}

/**
 * Valida che una URL sia sicura (same-origin)
 */
export function isSecureUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Encode HTML per prevenire XSS
 */
export function encodeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

// ============================================================================
// PHASE 2: Firestore Access Control & Data Validation
// ============================================================================

import type { Quote } from "./quote-model";

/**
 * Verifica che un preventivo appartenga all'utente corrente
 */
export function isQuoteOwnedByUser(quote: Quote, userId: string): boolean {
  return quote.uid === userId;
}

/**
 * Validazione client-side prima di inviare dati a Firestore
 */
export function validateQuoteForFirestore(quote: Quote, userId: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!quote.id || typeof quote.id !== "string") errors.push("ID preventivo mancante");
  if (!quote.numero || typeof quote.numero !== "string") errors.push("Numero preventivo mancante");
  if (!quote.uid || quote.uid !== userId) errors.push("Proprietario del preventivo non corrisponde all'utente");
  if (!quote.data || typeof quote.data !== "string") errors.push("Data preventivo mancante");
  if (!quote.createdAt || (typeof quote.createdAt !== "string" && typeof quote.createdAt !== "number")) errors.push("Data di creazione non valida");
  if (!quote.updatedAt || (typeof quote.updatedAt !== "string" && typeof quote.updatedAt !== "number")) errors.push("Data di aggiornamento non valida");

  if (!quote.cliente || typeof quote.cliente !== "object") {
    errors.push("Dati cliente mancanti");
  } else if (!quote.cliente.nome) {
    errors.push("Nome cliente obbligatorio");
  }

  if (!quote.ambito || typeof quote.ambito !== "string") errors.push("Ambito di lavoro mancante");
  if (!quote.sottotipo || typeof quote.sottotipo !== "string") errors.push("Tipo di lavoro mancante");

  const validStates = ["bozza", "finalizzato", "inviato", "accettato", "rifiutato", "modificato", "archiviato"];
  if (!quote.stato || !validStates.includes(quote.stato)) {
    errors.push(`Stato non valido: ${quote.stato}`);
  }

  const validSources = ["manuale", "pdf", "ocr", "import"];
  if (!quote.source || !validSources.includes(quote.source)) {
    errors.push(`Sorgente non valida: ${quote.source}`);
  }

  if (!Array.isArray(quote.servizi) || quote.servizi.length === 0) {
    errors.push("Almeno un servizio è obbligatorio");
  }

  if (typeof quote.totale !== "number" || quote.totale < 0) {
    errors.push("Totale preventivo non valido");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
