/**
 * Preventivi-Smart Pro — Security Shield v1.0
 * Self-Defending System: Domain Lock, Anti-Debug, Anti-Copy
 * Protezione massima della proprietà intellettuale
 */

// ===== CONFIGURAZIONE SICUREZZA =====
const SECURITY_CONFIG = {
  // Domini autorizzati (aggiungi i tuoi)
  allowedDomains: [
    "preventivi-smart.it",
    "www.preventivi-smart.it",
    "app.preventivi-smart.it",
    "localhost",
    "127.0.0.1"
  ],
  
  // Abilita protezioni
  enableDomainLock: true,
  enableAntiDebug: true,
  enableAntiCopy: true,
  enableConsoleBlock: true,
  enableDevtoolsDetection: true,
  
  // Azioni quando protezione violata
  violationAction: "crash", // "crash" | "redirect" | "disable"
  violationRedirectUrl: "https://preventivi-smart.it/unauthorized",
  
  // Timeout anti-debug (ms)
  debugCheckInterval: 1000
};

// ===== STATO PROTEZIONE =====
let isProtected = false;
let debugDetected = false;
let domainViolation = false;

// ===== FUNZIONE PRINCIPALE INIT =====
export function initSecurityShield() {
  console.log("%c🛡️ Security Shield Initializing...", "color: #059669; font-weight: bold; font-size: 14px;");
  
  // Esegui controlli in sequenza
  if (SECURITY_CONFIG.enableDomainLock) checkDomainLock();
  if (SECURITY_CONFIG.enableAntiDebug) startAntiDebugSystem();
  if (SECURITY_CONFIG.enableDevtoolsDetection) startDevtoolsDetection();
  if (SECURITY_CONFIG.enableConsoleBlock) blockConsoleExecution();
  if (SECURITY_CONFIG.enableAntiCopy) enableAntiCopyProtection();
  
  // Avvia monitoraggio continuo
  startContinuousMonitoring();
  
  isProtected = true;
  console.log("%c✅ Security Shield Active", "color: #059669; font-weight: bold; font-size: 12px;");
  
  return isProtected;
}

// ===== 1. DOMAIN LOCK =====
function checkDomainLock() {
  const currentDomain = window.location.hostname;
  const isAllowed = SECURITY_CONFIG.allowedDomains.some(domain => {
    return currentDomain === domain || currentDomain.endsWith("." + domain);
  });
  
  if (!isAllowed) {
    domainViolation = true;
    console.warn(`%c⚠️ DOMAIN VIOLATION: ${currentDomain} is not authorized`, "color: #dc2626; font-weight: bold;");
    handleViolation("Domain Lock Violation");
    return false;
  }
  
  console.log(`%c✓ Domain verified: ${currentDomain}`, "color: #059669; font-size: 11px;");
  return true;
}

// ===== 2. ANTI-DEBUG SYSTEM =====
function startAntiDebugSystem() {
  // Metodo 1: Rilevamento tramite Function toString
  const originalLog = console.log;
  Object.defineProperty(console, "log", {
    get: function() {
      debugDetected = true;
      handleViolation("Console Access Detected");
      return originalLog;
    }
  });
  
  // Metodo 2: Rilevamento tramite Debugger Statement
  setInterval(() => {
    const before = new Date().getTime();
    debugger;
    const after = new Date().getTime();
    
    if (after - before > 100) {
      debugDetected = true;
      handleViolation("Debugger Detected");
    }
  }, SECURITY_CONFIG.debugCheckInterval);
  
  // Metodo 3: Rilevamento tramite Breakpoints
  try {
    const test = () => { debugger; };
    const start = performance.now();
    test();
    const end = performance.now();
    
    if (end - start > 50) {
      debugDetected = true;
      handleViolation("Breakpoint Detected");
    }
  } catch (e) {
    // Silenzioso
  }
}

// ===== 3. DEVTOOLS DETECTION =====
function startDevtoolsDetection() {
  // Metodo 1: Rilevamento tramite console.clear
  const originalClear = console.clear;
  console.clear = function() {
    debugDetected = true;
    handleViolation("DevTools Opened (Clear)");
    originalClear.call(console);
  };
  
  // Metodo 2: Rilevamento tramite dimensioni finestra
  const checkDevTools = () => {
    const threshold = 160;
    
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
      
      if (debugDetected === false) {
        debugDetected = true;
        handleViolation("DevTools Detected (Window Size)");
      }
    }
  };
  
  window.addEventListener("resize", checkDevTools);
  checkDevTools();
  
  // Metodo 3: Rilevamento tramite console.profile
  const originalProfile = console.profile;
  console.profile = function() {
    debugDetected = true;
    handleViolation("DevTools Opened (Profile)");
    return originalProfile.call(console, arguments);
  };
}

