/**
 * Preventivi-Smart Pro — HTML Escape Utility
 * Previene XSS quando si usano template string + innerHTML con dati utente.
 */

const ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
  '/': '&#47;'
};

export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"'`/]/g, (ch) => ENTITIES[ch]);
}

export default escapeHtml;
