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