// ===== 4. BLOCK CONSOLE EXECUTION =====
function blockConsoleExecution() {
  // Disabilita metodi console pericolosi
  const dangerousMethods = ["log", "warn", "error", "info", "debug", "trace"];
  
  dangerousMethods.forEach(method => {
    const original = console[method];
    console[method] = function(...args) {
      // Permetti solo messaggi di sistema
      if (args[0]?.includes?.("Security Shield") || args[0]?.includes?.("✓") || args[0]?.includes?.("✅")) {
        return original.apply(console, args);
      }
      // Blocca tutto il resto
      return undefined;
    };
  });
  
  // Disabilita eval
  window.eval = function(code) {
    handleViolation("Eval Execution Attempt");
    return undefined;
  };
  
  // Disabilita Function constructor
  const OriginalFunction = Function;
  window.Function = function(...args) {
    handleViolation("Function Constructor Abuse");
    return OriginalFunction.apply(this, args);
  };
}

// ===== 5. ANTI-COPY PROTECTION =====
export function enableAntiCopyProtection() {
  // Disabilita tasto destro
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showSecurityAlert("Right-click disabled for security");
    return false;
  });
  
  // Disabilita Ctrl+C / Cmd+C
  document.addEventListener("copy", (e) => {
    e.preventDefault();
    showSecurityAlert("Copy disabled for security");
    return false;
  });
  
  // Disabilita Ctrl+X / Cmd+X
  document.addEventListener("cut", (e) => {
    e.preventDefault();
    showSecurityAlert("Cut disabled for security");
    return false;
  });
  
  // Disabilita Ctrl+V / Cmd+V
  document.addEventListener("paste", (e) => {
    e.preventDefault();
    showSecurityAlert("Paste disabled for security");
    return false;
  });
  
  // Disabilita Ctrl+U (View Source)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      showSecurityAlert("View Source disabled for security");
      return false;
    }
  });
  
  // Disabilita Ctrl+S (Save)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      showSecurityAlert("Save disabled for security");
      return false;
    }
  });
  
  // Disabilita selezione di testo (opzionale - può infastidire utenti legittimi)
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none";
  document.body.style.msUserSelect = "none";
  
  // Disabilita drag & drop
  document.addEventListener("dragstart", (e) => {
    e.preventDefault();
    return false;
  });
  
  // Proteggi elementi critici
  protectCriticalElements();
}

// ===== 6. PROTEGGI ELEMENTI CRITICI =====
function protectCriticalElements() {
  const criticalSelectors = [
    "script",
    "[data-protected]",
    ".engine",
    ".ai-analyzer"
  ];
  
  criticalSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Rendi invisibile nel DOM inspector
      el.setAttribute("data-protected", "true");
      
      // Blocca accesso diretto
      Object.defineProperty(el, "innerHTML", {
        get: function() {
          handleViolation("Protected Element Access Attempt");
          return "";
        },
        set: function(val) {
          handleViolation("Protected Element Modification Attempt");
        }
      });
    });
  });
}

// ===== 7. MONITORAGGIO CONTINUO =====
function startContinuousMonitoring() {
  // Monitora modifiche al DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        // Controlla se vengono aggiunti script malevoli
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === "SCRIPT" && !node.src.includes("preventivi-smart")) {
            handleViolation("Suspicious Script Injection Detected");
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Monitora accessi a localStorage/sessionStorage
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    if (key.includes("__proto__") || key.includes("constructor")) {
      handleViolation("Prototype Pollution Attempt");
      return;
    }
    return originalSetItem.call(this, key, value);
  };
  
  // Monitora accessi a window.location
  let locationChangeCount = 0;
  const originalReplace = window.location.replace;
  window.location.replace = function(url) {
    locationChangeCount++;
    if (locationChangeCount > 5) {
      handleViolation("Excessive Location Changes");
      return;
    }
    return originalReplace.call(window.location, url);
  };
}

