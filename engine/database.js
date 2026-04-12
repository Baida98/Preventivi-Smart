/**
 * Preventivi-Smart Pro v18.0 — Expanded Hierarchical Database
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
  { id: "idraulico", name: "Idraulico", icon: "fa-faucet", color: "#3b82f6", desc: "Perdite, caldaie e impianti idrici." },
  { id: "elettricista", name: "Elettricista", icon: "fa-bolt", color: "#f59e0b", desc: "Cortocircuiti, prese e impianti elettrici." },
  { id: "muratore", name: "Muratore", icon: "fa-trowel-bricks", color: "#8b5cf6", desc: "Mura, intonaci e opere strutturali." },
  { id: "pittore", name: "Pittore / Finiture", icon: "fa-paint-roller", color: "#10b981", desc: "Imbiancatura e pavimenti." },
  { id: "servizi", name: "Servizi / Altro", icon: "fa-screwdriver-wrench", color: "#ef4444", desc: "Giardinaggio, Pulizie, Traslochi e altro." }
];

// ===== SOTTO-CATEGORIE (Nuovo Livello per i Servizi) =====
export const SUB_CATEGORIES = [
  // Sotto-categorie per Servizi
  { id: "giardinaggio", parent: "servizi", name: "Giardinaggio", icon: "fa-leaf", color: "#22c55e" },
  { id: "pulizie", parent: "servizi", name: "Pulizie", icon: "fa-broom", color: "#38bdf8" },
  { id: "traslochi", parent: "servizi", name: "Traslochi / Sgomberi", icon: "fa-truck-ramp-box", color: "#f43f5e" },
  { id: "manutenzione", parent: "servizi", name: "Piccola Manutenzione", icon: "fa-toolbox", color: "#64748b" }
];

// ===== DATABASE SCENARI (Livello Finale) =====
export const TRADES_DATABASE = [
  // IDRAULICO
  { id: "idraulica_perdita", parent: "idraulico", name: "Tubo che Perde", icon: "fa-faucet-drip", basePrice: 150, unit: "intervento", description: "Perdita d'acqua da tubo o raccordo" },
  { id: "idraulica_scarico", parent: "idraulico", name: "Scarico Intasato", icon: "fa-toilet-portable", basePrice: 120, unit: "intervento", description: "Lavandino, doccia o WC intasato" },
  { id: "idraulica_caldaia", parent: "idraulico", name: "Caldaia / Termosifoni", icon: "fa-fire-burner", basePrice: 250, unit: "intervento", description: "Malfunzionamento riscaldamento" },
  
  // ELETTRICISTA
  { id: "elettrico_corto", parent: "elettricista", name: "Corto Circuito", icon: "fa-bolt-lightning", basePrice: 180, unit: "intervento", description: "Scintille o interruttore scattato" },
  { id: "elettrico_presa", parent: "elettricista", name: "Presa / Interruttore", icon: "fa-plug-circle-bolt", basePrice: 80, unit: "intervento", description: "Sostituzione o riparazione frutti" },
  { id: "elettrico_quadro", parent: "elettricista", name: "Quadro Elettrico", icon: "fa-box-archive", basePrice: 300, unit: "intervento", description: "Interventi su salvavita e magnetotermici" },

  // MURATORE
  { id: "muratura_crepa", parent: "muratore", name: "Crepe / Intonaco", icon: "fa-trowel", basePrice: 150, unit: "mq", description: "Riparazione crepe e ripristino intonaco" },
  { id: "muratura_umidita", parent: "muratore", name: "Umidità / Muffa", icon: "fa-droplet-slash", basePrice: 200, unit: "mq", description: "Trattamento antimuffa e risanamento" },
  
  // PITTORE
  { id: "finiture_imbiancatura", parent: "pittore", name: "Imbiancatura", icon: "fa-paint-roller", basePrice: 12, unit: "mq", description: "Tinteggiatura pareti e soffitti" },
  { id: "finiture_parquet", parent: "pittore", name: "Pavimenti / Parquet", icon: "fa-table-cells", basePrice: 45, unit: "mq", description: "Posa o lamatura pavimenti" },

  // --- SERVIZI -> GIARDINAGGIO ---
  { id: "giard_prato", parent: "giardinaggio", name: "Taglio Prato", icon: "fa-scissors", basePrice: 0.8, unit: "mq", description: "Rasatura erba e rifinitura bordi" },
  { id: "giard_potatura", parent: "giardinaggio", name: "Potatura Siepi", icon: "fa-tree", basePrice: 15, unit: "ml", description: "Potatura e sagomatura siepi" },
  { id: "giard_alberi", parent: "giardinaggio", name: "Abbattimento Alberi", icon: "fa-trowel-bricks", basePrice: 400, unit: "intervento", description: "Taglio alberi alto fusto con smaltimento" },
  { id: "giard_irrigazione", parent: "giardinaggio", name: "Impianto Irrigazione", icon: "fa-droplet", basePrice: 25, unit: "mq", description: "Installazione sistema automatico" },

  // --- SERVIZI -> PULIZIE ---
  { id: "pulizie_cantiere", parent: "pulizie", name: "Pulizie Cantiere", icon: "fa-broom", basePrice: 8, unit: "mq", description: "Rimozione calce e polveri post-lavori" },
  { id: "pulizie_vetrate", parent: "pulizie", name: "Lavaggio Vetrate", icon: "fa-window-maximize", basePrice: 15, unit: "intervento", description: "Pulizia vetri grandi dimensioni o altezza" },
  { id: "pulizie_ufficio", parent: "pulizie", name: "Pulizia Uffici", icon: "fa-building", basePrice: 25, unit: "ora", description: "Pulizia periodica spazi business" },
  { id: "pulizie_divani", parent: "pulizie", name: "Lavaggio Divani/Tappeti", icon: "fa-couch", basePrice: 80, unit: "intervento", description: "Igienizzazione a vapore tessuti" },

  // --- SERVIZI -> TRASLOCHI ---
  { id: "trasloco_appartamento", parent: "traslochi", name: "Trasloco Casa", icon: "fa-truck-moving", basePrice: 600, unit: "intervento", description: "Trasporto mobili e scatole (base 50mq)" },
  { id: "trasloco_sgombero", parent: "traslochi", name: "Sgombero Cantina", icon: "fa-box-open", basePrice: 250, unit: "intervento", description: "Svuotamento locali e smaltimento in discarica" },
  { id: "trasloco_pianoforte", parent: "traslochi", name: "Trasporto Speciale", icon: "fa-music", basePrice: 350, unit: "intervento", description: "Pianoforti o oggetti d'arte fragili" },

  // --- SERVIZI -> MANUTENZIONE ---
  { id: "manut_montaggio", parent: "manutenzione", name: "Montaggio Mobili", icon: "fa-hammer", basePrice: 45, unit: "ora", description: "Assemblaggio armadi, cucine o letti" },
  { id: "manut_tapparelle", parent: "manutenzione", name: "Riparazione Tapparelle", icon: "fa-bars-staggered", basePrice: 90, unit: "intervento", description: "Cambio corda o rulli bloccati" },
  { id: "manut_fabbro", parent: "manutenzione", name: "Cambio Serratura", icon: "fa-key", basePrice: 180, unit: "intervento", description: "Sostituzione cilindro europeo o riparazione" }
];

export function getAllCategories() { return MACRO_CATEGORIES; }
export function getSubCategories(parentId) { return SUB_CATEGORIES.filter(s => s.parent === parentId); }
export function getTradesByCategory(parentId) { 
  // Cerca sia nelle macro che nelle sotto-categorie
  return TRADES_DATABASE.filter(t => t.parent === parentId); 
}
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
