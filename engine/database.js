/**
 * Preventivi-Smart Pro v26.0 — Database Guidato 2026
 * Navigazione: Mestiere -> Tipo di Intervento -> Lavoro Specifico
 * Focus su Emergenze e Interventi Comuni
 */

export const REGIONAL_COEFFICIENTS = {
  "Lombardia": 1.28, "Trentino-Alto Adige": 1.25, "Valle d'Aosta": 1.20,
  "Lazio": 1.18, "Veneto": 1.15, "Emilia-Romagna": 1.12, "Piemonte": 1.10,
  "Liguria": 1.10, "Toscana": 1.08, "Friuli-Venezia Giulia": 1.05,
  "Marche": 1.00, "Umbria": 0.98, "Abruzzo": 0.95, "Campania": 0.92,
  "Sardegna": 0.90, "Puglia": 0.88, "Sicilia": 0.85, "Basilicata": 0.82,
  "Calabria": 0.80, "Molise": 0.78
};

export const QUALITY_MULTIPLIERS = {
  "economica": 0.85,
  "standard": 1.00,
  "premium": 1.35,
  "lusso": 1.75
};

// ===== MACRO CATEGORIE (MESTIERI GENERALI) =====
export const MACRO_CATEGORIES = [
  { 
    id: "idraulico", 
    name: "Idraulico", 
    icon: "fa-faucet", 
    color: "#3b82f6", 
    description: "Perdite, scarichi, caldaia, sanitari" 
  },
  { 
    id: "elettricista", 
    name: "Elettricista", 
    icon: "fa-bolt", 
    color: "#f59e0b", 
    description: "Blackout, prese, quadro, domotica" 
  },
  { 
    id: "climatizzazione", 
    name: "Climatizzazione", 
    icon: "fa-snowflake", 
    color: "#60a5fa", 
    description: "Condizionatori, pompe di calore" 
  },
  { 
    id: "muratore_interni", 
    name: "Muratore & Interni", 
    icon: "fa-hammer", 
    color: "#8b5cf6", 
    description: "Muratura, cartongesso, pittura, pavimenti" 
  },
  { 
    id: "serramenti", 
    name: "Serramenti & Sicurezza", 
    icon: "fa-key", 
    color: "#0ea5e9", 
    description: "Serrature, infissi, porte, tapparelle" 
  },
  { 
    id: "servizi", 
    name: "Servizi Professionali", 
    icon: "fa-briefcase", 
    color: "#06b6d4", 
    description: "Pulizie, traslochi, certificazioni" 
  }
];

// ===== SOTTO CATEGORIE (TIPO DI INTERVENTO) =====
export const SUB_CATEGORIES = [
  // IDRAULICO
  { id: "idr_riparazioni", parent: "idraulico", name: "Riparazioni & Emergenze", icon: "fa-wrench", color: "#1e40af" },
  { id: "idr_installazioni", parent: "idraulico", name: "Nuove Installazioni", icon: "fa-plus", color: "#3b82f6" },
  
  // ELETTRICISTA
  { id: "ele_riparazioni", parent: "elettricista", name: "Riparazioni & Emergenze", icon: "fa-bolt-lightning", color: "#d97706" },
  { id: "ele_installazioni", parent: "elettricista", name: "Nuove Installazioni", icon: "fa-plus", color: "#f59e0b" },
  
  // CLIMATIZZAZIONE
  { id: "cli_manutenzione", parent: "climatizzazione", name: "Manutenzione & Riparazione", icon: "fa-wrench", color: "#0369a1" },
  { id: "cli_installazioni", parent: "climatizzazione", name: "Nuove Installazioni", icon: "fa-plus", color: "#60a5fa" },
  
  // MURATORE & INTERNI
  { id: "mur_riparazioni", parent: "muratore_interni", name: "Riparazioni & Piccole Opere", icon: "fa-wrench", color: "#6b21a8" },
  { id: "mur_installazioni", parent: "muratore_interni", name: "Nuove Installazioni", icon: "fa-plus", color: "#8b5cf6" },
  
  // SERRAMENTI
  { id: "ser_riparazioni", parent: "serramenti", name: "Riparazioni & Emergenze", icon: "fa-wrench", color: "#0c4a6e" },
  { id: "ser_installazioni", parent: "serramenti", name: "Nuove Installazioni", icon: "fa-plus", color: "#0ea5e9" },
  
  // SERVIZI
  { id: "srv_pulizie", parent: "servizi", name: "Pulizie", icon: "fa-broom", color: "#0891b2" },
  { id: "srv_traslochi", parent: "servizi", name: "Traslochi", icon: "fa-truck", color: "#06b6d4" },
  { id: "srv_certificazioni", parent: "servizi", name: "Certificazioni", icon: "fa-certificate", color: "#cffafe" }
];