// ===== 8. GESTIONE VIOLAZIONI =====
function handleViolation(reason) {
  const timestamp = new Date().toISOString();
  const userAgent = navigator.userAgent;
  const url = window.location.href;
  
  console.warn(`%c🚨 SECURITY VIOLATION: ${reason}`, "color: #dc2626; font-weight: bold; font-size: 13px;");
  console.warn(`%cTimestamp: ${timestamp}`, "color: #dc2626; font-size: 11px;");
  console.warn(`%cURL: ${url}`, "color: #dc2626; font-size: 11px;");
  
  // Log della violazione (invia al server se configurato)
  logViolationToServer({
    reason,
    timestamp,
    userAgent,
    url,
    domain: window.location.hostname
  });
  
  // Esegui azione in base alla configurazione
  switch (SECURITY_CONFIG.violationAction) {
    case "crash":
      crashApplication(reason);
      break;
    case "redirect":
      window.location.href = SECURITY_CONFIG.violationRedirectUrl;
      break;
    case "disable":
      disableApplication(reason);
      break;
  }
}

// ===== 9. CRASH APPLICATION =====
function crashApplication(reason) {
  // Cancella tutto il DOM
  document.body.innerHTML = "";
  document.head.innerHTML = "";
  
  // Crea pagina di errore
  const errorPage = document.createElement("div");
  errorPage.style.cssText = `
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: Inter, sans-serif;
    text-align: center;
  `;
  
  errorPage.innerHTML = `
    <div style="max-width: 500px; padding: 2rem;">
      <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
      <h1 style="font-size: 2rem; margin-bottom: 1rem; font-weight: 800;">Accesso Negato</h1>
      <p style="font-size: 1.1rem; color: #94a3b8; margin-bottom: 2rem; line-height: 1.6;">
        Questa applicazione è protetta da un sistema di sicurezza avanzato.
        <br><br>
        Motivo: <strong>${reason}</strong>
        <br><br>
        Se ritieni che si tratti di un errore, contatta il supporto.
      </p>
      <p style="font-size: 0.9rem; color: #64748b;">
        Preventivi-Smart Pro © 2025 — All rights reserved
      </p>
    </div>
  `;
  
  document.documentElement.appendChild(errorPage);
  
  // Blocca tutto
  window.stop();
  throw new Error(`Security Shield: ${reason}`);
}

// ===== 10. DISABLE APPLICATION =====
function disableApplication(reason) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    backdrop-filter: blur(5px);
  `;
  
  overlay.innerHTML = `
    <div style="text-align: center; color: white;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Applicazione Disabilitata</h2>
      <p style="font-size: 1rem; color: #94a3b8; margin-bottom: 2rem;">
        Motivo: ${reason}
      </p>
    </div>
  `;
  
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
}

// ===== 11. MOSTRA ALERT SICUREZZA =====
function showSecurityAlert(message) {
  const alert = document.createElement("div");
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc2626;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    z-index: 999999;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
  `;
  
  alert.textContent = `🔒 ${message}`;
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

// ===== 12. LOG VIOLAZIONI AL SERVER =====
async function logViolationToServer(data) {
  try {
    // Invia a un endpoint di logging (configura il tuo backend)
    await fetch("/api/security-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(() => {
      // Silenzioso se il server non è disponibile
    });
  } catch (e) {
    // Silenzioso
  }
}

// ===== 13. PROTEZIONE MEMORIA =====
export function protectSensitiveData(data) {
  // Crea un Proxy che blocca accessi non autorizzati
  return new Proxy(data, {
    get(target, prop) {
      if (prop === "toJSON" || prop === "toString") {
        handleViolation("Sensitive Data Serialization Attempt");
        return () => "[PROTECTED]";
      }
      return target[prop];
    },
    set(target, prop, value) {
      handleViolation("Sensitive Data Modification Attempt");
      return false;
    }
  });
}

// ===== 14. WATERMARK INVISIBILE =====
export function addInvisibleWatermark() {
  // Aggiungi un watermark invisibile nel DOM per tracciare copie
  const watermark = document.createElement("meta");
  watermark.name = "preventivi-smart-protected";
  watermark.content = `v7.0-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  document.head.appendChild(watermark);
  
  // Aggiungi anche nel localStorage
  try {
    localStorage.setItem("_ps_watermark", watermark.content);
  } catch (e) {
    // Silenzioso
  }
}

// ===== EXPORT =====
export default {
  initSecurityShield,
  enableAntiCopyProtection,
  protectSensitiveData,
  addInvisibleWatermark,
  handleViolation,
  SECURITY_CONFIG
};
