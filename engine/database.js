/**
 * Preventivi-Smart Pro v23.0 — Database Professionale Aggiornato
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
  { id: "muratore", name: "Muratore", icon: "fa-trowel-bricks", color: "#8b5cf6", desc: "Opere murarie, cemento, mattoni e ristrutturazioni." },
  { id: "pittore", name: "Pittore / Imbianchino", icon: "fa-paint-roller", color: "#ec4899", desc: "Tinteggiatura, verniciatura e decorazione pareti." },
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

  // MURATORE
  { id: "mur_opere", parent: "muratore", name: "Opere Murarie", icon: "fa-wall", color: "#8b5cf6" },
  { id: "mur_ripristino", parent: "muratore", name: "Ripristino Strutturale", icon: "fa-hammer", color: "#a78bfa" },

  // PITTORE
  { id: "pit_tinteggio", parent: "pittore", name: "Tinteggiatura", icon: "fa-brush", color: "#ec4899" },
  { id: "pit_decorazioni", parent: "pittore", name: "Decorazioni", icon: "fa-wand-magic-sparkles", color: "#f472b6" },

  // SERRAMENTI / FABBRO
  { id: "ser_emergenza", parent: "serramenti", name: "Emergenza Apertura", icon: "fa-unlock", color: "#0ea5e9" },
  { id: "ser_riparazioni", parent: "serramenti", name: "Riparazione Infissi", icon: "fa-window-restore", color: "#38bdf8" },

  // SERVIZI
  { id: "srv_giardino", parent: "servizi", name: "Giardinaggio", icon: "fa-leaf", color: "#10b981" },
  { id: "srv_pulizie", parent: "servizi", name: "Pulizie Professionali", icon: "fa-broom", color: "#34d399" }
];

export const TRADES_DATABASE = [
  // IDRAULICO
  { 
    id: "idr_perdita_acqua", parent: "idr_guasti", name: "Perdita d'Acqua", icon: "fa-droplet", 
    basePrice: 160, unit: "intervento", 
    description: "Ricerca e riparazione perdita d'acqua domestica.",
    questions: [
      { label: "Dove si trova la perdita?", options: [
        { text: "A vista (sotto lavandino)", multiplier: 1.0 },
        { text: "Sotto traccia (muro/pavimento)", multiplier: 1.6 },
        { text: "Interrata (giardino/esterno)", multiplier: 2.2 }
      ]}
    ]
  },
  // ELETTRICISTA
  { 
    id: "ele_corto_circuito", parent: "ele_emergenza", name: "Corto Circuito / Blackout", icon: "fa-bolt-lightning", 
    basePrice: 180, unit: "intervento", 
    description: "Ricerca guasto e ripristino corrente elettrica.",
    questions: [
      { label: "Quando scatta il salvavita?", options: [
        { text: "Subito (appena riarmato)", multiplier: 1.0 },
        { text: "Casualmente (guasto intermittente)", multiplier: 1.5 },
        { text: "Sotto carico", multiplier: 1.3 }
      ]}
    ]
  },
  // MURATORE
  { 
    id: "mur_muro_mattoni", parent: "mur_opere", name: "Costruzione Muro", icon: "fa-wall", 
    basePrice: 45, unit: "mq", 
    description: "Realizzazione parete in mattoni o forati.",
    questions: [
      { label: "Tipo di materiale?", options: [
        { text: "Forati standard", multiplier: 1.0 },
        { text: "Mattoni pieni", multiplier: 1.4 },
        { text: "Cartongesso", multiplier: 0.8 }
      ]}
    ]
  },
  // PITTORE
  { 
    id: "pit_bianco", parent: "pit_tinteggio", name: "Tinteggiatura Bianca", icon: "fa-fill-drip", 
    basePrice: 12, unit: "mq", 
    description: "Tinteggiatura pareti e soffitti colore bianco.",
    questions: [
      { label: "Stato delle pareti?", options: [
        { text: "Buono stato", multiplier: 1.0 },
        { text: "Da rasare / Crepe", multiplier: 1.5 },
        { text: "Presenza muffa", multiplier: 1.3 }
      ]}
    ]
  },
  // SERVIZI -> Giardinaggio
  { 
    id: "srv_taglio_erba", parent: "srv_giardino", name: "Taglio Erba", icon: "fa-scissors", 
    basePrice: 0.8, unit: "mq", 
    description: "Manutenzione prato e taglio erba.",
    questions: [
      { label: "Altezza erba?", options: [
        { text: "Manutenzione regolare", multiplier: 1.0 },
        { text: "Erba alta / Incolta", multiplier: 1.8 }
      ]}
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
