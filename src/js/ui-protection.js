/**
 * Preventivi-Smart Pro — UI Protection v1.1
 * Protezione interfaccia leggera per accesso pubblico via link
 * Protegge il codice senza bloccare l'esperienza utente
 */

export function initUIProtection() {
  // Protezioni minime e non invasive
  disableViewSource();
  protectCriticalElements();
  
  console.log("%c✓ UI Protection Active", "color: #0ea5e9; font-size: 11px;");
}

// ===== 1. DISABILITA VIEW SOURCE =====
function disableViewSource() {
  // Disabilita Ctrl+U (View Source)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      return false;
    }
  });
}

// ===== 2. PROTEGGI ELEMENTI CRITICI =====
function protectCriticalElements() {
  // Proteggi script critici da ispezione diretta
  const scripts = document.querySelectorAll("script[data-protected]");
  scripts.forEach(script => {
    // Rendi il contenuto non selezionabile
    script.style.userSelect = "none";
    script.style.webkitUserSelect = "none";
  });
}

export default {
  initUIProtection
};
