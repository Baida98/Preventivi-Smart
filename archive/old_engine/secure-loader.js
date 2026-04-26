/**
 * Preventivi-Smart Pro — Secure Loader v1.1
 * Caricamento dinamico e protezione di moduli sensibili
 * Ottimizzato per l'accesso pubblico via link diretto
 */

import { initSecurityShield } from "./security-shield.js";

export class SecureLoader {
  constructor() {
    this.loadedModules = new Map();
    this.initialized = false;
  }

  /**
   * Inizializza l'app in modo sicuro
   */
  async init() {
    if (this.initialized) return true;

    try {
      // 1. Avvia lo scudo di sicurezza (ora permissivo per l'accesso via link)
      initSecurityShield();

      // 2. Carica i moduli critici
      await this.loadModule("database", "./database.js");
      await this.loadModule("calculator", "./smart-calculator.js");
      await this.loadModule("analyzer", "./professional-analyzer.js");
      await this.loadModule("report", "./congruity-report.js");
      await this.loadModule("pdf", "./professional-pdf.js");

      this.initialized = true;
      console.log("%c🚀 App Engine Ready", "color: #0ea5e9; font-weight: bold; font-size: 12px;");
      return true;
    } catch (e) {
      console.error("Inizializzazione fallita:", e);
      return false;
    }
  }

  /**
   * Carica un modulo e lo salva in cache
   */
  async loadModule(name, path) {
    try {
      const module = await import(path);
      this.loadedModules.set(name, module);
      return module;
    } catch (e) {
      console.error(`Errore caricamento modulo ${name}:`, e);
      throw e;
    }
  }

  /**
   * Ottieni un modulo caricato
   */
  getModule(name) {
    return this.loadedModules.get(name) || null;
  }
}

// ===== SINGLETON INSTANCE =====
export const secureLoader = new SecureLoader();
export default secureLoader;
