/**
 * Preventivi-Smart Pro v22.0 — Database Scenari Guasti e Problemi Comuni
 *
 * Metodologia:
 * - Focus su "Problemi Comuni" e "Chiamate di Emergenza"
 * - Domande dinamiche ultra-specifiche per ogni scenario
 * - Prezzi 2025 basati su medie di mercato e prezzari regionali
 */

export const REGIONAL_COEFFICIENTS = {
  "Lombardia": 1.25, "Trentino-Alto Adige": 1.22, "Valle d'Aosta": 1.18,
  "Lazio": 1.15, "Veneto": 1.12, "Emilia-Romagna": 1.10, "Piemonte": 1.08,
  "Liguria": 1.08, "Toscana": 1.05, "Friuli-Venezia Giulia": 1.02,
  "Marche": 0.98, "Umbria": 0.95, "Abruzzo": 0.92, "Campania": 0.90,
  "Sardegna": 0.88, "Puglia": 0.85, "Sicilia": 0.82, "Basilicata": 0.80,
  "Calabria": 0.78, "Molise": 0.75
};

export const MACRO_CATEGORIES = [
  { id: "idraulico", name: "Idraulico", icon: "fa-faucet", color: "#3b82f6", desc: "Perdite, scarichi, caldaie e condizionatori." },
  { id: "elettricista", name: "Elettricista", icon: "fa-bolt", color: "#f59e0b", desc: "Cortocircuiti, salvavita, prese e quadri." },
  { id: "muratore_pittore", name: "Muratore / Pittore", icon: "fa-trowel-bricks", color: "#8b5cf6", desc: "Muffa, crepe, infiltrazioni e pareti." },
  { id: "serramenti", name: "Serramenti / Fabbro", icon: "fa-key", color: "#0ea5e9", desc: "Serrature bloccate, vetri rotti, tapparelle." },
  { id: "servizi", name: "Servizi / Altro", icon: "fa-screwdriver-wrench", color: "#ef4444", desc: "Giardinaggio, pulizie e traslochi." }
];

export const SUB_CATEGORIES = [
  // IDRAULICO
  { id: "idr_guasti", parent: "idraulico", name: "Riparazioni e Guasti", icon: "fa-faucet-drip", color: "#3b82f6" },
  { id: "idr_caldaia", parent: "idraulico", name: "Caldaia e Clima", icon: "fa-fire", color: "#2563eb" },
  
  // ELETTRICISTA
  { id: "ele_emergenza", parent: "elettricista", name: "Emergenza / Guasti", icon: "fa-triangle-exclamation", color: "#f59e0b" },
  { id: "ele_installazioni", parent: "elettricista", name: "Nuove Installazioni", icon: "fa-plug", color: "#fbbf24" },

  // MURATORE / PITTORE
  { id: "mur_ripristino", parent: "muratore_pittore", name: "Ripristino e Muffa", icon: "fa-droplet-slash", color: "#8b5cf6" },
  { id: "mur_opere", parent: "muratore_pittore", name: "Opere Murarie", icon: "fa-wall", color: "#a78bfa" },

  // SERRAMENTI / FABBRO
  { id: "ser_emergenza", parent: "serramenti", name: "Emergenza Apertura", icon: "fa-unlock", color: "#0ea5e9" },
  { id: "ser_riparazioni", parent: "serramenti", name: "Riparazione Infissi", icon: "fa-window-restore", color: "#38bdf8" }
];

