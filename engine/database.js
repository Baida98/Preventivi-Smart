/**
 * Preventivi-Smart Pro v9.0 — Database Mestieri & Scenari
 * 25+ Scenari di intervento specifici con domande mirate e engagement massimo
 */

// ===== COEFFICIENTI REGIONALI =====
export const REGIONAL_COEFFICIENTS = {
  "Lombardia": 1.25, "Piemonte": 1.08, "Veneto": 1.12, "Emilia-Romagna": 1.10,
  "Liguria": 1.05, "Friuli-Venezia Giulia": 1.03, "Trentino-Alto Adige": 1.15,
  "Valle d'Aosta": 1.10, "Lazio": 1.15, "Toscana": 1.05, "Marche": 1.00,
  "Umbria": 0.97, "Abruzzo": 0.95, "Campania": 0.95, "Puglia": 0.88,
  "Sicilia": 0.85, "Sardegna": 0.92, "Calabria": 0.80, "Basilicata": 0.82,
  "Molise": 0.78
};

// ===== COEFFICIENTI QUALITÀ =====
export const QUALITY_MULTIPLIERS = {
  economica: 0.75,
  standard: 1.00,
  premium: 1.35,
  lusso: 1.75
};

// ===== DATABASE 25+ SCENARI INTERVENTO =====
export const TRADES_DATABASE = [
  // ===== IDRAULICA (5 scenari) =====
  {
    id: "idraulica_perdita",
    name: "Tubo che Perde",
    category: "impianti",
    icon: "fa-droplet",
    color: "#0ea5e9",
    colorBg: "rgba(14,165,233,0.1)",
    description: "Perdita d'acqua da tubo o raccordo",
    basePrice: 150,
    unit: "intervento",
    urgencyMultiplier: 1.5,
    complexity: "media",
    questions: [
      {
        id: "perdita_location",
        label: "Dove si trova la perdita?",
        type: "select",
        options: [
          { value: "sotto_lavandino", label: "Sotto il lavandino (facile accesso)", multiplier: 0.9 },
          { value: "muro", label: "Nel muro (difficile accesso)", multiplier: 1.3 },
          { value: "bagno", label: "In bagno (accesso medio)", multiplier: 1.0 },
          { value: "cantina", label: "In cantina/seminterrato", multiplier: 0.85 }
        ]
      },
      {
        id: "perdita_quantita",
        label: "Quanto perde?",
        type: "select",
        options: [
          { value: "goccia", label: "Goccia ogni 10 secondi", multiplier: 0.7 },
          { value: "moderata", label: "Getto moderato", multiplier: 1.0 },
          { value: "abbondante", label: "Getto abbondante", multiplier: 1.4 },
          { value: "allagamento", label: "Allagamento in corso!", multiplier: 2.0 }
        ]
      },
      {
        id: "perdita_tipo_tubo",
        label: "Tipo di tubo?",
        type: "select",
        options: [
          { value: "rame", label: "Rame", multiplier: 1.2 },
          { value: "plastica", label: "Plastica (PVC/PE)", multiplier: 0.9 },
          { value: "acciaio", label: "Acciaio zincato", multiplier: 1.1 },
          { value: "non_so", label: "Non so", multiplier: 1.0 }
        ]
      },
      {
        id: "perdita_urgenza",
        label: "Quanto è urgente?",
        type: "select",
        options: [
          { value: "non_urgente", label: "Può aspettare qualche giorno", multiplier: 0.7 },
          { value: "entro_settimana", label: "Entro questa settimana", multiplier: 1.0 },
          { value: "domani", label: "Domani se possibile", multiplier: 1.3 },
          { value: "oggi", label: "Oggi stesso (emergenza)", multiplier: 2.0 }
        ]
      }
    ]
  },

  {
    id: "idraulica_scarico",
    name: "Scarico Intasato",
    category: "impianti",
    icon: "fa-toilet",
    color: "#8b5cf6",
    colorBg: "rgba(139,92,246,0.1)",
    description: "Lavandino, doccia o WC intasato",
    basePrice: 120,
    unit: "intervento",
    urgencyMultiplier: 1.3,
    complexity: "bassa",
    questions: [
      {
        id: "scarico_dove",
        label: "Quale scarico è intasato?",
        type: "select",
        options: [
          { value: "lavandino", label: "Lavandino cucina", multiplier: 0.9 },
          { value: "doccia", label: "Doccia/vasca", multiplier: 1.1 },
          { value: "wc", label: "WC", multiplier: 1.3 },
          { value: "colonna", label: "Colonna principale", multiplier: 1.8 }
        ]
      },
      {
        id: "scarico_sintomi",
        label: "Quali sono i sintomi?",
        type: "select",
        options: [
          { value: "lento", label: "Scarica lentamente", multiplier: 0.8 },
          { value: "bloccato", label: "Completamente bloccato", multiplier: 1.2 },
          { value: "odore", label: "Odore cattivo", multiplier: 1.0 },
          { value: "rigurgito", label: "Rigurgito di acqua sporca", multiplier: 1.5 }
        ]
      },
      {
        id: "scarico_frequenza",
        label: "Da quanto tempo?",
        type: "select",
        options: [
          { value: "oggi", label: "Oggi", multiplier: 1.0 },
          { value: "giorni", label: "Ultimi 2-3 giorni", multiplier: 0.95 },
          { value: "settimane", label: "Settimane", multiplier: 1.2 },
          { value: "ricorrente", label: "Ricorrente da mesi", multiplier: 1.4 }
        ]
      }
    ]
  },

  {
    id: "idraulica_caldaia",
    name: "Caldaia Rotta",
    category: "impianti",
    icon: "fa-fire",
    color: "#ef4444",
    colorBg: "rgba(239,68,68,0.1)",
    description: "Caldaia che non scalda o perde",
    basePrice: 250,
    unit: "intervento",
    urgencyMultiplier: 2.0,
    complexity: "alta",
    questions: [
      {
        id: "caldaia_problema",
        label: "Qual è il problema?",
        type: "select",
        options: [
          { value: "no_caldo", label: "Non scalda l'acqua", multiplier: 1.0 },
          { value: "perde", label: "Perde acqua", multiplier: 1.3 },
          { value: "rumore", label: "Fa strani rumori", multiplier: 1.1 },
          { value: "accensione", label: "Non si accende", multiplier: 1.4 }
        ]
      },
      {
        id: "caldaia_eta",
        label: "Quanti anni ha la caldaia?",
        type: "select",
        options: [
          { value: "nuovo", label: "Meno di 3 anni", multiplier: 0.9 },
          { value: "medio", label: "3-10 anni", multiplier: 1.0 },
          { value: "vecchio", label: "10-20 anni", multiplier: 1.2 },
          { value: "molto_vecchio", label: "Più di 20 anni", multiplier: 1.5 }
        ]
      },
      {
        id: "caldaia_urgenza",
        label: "È inverno?",
        type: "select",
        options: [
          { value: "estate", label: "No, è estate/primavera", multiplier: 0.8 },
          { value: "autunno", label: "Autunno/inizio inverno", multiplier: 1.2 },
          { value: "inverno", label: "Sì, pieno inverno", multiplier: 2.0 }
        ]
      }
    ]
  },

  {
    id: "idraulica_rubinetto",
    name: "Rubinetto che Perde",
    category: "impianti",
    icon: "fa-faucet",
    color: "#06b6d4",
    colorBg: "rgba(6,182,212,0.1)",
    description: "Rubinetto che gocciola o non chiude",
    basePrice: 80,
    unit: "intervento",
    urgencyMultiplier: 1.0,
    complexity: "bassa",
    questions: [
      {
        id: "rubinetto_tipo",
        label: "Tipo di rubinetto?",
        type: "select",
        options: [
          { value: "monocomando", label: "Monocomando (una leva)", multiplier: 0.9 },
          { value: "bicomando", label: "Bicomando (due manopole)", multiplier: 1.0 },
          { value: "termostatico", label: "Termostatico", multiplier: 1.2 },
          { value: "moderno", label: "Moderno/design", multiplier: 1.3 }
        ]
      },
      {
        id: "rubinetto_perdita",
        label: "Come perde?",
        type: "select",
        options: [
          { value: "goccia", label: "Goccia dal beccuccio", multiplier: 0.8 },
          { value: "sotto", label: "Perde da sotto", multiplier: 1.1 },
          { value: "non_chiude", label: "Non chiude completamente", multiplier: 0.9 },
          { value: "sprizza", label: "Sprizza acqua", multiplier: 1.2 }
        ]
      }
    ]
  },

  {
    id: "idraulica_bagno",
    name: "Rifacimento Bagno",
    category: "finiture",
    icon: "fa-bath",
    color: "#3b82f6",
    colorBg: "rgba(59,130,246,0.1)",
    description: "Ristrutturazione completa bagno",
    basePrice: 3500,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "molto_alta",
    questions: [
      {
        id: "bagno_metratura",
        label: "Metratura bagno?",
        type: "select",
        options: [
          { value: "piccolo", label: "Piccolo (2-3 mq)", multiplier: 0.9 },
          { value: "medio", label: "Medio (3-5 mq)", multiplier: 1.0 },
          { value: "grande", label: "Grande (5-8 mq)", multiplier: 1.1 },
          { value: "suite", label: "Suite bagno (8+ mq)", multiplier: 1.3 }
        ]
      },
      {
        id: "bagno_lavori",
        label: "Cosa include il rifacimento?",
        type: "select",
        options: [
          { value: "piastrelle", label: "Solo piastrelle", multiplier: 0.7 },
          { value: "impianti", label: "Impianti + piastrelle", multiplier: 1.2 },
          { value: "completo", label: "Completo (muri, impianti, arredo)", multiplier: 1.5 },
          { value: "lusso", label: "Lusso con jacuzzi/sauna", multiplier: 2.0 }
        ]
      }
    ]
  },

  // ===== ELETTRICITÀ (5 scenari) =====
  {
    id: "elettricita_corto",
    name: "Corto Circuito",
    category: "impianti",
    icon: "fa-bolt",
    color: "#fbbf24",
    colorBg: "rgba(251,191,36,0.1)",
    description: "Mancanza di corrente, interruttore scatta",
    basePrice: 100,
    unit: "intervento",
    urgencyMultiplier: 1.8,
    complexity: "media",
    questions: [
      {
        id: "corto_sintomi",
        label: "Cosa è successo?",
        type: "select",
        options: [
          { value: "scatta", label: "L'interruttore scatta", multiplier: 1.0 },
          { value: "manca_corrente", label: "Manca corrente in una stanza", multiplier: 1.1 },
          { value: "tutto_buio", label: "Tutta la casa al buio", multiplier: 1.4 },
          { value: "odore_bruciato", label: "Odore di bruciato", multiplier: 2.0 }
        ]
      },
      {
        id: "corto_apparecchio",
        label: "Quale apparecchio era acceso?",
        type: "select",
        options: [
          { value: "nessuno", label: "Nessuno in particolare", multiplier: 1.0 },
          { value: "lavatrice", label: "Lavatrice", multiplier: 1.1 },
          { value: "forno", label: "Forno/fornelli", multiplier: 1.2 },
          { value: "riscaldamento", label: "Riscaldamento/climatizzazione", multiplier: 1.1 }
        ]
      },
      {
        id: "corto_riprova",
        label: "Hai riacceso l'interruttore?",
        type: "select",
        options: [
          { value: "no", label: "No, ho paura", multiplier: 1.3 },
          { value: "si_scatta", label: "Sì, ma scatta subito", multiplier: 1.2 },
          { value: "si_funziona", label: "Sì, e funziona", multiplier: 0.8 }
        ]
      }
    ]
  },

  {
    id: "elettricita_presa",
    name: "Presa/Interruttore Rotto",
    category: "impianti",
    icon: "fa-plug",
    color: "#f97316",
    colorBg: "rgba(249,115,22,0.1)",
    description: "Presa o interruttore non funziona",
    basePrice: 60,
    unit: "intervento",
    urgencyMultiplier: 1.1,
    complexity: "bassa",
    questions: [
      {
        id: "presa_tipo",
        label: "È una presa o un interruttore?",
        type: "select",
        options: [
          { value: "presa", label: "Presa", multiplier: 1.0 },
          { value: "interruttore", label: "Interruttore", multiplier: 0.9 },
          { value: "entrambi", label: "Modulo combinato", multiplier: 1.1 }
        ]
      },
      {
        id: "presa_problema",
        label: "Qual è il problema?",
        type: "select",
        options: [
          { value: "non_funziona", label: "Non funziona", multiplier: 1.0 },
          { value: "scossa", label: "Dà scossa", multiplier: 1.5 },
          { value: "bruciata", label: "Bruciata/annerita", multiplier: 1.3 },
          { value: "allentata", label: "Allentata/traballante", multiplier: 0.9 }
        ]
      }
    ]
  },

  {
    id: "elettricita_lampada",
    name: "Lampadina/Plafoniera",
    category: "finiture",
    icon: "fa-lightbulb",
    color: "#fcd34d",
    colorBg: "rgba(252,211,77,0.1)",
    description: "Lampadina non accende, plafoniera rotta",
    basePrice: 50,
    unit: "intervento",
    urgencyMultiplier: 1.0,
    complexity: "bassa",
    questions: [
      {
        id: "lampada_tipo",
        label: "Tipo di illuminazione?",
        type: "select",
        options: [
          { value: "lampadina", label: "Lampadina singola", multiplier: 0.8 },
          { value: "plafoniera", label: "Plafoniera", multiplier: 1.1 },
          { value: "applique", label: "Applique", multiplier: 1.0 },
          { value: "faretti", label: "Faretti/downlight", multiplier: 1.2 }
        ]
      },
      {
        id: "lampada_problema",
        label: "Qual è il problema?",
        type: "select",
        options: [
          { value: "non_accende", label: "Non accende", multiplier: 1.0 },
          { value: "sfarfalla", label: "Sfarfalla/lampeggia", multiplier: 1.1 },
          { value: "rotta", label: "Rotta/danneggiata", multiplier: 1.2 }
        ]
      }
    ]
  },

  {
    id: "elettricita_impianto",
    name: "Rifacimento Impianto Elettrico",
    category: "impianti",
    icon: "fa-wires",
    color: "#ec4899",
    colorBg: "rgba(236,72,153,0.1)",
    description: "Rifacimento completo impianto elettrico",
    basePrice: 2500,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "molto_alta",
    questions: [
      {
        id: "impianto_metratura",
        label: "Metratura da rifacimento?",
        type: "select",
        options: [
          { value: "piccolo", label: "Piccolo (50-80 mq)", multiplier: 0.9 },
          { value: "medio", label: "Medio (80-150 mq)", multiplier: 1.0 },
          { value: "grande", label: "Grande (150-250 mq)", multiplier: 1.1 },
          { value: "molto_grande", label: "Molto grande (250+ mq)", multiplier: 1.2 }
        ]
      },
      {
        id: "impianto_tipo_edificio",
        label: "Tipo di edificio?",
        type: "select",
        options: [
          { value: "appartamento", label: "Appartamento", multiplier: 1.0 },
          { value: "casa", label: "Casa indipendente", multiplier: 1.1 },
          { value: "villa", label: "Villa", multiplier: 1.2 },
          { value: "commerciale", label: "Locale commerciale", multiplier: 1.4 }
        ]
      }
    ]
  },

  // ===== MURATURA (4 scenari) =====
  {
    id: "muratura_crepa",
    name: "Crepa nel Muro",
    category: "strutture",
    icon: "fa-burst",
    color: "#a16207",
    colorBg: "rgba(161,98,7,0.1)",
    description: "Crepa, spaccatura o lesione nel muro",
    basePrice: 150,
    unit: "metro",
    urgencyMultiplier: 1.2,
    complexity: "media",
    questions: [
      {
        id: "crepa_dimensione",
        label: "Dimensione della crepa?",
        type: "select",
        options: [
          { value: "sottile", label: "Sottile (< 2mm)", multiplier: 0.8 },
          { value: "media", label: "Media (2-5mm)", multiplier: 1.0 },
          { value: "larga", label: "Larga (5-10mm)", multiplier: 1.3 },
          { value: "molto_larga", label: "Molto larga (> 10mm)", multiplier: 1.6 }
        ]
      },
      {
        id: "crepa_umidita",
        label: "Il muro è umido?",
        type: "select",
        options: [
          { value: "no", label: "No, asciutto", multiplier: 0.9 },
          { value: "leggermente", label: "Leggermente", multiplier: 1.2 },
          { value: "molto", label: "Molto umido", multiplier: 1.5 },
          { value: "muffa", label: "C'è muffa", multiplier: 1.7 }
        ]
      }
    ]
  },

  {
    id: "muratura_umidita",
    name: "Umidità e Muffa",
    category: "strutture",
    icon: "fa-water",
    color: "#0891b2",
    colorBg: "rgba(8,145,178,0.1)",
    description: "Muri umidi, muffa, macchie d'acqua",
    basePrice: 200,
    unit: "mq",
    urgencyMultiplier: 1.4,
    complexity: "alta",
    questions: [
      {
        id: "umidita_tipo",
        label: "Tipo di umidità?",
        type: "select",
        options: [
          { value: "risalita", label: "Risalita dal terreno", multiplier: 1.3 },
          { value: "infiltrazione", label: "Infiltrazione da esterno", multiplier: 1.4 },
          { value: "condensa", label: "Condensa (interno)", multiplier: 0.9 }
        ]
      },
      {
        id: "umidita_estensione",
        label: "Quanto è estesa?",
        type: "select",
        options: [
          { value: "piccola", label: "Piccola zona (< 1 mq)", multiplier: 0.8 },
          { value: "media", label: "Media (1-5 mq)", multiplier: 1.0 },
          { value: "grande", label: "Grande (5-20 mq)", multiplier: 1.3 },
          { value: "molto_grande", label: "Molto estesa (> 20 mq)", multiplier: 1.6 }
        ]
      }
    ]
  },

  {
    id: "muratura_intonaco",
    name: "Intonaco Scrostato",
    category: "finiture",
    icon: "fa-paint-roller",
    color: "#d97706",
    colorBg: "rgba(217,119,6,0.1)",
    description: "Intonaco che si scroста, cade a pezzi",
    basePrice: 180,
    unit: "mq",
    urgencyMultiplier: 1.1,
    complexity: "media",
    questions: [
      {
        id: "intonaco_estensione",
        label: "Quanto intonaco manca?",
        type: "select",
        options: [
          { value: "piccoli_pezzi", label: "Piccoli pezzi", multiplier: 0.8 },
          { value: "zone", label: "Alcune zone", multiplier: 1.0 },
          { value: "parete", label: "Intera parete", multiplier: 1.2 },
          { value: "piu_pareti", label: "Più pareti", multiplier: 1.4 }
        ]
      }
    ]
  },

  {
    id: "muratura_pittura",
    name: "Imbiancatura/Pittura",
    category: "finiture",
    icon: "fa-paint-roller",
    color: "#f43f5e",
    colorBg: "rgba(244,63,94,0.1)",
    description: "Pittura pareti, soffitti, porte",
    basePrice: 15,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "bassa",
    questions: [
      {
        id: "pittura_tipo",
        label: "Tipo di pittura?",
        type: "select",
        options: [
          { value: "semplice", label: "Semplice tinta unita", multiplier: 0.9 },
          { value: "effetto", label: "Con effetto/texture", multiplier: 1.2 },
          { value: "antimuffa", label: "Antimuffa", multiplier: 1.3 }
        ]
      },
      {
        id: "pittura_metratura",
        label: "Metratura da dipingere?",
        type: "select",
        options: [
          { value: "piccola", label: "Piccola (< 50 mq)", multiplier: 1.1 },
          { value: "media", label: "Media (50-150 mq)", multiplier: 1.0 },
          { value: "grande", label: "Grande (150-300 mq)", multiplier: 0.95 }
        ]
      }
    ]
  },

  // ===== PAVIMENTI (3 scenari) =====
  {
    id: "pavimenti_posa",
    name: "Posa Pavimenti",
    category: "finiture",
    icon: "fa-th-large",
    color: "#6366f1",
    colorBg: "rgba(99,102,241,0.1)",
    description: "Posa piastrelle, gres, parquet",
    basePrice: 35,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "media",
    questions: [
      {
        id: "pavimento_tipo",
        label: "Tipo di pavimento?",
        type: "select",
        options: [
          { value: "ceramica", label: "Ceramica/Gres", multiplier: 1.0 },
          { value: "parquet", label: "Parquet", multiplier: 1.3 },
          { value: "laminato", label: "Laminato", multiplier: 0.9 },
          { value: "marmo", label: "Marmo/Pietra", multiplier: 1.4 }
        ]
      },
      {
        id: "pavimento_demolizione",
        label: "Serve demolire il vecchio?",
        type: "select",
        options: [
          { value: "no", label: "No, superficie nuova", multiplier: 0.8 },
          { value: "parziale", label: "Parziale", multiplier: 1.1 },
          { value: "totale", label: "Totale", multiplier: 1.3 }
        ]
      }
    ]
  },

  {
    id: "pavimenti_riparazione",
    name: "Riparazione Pavimento",
    category: "finiture",
    icon: "fa-hammer",
    color: "#8b5cf6",
    colorBg: "rgba(139,92,246,0.1)",
    description: "Piastrella rotta, crepa, scrostamento",
    basePrice: 100,
    unit: "intervento",
    urgencyMultiplier: 1.1,
    complexity: "bassa",
    questions: [
      {
        id: "riparazione_danno",
        label: "Tipo di danno?",
        type: "select",
        options: [
          { value: "piastrella", label: "Una piastrella rotta", multiplier: 1.0 },
          { value: "piu_piastrelle", label: "Più piastrelle", multiplier: 1.2 },
          { value: "crepa", label: "Crepa nel pavimento", multiplier: 1.3 }
        ]
      }
    ]
  },

  {
    id: "pavimenti_pulizia",
    name: "Pulizia Post-Cantiere",
    category: "servizi",
    icon: "fa-broom",
    color: "#14b8a6",
    colorBg: "rgba(20,184,166,0.1)",
    description: "Pulizia e smaltimento materiali",
    basePrice: 8.5,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "bassa",
    questions: [
      {
        id: "pulizia_metratura",
        label: "Metratura da pulire?",
        type: "select",
        options: [
          { value: "piccola", label: "Piccola (< 50 mq)", multiplier: 1.2 },
          { value: "media", label: "Media (50-150 mq)", multiplier: 1.0 },
          { value: "grande", label: "Grande (150-300 mq)", multiplier: 0.9 }
        ]
      }
    ]
  },

  // ===== ESTERNI (3 scenari) =====
  {
    id: "esterni_tetto",
    name: "Riparazione Tetto",
    category: "esterni",
    icon: "fa-home",
    color: "#dc2626",
    colorBg: "rgba(220,38,38,0.1)",
    description: "Perdita dal tetto, tegole rotte",
    basePrice: 120,
    unit: "mq",
    urgencyMultiplier: 1.6,
    complexity: "alta",
    questions: [
      {
        id: "tetto_tipo",
        label: "Tipo di copertura?",
        type: "select",
        options: [
          { value: "tegole", label: "Tegole in laterizio", multiplier: 1.0 },
          { value: "coppi", label: "Coppi", multiplier: 1.1 },
          { value: "ardesia", label: "Ardesia", multiplier: 1.3 },
          { value: "lamiera", label: "Lamiera", multiplier: 0.9 }
        ]
      },
      {
        id: "tetto_problema",
        label: "Qual è il problema?",
        type: "select",
        options: [
          { value: "perdita", label: "Perdita d'acqua", multiplier: 1.3 },
          { value: "tegole_rotte", label: "Tegole rotte", multiplier: 1.0 },
          { value: "muschio", label: "Muschio/alghe", multiplier: 0.8 }
        ]
      }
    ]
  },

  {
    id: "esterni_giardino",
    name: "Giardinaggio",
    category: "esterni",
    icon: "fa-seedling",
    color: "#22c55e",
    colorBg: "rgba(34,197,94,0.1)",
    description: "Manutenzione giardino, potatura, semina",
    basePrice: 22,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "bassa",
    questions: [
      {
        id: "giardino_tipo_lavoro",
        label: "Tipo di lavoro?",
        type: "select",
        options: [
          { value: "manutenzione", label: "Manutenzione ordinaria", multiplier: 0.9 },
          { value: "potatura", label: "Potatura alberi/siepi", multiplier: 1.1 },
          { value: "semina", label: "Semina/rinvaso", multiplier: 1.0 },
          { value: "progettazione", label: "Progettazione nuovo giardino", multiplier: 1.5 }
        ]
      }
    ]
  },

  {
    id: "esterni_pavimentazione",
    name: "Pavimentazione Esterna",
    category: "esterni",
    icon: "fa-road",
    color: "#64748b",
    colorBg: "rgba(100,116,139,0.1)",
    description: "Posa piastrelle, massetto, asfalto",
    basePrice: 55,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "media",
    questions: [
      {
        id: "esterno_tipo",
        label: "Tipo di pavimentazione?",
        type: "select",
        options: [
          { value: "piastrelle", label: "Piastrelle", multiplier: 1.0 },
          { value: "massetto", label: "Massetto in cemento", multiplier: 0.8 },
          { value: "asfalto", label: "Asfalto", multiplier: 0.9 },
          { value: "pietra", label: "Pietra naturale", multiplier: 1.3 }
        ]
      }
    ]
  }
];

