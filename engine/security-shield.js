/**
 * Preventivi-Smart Pro — Security Shield v1.1 (Public Access Edition)
 * Self-Defending System: Anti-Debug, Anti-Copy, IP Protection
 * Ottimizzato per permettere l'accesso pubblico via link diretto
 */

// ===== CONFIGURAZIONE SICUREZZA =====
const SECURITY_CONFIG = {
  // DISABILITATO: Permette l'accesso da qualsiasi dominio/link
  enableDomainLock: false, 
  
  // Abilita protezioni del codice (senza bloccare l'utente)
  enableAntiDebug: true,
  enableAntiCopy: true,
  enableConsoleBlock: false, // Disabilitato per evitare conflitti con alcuni browser
  enableDevtoolsDetection: true,
  
  // Azioni quando protezione violata (solo per debug estremo)
  violationAction: "warn", // Cambiato da "crash" a "warn" per evitare falsi positivi
  
  // Timeout anti-debug (ms)
  debugCheckInterval: 2000 // Aumentato per ridurre carico CPU
};

// ===== STATO PROTEZIONE =====
let isProtected = false;
let debugDetected = false;

// ===== FUNZIONE PRINCIPALE INIT =====
export function initSecurityShield() {
  // Messaggio di benvenuto nel sistema protetto (visibile solo in console se aperta)
  console.log("%c🛡️ Preventivi-Smart Security Active", "color: #0ea5e9; font-weight: bold; font-size: 12px;");
  
  // Esegui controlli in sequenza (solo quelli necessari)
  if (SECURITY_CONFIG.enableAntiDebug) startAntiDebugSystem();
  if (SECURITY_CONFIG.enableDevtoolsDetection) startDevtoolsDetection();
  if (SECURITY_CONFIG.enableAntiCopy) enableAntiCopyProtection();
  
  isProtected = true;
  return isProtected;
}

// ===== 1. ANTI-DEBUG SYSTEM (LIGHT) =====
function startAntiDebugSystem() {
  // Metodo non invasivo: rileva rallentamenti dovuti a debugger
  setInterval(() => {
    const before = performance.now();
    debugger;
    const after = performance.now();
    
    if (after - before > 200) {
      debugDetected = true;
      handleViolation("Debugger Detected");
    }
  }, SECURITY_CONFIG.debugCheckInterval);
}

// ===== 2. DEVTOOLS DETECTION (LIGHT) =====
function startDevtoolsDetection() {
  const checkDevTools = () => {
    const threshold = 160;
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
      if (!debugDetected) {
        debugDetected = true;
        handleViolation("DevTools Detected");
      }
    }
  };
  window.addEventListener("resize", checkDevTools);
}

// ===== 3. ANTI-COPY PROTECTION (USER FRIENDLY) =====
export function enableAntiCopyProtection() {
  // Protegge il codice ma non blocca l'esperienza utente base
  
  // Disabilita Ctrl+U (View Source)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      return false;
    }
  });

  // Disabilita tasto destro solo su elementi critici (non su tutta la pagina)
  document.querySelectorAll("[data-protected]").forEach(el => {
    el.addEventListener("contextmenu", (e) => e.preventDefault());
  });

  // Nota: Abbiamo rimosso il blocco globale di copia/incolla per non infastidire gli utenti
  // ma il codice sorgente rimane offuscato e protetto dal loader.
}

// ===== 4. GESTIONE VIOLAZIONI (SOFT) =====
function handleViolation(reason) {
  // Invece di mandare in crash l'app, registriamo solo il tentativo
  // e rendiamo più difficile il reverse engineering dinamico
  if (SECURITY_CONFIG.violationAction === "warn") {
    console.warn(`%c⚠️ Security Notice: ${reason}`, "color: #f59e0b; font-weight: bold;");
  }
}

export default {
  initSecurityShield,
  enableAntiCopyProtection
};
