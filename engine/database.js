/**
 * Preventivi-Smart Pro v25.0 — Database Professionale 2026
 * Tassonomia Completa e Logica per Protezione Economica
 * Dati di Mercato Aggiornati ISTAT 2025/2026
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

// ===== MACRO CATEGORIE =====
export const MACRO_CATEGORIES = [
  { 
    id: "impianti_energia", 
    name: "Impianti & Energia", 
    icon: "fa-bolt", 
    color: "#f59e0b", 
    desc: "Idraulica, Elettrico, Climatizzazione, Rinnovabili" 
  },
  { 
    id: "murarie_strutture", 
    name: "Opere Murarie & Strutture", 
    icon: "fa-hammer", 
    color: "#8b5cf6", 
    desc: "Muratura, Cartongesso, Isolamento, Demolizioni" 
  },
  { 
    id: "finiture_interni", 
    name: "Finiture & Interni", 
    icon: "fa-paint-roller", 
    color: "#ec4899", 
    desc: "Pittura, Pavimenti, Serramenti, Arredo" 
  },
  { 
    id: "esterni_giardino", 
    name: "Esterni & Giardino", 
    icon: "fa-leaf", 
    color: "#10b981", 
    desc: "Giardinaggio, Facciate, Tetti, Piscine" 
  },
  { 
    id: "servizi_professionali", 
    name: "Servizi Professionali", 
    icon: "fa-briefcase", 
    color: "#06b6d4", 
    desc: "Pulizie, Traslochi, Certificazioni, Disinfestazione" 
  }
];

// ===== SOTTO CATEGORIE =====
export const SUB_CATEGORIES = [
  // IMPIANTI & ENERGIA
  { id: "imp_idraulica", parent: "impianti_energia", name: "Idraulica", icon: "fa-faucet", color: "#3b82f6" },
  { id: "imp_elettrico", parent: "impianti_energia", name: "Elettrico", icon: "fa-plug", color: "#fbbf24" },
  { id: "imp_climatizzazione", parent: "impianti_energia", name: "Climatizzazione", icon: "fa-snowflake", color: "#60a5fa" },
  { id: "imp_rinnovabili", parent: "impianti_energia", name: "Rinnovabili", icon: "fa-sun", color: "#fcd34d" },
  
  // MURARIE & STRUTTURE
  { id: "mur_muratore", parent: "murarie_strutture", name: "Muratore", icon: "fa-wall", color: "#a78bfa" },
  { id: "mur_cartongesso", parent: "murarie_strutture", name: "Cartongesso", icon: "fa-cube", color: "#c4b5fd" },
  { id: "mur_isolamento", parent: "murarie_strutture", name: "Isolamento Termico", icon: "fa-layer-group", color: "#ddd6fe" },
  
  // FINITURE & INTERNI
  { id: "fin_pittore", parent: "finiture_interni", name: "Pittore", icon: "fa-brush", color: "#f472b6" },
  { id: "fin_pavimentista", parent: "finiture_interni", name: "Pavimentista", icon: "fa-th-large", color: "#fbcfe8" },
  { id: "fin_serramenti", parent: "finiture_interni", name: "Serramenti", icon: "fa-door-open", color: "#f9a8d4" },
  
  // ESTERNI & GIARDINO
  { id: "est_giardiniere", parent: "esterni_giardino", name: "Giardiniere", icon: "fa-clover", color: "#34d399" },
  { id: "est_facciate", parent: "esterni_giardino", name: "Facciate & Tetti", icon: "fa-house", color: "#6ee7b7" },
  
  // SERVIZI PROFESSIONALI
  { id: "srv_pulizie", parent: "servizi_professionali", name: "Pulizie", icon: "fa-broom", color: "#22d3ee" },
  { id: "srv_traslochi", parent: "servizi_professionali", name: "Traslochi", icon: "fa-truck", color: "#67e8f9" },
  { id: "srv_certificazioni", parent: "servizi_professionali", name: "Certificazioni", icon: "fa-certificate", color: "#cffafe" }
];

// ===== DATABASE COMPLETO MESTIERI =====
export const TRADES_DATABASE = [
  // ========== IMPIANTI & ENERGIA ==========
  
  // IDRAULICA
  { 
    id: "idr_riparazione_perdita", 
    parent: "imp_idraulica", 
    name: "Riparazione Perdita d'Acqua", 
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
    id: "idr_nuovo_bagno", 
    parent: "imp_idraulica", 
    name: "Nuovo Impianto Bagno", 
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
      ]},
      { label: "Stato delle tubature esistenti?", options: [
        { text: "Buono, riutilizzabili", multiplier: 1.0 },
        { text: "Parzialmente da sostituire", multiplier: 1.3 },
        { text: "Completamente nuovo", multiplier: 1.8 }
      ]}
    ]
  },
  { 
    id: "idr_caldaia_manutenzione", 
    parent: "imp_idraulica", 
    name: "Manutenzione Caldaia", 
    icon: "fa-fire", 
    basePrice: 120, 
    unit: "intervento",
    category: "impianti",
    description: "Pulizia, controllo e manutenzione ordinaria caldaia.",
    questions: [
      { label: "Tipo di caldaia?", options: [
        { text: "Murale standard", multiplier: 1.0 },
        { text: "Condensazione", multiplier: 1.1 },
        { text: "Basamento/Industriale", multiplier: 1.3 }
      ]},
      { label: "Ultima manutenzione?", options: [
        { text: "Entro 1 anno", multiplier: 1.0 },
        { text: "1-2 anni fa", multiplier: 1.1 },
        { text: "Oltre 2 anni", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "idr_pompa_calore", 
    parent: "imp_idraulica", 
    name: "Installazione Pompa di Calore", 
    icon: "fa-wind", 
    basePrice: 4500, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione pompa di calore aria-acqua per riscaldamento e raffrescamento.",
    questions: [
      { label: "Potenza richiesta?", options: [
        { text: "Piccola (fino 8 kW)", multiplier: 1.0 },
        { text: "Media (8-15 kW)", multiplier: 1.2 },
        { text: "Grande (oltre 15 kW)", multiplier: 1.5 }
      ]},
      { label: "Tipo di installazione?", options: [
        { text: "Sostituzione caldaia esistente", multiplier: 1.0 },
        { text: "Nuovo impianto", multiplier: 1.4 }
      ]}
    ]
  },

  // ELETTRICO
  { 
    id: "ele_riparazione_guasto", 
    parent: "imp_elettrico", 
    name: "Riparazione Guasto Elettrico", 
    icon: "fa-bolt-lightning", 
    basePrice: 180, 
    unit: "intervento",
    category: "impianti",
    description: "Ricerca e riparazione guasto elettrico, corto circuito, salvavita scatta.",
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
    id: "ele_rifacimento_impianto", 
    parent: "imp_elettrico", 
    name: "Rifacimento Impianto Elettrico", 
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
      ]},
      { label: "Tipo di quadro?", options: [
        { text: "Standard monofase", multiplier: 1.0 },
        { text: "Trifase", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "ele_domotica", 
    parent: "imp_elettrico", 
    name: "Impianto Domotica Smart Home", 
    icon: "fa-microchip", 
    basePrice: 2000, 
    unit: "intervento",
    category: "impianti",
    description: "Installazione sistema domotica per automazione casa intelligente.",
    questions: [
      { label: "Livello di automazione?", options: [
        { text: "Base (illuminazione, prese)", multiplier: 1.0 },
        { text: "Intermedio (+ riscaldamento, tapparelle)", multiplier: 1.5 },
        { text: "Completo (+ sicurezza, videocitofono, irrigazione)", multiplier: 2.2 }
      ]}
    ]
  },

  // CLIMATIZZAZIONE
  { 
    id: "cli_condizionatore_monosplit", 
    parent: "imp_climatizzazione", 
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
      ]},
      { label: "Tipo di installazione?", options: [
        { text: "Parete interna", multiplier: 1.0 },
        { text: "Cassettone finestra", multiplier: 1.2 },
        { text: "Soffitto/Incasso", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "cli_condizionatore_multisplit", 
    parent: "imp_climatizzazione", 
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

  // RINNOVABILI
  { 
    id: "rin_fotovoltaico", 
    parent: "imp_rinnovabili", 
    name: "Impianto Fotovoltaico", 
    icon: "fa-sun", 
    basePrice: 1800, 
    unit: "kWp",
    category: "impianti",
    description: "Installazione impianto fotovoltaico con pannelli solari.",
    questions: [
      { label: "Potenza impianto?", options: [
        { text: "Piccolo (3-4 kWp)", multiplier: 1.0 },
        { text: "Medio (5-8 kWp)", multiplier: 1.05 },
        { text: "Grande (oltre 8 kWp)", multiplier: 1.1 }
      ]},
      { label: "Con accumulo batteria?", options: [
        { text: "No, grid-tied", multiplier: 1.0 },
        { text: "Sì, con batteria", multiplier: 1.8 }
      ]}
    ]
  },
  { 
    id: "rin_wallbox_ev", 
    parent: "imp_rinnovabili", 
    name: "Installazione Wallbox Ricarica EV", 
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

  // ========== MURARIE & STRUTTURE ==========
  
  // MURATORE
  { 
    id: "mur_costruzione_parete", 
    parent: "mur_muratore", 
    name: "Costruzione Parete in Mattoni", 
    icon: "fa-wall", 
    basePrice: 45, 
    unit: "mq",
    category: "strutture",
    description: "Realizzazione parete in mattoni o forati.",
    questions: [
      { label: "Tipo di materiale?", options: [
        { text: "Forati standard", multiplier: 1.0 },
        { text: "Mattoni pieni", multiplier: 1.4 },
        { text: "Laterizio termico", multiplier: 1.2 }
      ]},
      { label: "Altezza della parete?", options: [
        { text: "Fino a 2.5m", multiplier: 1.0 },
        { text: "2.5-4m", multiplier: 1.2 },
        { text: "Oltre 4m", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "mur_intonaco_rasatura", 
    parent: "mur_muratore", 
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
      ]},
      { label: "Stato della parete?", options: [
        { text: "Buono", multiplier: 1.0 },
        { text: "Irregolare", multiplier: 1.2 },
        { text: "Molto rovinato", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "mur_massetto", 
    parent: "mur_muratore", 
    name: "Massetto Pavimentale", 
    icon: "fa-square", 
    basePrice: 22, 
    unit: "mq",
    category: "strutture",
    description: "Realizzazione massetto in cemento o autolivellante.",
    questions: [
      { label: "Tipo di massetto?", options: [
        { text: "Cemento tradizionale", multiplier: 1.0 },
        { text: "Autolivellante", multiplier: 1.2 },
        { text: "Radiante (con tubi)", multiplier: 1.8 }
      ]}
    ]
  },

  // CARTONGESSO
  { 
    id: "car_controsoffitto", 
    parent: "mur_cartongesso", 
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
    id: "car_parete_divisoria", 
    parent: "mur_cartongesso", 
    name: "Parete Divisoria Cartongesso", 
    icon: "fa-layer-group", 
    basePrice: 35, 
    unit: "mq",
    category: "strutture",
    description: "Realizzazione parete divisoria in cartongesso.",
    questions: [
      { label: "Spessore parete?", options: [
        { text: "Singolo strato (7.5 cm)", multiplier: 1.0 },
        { text: "Doppio strato (10 cm)", multiplier: 1.2 },
        { text: "Insonorizzata (12+ cm)", multiplier: 1.5 }
      ]}
    ]
  },

  // ISOLAMENTO
  { 
    id: "iso_cappotto_termico", 
    parent: "mur_isolamento", 
    name: "Cappotto Termico Esterno", 
    icon: "fa-layer-group", 
    basePrice: 55, 
    unit: "mq",
    category: "strutture",
    description: "Isolamento termico a cappotto su facciata esterna.",
    questions: [
      { label: "Tipo di isolante?", options: [
        { text: "Polistirene (EPS)", multiplier: 1.0 },
        { text: "Lana di roccia", multiplier: 1.2 },
        { text: "Sughero naturale", multiplier: 1.5 }
      ]},
      { label: "Spessore isolante?", options: [
        { text: "4-6 cm", multiplier: 1.0 },
        { text: "8-10 cm", multiplier: 1.1 },
        { text: "12+ cm", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "iso_tetto", 
    parent: "mur_isolamento", 
    name: "Isolamento Tetto", 
    icon: "fa-house", 
    basePrice: 45, 
    unit: "mq",
    category: "strutture",
    description: "Isolamento termico e acustico della copertura.",
    questions: [
      { label: "Tipo di isolante?", options: [
        { text: "Lana di vetro", multiplier: 1.0 },
        { text: "Lana di roccia", multiplier: 1.1 },
        { text: "Poliuretano spray", multiplier: 1.4 }
      ]}
    ]
  },

  // ========== FINITURE & INTERNI ==========
  
  // PITTORE
  { 
    id: "pit_tinteggiatura_interna", 
    parent: "fin_pittore", 
    name: "Tinteggiatura Interna", 
    icon: "fa-brush", 
    basePrice: 12, 
    unit: "mq",
    category: "finiture",
    description: "Tinteggiatura pareti interne con idropittura.",
    questions: [
      { label: "Preparazione superficie?", options: [
        { text: "Superficie già pronta", multiplier: 1.0 },
        { text: "Stuccatura minore", multiplier: 1.2 },
        { text: "Rasatura completa", multiplier: 1.6 }
      ]},
      { label: "Numero di mani?", options: [
        { text: "Una mano", multiplier: 0.7 },
        { text: "Due mani", multiplier: 1.0 },
        { text: "Tre mani", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "pit_tinteggiatura_esterna", 
    parent: "fin_pittore", 
    name: "Tinteggiatura Esterna", 
    icon: "fa-paint-roller", 
    basePrice: 18, 
    unit: "mq",
    category: "finiture",
    description: "Tinteggiatura facciata esterna con pittura ai silicati.",
    questions: [
      { label: "Tipo di pittura?", options: [
        { text: "Acrilica standard", multiplier: 1.0 },
        { text: "Ai silicati", multiplier: 1.3 },
        { text: "Termica/Antimuffa", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "pit_decorativo", 
    parent: "fin_pittore", 
    name: "Effetto Decorativo (Spatolato/Velatura)", 
    icon: "fa-wand-magic-sparkles", 
    basePrice: 25, 
    unit: "mq",
    category: "finiture",
    description: "Effetti decorativi su pareti (spatolato, velatura, stencil).",
    questions: [
      { label: "Tipo di effetto?", options: [
        { text: "Spatolato", multiplier: 1.0 },
        { text: "Velatura", multiplier: 1.1 },
        { text: "Stencil/Personalizzato", multiplier: 1.5 }
      ]}
    ]
  },

  // PAVIMENTISTA
  { 
    id: "pav_piastrelle_ceramica", 
    parent: "fin_pavimentista", 
    name: "Posa Piastrelle Ceramica", 
    icon: "fa-th-large", 
    basePrice: 32, 
    unit: "mq",
    category: "finiture",
    description: "Posa piastrelle ceramica, gres, maiolica.",
    questions: [
      { label: "Formato piastrelle?", options: [
        { text: "Standard (30x30, 60x60)", multiplier: 1.0 },
        { text: "Piccolo (mosaico)", multiplier: 1.5 },
        { text: "Grande (120x120+)", multiplier: 1.8 }
      ]},
      { label: "Schema di posa?", options: [
        { text: "Dritta", multiplier: 1.0 },
        { text: "Diagonale", multiplier: 1.2 },
        { text: "Spina di pesce", multiplier: 1.4 }
      ]}
    ]
  },
  { 
    id: "pav_parquet", 
    parent: "fin_pavimentista", 
    name: "Posa Parquet", 
    icon: "fa-square", 
    basePrice: 45, 
    unit: "mq",
    category: "finiture",
    description: "Posa parquet in legno massello o prefinito.",
    questions: [
      { label: "Tipo di legno?", options: [
        { text: "Prefinito", multiplier: 1.0 },
        { text: "Massello standard", multiplier: 1.3 },
        { text: "Massello pregiato", multiplier: 1.8 }
      ]},
      { label: "Preparazione sottofondo?", options: [
        { text: "Sottofondo esistente", multiplier: 1.0 },
        { text: "Nuovo massetto", multiplier: 1.4 }
      ]}
    ]
  },
  { 
    id: "pav_resina", 
    parent: "fin_pavimentista", 
    name: "Pavimento in Resina", 
    icon: "fa-droplet", 
    basePrice: 55, 
    unit: "mq",
    category: "finiture",
    description: "Realizzazione pavimento in resina epossidica o poliuretanica.",
    questions: [
      { label: "Tipo di resina?", options: [
        { text: "Epossidica standard", multiplier: 1.0 },
        { text: "Poliuretanica", multiplier: 1.2 },
        { text: "Con inserti decorativi", multiplier: 1.5 }
      ]}
    ]
  },

  // SERRAMENTI
  { 
    id: "ser_sostituzione_infissi", 
    parent: "fin_serramenti", 
    name: "Sostituzione Infissi Finestre", 
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
      ]},
      { label: "Tipo di vetro?", options: [
        { text: "Doppio standard", multiplier: 1.0 },
        { text: "Doppio basso-emissivo", multiplier: 1.2 },
        { text: "Triplo", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "ser_porte_interne", 
    parent: "fin_serramenti", 
    name: "Installazione Porte Interne", 
    icon: "fa-door-open", 
    basePrice: 280, 
    unit: "porta",
    category: "finiture",
    description: "Installazione porte interne in legno o laminato.",
    questions: [
      { label: "Tipo di porta?", options: [
        { text: "Laminato standard", multiplier: 1.0 },
        { text: "Legno massello", multiplier: 1.4 },
        { text: "Scorrevole/Pieghevole", multiplier: 1.6 }
      ]}
    ]
  },

  // ========== ESTERNI & GIARDINO ==========
  
  // GIARDINIERE
  { 
    id: "gia_manutenzione_prato", 
    parent: "est_giardiniere", 
    name: "Manutenzione Prato", 
    icon: "fa-clover", 
    basePrice: 0.8, 
    unit: "mq",
    category: "esterni",
    description: "Taglio, concimazione, trattamento prato.",
    questions: [
      { label: "Frequenza manutenzione?", options: [
        { text: "Mensile", multiplier: 1.0 },
        { text: "Quindicinale", multiplier: 1.3 },
        { text: "Settimanale", multiplier: 1.6 }
      ]}
    ]
  },
  { 
    id: "gia_potatura_piante", 
    parent: "est_giardiniere", 
    name: "Potatura Piante e Alberi", 
    icon: "fa-tree", 
    basePrice: 150, 
    unit: "intervento",
    category: "esterni",
    description: "Potatura e manutenzione piante, siepi, alberi.",
    questions: [
      { label: "Tipo di potatura?", options: [
        { text: "Leggera (mantenimento)", multiplier: 1.0 },
        { text: "Media (ringiovanimento)", multiplier: 1.3 },
        { text: "Pesante (drastica)", multiplier: 1.6 }
      ]}
    ]
  },
  { 
    id: "gia_impianto_irrigazione", 
    parent: "est_giardiniere", 
    name: "Impianto Irrigazione Automatica", 
    icon: "fa-water", 
    basePrice: 1200, 
    unit: "intervento",
    category: "esterni",
    description: "Installazione impianto irrigazione con programmatore.",
    questions: [
      { label: "Metratura giardino?", options: [
        { text: "Piccolo (< 100 mq)", multiplier: 1.0 },
        { text: "Medio (100-300 mq)", multiplier: 1.2 },
        { text: "Grande (> 300 mq)", multiplier: 1.5 }
      ]}
    ]
  },

  // FACCIATE & TETTI
  { 
    id: "fac_rifacimento_facciata", 
    parent: "est_facciate", 
    name: "Rifacimento Facciata", 
    icon: "fa-house", 
    basePrice: 65, 
    unit: "mq",
    category: "esterni",
    description: "Rifacimento completo facciata con intonaco e tinteggiatura.",
    questions: [
      { label: "Tipo di intervento?", options: [
        { text: "Intonaco + tinta", multiplier: 1.0 },
        { text: "Cappotto termico", multiplier: 1.8 },
        { text: "Rivestimento (pietra/mattone)", multiplier: 2.2 }
      ]}
    ]
  },
  { 
    id: "fac_riparazione_tetto", 
    parent: "est_facciate", 
    name: "Riparazione Tetto", 
    icon: "fa-roof", 
    basePrice: 85, 
    unit: "mq",
    category: "esterni",
    description: "Riparazione e manutenzione copertura tetto.",
    questions: [
      { label: "Tipo di copertura?", options: [
        { text: "Coppi/Tegole", multiplier: 1.0 },
        { text: "Ardesia", multiplier: 1.3 },
        { text: "Lamiera/Membrane", multiplier: 0.9 }
      ]}
    ]
  },

  // ========== SERVIZI PROFESSIONALI ==========
  
  // PULIZIE
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
    id: "srv_sanificazione", 
    parent: "srv_pulizie", 
    name: "Sanificazione Certificata", 
    icon: "fa-spray-can", 
    basePrice: 15, 
    unit: "mq",
    category: "servizi",
    description: "Sanificazione con certificazione (muffa, batteri, virus).",
    questions: [
      { label: "Tipo di sanificazione?", options: [
        { text: "Antimuffa", multiplier: 1.0 },
        { text: "Antibatterica", multiplier: 1.1 },
        { text: "Completa (certificata)", multiplier: 1.4 }
      ]}
    ]
  },

  // TRASLOCHI
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

  // CERTIFICAZIONI
  { 
    id: "srv_ape_certificato", 
    parent: "srv_certificazioni", 
    name: "APE - Attestato Prestazione Energetica", 
    icon: "fa-certificate", 
    basePrice: 150, 
    unit: "intervento",
    category: "servizi",
    description: "Redazione Attestato Prestazione Energetica per immobile.",
    questions: [
      { label: "Tipo di immobile?", options: [
        { text: "Appartamento", multiplier: 1.0 },
        { text: "Villa/Casa indipendente", multiplier: 1.2 },
        { text: "Edificio complesso", multiplier: 1.5 }
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
    description: "Dichiarazione di Conformità per impianti elettrici/gas.",
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