// ===== FUNZIONI HELPER =====
export function getAllTrades() {
  return TRADES_DATABASE;
}

export function getTradeById(id) {
  return TRADES_DATABASE.find(t => t.id === id);
}

export function getTradesByCategory(category) {
  return TRADES_DATABASE.filter(t => t.category === category);
}

export function calculateAnswerMultiplier(tradeId, answers) {
  let multiplier = 1.0;
  const trade = getTradeById(tradeId);
  if (!trade) return multiplier;

  trade.questions.forEach(question => {
    const answer = answers[question.id];
    if (answer) {
      const option = question.options.find(opt => opt.value === answer);
      if (option && option.multiplier) {
        multiplier *= option.multiplier;
      }
    }
  });

  return Math.max(0.5, Math.min(multiplier, 2.5));
}

export function calculateFinalPrice(tradeId, quantity, region, quality, answers) {
  const trade = getTradeById(tradeId);
  if (!trade) return 0;

  const basePrice = trade.basePrice;
  const regionalCoeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  const qualityCoeff = QUALITY_MULTIPLIERS[quality] || 1.0;
  const answerMult = calculateAnswerMultiplier(tradeId, answers);
  const urgencyMult = trade.urgencyMultiplier || 1.0;

  const finalPrice = basePrice * quantity * regionalCoeff * qualityCoeff * answerMult * urgencyMult;
  return Math.round(finalPrice);
}

export function calculateCostBreakdown(tradeId, totalPrice) {
  return {
    manodopera: Math.round(totalPrice * 0.55),
    materiali: Math.round(totalPrice * 0.40)
  };
}
