/**
 * Preventivi-Smart Pro v24.0 — Database Completo Professionale
 * Domande dinamiche ultra-specifiche per ogni tipo di lavoro
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
  { id: "idr_installazioni", parent: "idraulico", name: "Nuove Installazioni", icon: "fa-wrench", color: "#1e40af" },
  
  // ELETTRICISTA
  { id: "ele_emergenza", parent: "elettricista", name: "Emergenza / Guasti", icon: "fa-triangle-exclamation", color: "#f59e0b" },
  { id: "ele_installazioni", parent: "elettricista", name: "Nuove Installazioni", icon: "fa-plug", color: "#fbbf24" },
  { id: "ele_manutenzione", parent: "elettricista", name: "Manutenzione", icon: "fa-screwdriver", color: "#fcd34d" },

  // MURATORE
  { id: "mur_opere", parent: "muratore", name: "Opere Murarie", icon: "fa-wall", color: "#8b5cf6" },
  { id: "mur_ripristino", parent: "muratore", name: "Ripristino Strutturale", icon: "fa-hammer", color: "#a78bfa" },
  { id: "mur_demolizione", parent: "muratore", name: "Demolizione", icon: "fa-explosion", color: "#c4b5fd" },

  // PITTORE
  { id: "pit_tinteggio", parent: "pittore", name: "Tinteggiatura", icon: "fa-brush", color: "#ec4899" },
  { id: "pit_decorazioni", parent: "pittore", name: "Decorazioni", icon: "fa-wand-magic-sparkles", color: "#f472b6" },
  { id: "pit_specializzati", parent: "pittore", name: "Lavori Specializzati", icon: "fa-palette", color: "#fbcfe8" },

  // SERRAMENTI / FABBRO
  { id: "ser_emergenza", parent: "serramenti", name: "Emergenza Apertura", icon: "fa-unlock", color: "#0ea5e9" },
  { id: "ser_riparazioni", parent: "serramenti", name: "Riparazione Infissi", icon: "fa-window-restore", color: "#38bdf8" },
  { id: "ser_installazioni", parent: "serramenti", name: "Nuove Installazioni", icon: "fa-door-open", color: "#7dd3fc" },

  // SERVIZI
  { id: "srv_giardino", parent: "servizi", name: "Giardinaggio", icon: "fa-leaf", color: "#10b981" },
  { id: "srv_pulizie", parent: "servizi", name: "Pulizie Professionali", icon: "fa-broom", color: "#34d399" },
  { id: "srv_traslochi", parent: "servizi", name: "Traslochi", icon: "fa-truck", color: "#6ee7b7" }
];

export const TRADES_DATABASE = [
  // ========== IDRAULICO ==========
  // GUASTI
  { 
    id: "idr_perdita_acqua", parent: "idr_guasti", name: "Perdita d'Acqua", icon: "fa-droplet", 
    basePrice: 160, unit: "intervento", 
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
    id: "idr_scarico_otturato", parent: "idr_guasti", name: "Scarico Otturato", icon: "fa-faucet-drip", 
    basePrice: 120, unit: "intervento", 
    description: "Disostruzione scarichi lavandini, WC o docce.",
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
  // CALDAIA
  { 
    id: "idr_caldaia_blocco", parent: "idr_caldaia", name: "Caldaia in Blocco", icon: "fa-fire-burner", 
    basePrice: 150, unit: "intervento", 
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
    id: "idr_manutenzione_caldaia", parent: "idr_caldaia", name: "Manutenzione Caldaia", icon: "fa-wrench", 
    basePrice: 80, unit: "intervento", 
    description: "Pulizia e manutenzione ordinaria caldaia.",
    questions: [
      { label: "Tipo di caldaia?", options: [
        { text: "Murale", multiplier: 1.0 },
        { text: "Basamento", multiplier: 1.2 },
        { text: "Condensazione", multiplier: 1.1 }
      ]},
      { label: "Ultima manutenzione?", options: [
        { text: "Entro 1 anno", multiplier: 1.0 },
        { text: "1-2 anni fa", multiplier: 1.1 },
        { text: "Oltre 2 anni", multiplier: 1.3 }
      ]}
    ]
  },

  // ========== ELETTRICISTA ==========
  // EMERGENZA
  { 
    id: "ele_corto_circuito", parent: "ele_emergenza", name: "Corto Circuito / Blackout", icon: "fa-bolt-lightning", 
    basePrice: 180, unit: "intervento", 
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
    id: "ele_salvavita_rotto", parent: "ele_emergenza", name: "Sostituzione Salvavita / Quadro", icon: "fa-square-check", 
    basePrice: 140, unit: "intervento", 
    description: "Sostituzione interruttore differenziale o magnetotermico.",
    questions: [
      { label: "Componente da sostituire?", options: [
        { text: "Singolo interruttore", multiplier: 1.0 },
        { text: "Intero quadro elettrico", multiplier: 3.5 },
        { text: "Più componenti", multiplier: 2.0 }
      ]},
      { label: "Tipo di quadro?", options: [
        { text: "Vecchio (pre-2000)", multiplier: 1.3 },
        { text: "Moderno", multiplier: 1.0 },
        { text: "Blindato/Speciale", multiplier: 1.5 }
      ]}
    ]
  },
  // INSTALLAZIONI
  { 
    id: "ele_prese_interruttori", parent: "ele_installazioni", name: "Installazione Prese/Interruttori", icon: "fa-plug", 
    basePrice: 50, unit: "punto", 
    description: "Installazione nuove prese o interruttori.",
    questions: [
      { label: "Numero di punti?", options: [
        { text: "1-2 punti", multiplier: 1.0 },
        { text: "3-5 punti", multiplier: 0.9 },
        { text: "6+ punti", multiplier: 0.8 }
      ]},
      { label: "Tipo di installazione?", options: [
        { text: "A vista", multiplier: 1.0 },
        { text: "Sottotraccia", multiplier: 1.5 },
        { text: "Scatole già presenti", multiplier: 0.7 }
      ]}
    ]
  },

  // ========== MURATORE ==========
  // OPERE
  { 
    id: "mur_muro_mattoni", parent: "mur_opere", name: "Costruzione Muro", icon: "fa-wall", 
    basePrice: 45, unit: "mq", 
    description: "Realizzazione parete in mattoni o forati.",
    questions: [
      { label: "Tipo di materiale?", options: [
        { text: "Forati standard", multiplier: 1.0 },
        { text: "Mattoni pieni", multiplier: 1.4 },
        { text: "Cartongesso", multiplier: 0.8 }
      ]},
      { label: "Altezza della parete?", options: [
        { text: "Fino a 2.5m", multiplier: 1.0 },
        { text: "2.5-4m", multiplier: 1.2 },
        { text: "Oltre 4m", multiplier: 1.5 }
      ]}
    ]
  },
  { 
    id: "mur_intonaco", parent: "mur_opere", name: "Intonaco e Rasatura", icon: "fa-trowel", 
    basePrice: 18, unit: "mq", 
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
  // RIPRISTINO
  { 
    id: "mur_crepe_infiltrazioni", parent: "mur_ripristino", name: "Riparazione Crepe/Infiltrazioni", icon: "fa-droplet-slash", 
    basePrice: 35, unit: "metro", 
    description: "Sigillatura crepe e trattamento infiltrazioni.",
    questions: [
      { label: "Ampiezza della crepa?", options: [
        { text: "Sottile (< 2mm)", multiplier: 1.0 },
        { text: "Media (2-5mm)", multiplier: 1.3 },
        { text: "Larga (> 5mm)", multiplier: 1.8 }
      ]},
      { label: "Causa?", options: [
        { text: "Assestamento", multiplier: 1.0 },
        { text: "Infiltrazione d'acqua", multiplier: 1.5 },
        { text: "Cedimento strutturale", multiplier: 2.5 }
      ]}
    ]
  },

  // ========== PITTORE ==========
  // TINTEGGIO
  { 
    id: "pit_bianco", parent: "pit_tinteggio", name: "Tinteggiatura Bianca", icon: "fa-fill-drip", 
    basePrice: 12, unit: "mq", 
    description: "Tinteggiatura pareti e soffitti colore bianco.",
    questions: [
      { label: "Stato delle pareti?", options: [
        { text: "Buono", multiplier: 1.0 },
        { text: "Da rasare / Crepe", multiplier: 1.5 },
        { text: "Presenza muffa", multiplier: 1.3 }
      ]},
      { label: "Numero di mani?", options: [
        { text: "Una mano", multiplier: 0.7 },
        { text: "Due mani", multiplier: 1.0 },
        { text: "Tre mani", multiplier: 1.3 }
      ]}
    ]
  },
  { 
    id: "pit_colori", parent: "pit_tinteggio", name: "Tinteggiatura Colori", icon: "fa-palette", 
    basePrice: 14, unit: "mq", 
    description: "Tinteggiatura con colori personalizzati.",
    questions: [
      { label: "Tipo di colore?", options: [
        { text: "Colore standard", multiplier: 1.0 },
        { text: "Colore personalizzato", multiplier: 1.2 },
        { text: "Effetti speciali", multiplier: 1.5 }
      ]},
      { label: "Preparazione pareti?", options: [
        { text: "Già preparate", multiplier: 1.0 },
        { text: "Pulizia + primer", multiplier: 1.3 },
        { text: "Rasatura completa", multiplier: 1.8 }
      ]}
    ]
  },
  // DECORAZIONI
  { 
    id: "pit_stucco", parent: "pit_decorazioni", name: "Stucco Decorativo", icon: "fa-wand-magic-sparkles", 
    basePrice: 22, unit: "mq", 
    description: "Applicazione stucco decorativo e finiture.",
    questions: [
      { label: "Tipo di stucco?", options: [
        { text: "Stucco veneziano", multiplier: 1.0 },
        { text: "Stucco lucido", multiplier: 1.2 },
        { text: "Stucco effetto", multiplier: 1.4 }
      ]},
      { label: "Complessità?", options: [
        { text: "Semplice", multiplier: 1.0 },
        { text: "Media", multiplier: 1.3 },
        { text: "Complessa", multiplier: 1.6 }
      ]}
    ]
  },

  // ========== SERRAMENTI ==========
  // EMERGENZA
  { 
    id: "ser_porta_bloccata", parent: "ser_emergenza", name: "Apertura Porta / Serratura", icon: "fa-key", 
    basePrice: 150, unit: "intervento", 
    description: "Apertura porta bloccata o chiave spezzata.",
    questions: [
      { label: "Tipo di serratura?", options: [
        { text: "Standard / Cilindro europeo", multiplier: 1.0 },
        { text: "Blindata / Doppia mappa", multiplier: 1.6 },
        { text: "Elettronica / Smart", multiplier: 2.0 }
      ]},
      { label: "Urgenza?", options: [
        { text: "Normale", multiplier: 1.0 },
        { text: "Urgente (sera/notte)", multiplier: 1.5 },
        { text: "Emergenza (festivo)", multiplier: 2.0 }
      ]}
    ]
  },
  // RIPARAZIONI
  { 
    id: "ser_vetro_rotto", parent: "ser_riparazioni", name: "Sostituzione Vetro", icon: "fa-window-restore", 
    basePrice: 80, unit: "intervento", 
    description: "Sostituzione vetro rotto in finestra o porta.",
    questions: [
      { label: "Tipo di vetro?", options: [
        { text: "Vetro semplice", multiplier: 1.0 },
        { text: "Doppio vetro", multiplier: 1.8 },
        { text: "Vetro blindato", multiplier: 2.5 }
      ]},
      { label: "Dimensione?", options: [
        { text: "Piccolo (< 1mq)", multiplier: 1.0 },
        { text: "Medio (1-2mq)", multiplier: 1.3 },
        { text: "Grande (> 2mq)", multiplier: 1.6 }
      ]}
    ]
  },

  // ========== SERVIZI ==========
  // GIARDINAGGIO
  { 
    id: "srv_taglio_erba", parent: "srv_giardino", name: "Taglio Erba", icon: "fa-scissors", 
    basePrice: 0.8, unit: "mq", 
    description: "Manutenzione prato e taglio erba.",
    questions: [
      { label: "Altezza erba?", options: [
        { text: "Manutenzione regolare (5-7cm)", multiplier: 1.0 },
        { text: "Erba alta (10-15cm)", multiplier: 1.5 },
        { text: "Erba incolta (> 20cm)", multiplier: 2.0 }
      ]},
      { label: "Frequenza?", options: [
        { text: "Una tantum", multiplier: 1.0 },
        { text: "Settimanale", multiplier: 0.85 },
        { text: "Quindicinale", multiplier: 0.9 }
      ]}
    ]
  },
  { 
    id: "srv_potatura", parent: "srv_giardino", name: "Potatura Alberi/Siepi", icon: "fa-leaf", 
    basePrice: 35, unit: "ora", 
    description: "Potatura e manutenzione alberi e siepi.",
    questions: [
      { label: "Tipo di pianta?", options: [
        { text: "Siepe", multiplier: 1.0 },
        { text: "Albero piccolo", multiplier: 1.3 },
        { text: "Albero grande", multiplier: 1.8 }
      ]},
      { label: "Altezza raggiungibile?", options: [
        { text: "Fino a 3m", multiplier: 1.0 },
        { text: "3-6m", multiplier: 1.4 },
        { text: "Oltre 6m (ponteggi)", multiplier: 2.5 }
      ]}
    ]
  },
  // PULIZIE
  { 
    id: "srv_pulizia_casa", parent: "srv_pulizie", name: "Pulizia Generale Casa", icon: "fa-broom", 
    basePrice: 15, unit: "ora", 
    description: "Pulizia completa appartamento/casa.",
    questions: [
      { label: "Metratura?", options: [
        { text: "Piccola (< 50mq)", multiplier: 1.0 },
        { text: "Media (50-100mq)", multiplier: 1.2 },
        { text: "Grande (> 100mq)", multiplier: 1.4 }
      ]},
      { label: "Tipo di pulizia?", options: [
        { text: "Ordinaria", multiplier: 1.0 },
        { text: "Profonda", multiplier: 1.5 },
        { text: "Post-ristrutturazione", multiplier: 2.0 }
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
