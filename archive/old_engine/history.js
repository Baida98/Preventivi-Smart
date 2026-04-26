/**
 * Modulo per gestire la storia dei preventivi generati
 * Con persistenza localStorage
 */

import { historyStorage } from "./session.js";

const MAX_HISTORY = 50;

export class QuoteHistory {
  constructor() {
    this.quotes = historyStorage.loadHistory();
  }

  /**
   * Aggiunge un preventivo alla storia
   */
  add(quote) {
    this.quotes.unshift({
      ...quote,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });

    // Mantieni solo gli ultimi MAX_HISTORY preventivi
    if (this.quotes.length > MAX_HISTORY) {
      this.quotes = this.quotes.slice(0, MAX_HISTORY);
    }

    // Salva nel localStorage
    historyStorage.saveHistory(this.quotes);
  }

  /**
   * Ottiene tutti i preventivi
   */
  getAll() {
    return this.quotes;
  }

  /**
   * Ottiene i preventivi per tipo
   */
  getByType(tipo) {
    return this.quotes.filter(q => q.tipo === tipo);
  }

  /**
   * Ottiene i preventivi per città
   */
  getByCity(citta) {
    return this.quotes.filter(q => q.citta === citta);
  }

  /**
   * Cancella la storia
   */
  clear() {
    this.quotes = [];
    historyStorage.clearHistory();
  }

  /**
   * Esporta la storia come JSON
   */
  export() {
    return JSON.stringify(this.quotes, null, 2);
  }

  /**
   * Importa la storia da JSON
   */
  import(jsonString) {
    try {
      this.quotes = JSON.parse(jsonString);
      return true;
    } catch (e) {
      console.error("Errore nell'importazione della storia:", e);
      return false;
    }
  }
}

export const quoteHistory = new QuoteHistory();
