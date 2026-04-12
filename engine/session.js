/**
 * Modulo di gestione sessione e persistenza dati
 * Implementa localStorage sicuro e gestione token
 */

const SESSION_KEY = "preventivi_smart_session";
const HISTORY_KEY = "preventivi_smart_history";
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 ore

/**
 * Classe per gestire la sessione utente
 */
export class SessionManager {
  constructor() {
    this.session = this.loadSession();
    this.startSessionTimer();
  }

  /**
   * Carica la sessione dal localStorage
   */
  loadSession() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored);
      
      // Verifica se la sessione è scaduta
      if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (e) {
      console.error("Errore caricamento sessione:", e);
      return null;
    }
  }

  /**
   * Salva la sessione nel localStorage
   */
  saveSession(userData) {
    try {
      const session = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        createdAt: Date.now(),
        lastActivity: Date.now()
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      this.session = session;
      return true;
    } catch (e) {
      console.error("Errore salvataggio sessione:", e);
      return false;
    }
  }

  /**
   * Aggiorna il timestamp dell'ultima attività
   */
  updateActivity() {
    if (this.session) {
      this.session.lastActivity = Date.now();
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
    }
  }

  /**
   * Cancella la sessione
   */
  clearSession() {
    localStorage.removeItem(SESSION_KEY);
    this.session = null;
  }

  /**
   * Ottiene la sessione corrente
   */
  getSession() {
    return this.session;
  }

  /**
   * Verifica se l'utente è autenticato
   */
  isAuthenticated() {
    return this.session !== null;
  }

  /**
   * Timer per aggiornare l'attività
   */
  startSessionTimer() {
    setInterval(() => {
      if (this.session) {
        this.updateActivity();
      }
    }, 5 * 60 * 1000); // Ogni 5 minuti
  }
}

/**
 * Classe per gestire la cronologia locale
 */
export class HistoryStorage {
  constructor() {
    this.maxItems = 100;
  }

  /**
   * Carica la cronologia dal localStorage
   */
  loadHistory() {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Errore caricamento cronologia:", e);
      return [];
    }
  }

  /**
   * Salva la cronologia nel localStorage
   */
  saveHistory(history) {
    try {
      // Mantieni solo gli ultimi maxItems
      const limited = history.slice(0, this.maxItems);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
      return true;
    } catch (e) {
      console.error("Errore salvataggio cronologia:", e);
      return false;
    }
  }

  /**
   * Aggiunge un preventivo alla cronologia
   */
  addQuote(quote) {
    const history = this.loadHistory();
    history.unshift({
      ...quote,
      id: Date.now(),
      savedAt: new Date().toISOString()
    });
    this.saveHistory(history);
  }

  /**
   * Ottiene tutta la cronologia
   */
  getAll() {
    return this.loadHistory();
  }

  /**
   * Cancella la cronologia
   */
  clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }

  /**
   * Esporta la cronologia come JSON
   */
  exportAsJSON() {
    const history = this.loadHistory();
    return JSON.stringify(history, null, 2);
  }

  /**
   * Importa cronologia da JSON
   */
  importFromJSON(jsonString) {
    try {
      const history = JSON.parse(jsonString);
      if (Array.isArray(history)) {
        this.saveHistory(history);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Errore importazione:", e);
      return false;
    }
  }
}

/**
 * Funzioni di sicurezza
 */
export const SecurityUtils = {
  /**
   * Sanitizza input per prevenire XSS
   */
  sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  /**
   * Valida email
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Genera hash semplice per dati sensibili
   */
  hashData(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  },

  /**
   * Cripta dati locali (semplice, non per dati altamente sensibili)
   */
  encryptData(data, key) {
    const json = JSON.stringify(data);
    let encrypted = "";
    for (let i = 0; i < json.length; i++) {
      encrypted += String.fromCharCode(
        json.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(encrypted);
  },

  /**
   * Decripta dati locali
   */
  decryptData(encrypted, key) {
    try {
      const json = atob(encrypted);
      let decrypted = "";
      for (let i = 0; i < json.length; i++) {
        decrypted += String.fromCharCode(
          json.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return JSON.parse(decrypted);
    } catch (e) {
      console.error("Errore decrittazione:", e);
      return null;
    }
  }
};

// Istanze globali
export const sessionManager = new SessionManager();
export const historyStorage = new HistoryStorage();
