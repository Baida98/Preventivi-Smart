/**
 * Preventivi-Smart Pro v11.0 — Mode Selector
 * Separazione tra "Stima Rapida" (Free) e "Analisi Professionale AI" (Premium)
 * Gestione della modalità di analisi e del flusso utente
 */

export const ANALYSIS_MODES = {
  QUICK_ESTIMATE: {
    id: "quick_estimate",
    name: "Stima Rapida",
    icon: "fa-bolt",
    color: "#0ea5e9",
    description: "Calcola una stima veloce del prezzo di mercato",
    features: [
      "✓ Selezione mestiere",
      "✓ Risposta a domande base",
      "✓ Stima prezzo indicativa",
      "✓ Grafico range mercato"
    ],
    isPremium: false,
    estimatedTime: "2-3 minuti",
    icon_fa: "fa-zap"
  },

  PROFESSIONAL_ANALYSIS: {
    id: "professional_analysis",
    name: "Analisi Professionale AI",
    icon: "fa-microscope",
    color: "#8b5cf6",
    description: "Analisi completa del preventivo ricevuto con report di congruità",
    features: [
      "✓ Analisi dettagliata del preventivo ricevuto",
      "✓ Report di Congruità di Mercato",
      "✓ Benchmark orari e costi",
      "✓ Analisi rischi legali e tecnici",
      "✓ Consigli professionali personalizzati",
      "✓ Certificazioni richieste",
      "✓ Export PDF Professionale",
      "✓ Storico analisi personale"
    ],
    isPremium: true,
    estimatedTime: "5-7 minuti",
    icon_fa: "fa-microscope",
    badge: "PRO"
  }
};

// ===== GESTIONE DELLA MODALITÀ =====
export class AnalysisMode {
  constructor() {
    this.currentMode = null;
    this.userIsLoggedIn = false;
    this.userHasPremium = false;
  }

  setMode(modeId) {
    if (!ANALYSIS_MODES[modeId.toUpperCase().replace(/-/g, "_")]) {
      console.error(`Mode ${modeId} not found`);
      return false;
    }
    this.currentMode = modeId;
    return true;
  }

  getMode() {
    return this.currentMode;
  }

  getModeConfig() {
    const modeKey = this.currentMode.toUpperCase().replace(/-/g, "_");
    return ANALYSIS_MODES[modeKey] || null;
  }

  canAccessMode(modeId) {
    const modeKey = modeId.toUpperCase().replace(/-/g, "_");
    const mode = ANALYSIS_MODES[modeKey];

    if (!mode) return false;
    if (!mode.isPremium) return true;
    if (mode.isPremium && this.userHasPremium) return true;

    return false;
  }

  setLoginStatus(isLoggedIn) {
    this.userIsLoggedIn = isLoggedIn;
  }

  setPremiumStatus(hasPremium) {
    this.userHasPremium = hasPremium;
  }

  getAccessDeniedMessage(modeId) {
    return `La modalità "${ANALYSIS_MODES[modeId.toUpperCase().replace(/-/g, "_")].name}" è disponibile solo per utenti Premium.`;
  }
}

// ===== VALIDAZIONE DATI PER MODALITÀ =====
export function validateDataForMode(modeId, data) {
  const mode = ANALYSIS_MODES[modeId.toUpperCase().replace(/-/g, "_")];
  if (!mode) return { valid: false, errors: ["Modalità non riconosciuta"] };

  const errors = [];

  // Validazioni comuni
  if (!data.tradeId) errors.push("Mestiere non selezionato");
  if (!data.region) errors.push("Regione non selezionata");
  if (!data.quality) errors.push("Qualità non selezionata");

  // Validazioni specifiche per modalità Premium
  if (mode.isPremium) {
    if (!data.receivedPrice || data.receivedPrice <= 0) {
      errors.push("Prezzo ricevuto non valido");
    }
    if (!data.quantity || data.quantity <= 0) {
      errors.push("Quantità non valida");
    }
    if (!data.answers || Object.keys(data.answers).length < 2) {
      errors.push("Risposte insufficienti alle domande");
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// ===== GESTIONE DELLA SESSIONE DI ANALISI =====
export class AnalysisSession {
  constructor(modeId) {
    this.modeId = modeId;
    this.sessionId = this.generateSessionId();
    this.createdAt = new Date();
    this.data = {};
    this.results = null;
    this.status = "initialized"; // initialized, in_progress, completed, error
  }

  generateSessionId() {
    return `AS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  updateData(newData) {
    this.data = { ...this.data, ...newData };
  }

  setResults(results) {
    this.results = results;
    this.status = "completed";
  }

  setError(error) {
    this.status = "error";
    this.error = error;
  }

  getProgress() {
    const modeConfig = ANALYSIS_MODES[this.modeId.toUpperCase().replace(/-/g, "_")];
    if (!modeConfig) return 0;

    const requiredFields = modeConfig.isPremium
      ? ["tradeId", "region", "quality", "receivedPrice", "quantity", "answers"]
      : ["tradeId", "region", "quality"];

    const filledFields = requiredFields.filter(field => this.data[field]);
    return Math.round((filledFields.length / requiredFields.length) * 100);
  }

  isComplete() {
    const validation = validateDataForMode(this.modeId, this.data);
    return validation.valid;
  }

  export() {
    return {
      sessionId: this.sessionId,
      modeId: this.modeId,
      createdAt: this.createdAt,
      completedAt: this.status === "completed" ? new Date() : null,
      data: this.data,
      results: this.results,
      status: this.status
    };
  }
}

// ===== STORAGE LOCALE SESSIONI =====
export function saveSessionToLocalStorage(session) {
  try {
    const sessions = JSON.parse(localStorage.getItem("analysisSessions") || "[]");
    sessions.push(session.export());
    localStorage.setItem("analysisSessions", JSON.stringify(sessions));
    return true;
  } catch (e) {
    console.error("Errore nel salvataggio della sessione:", e);
    return false;
  }
}

export function loadSessionsFromLocalStorage() {
  try {
    return JSON.parse(localStorage.getItem("analysisSessions") || "[]");
  } catch (e) {
    console.error("Errore nel caricamento delle sessioni:", e);
    return [];
  }
}

export function clearSessionsFromLocalStorage() {
  try {
    localStorage.removeItem("analysisSessions");
    return true;
  } catch (e) {
    console.error("Errore nella cancellazione delle sessioni:", e);
    return false;
  }
}

export default {
  ANALYSIS_MODES,
  AnalysisMode,
  AnalysisSession,
  validateDataForMode,
  saveSessionToLocalStorage,
  loadSessionsFromLocalStorage,
  clearSessionsFromLocalStorage
};