// ===== DATABASE MESTIERI (LAVORI SPECIFICI) =====
export const TRADES_DATABASE = [
  // ========== IDRAULICO - RIPARAZIONI & EMERGENZE ==========
  { 
    id: "idr_tubo_perde", 
    subId: "idr_riparazioni",
    name: "Tubo che Perde - Ricerca e Riparazione", 
    icon: "fa-droplet", 
    basePrice: 160, 
    unit: "intervento",
    category: "impianti",
    description: "Ricerca perdita e riparazione tubazione a vista o sottotraccia.",
    questions: [
      { label: "La perdita è a vista?", options: [
        { text: "Sì, facile accesso", multiplier: 1.0 },
        { text: "No, sotto il pavimento/muro", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "idr_scarico_otturato", 
    subId: "idr_riparazioni",
    name: "Scarico Otturato - Disostruzione", 
    icon: "fa-faucet-drip", 
    basePrice: 120, 
    unit: "intervento",
    category: "impianti",
    description: "Disostruzione meccanica o chimica di scarichi domestici.",
    questions: [
      { label: "Tipo di scarico?", options: [
        { text: "Lavandino/Bidet", multiplier: 1.0 },
        { text: "WC/Scarico Principale", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "idr_caldaia_blocco", 
    subId: "idr_riparazioni",
    name: "Caldaia in Blocco - Ripristino", 
    icon: "fa-fire", 
    basePrice: 150, 
    unit: "intervento",
    category: "impianti",
    description: "Analisi errore caldaia e ripristino funzionalità base.",
    questions: [
      { label: "La caldaia ha più di 10 anni?", options: [
        { text: "No", multiplier: 1.0 },
        { text: "Sì", multiplier: 1.2 }
      ]}
    ]
  },
  { 
    id: "idr_perdita_gas", 
    subId: "idr_riparazioni",
    name: "Perdita Gas - Riparazione Urgente", 
    icon: "fa-exclamation-triangle", 
    basePrice: 200, 
    unit: "intervento",
    category: "impianti",
    description: "Messa in sicurezza e riparazione tubazione gas.",
    questions: [
      { label: "Intervento notturno o festivo?", options: [
        { text: "No, feriale", multiplier: 1.0 },
        { text: "Sì, urgente", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "idr_sostituzione_rubinetto", 
    subId: "idr_riparazioni",
    name: "Sostituzione Rubinetteria (Miscelatori)", 
    icon: "fa-faucet", 
    basePrice: 280, 
    unit: "intervento",
    category: "impianti",
    description: "Sostituzione rubinetto inclusa minuteria.",
    questions: [
      { label: "Rubinetto fornito da te?", options: [
        { text: "Sì, solo manodopera", multiplier: 0.6 },
        { text: "No, fornito da idraulico", multiplier: 1.0 }
      ]}
    ]
  },

  // ========== IDRAULICO - NUOVE INSTALLAZIONI ==========
  { 
    id: "idr_nuovo_bagno", 
    subId: "idr_installazioni",
    name: "Nuovo Impianto Bagno Completo", 
    icon: "fa-bath", 
    basePrice: 2500, 
    unit: "intervento",
    category: "impianti",
    description: "Rifacimento totale tubazioni carico e scarico bagno.",
    questions: [
      { label: "Numero di punti acqua?", options: [
        { text: "Fino a 4 (Standard)", multiplier: 1.0 },
        { text: "Oltre 4 punti", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "idr_inst_caldaia", 
    subId: "idr_installazioni",
    name: "Installazione Caldaia o Pompa di Calore", 
    icon: "fa-wind", 
    basePrice: 3500, 
    unit: "intervento",
    category: "impianti",
    description: "Posa e collegamento nuova unità termica.",
    questions: [
      { label: "Tipo di unità?", options: [
        { text: "Caldaia a condensazione", multiplier: 1.0 },
        { text: "Pompa di calore", multiplier: 1.8 }
      ]}
    ]
  },

  // ========== ELETTRICISTA - RIPARAZIONI & EMERGENZE ==========
  { 
    id: "ele_blackout", 
    subId: "ele_riparazioni",
    name: "Blackout / Salta la Corrente - Ricerca Guasto", 
    icon: "fa-bolt-lightning", 
    basePrice: 180, 
    unit: "intervento",
    category: "impianti",
    description: "Diagnosi e ripristino corrente elettrica.",
    questions: [
      { label: "Il guasto è nel quadro principale?", options: [
        { text: "Sì", multiplier: 1.0 },
        { text: "No, in una stanza specifica", multiplier: 1.2 }
      ]}
    ]
  },
  { 
    id: "ele_salvavita", 
    subId: "ele_riparazioni",
    name: "Sostituzione Salvavita (Interruttore Differenziale)", 
    icon: "fa-square-check", 
    basePrice: 140, 
    unit: "intervento",
    category: "impianti",
    description: "Fornitura e posa nuovo interruttore differenziale.",
    questions: [
      { label: "Quadro elettrico moderno?", options: [
        { text: "Sì, spazio disponibile", multiplier: 1.0 },
        { text: "No, vecchio quadro", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "ele_presa_bruciata", 
    subId: "ele_riparazioni",
    name: "Presa o Interruttore Bruciato - Sostituzione", 
    icon: "fa-plug", 
    basePrice: 95, 
    unit: "intervento",
    category: "impianti",
    description: "Sostituzione frutti e placche danneggiate.",
    questions: [
      { label: "Numero di punti da sostituire?", options: [
        { text: "1 punto", multiplier: 1.0 },
        { text: "Da 2 a 5 punti", multiplier: 2.5 }
      ]}
    ]
  },
  { 
    id: "ele_citofono", 
    subId: "ele_riparazioni",
    name: "Citofono non Funziona - Riparazione", 
    icon: "fa-phone", 
    basePrice: 120, 
    unit: "intervento",
    category: "impianti",
    description: "Riparazione o sostituzione cornetta citofonica.",
    questions: [
      { label: "Sistema condominiale?", options: [
        { text: "Sì", multiplier: 1.2 },
        { text: "No, indipendente", multiplier: 1.0 }
      ]}
    ]
  },

  // ========== ELETTRICISTA - NUOVE INSTALLAZIONI ==========
  { 
    id: "ele_imp_completo", 
    subId: "ele_installazioni",
    name: "Rifacimento Impianto Elettrico Completo", 
    icon: "fa-plug", 
    basePrice: 3500, 
    unit: "intervento",
    category: "impianti",
    description: "Nuovo impianto elettrico a norma con certificazione.",
    questions: [
      { label: "Dimensione casa?", options: [
        { text: "Fino a 70mq", multiplier: 1.0 },
        { text: "70mq - 120mq", multiplier: 1.6 },
        { text: "Oltre 120mq", multiplier: 2.2 }
      ]}
    ]
  },
  { 
    id: "ele_punti_luce", 
    subId: "ele_installazioni",
    name: "Nuovi Punti Luce (Prese/Interruttori)", 
    icon: "fa-lightbulb", 
    basePrice: 120, 
    unit: "punto",
    category: "impianti",
    description: "Aggiunta nuovi punti luce o prese.",
    questions: [
      { label: "Lavoro sotto traccia?", options: [
        { text: "No, esterna/canalina", multiplier: 0.8 },
        { text: "Sì, con opere murarie", multiplier: 1.2 }
      ]}
    ]
  },
  { 
    id: "ele_domotica", 
    subId: "ele_installazioni",
    name: "Impianto Domotica (Smart Home)", 
    icon: "fa-microchip", 
    basePrice: 2000, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione sistema controllo luci/tapparelle smart.",
    questions: [
      { label: "Numero di dispositivi?", options: [
        { text: "Fino a 10", multiplier: 1.0 },
        { text: "Oltre 10", multiplier: 1.8 }
      ]}
    ]
  },
  { 
    id: "ele_wallbox", 
    subId: "ele_installazioni",
    name: "Installazione Wallbox (Ricarica EV)", 
    icon: "fa-charging-station", 
    basePrice: 800, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione e cablaggio stazione ricarica auto.",
    questions: [
      { label: "Distanza dal contatore?", options: [
        { text: "Entro 10 metri", multiplier: 1.0 },
        { text: "Oltre 10 metri", multiplier: 1.4 }
      ]}
    ]
  },

  // ========== CLIMATIZZAZIONE - MANUTENZIONE ==========
  { 
    id: "cli_ricarica_gas", 
    subId: "cli_manutenzione",
    name: "Ricarica Gas Condizionatore", 
    icon: "fa-snowflake", 
    basePrice: 280, 
    unit: "intervento",
    category: "impianti",
    description: "Ricarica gas refrigerante e controllo perdite.",
    questions: [
      { label: "Tipo di gas?", options: [
        { text: "R32 (Moderno)", multiplier: 1.0 },
        { text: "R410A (Vecchio)", multiplier: 1.2 }
      ]}
    ]
  },
  { 
    id: "cli_pulizia_filtri", 
    subId: "cli_manutenzione",
    name: "Pulizia Filtri e Sanificazione", 
    icon: "fa-fan", 
    basePrice: 150, 
    unit: "intervento",
    category: "impianti",
    description: "Igienizzazione split e pulizia filtri.",
    questions: [
      { label: "Numero di split?", options: [
        { text: "1 Split", multiplier: 1.0 },
        { text: "2-3 Split", multiplier: 2.2 }
      ]}
    ]
  },
  { 
    id: "cli_perdita_condensa", 
    subId: "cli_manutenzione",
    name: "Perdita Condensa Split - Riparazione", 
    icon: "fa-droplet", 
    basePrice: 120, 
    unit: "intervento",
    category: "impianti",
    description: "Sblocco scarico condensa o riparazione vaschetta.",
    questions: [
      { label: "Split accessibile?", options: [
        { text: "Sì, altezza standard", multiplier: 1.0 },
        { text: "No, serve scala alta", multiplier: 1.2 }
      ]}
    ]
  },

  // ========== CLIMATIZZAZIONE - NUOVE INSTALLAZIONI ==========
  { 
    id: "cli_inst_mono", 
    subId: "cli_installazioni",
    name: "Installazione Condizionatore Monosplit", 
    icon: "fa-snowflake", 
    basePrice: 1200, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione unità interna ed esterna.",
    questions: [
      { label: "Predisposizione presente?", options: [
        { text: "Sì", multiplier: 0.7 },
        { text: "No, da creare", multiplier: 1.0 }
      ]}
    ]
  },
  { 
    id: "cli_inst_multi", 
    subId: "cli_installazioni",
    name: "Installazione Condizionatore Multisplit", 
    icon: "fa-fan", 
    subId: "cli_installazioni",
    basePrice: 3500, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione sistema dual o trial split.",
    questions: [
      { label: "Numero unità interne?", options: [
        { text: "2 Unità", multiplier: 1.0 },
        { text: "3 Unità", multiplier: 1.4 }
      ]}
    ]
  },

  // ========== MURATORE - RIPARAZIONI ==========
  { 
    id: "mur_crepe", 
    subId: "mur_riparazioni",
    name: "Riparazione Crepe o Infiltrazioni", 
    icon: "fa-droplet-slash", 
    basePrice: 35, 
    unit: "metro",
    category: "strutture",
    description: "Chiusura crepe e ripristino intonaco ammalorato.",
    questions: [
      { label: "Profondità crepa?", options: [
        { text: "Superficiale", multiplier: 1.0 },
        { text: "Strutturale", multiplier: 2.0 }
      ]}
    ]
  },
  { 
    id: "mur_intonaco", 
    subId: "mur_riparazioni",
    name: "Intonaco e Rasatura", 
    icon: "fa-trowel", 
    basePrice: 18, 
    unit: "mq",
    category: "strutture",
    description: "Applicazione intonaco e finitura liscia.",
    questions: [
      { label: "Superficie totale?", options: [
        { text: "Fino a 20mq", multiplier: 1.2 },
        { text: "Oltre 20mq", multiplier: 1.0 }
      ]}
    ]
  },

  // ========== MURATORE - NUOVE INSTALLAZIONI ==========
  { 
    id: "mur_parete", 
    subId: "mur_installazioni",
    name: "Costruzione Parete (Mattoni/Cartongesso)", 
    icon: "fa-wall", 
    basePrice: 45, 
    unit: "mq",
    category: "strutture",
    description: "Erezione nuova parete divisoria.",
    questions: [
      { label: "Materiale?", options: [
        { text: "Cartongesso", multiplier: 1.0 },
        { text: "Mattoni forati", multiplier: 1.4 }
      ]}
    ]
  },
  { 
    id: "mur_controsoffitto", 
    subId: "mur_installazioni",
    name: "Controsoffitto in Cartongesso", 
    icon: "fa-cube", 
    basePrice: 28, 
    unit: "mq",
    category: "strutture",
    description: "Realizzazione controsoffitto piano.",
    questions: [
      { label: "Integrazione faretti?", options: [
        { text: "No", multiplier: 1.0 },
        { text: "Sì, fori pronti", multiplier: 1.2 }
      ]}
    ]
  },

  // ========== FINITURE & INTERNI ==========
  { 
    id: "fin_tinteggiatura", 
    subId: "mur_riparazioni",
    name: "Tinteggiatura (Interna/Esterna)", 
    icon: "fa-brush", 
    basePrice: 12, 
    unit: "mq",
    category: "finiture",
    description: "Pittura pareti con due mani di idropittura.",
    questions: [
      { label: "Colore?", options: [
        { text: "Bianco", multiplier: 1.0 },
        { text: "Colorato", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "fin_pavimento", 
    subId: "mur_installazioni",
    name: "Posa Pavimento (Piastrelle/Parquet/Resina)", 
    icon: "fa-th-large", 
    basePrice: 32, 
    unit: "mq",
    category: "finiture",
    description: "Posa in opera nuovo pavimento (solo manodopera).",
    questions: [
      { label: "Formato piastrelle?", options: [
        { text: "Standard (30x30, 60x60)", multiplier: 1.0 },
        { text: "Grandi formati", multiplier: 1.4 }
      ]}
    ]
  },

  // ========== SERRAMENTI - EMERGENZE ==========
  { 
    id: "ser_porta_bloccata", 
    subId: "ser_riparazioni",
    name: "Apertura Porta Bloccata (Fabbro)", 
    icon: "fa-unlock", 
    basePrice: 150, 
    unit: "intervento",
    category: "finiture",
    description: "Apertura porta senza scasso o con cambio cilindro.",
    questions: [
      { label: "Porta blindata?", options: [
        { text: "No", multiplier: 1.0 },
        { text: "Sì", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "ser_cinghia_tapparella", 
    subId: "ser_riparazioni",
    name: "Sostituzione Cinghia Tapparella", 
    icon: "fa-window-restore", 
    basePrice: 120, 
    unit: "intervento",
    category: "finiture",
    description: "Cambio corda e controllo rullino.",
    questions: [
      { label: "Tapparella motorizzata?", options: [
        { text: "No", multiplier: 1.0 },
        { text: "Sì, riparazione motore", multiplier: 2.0 }
      ]}
    ]
  },
  { 
    id: "ser_zanzariera", 
    subId: "ser_riparazioni",
    name: "Riparazione Zanzariera Strappata", 
    icon: "fa-mosquito", 
    basePrice: 80, 
    unit: "intervento",
    category: "finiture",
    description: "Sostituzione rete zanzariera.",
    questions: [
      { label: "Modello?", options: [
        { text: "A rullo", multiplier: 1.0 },
        { text: "Plissettata", multiplier: 1.4 }
      ]}
    ]
  },

  // ========== SERRAMENTI - NUOVE INSTALLAZIONI ==========
  { 
    id: "ser_infissi", 
    subId: "ser_installazioni",
    name: "Sostituzione Infissi (Finestre)", 
    icon: "fa-window", 
    basePrice: 380, 
    unit: "finestra",
    category: "finiture",
    description: "Smontaggio vecchio infisso e posa nuovo.",
    questions: [
      { label: "Materiale nuovo infisso?", options: [
        { text: "PVC", multiplier: 1.0 },
        { text: "Alluminio/Legno", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "ser_porta_blindata", 
    subId: "ser_installazioni",
    name: "Installazione Porta Blindata", 
    icon: "fa-door-closed", 
    basePrice: 950, 
    unit: "intervento",
    category: "finiture",
    description: "Posa in opera porta blindata classe 3 o 4.",
    questions: [
      { label: "Classe sicurezza?", options: [
        { text: "Classe 3", multiplier: 1.0 },
        { text: "Classe 4", multiplier: 1.4 }
      ]}
    ]
  },

  // ========== SERVIZI PROFESSIONALI ==========
  { 
    id: "srv_pulizie_post", 
    subId: "srv_pulizie",
    name: "Pulizia Post-Cantiere", 
    icon: "fa-broom", 
    basePrice: 10, 
    unit: "mq",
    category: "servizi",
    description: "Pulizia profonda dopo lavori di ristrutturazione.",
    questions: [
      { label: "Grado di sporco?", options: [
        { text: "Leggero (Polvere)", multiplier: 1.0 },
        { text: "Pesante (Calce/Vernice)", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "srv_trasloco", 
    subId: "srv_traslochi",
    name: "Trasloco Locale", 
    icon: "fa-truck", 
    basePrice: 1500, 
    unit: "intervento",
    category: "servizi",
    description: "Carico, trasporto e scarico mobili entro 50km.",
    questions: [
      { label: "Piano dell'abitazione?", options: [
        { text: "Piano Terra / Rialzato", multiplier: 1.0 },
        { text: "Piani Alti con elevatore", multiplier: 1.4 }
      ]}
    ]
  },
  { 
    id: "srv_ape", 
    subId: "srv_certificazioni",
    name: "APE - Attestato Prestazione Energetica", 
    icon: "fa-certificate", 
    basePrice: 150, 
    unit: "intervento",
    category: "servizi",
    description: "Certificazione energetica obbligatoria per affitto/vendita.",
    questions: [
      { label: "Uso?", options: [
        { text: "Residenziale", multiplier: 1.0 },
        { text: "Commerciale", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "srv_dichiarazione_conformita", 
    subId: "srv_certificazioni",
    name: "Dichiarazione di Conformità Impianto", 
    icon: "fa-file-check", 
    basePrice: 200, 
    unit: "intervento",
    category: "servizi",
    description: "Rilascio certificazione impianto esistente.",
    questions: [
      { label: "Tipo di impianto?", options: [
        { text: "Elettrico", multiplier: 1.0 },
        { text: "Gas", multiplier: 1.2 },
        { text: "Entrambi", multiplier: 1.8 }
      ]}
    ]
  }
];

// ===== FUNZIONI DI SUPPORTO =====
export function getAllCategories() { return MACRO_CATEGORIES; }
export function getSubCategories(parentId) { return SUB_CATEGORIES.filter(s => s.parent === parentId); }
export function getTradesByCategory(parentId) { return TRADES_DATABASE.filter(t => t.parent === parentId); }
export function getTradeById(id) { return TRADES_DATABASE.find(t => t.id === id); }
export function getAllTrades() { return TRADES_DATABASE; }

export function calculateFinalPrice(tradeId, quantity, region, quality, answers) {
  const trade = getTradeById(tradeId);
  if (!trade) return 0;
  
  const basePriceTotal = trade.basePrice * quantity;
  const regionalCoeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  const qualityCoeff = QUALITY_MULTIPLIERS[quality] || 1.0;
  const answerMultiplier = calculateAnswerMultiplier(tradeId, answers);

  return Math.round(basePriceTotal * regionalCoeff * qualityCoeff * answerMultiplier * 100) / 100;
}

export function calculateAnswerMultiplier(tradeId, answers) {
  const trade = getTradeById(tradeId);
  if (!trade) return 1.0;

  let multiplier = 1.0;
  
  if (typeof answers === 'object' && answers !== null) {
    Object.values(answers).forEach(answer => {
      if (typeof answer === 'number') {
        multiplier *= answer;
      } else if (typeof answer === 'string') {
        if (answer.includes("difficile") || answer.includes("grande")) {
          multiplier *= 1.2;
        } else if (answer.includes("facile") || answer.includes("piccolo")) {
          multiplier *= 0.9;
        }
      }
    });
  }

  return multiplier;
}

// Default export per compatibilità con app-v3.js
export default {
  REGIONAL_COEFFICIENTS,
  QUALITY_MULTIPLIERS,
  MACRO_CATEGORIES,
  SUB_CATEGORIES,
  TRADES_DATABASE,
  getAllCategories,
  getSubCategories,
  getTradesByCategory,
  getTradeById,
  getAllTrades,
  calculateFinalPrice,
  calculateAnswerMultiplier
};
