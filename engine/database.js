/**
 * Preventivi-Smart Pro v20.0 — Database Istituzionale e Dinamico
 *
 * Metodologia:
 * - Prezzi ancorati ai Prezzari Regionali 2025 (LOM252, Lazio 2023/24, Campania 2024/25)
 * - Coefficienti regionali ricalibrati su indici ISTAT Costo Costruzione 2025
 * - Domande specifiche per scenario per eliminare stime generiche
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
  { id: "idraulico", name: "Idraulico", icon: "fa-faucet", color: "#3b82f6", desc: "Impianti idrici, scarichi e caldaie." },
  { id: "elettricista", name: "Elettricista", icon: "fa-bolt", color: "#f59e0b", desc: "Punti luce, quadri e certificazioni." },
  { id: "muratore", name: "Muratore", icon: "fa-trowel-bricks", color: "#8b5cf6", desc: "Opere murarie, intonaci e risanamenti." },
  { id: "pittore", name: "Pittore", icon: "fa-paint-roller", color: "#10b981", desc: "Tinteggiature e rasature professionali." },
  { id: "piastrellista", name: "Piastrellista", icon: "fa-border-all", color: "#14b8a6", desc: "Posa pavimenti e rivestimenti." },
  { id: "cartongesso", name: "Cartongesso", icon: "fa-vector-square", color: "#6366f1", desc: "Pareti e controsoffitti a secco." },
  { id: "serramenti", name: "Serramenti", icon: "fa-window-maximize", color: "#0ea5e9", desc: "Infissi in PVC, Alluminio e Legno." },
  { id: "climatizzazione", name: "Climatizzazione", icon: "fa-fan", color: "#06b6d4", desc: "Installazione e manutenzione split." },
  { id: "servizi", name: "Servizi / Altro", icon: "fa-screwdriver-wrench", color: "#ef4444", desc: "Giardinaggio, pulizie e traslochi." }
];

export const SUB_CATEGORIES = [
  { id: "giardinaggio", parent: "servizi", name: "Giardinaggio", icon: "fa-leaf", color: "#22c55e" },
  { id: "pulizie", parent: "servizi", name: "Pulizie", icon: "fa-broom", color: "#38bdf8" },
  { id: "traslochi", parent: "servizi", name: "Traslochi / Sgomberi", icon: "fa-truck-ramp-box", color: "#f43f5e" },
  { id: "manutenzione", parent: "servizi", name: "Piccola Manutenzione", icon: "fa-toolbox", color: "#64748b" }
];

export const TRADES_DATABASE = [
  // IDRAULICO
  { 
    id: "idraulica_perdita", parent: "idraulico", name: "Riparazione Perdita", icon: "fa-faucet-drip", 
    basePrice: 160, unit: "intervento", 
    description: "Ricerca e ripristino perdita d'acqua.",
    specificQuestion: "Qual è l'accessibilità del tubo?",
    options: [
      { label: "A vista / Esterno", multiplier: 1.0, icon: "fa-eye" },
      { label: "Sotto traccia (muro)", multiplier: 1.4, icon: "fa-wall" },
      { label: "Interrato / Pavimento", multiplier: 1.8, icon: "fa-arrow-down" }
    ]
  },
  { 
    id: "idraulica_punto_acqua", parent: "idraulico", name: "Nuovo Punto Acqua", icon: "fa-faucet", 
    basePrice: 180, unit: "punto", 
    description: "Realizzazione nuovo carico/scarico.",
    specificQuestion: "Distanza dallo scarico principale?",
    options: [
      { label: "Entro 2 metri", multiplier: 1.0, icon: "fa-ruler-horizontal" },
      { label: "Oltre 2 metri", multiplier: 1.3, icon: "fa-arrows-left-right" },
      { label: "Piano diverso", multiplier: 1.6, icon: "fa-stairs" }
    ]
  },

  // ELETTRICISTA
  { 
    id: "elettrico_punto_luce", parent: "elettricista", name: "Punto Luce / Presa", icon: "fa-lightbulb", 
    basePrice: 65, unit: "punto", 
    description: "Installazione nuovo punto elettrico.",
    specificQuestion: "Tipo di installazione?",
    options: [
      { label: "Esterna (canalina)", multiplier: 1.0, icon: "fa-grip-lines" },
      { label: "Sotto traccia (muro)", multiplier: 1.3, icon: "fa-hammer" },
      { label: "Cartongesso", multiplier: 1.1, icon: "fa-layer-group" }
    ]
  },

  // PITTORE
  { 
    id: "finiture_imbiancatura", parent: "pittore", name: "Imbiancatura Interna", icon: "fa-paint-roller", 
    basePrice: 12, unit: "mq", 
    description: "Tinteggiatura professionale pareti.",
    specificQuestion: "Stato attuale delle pareti?",
    options: [
      { label: "Ottimo (solo colore)", multiplier: 1.0, icon: "fa-check-double" },
      { label: "Crepe / Fori da stuccare", multiplier: 1.3, icon: "fa-band-aid" },
      { label: "Muffa / Umidità", multiplier: 1.6, icon: "fa-droplet-slash" }
    ]
  },

  // PIASTRELLISTA
  { 
    id: "piastrelle_gres", parent: "piastrellista", name: "Posa Gres Porcellanato", icon: "fa-table-cells-large", 
    basePrice: 35, unit: "mq", 
    description: "Posa pavimenti o rivestimenti.",
    specificQuestion: "Formato delle piastrelle?",
    options: [
      { label: "Standard (30x30 / 60x60)", multiplier: 1.0, icon: "fa-square" },
      { label: "Mosaico / Piccoli formati", multiplier: 1.5, icon: "fa-border-none" },
      { label: "Grandi lastre (> 100cm)", multiplier: 1.8, icon: "fa-maximize" }
    ]
  },

  // CARTONGESSO
  { 
    id: "cartongesso_parete", parent: "cartongesso", name: "Parete Divisoria", icon: "fa-grip-lines-vertical", 
    basePrice: 40, unit: "mq", 
    description: "Realizzazione parete a secco.",
    specificQuestion: "Isolamento termo-acustico?",
    options: [
      { label: "Nessuno", multiplier: 1.0, icon: "fa-xmark" },
      { label: "Lana di roccia / Vetro", multiplier: 1.3, icon: "fa-shield-halved" },
      { label: "Doppia lastra rinforzata", multiplier: 1.5, icon: "fa-layer-group" }
    ]
  },

  // SERRAMENTI
  { 
    id: "serramenti_pvc", parent: "serramenti", name: "Infisso PVC", icon: "fa-window-restore", 
    basePrice: 450, unit: "mq", 
    description: "Fornitura e posa infisso PVC.",
    specificQuestion: "Tipologia di vetro?",
    options: [
      { label: "Doppio vetro standard", multiplier: 1.0, icon: "fa-window-maximize" },
      { label: "Triplo vetro termico", multiplier: 1.2, icon: "fa-temperature-low" },
      { label: "Antisfondamento / Acustico", multiplier: 1.4, icon: "fa-shield-virus" }
    ]
  },

  // CLIMATIZZAZIONE
  { 
    id: "clima_mono", parent: "climatizzazione", name: "Climatizzatore Mono Split", icon: "fa-snowflake", 
    basePrice: 450, unit: "unità", 
    description: "Installazione climatizzatore.",
    specificQuestion: "Lunghezza linea frigorifera?",
    options: [
      { label: "Entro 3 metri", multiplier: 1.0, icon: "fa-ruler" },
      { label: "Da 3 a 7 metri", multiplier: 1.3, icon: "fa-arrows-left-right" },
      { label: "Oltre 7 metri", multiplier: 1.6, icon: "fa-route" }
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
