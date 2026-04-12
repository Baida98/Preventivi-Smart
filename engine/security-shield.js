/**
 * Preventivi-Smart Pro — Security Shield v1.2 (Open Access Edition)
 * Protezione codice leggera (Anti-Copy, Anti-Debug) senza blocchi di dominio
 * L'app è ora accessibile da qualsiasi link o dominio.
 */

// ===== CONFIGURAZIONE SICUREZZA =====
const SECURITY_CONFIG = {
  enableAntiDebug: true,
  enableAntiCopy: true,
  enableDevtoolsDetection: true,
  debugCheckInterval: 3000
};

// ===== STATO PROTEZIONE =====
let isProtected = false;

// ===== FUNZIONE PRINCIPALE INIT =====
export function initSecurityShield() {
  // Messaggio di benvenuto nel sistema (visibile solo in console)
  console.log("%c🛡️ Preventivi-Smart Security Active (Open Access)", "color: #0ea5e9; font-weight: bold; font-size: 12px;");
  
  // Esegui solo protezioni non bloccanti
  if (SECURITY_CONFIG.enableAntiDebug) startAntiDebugSystem();
  if (SECURITY_CONFIG.enableDevtoolsDetection) startDevtoolsDetection();
  if (SECURITY_CONFIG.enableAntiCopy) enableAntiCopyProtection();
  
  isProtected = true;
  return isProtected;
}

// ===== 1. ANTI-DEBUG SYSTEM (NON BLOCCANTE) =====
function startAntiDebugSystem() {
  setInterval(() => {
    const before = performance.now();
    debugger;
    const after = performance.now();
    
    if (after - before > 200) {
      console.warn("%c⚠️ Debugger detected - Performance may be affected", "color: #f59e0b;");
    }
  }, SECURITY_CONFIG.debugCheckInterval);
}

// ===== 2. DEVTOOLS DETECTION (NON BLOCCANTE) =====
function startDevtoolsDetection() {
  const checkDevTools = () => {
    const threshold = 160;
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
      console.info("%cℹ️ DevTools open", "color: #3b82f6;");
    }
  };
  window.addEventListener("resize", checkDevTools);
}

// ===== 3. ANTI-COPY PROTECTION (USER FRIENDLY) =====
export function enableAntiCopyProtection() {
  // Disabilita Ctrl+U (View Source)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      return false;
    }
  });
}

// Nessuna funzione handleViolation o crash app è più presente.
export default {
  initSecurityShield,
  enableAntiCopyProtection
};
