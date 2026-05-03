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
 */
export const CSP_HEADER = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/eval necessari per React
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

/**
 * Applica gli header di sicurezza al documento
 */
export function applySecurityHeaders() {
  // Imposta il Content-Security-Policy meta tag
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = CSP_HEADER['Content-Security-Policy'];
  document.head.appendChild(cspMeta);

  // Imposta il Referrer-Policy meta tag
  const refMeta = document.createElement('meta');
  refMeta.name = 'referrer';
  refMeta.content = 'strict-origin-when-cross-origin';
  document.head.appendChild(refMeta);
}

/**
 * Valida che una URL sia sicura (same-origin)
 * @param url La URL da validare
 * @returns true se la URL è sicura
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
 * @param text Il testo da encodare
 * @returns Il testo encodato
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
 * (Dovrebbe essere già garantito dal Firestore, ma verifica anche client-side)
 */
export function isQuoteOwnedByUser(quote: Quote, userId: string): boolean {
  return quote.uid === userId;
}

/**
 * Validazione client-side prima di inviare dati a Firestore
 * Previene round-trip inutili e dà feedback istantaneo all'utente
 */
export function validateQuoteForFirestore(quote: Quote, userId: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Campi obbligatori
  if (!quote.id || typeof quote.id !== "string") {
    errors.push("ID preventivo mancante");
  }

  if (!quote.numero || typeof quote.numero !== "string") {
    errors.push("Numero preventivo mancante");
  }

  if (!quote.uid || quote.uid !== userId) {
    errors.push("Proprietario del preventivo non corrisponde all'utente");
  }

  if (!quote.data || typeof quote.data !== "string") {
    errors.push("Data preventivo mancante");
  }

  if (!quote.createdAt || typeof quote.createdAt !== "string") {
    errors.push("Data di creazione mancante");
  }

  if (!quote.updatedAt || typeof quote.updatedAt !== "string") {
    errors.push("Data di aggiornamento mancante");
  }

  // Cliente
  if (!quote.cliente || typeof quote.cliente !== "object") {
    errors.push("Dati cliente mancanti");
  } else if (!quote.cliente.nome) {
    errors.push("Nome cliente obbligatorio");
  }

  // Segmentazione
  if (!quote.ambito || typeof quote.ambito !== "string") {
    errors.push("Ambito di lavoro mancante");
  }

  if (!quote.sottotipo || typeof quote.sottotipo !== "string") {
    errors.push("Tipo di lavoro mancante");
  }

  // Stato e source
  const validStates = ["bozza", "finalizzato", "inviato", "accettato", "rifiutato", "archiviato"];
  if (!quote.stato || !validStates.includes(quote.stato)) {
    errors.push(`Stato preventivo non valido. Ammessi: ${validStates.join(", ")}`);
  }

  const validSources = ["manuale", "pdf", "ocr", "import"];
  if (!quote.source || !validSources.includes(quote.source)) {
    errors.push(`Sorgente preventivo non valida. Ammessi: ${validSources.join(", ")}`);
  }

  // Servizi
  if (!Array.isArray(quote.servizi) || quote.servizi.length === 0) {
    errors.push("Almeno un servizio è obbligatorio");
  } else {
    quote.servizi.forEach((s, idx) => {
      if (!s.descrizione) {
        errors.push(`Servizio ${idx + 1}: descrizione mancante`);
      }
      if (typeof s.quantita !== "number" || s.quantita <= 0) {
        errors.push(`Servizio ${idx + 1}: quantità non valida (deve essere > 0)`);
      }
      if (typeof s.prezzoUnitario !== "number" || s.prezzoUnitario < 0) {
        errors.push(`Servizio ${idx + 1}: prezzo unitario non valido`);
      }
      if (typeof s.totale !== "number" || s.totale < 0) {
        errors.push(`Servizio ${idx + 1}: totale non valido`);
      }
    });
  }

  // Totale
  if (typeof quote.totale !== "number" || quote.totale < 0) {
    errors.push("Totale preventivo non valido");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Verifica che i dati non siano stati modificati tra lettura e scrittura
 * (Optimistic locking pattern)
 */
export function validateQuoteUpdate(
  original: Quote,
  updated: Quote
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Campi immutabili
  if (original.id !== updated.id) {
    errors.push("ID preventivo non può essere modificato");
  }

  if (original.numero !== updated.numero) {
    errors.push("Numero preventivo non può essere modificato");
  }

  if (original.uid !== updated.uid) {
    errors.push("Proprietario non può essere modificato");
  }

  if (original.createdAt !== updated.createdAt) {
    errors.push("Data di creazione non può essere modificata");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Controlli di accesso (per futuro uso)
 */
export function canUserAccessQuote(userId: string, quote: Quote): boolean {
  return quote.uid === userId;
}

export function canUserUpdateQuote(userId: string, quote: Quote): boolean {
  return quote.uid === userId;
}

export function canUserDeleteQuote(userId: string, quote: Quote): boolean {
  return quote.uid === userId;
}

/**
 * Sanitizza quote per display pubblico
 * (rimuove dati sensibili, usato se mai implementiamo sharing)
 */
export function sanitizeQuoteForPublic(quote: Quote): Partial<Quote> {
  return {
    numero: quote.numero,
    data: quote.data,
    ambito: quote.ambito,
    sottotipo: quote.sottotipo,
    totale: quote.totale,
    mq: quote.mq,
    verdict: quote.verdict,
    verdictLabel: quote.verdictLabel,
    // Escludi: uid, cliente completo, note private
  };
}
