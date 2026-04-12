/**
 * Preventivi-Smart Pro v16.0 — Hierarchical Database
 * Struttura a imbuto: Macro-categorie -> Sottocategorie -> Scenari
 */

// ===== COEFFICIENTI REGIONALI =====
export const REGIONAL_COEFFICIENTS = {
  "Lombardia": 1.25, "Piemonte": 1.08, "Veneto": 1.12, "Emilia-Romagna": 1.10,
  "Lazio": 1.15, "Toscana": 1.05, "Campania": 0.95, "Sicilia": 0.85, "Puglia": 0.88,
  "Sardegna": 0.92, "Liguria": 1.05, "Marche": 1.00, "Umbria": 0.97, "Abruzzo": 0.95,
  "Trentino-Alto Adige": 1.15, "Friuli-Venezia Giulia": 1.03, "Calabria": 0.80,
  "Basilicata": 0.82, "Molise": 0.78, "Valle d'Aosta": 1.10
};

// ===== MACRO CATEGORIE =====
export const MACRO_CATEGORIES = [
  { id: "idraulico", name: "Idraulico", icon: "fa-faucet", color: "#3b82f6", desc: "Perdite, caldaie, scarichi e impianti idrici." },
  { id: "elettricista", name: "Elettricista", icon: "fa-bolt", color: "#f59e0b", desc: "Cortocircuiti, prese, luci e impianti elettrici." },
  { id: "muratore", name: "Muratore", icon: "fa-trowel-bricks", color: "#8b5cf6", desc: "Mura, intonaci, umidità e opere strutturali." },
  { id: "pittore", name: "Pittore / Finiture", icon: "fa-paint-roller", color: "#10b981", desc: "Imbiancatura, parquet e rifiniture estetiche." },
  { id: "servizi", name: "Servizi / Altro", icon: "fa-broom", color: "#ef4444", desc: "Pulizie post-cantiere, giardinaggio e traslochi." }
];

// ===== DATABASE SCENARI (Sottocategorie) =====
export const TRADES_DATABASE = [
  // IDRAULICO
  { id: "idraulica_perdita", parent: "idraulico", name: "Tubo che Perde", icon: "fa-faucet-drip", basePrice: 150, unit: "intervento", description: "Perdita d'acqua da tubo o raccordo", questions: [] },
  { id: "idraulica_scarico", parent: "idraulico", name: "Scarico Intasato", icon: "fa-toilet-portable", basePrice: 120, unit: "intervento", description: "Lavandino, doccia o WC intasato", questions: [] },
  { id: "idraulica_caldaia", parent: "idraulico", name: "Caldaia / Termosifoni", icon: "fa-fire-burner", basePrice: 250, unit: "intervento", description: "Malfunzionamento riscaldamento", questions: [] },
  
  // ELETTRICISTA
  { id: "elettrico_corto", parent: "elettricista", name: "Corto Circuito", icon: "fa-bolt-lightning", basePrice: 180, unit: "intervento", description: "Scintille o interruttore scattato", questions: [] },
  { id: "elettrico_presa", parent: "elettricista", name: "Presa / Interruttore", icon: "fa-plug-circle-bolt", basePrice: 80, unit: "intervento", description: "Sostituzione o riparazione frutti", questions: [] },
  { id: "elettrico_quadro", parent: "elettricista", name: "Quadro Elettrico", icon: "fa-box-archive", basePrice: 300, unit: "intervento", description: "Interventi su salvavita e magnetotermici", questions: [] },

  // MURATORE
  { id: "muratura_crepa", parent: "muratore", name: "Crepe / Intonaco", icon: "fa-trowel", basePrice: 150, unit: "mq", description: "Riparazione crepe e ripristino intonaco", questions: [] },
  { id: "muratura_umidita", parent: "muratore", name: "Umidità / Muffa", icon: "fa-droplet-slash", basePrice: 200, unit: "mq", description: "Trattamento antimuffa e risanamento", questions: [] },
  
  // PITTORE
  { id: "finiture_imbiancatura", parent: "pittore", name: "Imbiancatura", icon: "fa-paint-roller", basePrice: 12, unit: "mq", description: "Tinteggiatura pareti e soffitti", questions: [] },
  { id: "finiture_parquet", parent: "pittore", name: "Pavimenti / Parquet", icon: "fa-table-cells", basePrice: 45, unit: "mq", description: "Posa o lamatura pavimenti", questions: [] },

  // SERVIZI
  { id: "servizi_pulizie", parent: "servizi", name: "Pulizie Cantiere", icon: "fa-broom", basePrice: 150, unit: "intervento", description: "Pulizia profonda post-lavori", questions: [] }
];

export function getAllCategories() { return MACRO_CATEGORIES; }
export function getTradesByCategory(catId) { return TRADES_DATABASE.filter(t => t.parent === catId); }
export function getTradeById(id) { return TRADES_DATABASE.find(t => t.id === id); }
export function getAllTrades() { return TRADES_DATABASE; }

export default {
  REGIONAL_COEFFICIENTS,
  MACRO_CATEGORIES,
  TRADES_DATABASE,
  getAllCategories,
  getTradesByCategory,
  getTradeById,
  getAllTrades
};
