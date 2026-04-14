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
    desc: "Perdite, scarichi, caldaia, sanitari" 
  },
  { 
    id: "elettricista", 
    name: "Elettricista", 
    icon: "fa-bolt", 
    color: "#f59e0b", 
    desc: "Blackout, prese, quadro, domotica" 
  },
  { 
    id: "climatizzazione", 
    name: "Climatizzazione", 
    icon: "fa-snowflake", 
    color: "#60a5fa", 
    desc: "Condizionatori, pompe di calore" 
  },
  { 
    id: "muratore_interni", 
    name: "Muratore & Interni", 
    icon: "fa-hammer", 
    color: "#8b5cf6", 
    desc: "Muratura, cartongesso, pittura, pavimenti" 
  },
  { 
    id: "serramenti", 
    name: "Serramenti & Sicurezza", 
    icon: "fa-key", 
    color: "#0ea5e9", 
    desc: "Serrature, infissi, porte, tapparelle" 
  },
  { 
    id: "servizi", 
    name: "Servizi Professionali", 
    icon: "fa-briefcase", 
    color: "#06b6d4", 
    desc: "Pulizie, traslochi, certificazioni" 
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
    parent: "idr_riparazioni", 
    name: "Tubo che Perde - Ricerca e Riparazione", 
    icon: "fa-droplet", 
    basePrice: 160, 
    unit: "intervento",
    category: "impianti",
    description: "Ricerca e riparazione perdita d'acqua domestica.",
    questions: [
      { label: "Dove si trova la perdita?", options: [
        { text: "A vista (sotto lavandino)", multiplier: 1.0 },
        { text: "Sotto traccia (muro/pavimento)", multiplier: 1.6 },
        { text: "Interrata (giardino/esterno)", multiplier: 2.2 }
      ]},
      { label: "Materiale della tubazione?", options: [
        { text: "Rame", multiplier: 1.0 },
        { text: "Plastica/PVC", multiplier: 0.8 },
        { text: "Ferro/Acciaio", multiplier: 1.4 }
      ]}
    ]
  },
  { 
    id: "idr_scarico_otturato", 
    parent: "idr_riparazioni", 
    name: "Scarico Otturato - Disostruzione", 
    icon: "fa-faucet-drip", 
    basePrice: 120, 
    unit: "intervento",
    category: "impianti",
    description: "Disostruzione scarichi lavandini, WC o colonna.",
    questions: [
      { label: "Quale scarico è bloccato?", options: [
        { text: "Lavandino / Bidet", multiplier: 1.0 },
        { text: "WC / Colonna principale", multiplier: 1.5 },
        { text: "Intero impianto (allagamento)", multiplier: 2.5 }
      ]},
      { label: "Tipo di ostruzione?", options: [
        { text: "Capelli / Residui", multiplier: 1.0 },
        { text: "Calcare / Sedimenti", multiplier: 1.3 },
        { text: "Radici / Oggetti", multiplier: 2.0 }
      ]}
    ]
  },
  { 
    id: "idr_caldaia_blocco", 
    parent: "idr_riparazioni", 
    name: "Caldaia in Blocco - Ripristino", 
    icon: "fa-fire", 
    basePrice: 150, 
    unit: "intervento",
    category: "impianti",
    description: "Diagnosi e ripristino caldaia ferma.",
    questions: [
      { label: "Età della caldaia?", options: [
        { text: "Nuova (< 5 anni)", multiplier: 1.0 },
        { text: "Datata (5-12 anni)", multiplier: 1.3 },
        { text: "Vecchia (> 12 anni)", multiplier: 1.8 }
      ]},
      { label: "Tipo di guasto?", options: [
        { text: "Accensione fallita", multiplier: 1.0 },
        { text: "Pressione bassa", multiplier: 1.2 },
        { text: "Errore elettronico", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "idr_perdita_gas", 
    parent: "idr_riparazioni", 
    name: "Perdita Gas - Riparazione Urgente", 
    icon: "fa-exclamation-triangle", 
    basePrice: 200, 
    unit: "intervento",
    category: "impianti",
    description: "Ricerca e riparazione perdita gas metano.",
    questions: [
      { label: "Dove si sospetta la perdita?", options: [
        { text: "Caldaia", multiplier: 1.0 },
        { text: "Tubo di alimentazione", multiplier: 1.3 },
        { text: "Fornello/Cucina", multiplier: 1.1 }
      ]}
    ]
  },
  { 
    id: "idr_rubinetteria", 
    parent: "idr_installazioni", 
    name: "Sostituzione Rubinetteria (Miscelatori)", 
    icon: "fa-faucet", 
    basePrice: 280, 
    unit: "intervento",
    category: "impianti",
    description: "Sostituzione miscelatori e rubinetti.",
    questions: [
      { label: "Tipo di rubinetto?", options: [
        { text: "Monocomando standard", multiplier: 1.0 },
        { text: "Bicomando", multiplier: 1.1 },
        { text: "Miscelatore premium", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "idr_bagno_completo", 
    parent: "idr_installazioni", 
    name: "Nuovo Impianto Bagno Completo", 
    icon: "fa-bath", 
    basePrice: 2500, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione completa impianto idrico e sanitari bagno.",
    questions: [
      { label: "Tipo di sanitari?", options: [
        { text: "Standard (bidet, WC, lavabo)", multiplier: 1.0 },
        { text: "Premium (vasca/doccia, bidet, doppio lavabo)", multiplier: 1.5 },
        { text: "Lusso (vasca idromassaggio, doccia multifunzione)", multiplier: 2.0 }
      ]}
    ]
  },
  { 
    id: "idr_caldaia_nuova", 
    parent: "idr_installazioni", 
    name: "Installazione Caldaia o Pompa di Calore", 
    icon: "fa-wind", 
    basePrice: 3500, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione caldaia condensazione o pompa di calore.",
    questions: [
      { label: "Tipo di generatore?", options: [
        { text: "Caldaia condensazione", multiplier: 1.0 },
        { text: "Pompa di calore aria-acqua", multiplier: 1.6 }
      ]}
    ]
  },

  // ========== ELETTRICISTA - RIPARAZIONI & EMERGENZE ==========
  { 
    id: "ele_blackout", 
    parent: "ele_riparazioni", 
    name: "Blackout / Salta la Corrente - Ricerca Guasto", 
    icon: "fa-bolt-lightning", 
    basePrice: 180, 
    unit: "intervento",
    category: "impianti",
    description: "Ricerca guasto e ripristino corrente elettrica.",
    questions: [
      { label: "Quando scatta il salvavita?", options: [
        { text: "Subito (appena riarmato)", multiplier: 1.0 },
        { text: "Casualmente (intermittente)", multiplier: 1.5 },
        { text: "Sotto carico", multiplier: 1.3 }
      ]},
      { label: "Interessamento?", options: [
        { text: "Un circuito", multiplier: 1.0 },
        { text: "Più circuiti", multiplier: 1.4 },
        { text: "Tutto l'impianto", multiplier: 2.0 }
      ]}
    ]
  },
  { 
    id: "ele_salvavita_rotto", 
    parent: "ele_riparazioni", 
    name: "Sostituzione Salvavita (Interruttore Differenziale)", 
    icon: "fa-square-check", 
    basePrice: 140, 
    unit: "intervento",
    category: "impianti",
    description: "Sostituzione interruttore differenziale o magnetotermico.",
    questions: [
      { label: "Componente da sostituire?", options: [
        { text: "Singolo interruttore", multiplier: 1.0 },
        { text: "Intero quadro elettrico", multiplier: 3.5 },
        { text: "Più componenti", multiplier: 2.0 }
      ]}
    ]
  },
  { 
    id: "ele_presa_bruciata", 
    parent: "ele_riparazioni", 
    name: "Presa o Interruttore Bruciato - Sostituzione", 
    icon: "fa-plug", 
    basePrice: 95, 
    unit: "intervento",
    category: "impianti",
    description: "Sostituzione presa o interruttore danneggiato.",
    questions: [
      { label: "Numero di punti da sostituire?", options: [
        { text: "1 punto", multiplier: 1.0 },
        { text: "2-3 punti", multiplier: 0.9 },
        { text: "Oltre 3 punti", multiplier: 0.8 }
      ]}
    ]
  },
  { 
    id: "ele_citofono", 
    parent: "ele_riparazioni", 
    name: "Citofono non Funziona - Riparazione", 
    icon: "fa-phone", 
    basePrice: 120, 
    unit: "intervento",
    category: "impianti",
    description: "Diagnosi e riparazione sistema citofonico.",
    questions: [
      { label: "Tipo di citofono?", options: [
        { text: "Analogico", multiplier: 1.0 },
        { text: "Digitale", multiplier: 1.2 }
      ]}
    ]
  },
  { 
    id: "ele_impianto_rifacimento", 
    parent: "ele_installazioni", 
    name: "Rifacimento Impianto Elettrico Completo", 
    icon: "fa-plug", 
    basePrice: 3500, 
    unit: "intervento",
    category: "impianti",
    description: "Rifacimento completo impianto elettrico sottotraccia.",
    questions: [
      { label: "Metratura immobile?", options: [
        { text: "Piccolo (< 50 mq)", multiplier: 1.0 },
        { text: "Medio (50-100 mq)", multiplier: 1.1 },
        { text: "Grande (> 100 mq)", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "ele_nuovi_punti", 
    parent: "ele_installazioni", 
    name: "Nuovi Punti Luce (Prese/Interruttori)", 
    icon: "fa-lightbulb", 
    basePrice: 120, 
    unit: "punto",
    category: "impianti",
    description: "Installazione nuove prese o interruttori.",
    questions: [
      { label: "Numero di punti?", options: [
        { text: "1-2 punti", multiplier: 1.0 },
        { text: "3-5 punti", multiplier: 0.9 },
        { text: "6+ punti", multiplier: 0.8 }
      ]}
    ]
  },
  { 
    id: "ele_domotica", 
    parent: "ele_installazioni", 
    name: "Impianto Domotica (Smart Home)", 
    icon: "fa-microchip", 
    basePrice: 2000, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione sistema domotica per automazione casa.",
    questions: [
      { label: "Livello di automazione?", options: [
        { text: "Base (illuminazione, prese)", multiplier: 1.0 },
        { text: "Intermedio (+ riscaldamento, tapparelle)", multiplier: 1.5 },
        { text: "Completo (+ sicurezza, videocitofono)", multiplier: 2.2 }
      ]}
    ]
  },
  { 
    id: "ele_wallbox", 
    parent: "ele_installazioni", 
    name: "Installazione Wallbox (Ricarica EV)", 
    icon: "fa-charging-station", 
    basePrice: 800, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione colonnina di ricarica per auto elettrica.",
    questions: [
      { label: "Potenza wallbox?", options: [
        { text: "Monofase 3.7 kW", multiplier: 1.0 },
        { text: "Trifase 7.4 kW", multiplier: 1.2 },
        { text: "Trifase 11 kW", multiplier: 1.4 }
      ]}
    ]
  },

  // ========== CLIMATIZZAZIONE - MANUTENZIONE & RIPARAZIONE ==========
  { 
    id: "cli_ricarica_gas", 
    parent: "cli_manutenzione", 
    name: "Ricarica Gas Condizionatore", 
    icon: "fa-snowflake", 
    basePrice: 280, 
    unit: "intervento",
    category: "impianti",
    description: "Ricarica gas refrigerante condizionatore.",
    questions: [
      { label: "Potenza condizionatore?", options: [
        { text: "Piccolo (fino 7 kW)", multiplier: 1.0 },
        { text: "Medio (7-12 kW)", multiplier: 1.1 },
        { text: "Grande (oltre 12 kW)", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "cli_pulizia_filtri", 
    parent: "cli_manutenzione", 
    name: "Pulizia Filtri e Sanificazione", 
    icon: "fa-fan", 
    basePrice: 150, 
    unit: "intervento",
    category: "impianti",
    description: "Pulizia filtri e sanificazione sistema climatico.",
    questions: [
      { label: "Tipo di pulizia?", options: [
        { text: "Ordinaria (filtri)", multiplier: 1.0 },
        { text: "Profonda (sanificazione)", multiplier: 1.4 }
      ]}
    ]
  },
  { 
    id: "cli_perdita_condensa", 
    parent: "cli_manutenzione", 
    name: "Perdita Condensa Split - Riparazione", 
    icon: "fa-droplet", 
    basePrice: 120, 
    unit: "intervento",
    category: "impianti",
    description: "Riparazione scarico condensa condizionatore.",
    questions: [
      { label: "Tipo di perdita?", options: [
        { text: "Tubo intasato", multiplier: 1.0 },
        { text: "Vasca danneggiata", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "cli_monosplit", 
    parent: "cli_installazioni", 
    name: "Installazione Condizionatore Monosplit", 
    icon: "fa-snowflake", 
    basePrice: 1200, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione condizionatore monosplit per singolo ambiente.",
    questions: [
      { label: "Potenza richiesta?", options: [
        { text: "Piccola (fino 7 kW)", multiplier: 1.0 },
        { text: "Media (7-12 kW)", multiplier: 1.1 },
        { text: "Grande (oltre 12 kW)", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "cli_multisplit", 
    parent: "cli_installazioni", 
    name: "Installazione Condizionatore Multisplit", 
    icon: "fa-fan", 
    basePrice: 3500, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione sistema multisplit per più ambienti.",
    questions: [
      { label: "Numero di unità interne?", options: [
        { text: "2-3 unità", multiplier: 1.0 },
        { text: "4-5 unità", multiplier: 1.2 },
        { text: "Oltre 5 unità", multiplier: 1.5 }
      ]}
    ]
  },

  // ========== MURATORE & INTERNI - RIPARAZIONI ==========
  { 
    id: "mur_crepe_infiltrazioni", 
    parent: "mur_riparazioni", 
    name: "Riparazione Crepe o Infiltrazioni", 
    icon: "fa-droplet-slash", 
    basePrice: 35, 
    unit: "metro",
    category: "strutture",
    description: "Sigillatura crepe e trattamento infiltrazioni.",
    questions: [
      { label: "Ampiezza della crepa?", options: [
        { text: "Sottile (< 2mm)", multiplier: 1.0 },
        { text: "Media (2-5mm)", multiplier: 1.3 },
        { text: "Larga (> 5mm)", multiplier: 1.8 }
      ]}
    ]
  },
  { 
    id: "mur_intonaco_rasatura", 
    parent: "mur_riparazioni", 
    name: "Intonaco e Rasatura", 
    icon: "fa-trowel", 
    basePrice: 18, 
    unit: "mq",
    category: "strutture",
    description: "Intonaco civile e rasatura pareti.",
    questions: [
      { label: "Tipo di intonaco?", options: [
        { text: "Civile standard", multiplier: 1.0 },
        { text: "Termico", multiplier: 1.3 },
        { text: "Speciale (acustico, idrofugo)", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "mur_parete_costruzione", 
    parent: "mur_installazioni", 
    name: "Costruzione Parete (Mattoni/Cartongesso)", 
    icon: "fa-wall", 
    basePrice: 45, 
    unit: "mq",
    category: "strutture",
    description: "Realizzazione parete in mattoni o cartongesso.",
    questions: [
      { label: "Tipo di materiale?", options: [
        { text: "Forati standard", multiplier: 1.0 },
        { text: "Mattoni pieni", multiplier: 1.4 },
        { text: "Cartongesso", multiplier: 0.8 }
      ]}
    ]
  },
  { 
    id: "mur_controsoffitto", 
    parent: "mur_installazioni", 
    name: "Controsoffitto in Cartongesso", 
    icon: "fa-cube", 
    basePrice: 28, 
    unit: "mq",
    category: "strutture",
    description: "Realizzazione controsoffitto in cartongesso.",
    questions: [
      { label: "Tipo di cartongesso?", options: [
        { text: "Standard", multiplier: 1.0 },
        { text: "Ignifugo", multiplier: 1.2 },
        { text: "Idrofugo (bagno/cucina)", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "pit_tinteggiatura", 
    parent: "mur_installazioni", 
    name: "Tinteggiatura (Interna/Esterna)", 
    icon: "fa-brush", 
    basePrice: 12, 
    unit: "mq",
    category: "finiture",
    description: "Tinteggiatura pareti con idropittura o pittura esterna.",
    questions: [
      { label: "Tipo di pittura?", options: [
        { text: "Idropittura interna", multiplier: 1.0 },
        { text: "Pittura esterna ai silicati", multiplier: 1.3 },
        { text: "Effetto decorativo", multiplier: 1.8 }
      ]}
    ]
  },
  { 
    id: "pav_piastrelle", 
    parent: "mur_installazioni", 
    name: "Posa Pavimento (Piastrelle/Parquet/Resina)", 
    icon: "fa-th-large", 
    basePrice: 32, 
    unit: "mq",
    category: "finiture",
    description: "Posa piastrelle ceramica, parquet o resina.",
    questions: [
      { label: "Tipo di pavimento?", options: [
        { text: "Piastrelle ceramica", multiplier: 1.0 },
        { text: "Parquet", multiplier: 1.4 },
        { text: "Resina", multiplier: 1.7 }
      ]}
    ]
  },

  // ========== SERRAMENTI - RIPARAZIONI & EMERGENZE ==========
  { 
    id: "ser_porta_bloccata", 
    parent: "ser_riparazioni", 
    name: "Apertura Porta Bloccata (Fabbro)", 
    icon: "fa-unlock", 
    basePrice: 150, 
    unit: "intervento",
    category: "finiture",
    description: "Apertura serratura bloccata senza scasso.",
    questions: [
      { label: "Tipo di serratura?", options: [
        { text: "Cilindro standard", multiplier: 1.0 },
        { text: "Blindata", multiplier: 1.5 },
        { text: "Elettronica", multiplier: 1.8 }
      ]}
    ]
  },
  { 
    id: "ser_tapparella_rotta", 
    parent: "ser_riparazioni", 
    name: "Sostituzione Cinghia Tapparella", 
    icon: "fa-window-restore", 
    basePrice: 120, 
    unit: "intervento",
    category: "finiture",
    description: "Riparazione o sostituzione cinghia tapparella rotta.",
    questions: [
      { label: "Tipo di danno?", options: [
        { text: "Cinghia spezzata", multiplier: 1.0 },
        { text: "Rullo danneggiato", multiplier: 1.4 }
      ]}
    ]
  },
  { 
    id: "ser_zanzariera", 
    parent: "ser_riparazioni", 
    name: "Riparazione Zanzariera Strappata", 
    icon: "fa-mosquito", 
    basePrice: 80, 
    unit: "intervento",
    category: "finiture",
    description: "Sostituzione rete zanzariera.",
    questions: [
      { label: "Tipo di zanzariera?", options: [
        { text: "Fissa", multiplier: 1.0 },
        { text: "Scorrevole", multiplier: 1.2 }
      ]}
    ]
  },
  { 
    id: "ser_infissi", 
    parent: "ser_installazioni", 
    name: "Sostituzione Infissi (Finestre)", 
    icon: "fa-window", 
    basePrice: 380, 
    unit: "finestra",
    category: "finiture",
    description: "Sostituzione finestre con nuovi infissi.",
    questions: [
      { label: "Tipo di infisso?", options: [
        { text: "Alluminio standard", multiplier: 1.0 },
        { text: "PVC", multiplier: 0.9 },
        { text: "Legno-alluminio", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "ser_porta_blindata", 
    parent: "ser_installazioni", 
    name: "Installazione Porta Blindata", 
    icon: "fa-door-closed", 
    basePrice: 950, 
    unit: "intervento",
    category: "finiture",
    description: "Installazione porta blindata di sicurezza.",
    questions: [
      { label: "Livello di sicurezza?", options: [
        { text: "Standard (Classe 2)", multiplier: 1.0 },
        { text: "Premium (Classe 3)", multiplier: 1.3 },
        { text: "Lusso (Classe 4+)", multiplier: 1.6 }
      ]}
    ]
  },

  // ========== SERVIZI PROFESSIONALI ==========
  { 
    id: "srv_pulizia_postcantiere", 
    parent: "srv_pulizie", 
    name: "Pulizia Post-Cantiere", 
    icon: "fa-broom", 
    basePrice: 10, 
    unit: "mq",
    category: "servizi",
    description: "Pulizia completa post-cantiere, rimozione polvere e detriti.",
    questions: [
      { label: "Tipo di pulizia?", options: [
        { text: "Ordinaria (polvere)", multiplier: 1.0 },
        { text: "Profonda (detergenti)", multiplier: 1.4 },
        { text: "Fine lavori (lucidatura)", multiplier: 1.8 }
      ]}
    ]
  },
  { 
    id: "srv_trasloco_locale", 
    parent: "srv_traslochi", 
    name: "Trasloco Locale", 
    icon: "fa-truck", 
    basePrice: 1500, 
    unit: "intervento",
    category: "servizi",
    description: "Trasloco completo con imballaggio e montaggio mobili.",
    questions: [
      { label: "Metratura immobile?", options: [
        { text: "Piccolo (< 80 mq)", multiplier: 1.0 },
        { text: "Medio (80-150 mq)", multiplier: 1.2 },
        { text: "Grande (> 150 mq)", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "srv_ape", 
    parent: "srv_certificazioni", 
    name: "APE - Attestato Prestazione Energetica", 
    icon: "fa-certificate", 
    basePrice: 150, 
    unit: "intervento",
    category: "servizi",
    description: "Redazione Attestato Prestazione Energetica.",
    questions: [
      { label: "Tipo di immobile?", options: [
        { text: "Appartamento", multiplier: 1.0 },
        { text: "Villa/Casa indipendente", multiplier: 1.2 }
      ]}
    ]
  },
  { 
    id: "srv_dichiarazione_conformita", 
    parent: "srv_certificazioni", 
    name: "Dichiarazione di Conformità Impianto", 
    icon: "fa-file-check", 
    basePrice: 200, 
    unit: "intervento",
    category: "servizi",
    description: "Dichiarazione di Conformità per impianti.",
    questions: [
      { label: "Tipo di impianto?", options: [
        { text: "Elettrico", multiplier: 1.0 },
        { text: "Gas", multiplier: 1.1 },
        { text: "Entrambi", multiplier: 1.5 }
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
