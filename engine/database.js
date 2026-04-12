/**
 * Preventivi-Smart Pro v19.0 — Database categorie e scenari
 *
 * Metodologia prezzi:
 * - allineamento ai prezzari regionali 2025 (es. Regione Lombardia LOM252)
 * - calibrazione con indici ISTAT 2025 sui prezzi delle costruzioni
 * - consolidamento dei valori medi già presenti in research_data.md,
 *   real_market_data_2025.md e database-v6-backup.js
 */

// ===== COEFFICIENTI REGIONALI =====
export const REGIONAL_COEFFICIENTS = {
  "Lombardia": 1.25,
  "Trentino-Alto Adige": 1.22,
  "Valle d'Aosta": 1.18,
  "Lazio": 1.15,
  "Veneto": 1.12,
  "Emilia-Romagna": 1.10,
  "Piemonte": 1.08,
  "Liguria": 1.08,
  "Toscana": 1.05,
  "Friuli-Venezia Giulia": 1.02,
  "Marche": 0.98,
  "Umbria": 0.95,
  "Abruzzo": 0.92,
  "Campania": 0.90,
  "Sardegna": 0.88,
  "Puglia": 0.85,
  "Sicilia": 0.82,
  "Basilicata": 0.80,
  "Calabria": 0.78,
  "Molise": 0.75
};

// ===== MACRO CATEGORIE =====
export const MACRO_CATEGORIES = [
  { id: "idraulico", name: "Idraulico", icon: "fa-faucet", color: "#3b82f6", desc: "Impianti idrici, scarichi, caldaie e punti acqua." },
  { id: "elettricista", name: "Elettricista", icon: "fa-bolt", color: "#f59e0b", desc: "Punti luce, quadri, linee elettriche e verifiche." },
  { id: "muratore", name: "Muratore", icon: "fa-trowel-bricks", color: "#8b5cf6", desc: "Intonaci, pareti, ripristini murari e risanamenti." },
  { id: "pittore", name: "Pittore", icon: "fa-paint-roller", color: "#10b981", desc: "Tinteggiature, rasature e trattamenti murali." },
  { id: "piastrellista", name: "Piastrellista", icon: "fa-border-all", color: "#14b8a6", desc: "Posa pavimenti e rivestimenti con stime al mq." },
  { id: "cartongesso", name: "Cartongesso", icon: "fa-vector-square", color: "#6366f1", desc: "Pareti, contropareti e controsoffitti in cartongesso." },
  { id: "serramenti", name: "Serramenti", icon: "fa-window-maximize", color: "#0ea5e9", desc: "Finestre, portefinestre e sostituzioni infissi." },
  { id: "climatizzazione", name: "Climatizzazione", icon: "fa-fan", color: "#06b6d4", desc: "Split, dual split, manutenzioni e ricariche gas." },
  { id: "servizi", name: "Servizi / Altro", icon: "fa-screwdriver-wrench", color: "#ef4444", desc: "Giardinaggio, pulizie, traslochi e piccola manutenzione." }
];

// ===== SOTTO-CATEGORIE =====
export const SUB_CATEGORIES = [
  { id: "giardinaggio", parent: "servizi", name: "Giardinaggio", icon: "fa-leaf", color: "#22c55e" },
  { id: "pulizie", parent: "servizi", name: "Pulizie", icon: "fa-broom", color: "#38bdf8" },
  { id: "traslochi", parent: "servizi", name: "Traslochi / Sgomberi", icon: "fa-truck-ramp-box", color: "#f43f5e" },
  { id: "manutenzione", parent: "servizi", name: "Piccola Manutenzione", icon: "fa-toolbox", color: "#64748b" }
];

