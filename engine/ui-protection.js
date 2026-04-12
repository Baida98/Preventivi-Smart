/**
 * Preventivi-Smart Pro — UI Protection v1.0
 * Protezione interfaccia: No-Copy, No-Inspect, No-Screenshot, No-DevTools
 */

export function initUIProtection() {
  disableInspectElement();
  disableSourceView();
  disableScreenshot();
  disableKeyboardShortcuts();
  disableMouseEvents();
  protectFormInputs();
  addCSSProtection();
  monitorClipboard();
  
  console.log("%c✓ UI Protection Active", "color: #059669; font-size: 11px;");
}

// ===== 1. DISABILITA INSPECT ELEMENT =====
function disableInspectElement() {
  // Disabilita F12
  document.addEventListener("keydown", (e) => {
    if (e.key === "F12") {
      e.preventDefault();
      showWarning("Inspect disabled");
      return false;
    }
  });
  
  // Disabilita Ctrl+Shift+I
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
      e.preventDefault();
      showWarning("Inspect disabled");
      return false;
    }
  });
  
  // Disabilita Ctrl+Shift+C
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
      e.preventDefault();
      showWarning("Element picker disabled");
      return false;
    }
  });
  
  // Disabilita Ctrl+Shift+J (Console)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "J") {
      e.preventDefault();
      showWarning("Console disabled");
      return false;
    }
  });
  
  // Disabilita Ctrl+Shift+K (Console su Firefox)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "K") {
      e.preventDefault();
      showWarning("Console disabled");
      return false;
    }
  });
}

// ===== 2. DISABILITA SOURCE VIEW =====
function disableSourceView() {
  // Disabilita Ctrl+U (View Source)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      showWarning("View Source disabled");
      return false;
    }
  });
  
  // Disabilita Cmd+Option+U (Safari View Source)
  document.addEventListener("keydown", (e) => {
    if (e.metaKey && e.altKey && e.key === "u") {
      e.preventDefault();
      showWarning("View Source disabled");
      return false;
    }
  });
}

// ===== 3. DISABILITA SCREENSHOT =====
function disableScreenshot() {
  // Disabilita Print Screen
  document.addEventListener("keydown", (e) => {
    if (e.key === "PrintScreen") {
      e.preventDefault();
      showWarning("Screenshot disabled");
      return false;
    }
  });
  
  // Disabilita Ctrl+P (Print)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "p") {
      e.preventDefault();
      showWarning("Print disabled");
      return false;
    }
  });
  
  // Blocca Screen Capture API
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    const original = navigator.mediaDevices.getDisplayMedia;
    navigator.mediaDevices.getDisplayMedia = function() {
      console.warn("Screen capture blocked");
      return Promise.reject(new Error("Screen capture is disabled"));
    };
  }
}

// ===== 4. DISABILITA KEYBOARD SHORTCUTS PERICOLOSI =====
function disableKeyboardShortcuts() {
  const blockedKeys = [
    { ctrl: true, key: "a" },      // Select All
    { ctrl: true, key: "c" },      // Copy
    { ctrl: true, key: "x" },      // Cut
    { ctrl: true, key: "v" },      // Paste
    { ctrl: true, key: "s" },      // Save
    { ctrl: true, key: "n" },      // New Window
    { ctrl: true, key: "w" },      // Close Tab
    { ctrl: true, key: "t" },      // New Tab
    { ctrl: true, key: "shift" },  // Shift+Ctrl
    { alt: true, key: "F4" },      // Close Window
    { alt: true, key: "Tab" },     // Switch Window
  ];
  
  document.addEventListener("keydown", (e) => {
    for (const blocked of blockedKeys) {
      const matches = (blocked.ctrl === undefined || blocked.ctrl === (e.ctrlKey || e.metaKey)) &&
                      (blocked.alt === undefined || blocked.alt === e.altKey) &&
                      (blocked.shift === undefined || blocked.shift === e.shiftKey) &&
                      e.key.toLowerCase() === blocked.key.toLowerCase();
      
      if (matches) {
        e.preventDefault();
        return false;
      }
    }
  });
}

// ===== 5. DISABILITA MOUSE EVENTS =====
function disableMouseEvents() {
  // Disabilita right-click
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showWarning("Right-click disabled");
    return false;
  });
  
  // Disabilita drag
  document.addEventListener("dragstart", (e) => {
    e.preventDefault();
    return false;
  });
  
  document.addEventListener("drag", (e) => {
    e.preventDefault();
    return false;
  });
  
  // Disabilita drop
  document.addEventListener("drop", (e) => {
    e.preventDefault();
    return false;
  });
  
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
    return false;
  });
}

