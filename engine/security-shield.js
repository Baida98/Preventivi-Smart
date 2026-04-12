/**
 * Preventivi-Smart Pro — Security Shield v1.3 (Open Access Fix)
 * Protezione codice passiva (Anti-Copy, Anti-Debug) senza alcun blocco all'avvio.
 * L'app è ora accessibile istantaneamente da qualsiasi link.
 */

export function initSecurityShield() {
  // Solo messaggi informativi in console
  console.log("%c🛡️ Preventivi-Smart Security Active (Public Mode)", "color: #0ea5e9; font-weight: bold; font-size: 12px;");
  
  // Attiva solo protezioni non bloccanti
  enableAntiCopyProtection();
  startAntiDebugSystem();
  
  return true; // Ritorna sempre vero per non bloccare l'app
}

function startAntiDebugSystem() {
  // Rilevamento debugger leggero (solo log, nessun blocco)
  setInterval(() => {
    const before = performance.now();
    debugger;
    const after = performance.now();
    if (after - before > 200) {
      console.warn("%c⚠️ Debugger detected", "color: #f59e0b;");
    }
  }, 5000);
}

export function enableAntiCopyProtection() {
  // Impedisce solo la visualizzazione del sorgente con Ctrl+U
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      return false;
    }
  });
}

// Nessun riferimento a Domain Lock, Violation, o Redirect.
export default {
  initSecurityShield,
  enableAntiCopyProtection
};