// ===== DATABASE SCENARI =====
export const TRADES_DATABASE = [
  // IDRAULICO
  { id: "idraulica_perdita", parent: "idraulico", name: "Riparazione Perdita", icon: "fa-faucet-drip", basePrice: 160, unit: "intervento", description: "Ricerca perdita semplice e ripristino tubo o raccordo" },
  { id: "idraulica_scarico", parent: "idraulico", name: "Disotturazione Scarico", icon: "fa-toilet-portable", basePrice: 140, unit: "intervento", description: "Lavandino, doccia o WC ostruito con intervento standard" },
  { id: "idraulica_punto_acqua", parent: "idraulico", name: "Nuovo Punto Acqua", icon: "fa-faucet", basePrice: 180, unit: "punto", description: "Realizzazione o spostamento punto acqua/scarico" },
  { id: "idraulica_caldaia", parent: "idraulico", name: "Caldaia / Termosifoni", icon: "fa-fire-burner", basePrice: 650, unit: "intervento", description: "Installazione o sostituzione componenti principali lato manodopera" },

  // ELETTRICISTA
  { id: "elettrico_punto_luce", parent: "elettricista", name: "Punto Luce / Presa", icon: "fa-lightbulb", basePrice: 65, unit: "punto", description: "Nuovo punto luce o presa con lavorazione standard" },
  { id: "elettrico_quadro", parent: "elettricista", name: "Intervento su Quadro", icon: "fa-box-archive", basePrice: 450, unit: "intervento", description: "Adeguamento o sostituzione componenti del quadro elettrico" },
  { id: "elettrico_certificazione", parent: "elettricista", name: "Verifica / Certificazione", icon: "fa-file-circle-check", basePrice: 220, unit: "intervento", description: "Controllo impianto con rilascio documentazione ove prevista" },

  // MURATORE
  { id: "muratura_intonaco", parent: "muratore", name: "Ripristino Intonaco", icon: "fa-trowel", basePrice: 30, unit: "mq", description: "Ripristino intonaco interno su superfici ammalorate" },
  { id: "muratura_tramezzo", parent: "muratore", name: "Nuovo Tramezzo", icon: "fa-person-shelter", basePrice: 50, unit: "mq", description: "Parete divisoria tradizionale comprensiva di lavorazione base" },
  { id: "muratura_risanamento", parent: "muratore", name: "Risanamento Umidità", icon: "fa-droplet-slash", basePrice: 60, unit: "mq", description: "Intervento di bonifica, trattamento e ripristino murario" },

  // PITTORE
  { id: "finiture_imbiancatura", parent: "pittore", name: "Imbiancatura Interna", icon: "fa-paint-roller", basePrice: 12, unit: "mq", description: "Tinteggiatura standard pareti e soffitti" },
  { id: "finiture_rasatura", parent: "pittore", name: "Rasatura Pareti", icon: "fa-fill-drip", basePrice: 8, unit: "mq", description: "Preparazione superfici con rasatura e correzione piccole imperfezioni" },
  { id: "finiture_antimuffa", parent: "pittore", name: "Trattamento Antimuffa", icon: "fa-shield-virus", basePrice: 18, unit: "mq", description: "Ciclo antimuffa e ritinteggiatura tecnica" },

  // PIASTRELLISTA
  { id: "piastrelle_gres", parent: "piastrellista", name: "Posa Gres Standard", icon: "fa-table-cells-large", basePrice: 35, unit: "mq", description: "Posa pavimento o rivestimento in gres formato standard" },
  { id: "piastrelle_grandi_lastre", parent: "piastrellista", name: "Posa Grandi Lastre", icon: "fa-table-cells", basePrice: 52, unit: "mq", description: "Posa di formati grandi con maggiore complessità esecutiva" },
  { id: "piastrelle_bagno", parent: "piastrellista", name: "Rivestimento Bagno", icon: "fa-bath", basePrice: 40, unit: "mq", description: "Rivestimento pareti bagno con tagli e finiture" },

  // CARTONGESSO
  { id: "cartongesso_parete", parent: "cartongesso", name: "Parete Divisoria", icon: "fa-grip-lines-vertical", basePrice: 40, unit: "mq", description: "Parete in cartongesso con struttura standard" },
  { id: "cartongesso_controsoffitto", parent: "cartongesso", name: "Controsoffitto", icon: "fa-minus", basePrice: 34, unit: "mq", description: "Controsoffitto lineare in lastre di cartongesso" },
  { id: "cartongesso_controparete", parent: "cartongesso", name: "Controparete Isolata", icon: "fa-layer-group", basePrice: 45, unit: "mq", description: "Controparete con isolamento e struttura rinforzata" },

  // SERRAMENTI
  { id: "serramenti_pvc", parent: "serramenti", name: "Infisso PVC Standard", icon: "fa-window-restore", basePrice: 450, unit: "mq", description: "Fornitura e posa infisso PVC fascia media" },
  { id: "serramenti_alluminio", parent: "serramenti", name: "Infisso Alluminio Taglio Termico", icon: "fa-vector-square", basePrice: 580, unit: "mq", description: "Serramento in alluminio con migliori prestazioni termiche" },
  { id: "serramenti_portafinestra", parent: "serramenti", name: "Portafinestra Scorrevole", icon: "fa-door-open", basePrice: 650, unit: "mq", description: "Portafinestra o alzante scorrevole fascia media" },

  // CLIMATIZZAZIONE
  { id: "clima_mono", parent: "climatizzazione", name: "Climatizzatore Mono Split", icon: "fa-snowflake", basePrice: 450, unit: "unità", description: "Installazione mono split standard" },
  { id: "clima_dual", parent: "climatizzazione", name: "Climatizzatore Dual Split", icon: "fa-fan", basePrice: 810, unit: "unità", description: "Installazione dual split con due unità interne" },
  { id: "clima_manutenzione", parent: "climatizzazione", name: "Manutenzione / Ricarica", icon: "fa-gauge-high", basePrice: 120, unit: "intervento", description: "Pulizia, controllo gas e manutenzione ordinaria" },

  // SERVIZI -> GIARDINAGGIO
  { id: "giard_prato", parent: "giardinaggio", name: "Realizzazione Prato", icon: "fa-seedling", basePrice: 15, unit: "mq", description: "Preparazione fondo, prato e finitura base" },
  { id: "giard_potatura", parent: "giardinaggio", name: "Potatura Siepi", icon: "fa-tree", basePrice: 12, unit: "ml", description: "Potatura e sagomatura siepi lineari" },
  { id: "giard_alberi", parent: "giardinaggio", name: "Abbattimento Alberi", icon: "fa-tree-city", basePrice: 400, unit: "intervento", description: "Taglio alberi alto fusto con smaltimento standard" },
  { id: "giard_irrigazione", parent: "giardinaggio", name: "Impianto Irrigazione", icon: "fa-droplet", basePrice: 20, unit: "mq", description: "Predisposizione irrigazione base per superfici verdi" },

  // SERVIZI -> PULIZIE
  { id: "pulizie_cantiere", parent: "pulizie", name: "Pulizie Post Cantiere", icon: "fa-broom", basePrice: 8, unit: "mq", description: "Rimozione polveri e residui di fine lavori" },
  { id: "pulizie_vetrate", parent: "pulizie", name: "Lavaggio Vetrate", icon: "fa-window-maximize", basePrice: 18, unit: "mq", description: "Pulizia vetrate e superfici vetrate estese" },
  { id: "pulizie_ufficio", parent: "pulizie", name: "Pulizia Uffici", icon: "fa-building", basePrice: 25, unit: "ora", description: "Servizio ordinario in ambienti professionali" },
  { id: "pulizie_divani", parent: "pulizie", name: "Lavaggio Divani / Tappeti", icon: "fa-couch", basePrice: 80, unit: "intervento", description: "Igienizzazione a vapore di tessili d'arredo" },

  // SERVIZI -> TRASLOCHI
  { id: "trasloco_appartamento", parent: "traslochi", name: "Trasloco Casa", icon: "fa-truck-moving", basePrice: 650, unit: "intervento", description: "Trasloco appartamento medio con carico e scarico base" },
  { id: "trasloco_sgombero", parent: "traslochi", name: "Sgombero Cantina", icon: "fa-box-open", basePrice: 280, unit: "intervento", description: "Svuotamento locali e conferimento standard" },
  { id: "trasloco_speciale", parent: "traslochi", name: "Trasporto Speciale", icon: "fa-music", basePrice: 380, unit: "intervento", description: "Oggetti voluminosi o delicati, come pianoforti o opere d'arte" },

  // SERVIZI -> MANUTENZIONE
  { id: "manut_montaggio", parent: "manutenzione", name: "Montaggio Mobili", icon: "fa-hammer", basePrice: 45, unit: "ora", description: "Assemblaggio mobili e arredi con tariffa oraria" },
  { id: "manut_tapparelle", parent: "manutenzione", name: "Riparazione Tapparelle", icon: "fa-bars-staggered", basePrice: 95, unit: "intervento", description: "Sostituzione cinghia, rullo o sblocco meccanismo" },
  { id: "manut_fabbro", parent: "manutenzione", name: "Cambio Serratura", icon: "fa-key", basePrice: 180, unit: "intervento", description: "Sostituzione cilindro europeo e regolazione base" }
];

export function getAllCategories() {
  return MACRO_CATEGORIES;
}

export function getSubCategories(parentId) {
  return SUB_CATEGORIES.filter(s => s.parent === parentId);
}

export function getTradesByCategory(parentId) {
  return TRADES_DATABASE.filter(t => t.parent === parentId);
}

export function getTradeById(id) {
  return TRADES_DATABASE.find(t => t.id === id);
}

export function getAllTrades() {
  return TRADES_DATABASE;
}

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