// ===== 6. PROTEGGI FORM INPUTS =====
function protectFormInputs() {
  // Disabilita autocomplete su campi sensibili
  const sensitiveInputs = document.querySelectorAll(
    'input[type="password"], input[type="email"], input[data-protected]'
  );
  
  sensitiveInputs.forEach(input => {
    input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false");
    
    // Blocca copia da input
    input.addEventListener("copy", (e) => {
      e.preventDefault();
      showWarning("Copy from this field is disabled");
      return false;
    });
    
    // Blocca paste su campi critici
    if (input.dataset.noPaste) {
      input.addEventListener("paste", (e) => {
        e.preventDefault();
        showWarning("Paste is not allowed");
        return false;
      });
    }
  });
}

// ===== 7. PROTEZIONE CSS =====
function addCSSProtection() {
  const style = document.createElement("style");
  style.textContent = `
    /* Disabilita selezione testo */
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
    
    /* Permetti selezione su input */
    input, textarea {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
    
    /* Disabilita drag su immagini */
    img {
      -webkit-user-drag: none;
      user-drag: none;
      pointer-events: none;
    }
    
    /* Disabilita outline su focus */
    *:focus {
      outline: none !important;
    }
    
    /* Proteggi elementi critici */
    [data-protected] {
      -webkit-user-select: none !important;
      user-select: none !important;
      pointer-events: auto !important;
    }
    
    /* Disabilita print styles */
    @media print {
      * {
        display: none !important;
      }
    }
    
    /* Disabilita highlight su selezione */
    ::selection {
      background: transparent !important;
      color: inherit !important;
    }
    
    ::-moz-selection {
      background: transparent !important;
      color: inherit !important;
    }
  `;
  
  document.head.appendChild(style);
}

// ===== 8. MONITORA CLIPBOARD =====
function monitorClipboard() {
  // Intercetta accessi a clipboard
  if (navigator.clipboard) {
    const originalRead = navigator.clipboard.readText;
    navigator.clipboard.readText = function() {
      console.warn("Clipboard read attempt blocked");
      return Promise.reject(new Error("Clipboard access denied"));
    };
    
    const originalWrite = navigator.clipboard.writeText;
    navigator.clipboard.writeText = function(text) {
      console.warn("Clipboard write attempt blocked");
      return Promise.reject(new Error("Clipboard access denied"));
    };
  }
}

// ===== 9. MOSTRA WARNING =====
function showWarning(message) {
  const warning = document.createElement("div");
  warning.style.cssText = `
    position: fixed;
    top: 15px;
    right: 15px;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: white;
    padding: 0.75rem 1.25rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    z-index: 999999;
    box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
    animation: slideInRight 0.3s ease-out;
    border-left: 4px solid #fca5a5;
  `;
  
  warning.innerHTML = `<i class="fas fa-shield-alt" style="margin-right: 0.5rem;"></i>${message}`;
  document.body.appendChild(warning);
  
  setTimeout(() => {
    warning.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => warning.remove(), 300);
  }, 2500);
}

// ===== 10. PROTEZIONE MEMORIA =====
export function secureMemory() {
  // Pulisci dati sensibili dalla memoria
  if (window.crypto && window.crypto.getRandomValues) {
    const sensitiveKeys = ["apiKey", "token", "password", "secret"];
    
    sensitiveKeys.forEach(key => {
      if (window[key]) {
        const randomData = new Uint8Array(32);
        window.crypto.getRandomValues(randomData);
        window[key] = null;
      }
    });
  }
}

// ===== 11. MONITORA MODIFICHE DOM =====
export function monitorDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") {
        if (mutation.attributeName === "class" || mutation.attributeName === "style") {
          // Controlla modifiche sospette
          const target = mutation.target;
          if (target.classList && target.classList.contains("hidden-by-attacker")) {
            target.classList.remove("hidden-by-attacker");
            console.warn("DOM tampering detected and prevented");
          }
        }
      }
    });
  });
  
  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class", "style", "data-*"]
  });
}

// ===== 12. PROTEZIONE NETWORK =====
export function protectNetwork() {
  // Intercetta fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    
    // Blocca richieste a domini non autorizzati
    if (typeof url === "string") {
      const urlObj = new URL(url, window.location.origin);
      if (!urlObj.hostname.includes("preventivi-smart") && 
          !urlObj.hostname.includes("firebase") &&
          !urlObj.hostname.includes("googleapis")) {
        console.warn(`Blocked fetch to unauthorized domain: ${urlObj.hostname}`);
        return Promise.reject(new Error("Unauthorized domain"));
      }
    }
    
    return originalFetch.apply(this, args);
  };
}

// ===== EXPORT =====
export default {
  initUIProtection,
  secureMemory,
  monitorDOMChanges,
  protectNetwork
};
