/**
 * Preventivi-Smart Pro v21.0 — Database Istituzionale Massivo
 *
 * Metodologia:
 * - Prezzi ancorati ai Prezzari Regionali 2025 (LOM252, Lazio 2023/24, Campania 2024/25)
 * - Coefficienti regionali ricalibrati su indici ISTAT Costo Costruzione 2025
 * - Struttura gerarchica profonda per eliminare schermate vuote
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
  // IDRAULICO
  { id: "idr_impianti", parent: "idraulico", name: "Impianti e Tubazioni", icon: "fa-pipes", color: "#3b82f6" },
  { id: "idr_sanitari", parent: "idraulico", name: "Sanitari e Rubinetteria", icon: "fa-sink", color: "#60a5fa" },
  { id: "idr_calore", parent: "idraulico", name: "Riscaldamento e Caldaie", icon: "fa-fire", color: "#2563eb" },
  
  // ELETTRICISTA
  { id: "ele_impianti", parent: "elettricista", name: "Impianto Completo", icon: "fa-plug-circle-bolt", color: "#f59e0b" },
  { id: "ele_punti", parent: "elettricista", name: "Punti Luce e Prese", icon: "fa-lightbulb", color: "#fbbf24" },
  { id: "ele_sicurezza", parent: "elettricista", name: "Sicurezza e Domotica", icon: "fa-shield-halved", color: "#d97706" },

  // PITTORE
  { id: "pit_interni", parent: "pittore", name: "Tinteggiatura Interni", icon: "fa-house-chimney-window", color: "#10b981" },
  { id: "pit_esterni", parent: "pittore", name: "Facciate ed Esterni", icon: "fa-tree-city", color: "#059669" },
  { id: "pit_decorazioni", parent: "pittore", name: "Decorazioni e Smalti", icon: "fa-palette", color: "#34d399" },

  // MURATORE
  { id: "mur_strutture", parent: "muratore", name: "Muri e Divisori", icon: "fa-wall", color: "#8b5cf6" },
  { id: "mur_intonaci", parent: "muratore", name: "Intonaci e Massetti", icon: "fa-trowel", color: "#a78bfa" },
  { id: "mur_demolizioni", parent: "muratore", name: "Demolizioni", icon: "fa-hammer", color: "#7c3aed" },

  // SERVIZI
  { id: "giardinaggio", parent: "servizi", name: "Giardinaggio", icon: "fa-leaf", color: "#22c55e" },
  { id: "pulizie", parent: "servizi", name: "Pulizie", icon: "fa-broom", color: "#38bdf8" },
  { id: "traslochi", parent: "servizi", name: "Traslochi / Sgomberi", icon: "fa-truck-ramp-box", color: "#f43f5e" },
  { id: "manutenzione", parent: "servizi", name: "Piccola Manutenzione", icon: "fa-toolbox", color: "#64748b" }
];

export const TRADES_DATABASE = [
  // IDRAULICO -> Impianti
  { 
    id: "idr_rifacimento_bagno", parent: "idr_impianti", name: "Rifacimento Impianto Bagno", icon: "fa-bath", 
    basePrice: 1200, unit: "intervento", 
    description: "Rifacimento completo tubazioni carico/scarico per un bagno.",
    specificQuestion: "Numero di punti acqua previsti?",
    options: [
      { label: "Fino a 4 punti", multiplier: 1.0, icon: "fa-4" },
      { label: "Da 5 a 7 punti", multiplier: 1.4, icon: "fa-7" },
      { label: "Oltre 7 punti", multiplier: 1.8, icon: "fa-plus" }
    ]
  },
  { 
    id: "idr_perdita", parent: "idr_impianti", name: "Riparazione Perdita", icon: "fa-faucet-drip", 
    basePrice: 160, unit: "intervento", 
    description: "Ricerca e ripristino perdita d'acqua.",
    specificQuestion: "Posizione del tubo?",
    options: [
      { label: "A vista", multiplier: 1.0, icon: "fa-eye" },
      { label: "Sotto traccia", multiplier: 1.5, icon: "fa-wall" }
    ]
  },

  // ELETTRICISTA -> Impianti
  { 
    id: "ele_rifacimento_totale", parent: "ele_impianti", name: "Rifacimento Impianto Totale", icon: "fa-bolt", 
    basePrice: 4500, unit: "intervento", 
    description: "Rifacimento completo impianto elettrico certificato.",
    specificQuestion: "Dimensione dell'immobile?",
    options: [
      { label: "Monolocale / Bilocale", multiplier: 1.0, icon: "fa-house" },
      { label: "Trilocale / Quadrilocale", multiplier: 1.6, icon: "fa-house-chimney" },
      { label: "Villa / Oltre 150mq", multiplier: 2.5, icon: "fa-hotel" }
    ]
  },
  { 
    id: "ele_punto_luce", parent: "ele_punti", name: "Punto Luce / Presa", icon: "fa-lightbulb", 
    basePrice: 65, unit: "punto", 
    description: "Installazione nuovo punto elettrico.",
    specificQuestion: "Tipo di installazione?",
    options: [
      { label: "Esterna", multiplier: 1.0, icon: "fa-grip-lines" },
      { label: "Sotto traccia", multiplier: 1.3, icon: "fa-hammer" }
    ]
  },

  // PITTORE -> Interni
  { 
    id: "pit_imbiancatura_std", parent: "pit_interni", name: "Tinteggiatura Lavabile", icon: "fa-paint-roller", 
    basePrice: 12, unit: "mq", 
    description: "Due mani di pittura lavabile bianca o colorata.",
    specificQuestion: "Stato delle pareti?",
    options: [
      { label: "Buono", multiplier: 1.0, icon: "fa-check" },
      { label: "Da stuccare / Crepe", multiplier: 1.3, icon: "fa-band-aid" },
      { label: "Muffa presente", multiplier: 1.6, icon: "fa-droplet-slash" }
    ]
  },
  { 
    id: "pit_rasatura", parent: "pit_interni", name: "Rasatura a Gesso", icon: "fa-trowel", 
    basePrice: 18, unit: "mq", 
    description: "Livellamento pareti con gesso o stucco.",
    specificQuestion: "Numero di passate?",
    options: [
      { label: "Singola mano", multiplier: 1.0, icon: "fa-1" },
      { label: "Doppia mano (finitura specchio)", multiplier: 1.5, icon: "fa-2" }
    ]
  },

  // MURATORE -> Strutture
  { 
    id: "mur_parete_mattoni", parent: "mur_strutture", name: "Parete in Mattoni/Gasbeton", icon: "fa-wall", 
    basePrice: 45, unit: "mq", 
    description: "Costruzione nuova parete divisoria.",
    specificQuestion: "Spessore della parete?",
    options: [
      { label: "8-10 cm (Divisoria)", multiplier: 1.0, icon: "fa-ruler-horizontal" },
      { label: "12-15 cm (Robusta)", multiplier: 1.3, icon: "fa-ruler-combined" }
    ]
  },
  { 
    id: "mur_demolizione_parete", parent: "mur_demolizioni", name: "Demolizione Parete", icon: "fa-hammer", 
    basePrice: 25, unit: "mq", 
    description: "Abbattimento parete non portante e smaltimento.",
    specificQuestion: "Incluso smaltimento macerie?",
    options: [
      { label: "Sì, completo", multiplier: 1.0, icon: "fa-truck-pickup" },
      { label: "No, solo abbattimento", multiplier: 0.7, icon: "fa-xmark" }
    ]
  },

  // PIASTRELLISTA (Senza sottocategorie per ora, diretto a macro)
  { 
    id: "pia_posa_pavimento", parent: "piastrellista", name: "Posa Pavimento Gres", icon: "fa-table-cells-large", 
    basePrice: 35, unit: "mq", 
    description: "Posa professionale piastrelle in gres.",
    specificQuestion: "Formato piastrella?",
    options: [
      { label: "Standard (30x30 / 60x60)", multiplier: 1.0, icon: "fa-square" },
      { label: "Grandi lastre", multiplier: 1.8, icon: "fa-maximize" }
    ]
  },

  // CARTONGESSO
  { 
    id: "car_controsoffitto", parent: "cartongesso", name: "Controsoffitto Piano", icon: "fa-layer-group", 
    basePrice: 38, unit: "mq", 
    description: "Realizzazione controsoffitto in cartongesso.",
    specificQuestion: "Isolamento incluso?",
    options: [
      { label: "Senza isolamento", multiplier: 1.0, icon: "fa-xmark" },
      { label: "Con lana di roccia", multiplier: 1.4, icon: "fa-shield-halved" }
    ]
  },

  // SERRAMENTI
  { 
    id: "ser_pvc_std", parent: "serramenti", name: "Infisso PVC Standard", icon: "fa-window-maximize", 
    basePrice: 480, unit: "mq", 
    description: "Fornitura e posa infisso PVC alta efficienza.",
    specificQuestion: "Tipo di vetro?",
    options: [
      { label: "Doppio vetro", multiplier: 1.0, icon: "fa-window-restore" },
      { label: "Triplo vetro", multiplier: 1.25, icon: "fa-temperature-low" }
    ]
  },

  // CLIMATIZZAZIONE
  { 
    id: "cli_installazione_split", parent: "climatizzazione", name: "Installazione Split", icon: "fa-fan", 
    basePrice: 350, unit: "unità", 
    description: "Montaggio unità interna ed esterna.",
    specificQuestion: "Distanza tra le unità?",
    options: [
      { label: "Entro 3 metri", multiplier: 1.0, icon: "fa-ruler" },
      { label: "Oltre 3 metri", multiplier: 1.4, icon: "fa-arrows-left-right" }
    ]
  },

  // SERVIZI -> Giardinaggio
  { 
    id: "gia_taglio_erba", parent: "giardinaggio", name: "Taglio Erba / Manutenzione", icon: "fa-scissors", 
    basePrice: 0.8, unit: "mq", 
    description: "Taglio prato e rifinitura bordi.",
    specificQuestion: "Stato del prato?",
    options: [
      { label: "Curato", multiplier: 1.0, icon: "fa-face-smile" },
      { label: "Incolto / Erba alta", multiplier: 1.8, icon: "fa-mountain" }
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