export const TRADES_DATABASE = [
  // IDRAULICO -> Guasti
  { 
    id: "idr_perdita_acqua", parent: "idr_guasti", name: "Perdita d'Acqua", icon: "fa-droplet", 
    basePrice: 160, unit: "intervento", 
    description: "Ricerca e riparazione perdita d'acqua domestica.",
    specificQuestion: "Dove si trova la perdita?",
    options: [
      { label: "A vista (sotto lavandino)", multiplier: 1.0, icon: "fa-eye" },
      { label: "Sotto traccia (muro/pavimento)", multiplier: 1.6, icon: "fa-wall" },
      { label: "Interrata (giardino/esterno)", multiplier: 2.2, icon: "fa-arrow-down" }
    ]
  },
  { 
    id: "idr_scarico_otturato", parent: "idr_guasti", name: "Scarico Otturato", icon: "fa-faucet-drip", 
    basePrice: 120, unit: "intervento", 
    description: "Disostruzione scarichi lavandini, WC o docce.",
    specificQuestion: "Quale scarico è bloccato?",
    options: [
      { label: "Lavandino / Bidet", multiplier: 1.0, icon: "fa-sink" },
      { label: "WC / Colonna principale", multiplier: 1.5, icon: "fa-toilet" },
      { label: "Intero impianto (allagamento)", multiplier: 2.5, icon: "fa-water" }
    ]
  },

  // IDRAULICO -> Caldaia
  { 
    id: "idr_caldaia_blocco", parent: "idr_caldaia", name: "Caldaia in Blocco", icon: "fa-fire-burner", 
    basePrice: 150, unit: "intervento", 
    description: "Diagnosi e ripristino caldaia ferma.",
    specificQuestion: "Qual è l'età della caldaia?",
    options: [
      { label: "Nuova (< 5 anni)", multiplier: 1.0, icon: "fa-star" },
      { label: "Datata (5-12 anni)", multiplier: 1.3, icon: "fa-clock" },
      { label: "Vecchia (> 12 anni)", multiplier: 1.8, icon: "fa-calendar-xmark" }
    ]
  },

  // ELETTRICISTA -> Emergenza
  { 
    id: "ele_corto_circuito", parent: "ele_emergenza", name: "Corto Circuito / Blackout", icon: "fa-bolt-lightning", 
    basePrice: 180, unit: "intervento", 
    description: "Ricerca guasto e ripristino corrente elettrica.",
    specificQuestion: "Quando scatta il salvavita?",
    options: [
      { label: "Subito (appena riarmato)", multiplier: 1.0, icon: "fa-bolt" },
      { label: "Casualmente (guasto intermittente)", multiplier: 1.5, icon: "fa-shuffle" },
      { label: "Sotto carico (quando accendo elettr.)", multiplier: 1.3, icon: "fa-plug" }
    ]
  },
  { 
    id: "ele_salvavita_rotto", parent: "ele_emergenza", name: "Sostituzione Salvavita / Quadro", icon: "fa-square-check", 
    basePrice: 140, unit: "intervento", 
    description: "Sostituzione interruttore differenziale o magnetotermico.",
    specificQuestion: "Tipo di componente?",
    options: [
      { label: "Singolo interruttore", multiplier: 1.0, icon: "fa-toggle-on" },
      { label: "Intero quadro elettrico", multiplier: 3.5, icon: "fa-box" }
    ]
  },

  // MURATORE / PITTORE -> Ripristino
  { 
    id: "mur_muffa_parete", parent: "mur_ripristino", name: "Trattamento Muffa", icon: "fa-droplet-slash", 
    basePrice: 25, unit: "mq", 
    description: "Trattamento professionale antimuffa e risanamento.",
    specificQuestion: "Gravità dell'infestazione?",
    options: [
      { label: "Macchie isolate", multiplier: 1.0, icon: "fa-circle" },
      { label: "Intera parete nera", multiplier: 1.8, icon: "fa-square" },
      { label: "Con distacco intonaco", multiplier: 2.5, icon: "fa-hammer" }
    ]
  },

  // SERRAMENTI / FABBRO -> Emergenza
  { 
    id: "ser_porta_bloccata", parent: "ser_emergenza", name: "Apertura Porta / Serratura", icon: "fa-key", 
    basePrice: 150, unit: "intervento", 
    description: "Apertura porta bloccata o chiave spezzata.",
    specificQuestion: "Tipo di serratura?",
    options: [
      { label: "Standard / Cilindro europeo", multiplier: 1.0, icon: "fa-lock-open" },
      { label: "Blindata / Doppia mappa", multiplier: 1.6, icon: "fa-shield" },
      { label: "Elettronica / Smart", multiplier: 2.0, icon: "fa-microchip" }
    ]
  }
];

export function getAllCategories() { return MACRO_CATEGORIES; }
export function getSubCategories(parentId) { return SUB_CATEGORIES.filter(s => s.parent === parentId); }
export function getTradesByCategory(parentId) { return TRADES_DATABASE.filter(t => t.parent === parentId); }
export function getTradeById(id) { return TRADES_DATABASE.find(t => t.id === id); }
export function getAllTrades() { return TRADES_DATABASE; }

export default {
  REGIONAL_COEFFICIENTS,
  MACRO_CATEGORIES,
  SUB_CATEGORIES,
  TRADES_DATABASE,
  getAllCategories,
  getSubCategories,
  getTradesByCategory,
  getTradeById,
  getAllTrades
};
