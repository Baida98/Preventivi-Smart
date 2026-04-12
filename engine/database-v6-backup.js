/**
 * Database Professionale Preventivi-Smart v6.0
 * Dati aggiornati 2025/2026 basati su Prezzari Regionali e Indici DEI
 * 14 mestieri con domande tecniche avanzate e simboli FontAwesome
 */

// ===== COEFFICIENTI REGIONALI AGGIORNATI 2025/2026 =====
export const REGIONAL_COEFFICIENTS = {
  "Lombardia": 1.28,
  "Trentino-Alto Adige": 1.25,
  "Valle d'Aosta": 1.20,
  "Lazio": 1.18,
  "Veneto": 1.15,
  "Emilia-Romagna": 1.12,
  "Piemonte": 1.10,
  "Liguria": 1.10,
  "Toscana": 1.08,
  "Friuli-Venezia Giulia": 1.05,
  "Marche": 1.00,
  "Umbria": 0.98,
  "Abruzzo": 0.95,
  "Campania": 0.92,
  "Sardegna": 0.90,
  "Puglia": 0.88,
  "Sicilia": 0.85,
  "Basilicata": 0.82,
  "Calabria": 0.80,
  "Molise": 0.78
};

// ===== MOLTIPLICATORI QUALITÀ MATERIALI =====
export const QUALITY_MULTIPLIERS = {
  "economica": 0.85,
  "standard": 1.00,
  "premium": 1.35,
  "lusso": 1.75
};

// ===== MESTIERI CON DOMANDE TECNICHE AVANZATE =====
export const TRADES = [
  {
    id: "imbiancatura",
    name: "Imbiancatura",
    description: "Tinteggiatura interni ed esterni con trattamenti specifici",
    icon: "fa-paint-roller",
    color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.12)",
    unit: "mq",
    basePrice: 10.50,
    category: "finiture",
    questions: [
      {
        id: "surface_prep",
        label: "Preparazione della Superficie",
        type: "select",
        options: [
          { value: "nessuna", label: "Superficie già pronta (solo pulizia)", multiplier: 1.0 },
          { value: "stuccatura", label: "Stuccatura fori e crepe minori", multiplier: 1.20 },
          { value: "rasatura", label: "Rasatura completa (intonaco civile)", multiplier: 1.60 },
          { value: "rimozione", label: "Rimozione vecchia carta da parati", multiplier: 1.40 }
        ]
      },
      {
        id: "paint_tech",
        label: "Tipo di Pittura e Tecnica",
        type: "select",
        options: [
          { value: "idropittura", label: "Idropittura traspirante (standard)", multiplier: 1.0 },
          { value: "lavabile", label: "Smalto all'acqua / Lavabile", multiplier: 1.25 },
          { value: "silicati", label: "Pittura ai silicati (esterno)", multiplier: 1.50 },
          { value: "decorativo", label: "Effetti decorativi (velatura/spatolato)", multiplier: 2.10 }
        ]
      },
      {
        id: "muffa",
        label: "Trattamento Antimuffa",
        type: "select",
        options: [
          { value: "no", label: "Non necessario", multiplier: 1.0 },
          { value: "si", label: "Trattamento igienizzante preventivo", multiplier: 1.30 }
        ]
      },
      {
        id: "altezza",
        label: "Altezza Soffitto / Accesso",
        type: "select",
        options: [
          { value: "standard", label: "Fino a 3 m (scala normale)", multiplier: 1.0 },
          { value: "alta", label: "3–5 m (ponteggio leggero)", multiplier: 1.35 },
          { value: "molto_alta", label: "Oltre 5 m (ponteggio fisso)", multiplier: 1.70 }
        ]
      },
      {
        id: "mani",
        label: "Numero di Mani",
        type: "select",
        options: [
          { value: "una", label: "Una mano (ritocco)", multiplier: 0.70 },
          { value: "due", label: "Due mani (standard)", multiplier: 1.0 },
          { value: "tre", label: "Tre mani (massima copertura)", multiplier: 1.30 }
        ]
      }
    ]
  },
  {
    id: "elettricista",
    name: "Impianto Elettrico",
    description: "Realizzazione e messa a norma impianti civili e domotici",
    icon: "fa-bolt",
    color: "#eab308",
    colorBg: "rgba(234,179,8,0.12)",
    unit: "punti",
    basePrice: 65.00,
    category: "impianti",
    questions: [
      {
        id: "impianto_tipo",
        label: "Tipo di Impianto",
        type: "select",
        options: [
          { value: "nuovo", label: "Nuovo impianto sottotraccia", multiplier: 1.0 },
          { value: "rifacimento", label: "Rifacimento su tubazioni esistenti", multiplier: 0.85 },
          { value: "esterno", label: "Impianto esterno a vista (canalina)", multiplier: 0.90 },
          { value: "domotica", label: "Impianto Domotico (Smart Home)", multiplier: 1.80 }
        ]
      },
      {
        id: "quadro",
        label: "Tipo di Quadro Elettrico",
        type: "select",
        options: [
          { value: "standard", label: "Quadro standard (fino a 12 moduli)", multiplier: 1.0 },
          { value: "avanzato", label: "Quadro sezionato (protezioni avanzate)", multiplier: 1.40 },
          { value: "trifase", label: "Quadro trifase industriale", multiplier: 1.80 }
        ]
      },
      {
        id: "certificazione",
        label: "Certificazione e Collaudo",
        type: "select",
        options: [
          { value: "dichiarazione", label: "Dichiarazione di Conformità (Di.Co.)", multiplier: 1.10 },
          { value: "collaudo", label: "Collaudo + Relazione tecnica completa", multiplier: 1.20 }
        ]
      },
      {
        id: "fotovoltaico",
        label: "Predisposizione Fotovoltaico / EV",
        type: "select",
        options: [
          { value: "no", label: "Non richiesta", multiplier: 1.0 },
          { value: "ev", label: "Predisposizione colonnina EV", multiplier: 1.25 },
          { value: "fotovoltaico", label: "Predisposizione impianto fotovoltaico", multiplier: 1.40 }
        ]
      }
    ]
  },
  {
    id: "idraulico",
    name: "Impianto Idraulico",
    description: "Distribuzione idrica, scarichi sanitari e riscaldamento",
    icon: "fa-faucet",
    color: "#0ea5e9",
    colorBg: "rgba(14,165,233,0.12)",
    unit: "punti",
    basePrice: 195.00,
    category: "impianti",
    questions: [
      {
        id: "tubazioni",
        label: "Materiale Tubazioni",
        type: "select",
        options: [
          { value: "multistrato", label: "Multistrato (standard moderno)", multiplier: 1.0 },
          { value: "rame", label: "Rame saldato (alta qualità)", multiplier: 1.35 },
          { value: "ppr", label: "Polipropilene a saldare (economico)", multiplier: 0.95 }
        ]
      },
      {
        id: "scarichi",
        label: "Sistema di Scarico",
        type: "select",
        options: [
          { value: "standard", label: "PVC/PP standard", multiplier: 1.0 },
          { value: "insonorizzato", label: "Scarichi insonorizzati (Geberit Silent)", multiplier: 1.45 }
        ]
      },
      {
        id: "collettore",
        label: "Schema di Distribuzione",
        type: "select",
        options: [
          { value: "serie", label: "In serie (tradizionale)", multiplier: 1.0 },
          { value: "collettore", label: "A collettore (singola intercettazione)", multiplier: 1.25 }
        ]
      },
      {
        id: "riscaldamento",
        label: "Tipo di Riscaldamento",
        type: "select",
        options: [
          { value: "nessuno", label: "Solo impianto idrico (no riscaldamento)", multiplier: 1.0 },
          { value: "radiatori", label: "Radiatori tradizionali", multiplier: 1.50 },
          { value: "pannelli", label: "Pannelli radianti a pavimento", multiplier: 2.20 },
          { value: "pompa", label: "Pompa di calore (impianto completo)", multiplier: 2.80 }
        ]
      },
      {
        id: "caldaia",
        label: "Tipo di Caldaia / Generatore",
        type: "select",
        options: [
          { value: "nessuna", label: "Non inclusa nel preventivo", multiplier: 1.0 },
          { value: "condensazione", label: "Caldaia a condensazione (A+)", multiplier: 1.30 },
          { value: "pompa_calore", label: "Pompa di calore aria-acqua", multiplier: 1.60 }
        ]
      }
    ]
  },
  {
    id: "piastrellista",
    name: "Posa Pavimenti",
    description: "Installazione professionale ceramica, gres e marmo",
    icon: "fa-th-large",
    color: "#8b5cf6",
    colorBg: "rgba(139,92,246,0.12)",
    unit: "mq",
    basePrice: 32.00,
    category: "finiture",
    questions: [
      {
        id: "formato",
        label: "Formato Piastrelle / Materiale",
        type: "select",
        options: [
          { value: "standard", label: "Ceramica standard (30×30, 60×60)", multiplier: 1.0 },
          { value: "piccolo", label: "Mosaico o formato piccolo (<20cm)", multiplier: 1.50 },
          { value: "grande", label: "Grandi lastre (120×120 o più)", multiplier: 1.80 },
          { value: "listoni", label: "Listoni effetto legno (posa sfalsata)", multiplier: 1.20 },
          { value: "marmo", label: "Marmo / Pietra naturale", multiplier: 2.20 }
        ]
      },
      {
        id: "posa_tipo",
        label: "Schema di Posa",
        type: "select",
        options: [
          { value: "dritta", label: "Posa dritta a giunto unito", multiplier: 1.0 },
          { value: "diagonale", label: "Posa in diagonale (45°)", multiplier: 1.25 },
          { value: "spina", label: "A spina di pesce (Herringbone)", multiplier: 1.45 },
          { value: "versailles", label: "Versailles / Opus incertum", multiplier: 1.80 }
        ]
      },
      {
        id: "massetto",
        label: "Stato del Sottofondo",
        type: "select",
        options: [
          { value: "pronto", label: "Massetto esistente planare", multiplier: 1.0 },
          { value: "autolivellante", label: "Necessario autolivellante", multiplier: 1.30 },
          { value: "sovrapposizione", label: "Incollaggio su vecchio pavimento", multiplier: 1.15 },
          { value: "massetto_nuovo", label: "Nuovo massetto da realizzare", multiplier: 1.60 }
        ]
      },
      {
        id: "fughe",
        label: "Tipo di Fughe / Stuccatura",
        type: "select",
        options: [
          { value: "standard", label: "Fughe standard colorate", multiplier: 1.0 },
          { value: "epossidica", label: "Stuccatura epossidica (resistente)", multiplier: 1.25 },
          { value: "continuo", label: "Pavimento continuo (senza fughe)", multiplier: 1.50 }
        ]
      }
    ]
  },
  {
    id: "muratore",
    name: "Opere Murarie",
    description: "Costruzione pareti, intonaci, massetti e demolizioni",
    icon: "fa-hard-hat",
    color: "#78716c",
    colorBg: "rgba(120,113,108,0.12)",
    unit: "mq",
    basePrice: 55.00,
    category: "strutture",
    questions: [
      {
        id: "parete_tipo",
        label: "Tipologia Intervento",
        type: "select",
        options: [
          { value: "foratini", label: "Parete in laterizio forato 8–10 cm", multiplier: 1.0 },
          { value: "gasbeton", label: "Blocchi cemento cellulare (Ytong)", multiplier: 0.90 },
          { value: "portante", label: "Muratura portante in mattoni pieni", multiplier: 1.80 },
          { value: "demolizione", label: "Demolizione parete non portante", multiplier: 0.70 },
          { value: "apertura", label: "Apertura vano porta / finestra", multiplier: 2.50 }
        ]
      },
      {
        id: "intonaco",
        label: "Finitura Intonaco",
        type: "select",
        options: [
          { value: "grezzo", label: "Solo rinzaffo grezzo", multiplier: 0.80 },
          { value: "civile", label: "Intonaco civile finito", multiplier: 1.0 },
          { value: "premiscelato", label: "Premiscelato a macchina", multiplier: 0.95 },
          { value: "deumidificante", label: "Intonaco deumidificante (risanante)", multiplier: 1.60 }
        ]
      },
      {
        id: "macerie",
        label: "Smaltimento Macerie",
        type: "select",
        options: [
          { value: "incluso", label: "Carico, trasporto e smaltimento incluso", multiplier: 1.25 },
          { value: "escluso", label: "Solo accatastamento in cantiere", multiplier: 1.0 }
        ]
      },
      {
        id: "ponteggio",
        label: "Necessità Ponteggio",
        type: "select",
        options: [
          { value: "no", label: "Nessun ponteggio necessario", multiplier: 1.0 },
          { value: "trabattello", label: "Trabattello mobile", multiplier: 1.15 },
          { value: "fisso", label: "Ponteggio fisso (facciata)", multiplier: 1.45 }
        ]
      }
    ]
  },
  {
    id: "falegname",
    name: "Falegnameria",
    description: "Porte, finestre, arredi su misura e restauro legno",
    icon: "fa-hammer",
    color: "#92400e",
    colorBg: "rgba(146,64,14,0.12)",
    unit: "pz",
    basePrice: 450.00,
    category: "finiture",
    questions: [
      {
        id: "tipo_lavoro",
        label: "Tipo di Intervento",
        type: "select",
        options: [
          { value: "porta_interna", label: "Porta interna con telaio e maniglia", multiplier: 1.0 },
          { value: "porta_blindata", label: "Porta blindata / Sicurezza", multiplier: 2.80 },
          { value: "finestra", label: "Finestra in legno con doppio vetro", multiplier: 2.20 },
          { value: "armadio", label: "Armadio su misura (al metro lineare)", multiplier: 1.80 },
          { value: "cucina", label: "Cucina su misura (mobile lineare)", multiplier: 2.50 },
          { value: "restauro", label: "Restauro e verniciatura infissi", multiplier: 0.60 }
        ]
      },
      {
        id: "essenza",
        label: "Tipo di Legno / Materiale",
        type: "select",
        options: [
          { value: "mdf", label: "MDF / Truciolato laccato", multiplier: 1.0 },
          { value: "abete", label: "Abete / Pino (legno tenero)", multiplier: 1.20 },
          { value: "rovere", label: "Rovere / Faggio (legno duro)", multiplier: 1.60 },
          { value: "noce", label: "Noce / Ciliegio (pregiato)", multiplier: 2.20 },
          { value: "teak", label: "Teak / Iroko (esterno/nautica)", multiplier: 2.80 }
        ]
      },
      {
        id: "finitura",
        label: "Finitura Superficiale",
        type: "select",
        options: [
          { value: "laccato", label: "Laccato opaco/lucido", multiplier: 1.0 },
          { value: "verniciato", label: "Verniciato a poro aperto", multiplier: 1.15 },
          { value: "cerato", label: "Oliato / Cerato naturale", multiplier: 1.30 },
          { value: "grezzo", label: "Grezzo (solo piallatura)", multiplier: 0.75 }
        ]
      },
      {
        id: "montaggio",
        label: "Smontaggio / Montaggio",
        type: "select",
        options: [
          { value: "solo_montaggio", label: "Solo montaggio (nuovo)", multiplier: 1.0 },
          { value: "sostituzione", label: "Smontaggio vecchio + montaggio nuovo", multiplier: 1.30 },
          { value: "adattamento", label: "Adattamento vano esistente", multiplier: 1.50 }
        ]
      }
    ]
  },
  {
    id: "parchettista",
    name: "Posa Parquet",
    description: "Parquet in legno massello, prefinito e laminato",
    icon: "fa-border-all",
    color: "#b45309",
    colorBg: "rgba(180,83,9,0.12)",
    unit: "mq",
    basePrice: 45.00,
    category: "finiture",
    questions: [
      {
        id: "tipo_parquet",
        label: "Tipo di Parquet",
        type: "select",
        options: [
          { value: "laminato", label: "Laminato (AC4/AC5)", multiplier: 0.70 },
          { value: "prefinito", label: "Prefinito multistrato (6–15 mm)", multiplier: 1.0 },
          { value: "massello", label: "Massello in legno duro (20 mm+)", multiplier: 1.60 },
          { value: "bamboo", label: "Bambù / Sughero ecologico", multiplier: 1.20 }
        ]
      },
      {
        id: "posa_parquet",
        label: "Metodo di Posa",
        type: "select",
        options: [
          { value: "flottante", label: "Flottante (click system)", multiplier: 1.0 },
          { value: "incollato", label: "Incollato a tutta superficie", multiplier: 1.35 },
          { value: "inchiodato", label: "Inchiodato su listelli", multiplier: 1.50 }
        ]
      },
      {
        id: "schema_parquet",
        label: "Schema Decorativo",
        type: "select",
        options: [
          { value: "dritto", label: "Posa dritta parallela", multiplier: 1.0 },
          { value: "diagonale", label: "Posa diagonale (45°)", multiplier: 1.20 },
          { value: "spina", label: "Spina di pesce / Chevron", multiplier: 1.45 },
          { value: "punto_ungheria", label: "Punto d'Ungheria (classico)", multiplier: 1.60 }
        ]
      },
      {
        id: "levigatura",
        label: "Levigatura e Trattamento",
        type: "select",
        options: [
          { value: "no", label: "Non necessaria (prefinito/laminato)", multiplier: 1.0 },
          { value: "levigatura", label: "Levigatura + verniciatura", multiplier: 1.40 },
          { value: "levigatura_olio", label: "Levigatura + olio naturale", multiplier: 1.50 }
        ]
      }
    ]
  },
  {
    id: "cartongessista",
    name: "Cartongesso",
    description: "Controsoffitti, pareti divisorie e isolamento acustico",
    icon: "fa-layer-group",
    color: "#64748b",
    colorBg: "rgba(100,116,139,0.12)",
    unit: "mq",
    basePrice: 38.00,
    category: "finiture",
    questions: [
      {
        id: "tipo_lavoro_cg",
        label: "Tipo di Lavoro",
        type: "select",
        options: [
          { value: "parete", label: "Parete divisoria semplice", multiplier: 1.0 },
          { value: "controsoffitto", label: "Controsoffitto piano", multiplier: 1.20 },
          { value: "controsoffitto_sagomato", label: "Controsoffitto sagomato / ribassato", multiplier: 1.80 },
          { value: "rivestimento", label: "Rivestimento parete esistente", multiplier: 0.85 },
          { value: "nicchie", label: "Nicchie / Velette decorative", multiplier: 2.20 }
        ]
      },
      {
        id: "lastra_tipo",
        label: "Tipo di Lastra",
        type: "select",
        options: [
          { value: "standard", label: "Standard (ambienti secchi)", multiplier: 1.0 },
          { value: "idrofuga", label: "Idrofuga Verde (bagni/cucine)", multiplier: 1.15 },
          { value: "antifuoco", label: "Antifuoco Rosa (REI 60/120)", multiplier: 1.35 },
          { value: "acustica", label: "Acustica ad alta densità", multiplier: 1.50 }
        ]
      },
      {
        id: "isolamento",
        label: "Isolamento Interno",
        type: "select",
        options: [
          { value: "nessuno", label: "Nessun isolamento", multiplier: 1.0 },
          { value: "lana_roccia", label: "Lana di roccia (acustico/termico)", multiplier: 1.25 },
          { value: "polistirene", label: "Polistirene espanso (termico)", multiplier: 1.20 },
          { value: "fibra_legno", label: "Fibra di legno (ecologico)", multiplier: 1.40 }
        ]
      },
      {
        id: "finitura_cg",
        label: "Finitura Superficiale",
        type: "select",
        options: [
          { value: "stuccatura", label: "Stuccatura e carteggiatura (pronto pittura)", multiplier: 1.0 },
          { value: "rasatura", label: "Rasatura a zero (finitura liscia)", multiplier: 1.20 }
        ]
      }
    ]
  },
  {
    id: "climatizzazione",
    name: "Climatizzazione",
    description: "Condizionatori, ventilazione e impianti VMC",
    icon: "fa-snowflake",
    color: "#06b6d4",
    colorBg: "rgba(6,182,212,0.12)",
    unit: "pz",
    basePrice: 850.00,
    category: "impianti",
    questions: [
      {
        id: "tipo_impianto_clim",
        label: "Tipo di Impianto",
        type: "select",
        options: [
          { value: "monosplit", label: "Monosplit (1 unità interna)", multiplier: 1.0 },
          { value: "dualsplit", label: "Dual Split (2 unità interne)", multiplier: 1.80 },
          { value: "multisplit", label: "Multi Split (3–5 unità)", multiplier: 2.80 },
          { value: "canalizzato", label: "Canalizzato nascosto (alta gamma)", multiplier: 3.50 },
          { value: "vmc", label: "VMC - Ventilazione Meccanica Controllata", multiplier: 4.20 }
        ]
      },
      {
        id: "potenza",
        label: "Potenza Frigorifica",
        type: "select",
        options: [
          { value: "9000", label: "9.000 BTU (fino a 25 mq)", multiplier: 1.0 },
          { value: "12000", label: "12.000 BTU (fino a 35 mq)", multiplier: 1.20 },
          { value: "18000", label: "18.000 BTU (fino a 50 mq)", multiplier: 1.45 },
          { value: "24000", label: "24.000 BTU (fino a 70 mq)", multiplier: 1.70 }
        ]
      },
      {
        id: "classe_energetica",
        label: "Classe Energetica",
        type: "select",
        options: [
          { value: "a_plus", label: "A+ (efficiente)", multiplier: 1.0 },
          { value: "a_plus_plus", label: "A++ (alta efficienza)", multiplier: 1.25 },
          { value: "a_plus_plus_plus", label: "A+++ (massima efficienza)", multiplier: 1.55 }
        ]
      },
      {
        id: "posa_clim",
        label: "Tipo di Installazione",
        type: "select",
        options: [
          { value: "standard", label: "Standard (unità esterna a parete)", multiplier: 1.0 },
          { value: "canalizzazione", label: "Con canalizzazione interna", multiplier: 1.30 },
          { value: "tetto", label: "Unità esterna su tetto/terrazzo", multiplier: 1.50 }
        ]
      }
    ]
  },
  {
    id: "fabbro",
    name: "Fabbro / Serramentista",
    description: "Cancelli, ringhiere, serramenti in ferro e alluminio",
    icon: "fa-key",
    color: "#475569",
    colorBg: "rgba(71,85,105,0.12)",
    unit: "mq",
    basePrice: 280.00,
    category: "strutture",
    questions: [
      {
        id: "tipo_lavoro_fabbro",
        label: "Tipo di Manufatto",
        type: "select",
        options: [
          { value: "ringhiera", label: "Ringhiera / Parapetto scala", multiplier: 1.0 },
          { value: "cancello_pedonale", label: "Cancello pedonale battente", multiplier: 1.20 },
          { value: "cancello_auto", label: "Cancello carraio scorrevole", multiplier: 2.20 },
          { value: "inferriata", label: "Inferriata di sicurezza", multiplier: 1.40 },
          { value: "pensilina", label: "Pensilina / Tettoia in ferro", multiplier: 1.80 },
          { value: "scala", label: "Scala in ferro su misura", multiplier: 2.50 }
        ]
      },
      {
        id: "materiale_fabbro",
        label: "Materiale",
        type: "select",
        options: [
          { value: "ferro", label: "Ferro verniciato (standard)", multiplier: 1.0 },
          { value: "acciaio_inox", label: "Acciaio inox (resistente)", multiplier: 1.60 },
          { value: "alluminio", label: "Alluminio (leggero/moderno)", multiplier: 1.40 },
          { value: "corten", label: "Acciaio Corten (design)", multiplier: 1.80 }
        ]
      },
      {
        id: "automazione",
        label: "Automazione / Motorizzazione",
        type: "select",
        options: [
          { value: "no", label: "Manuale (nessuna automazione)", multiplier: 1.0 },
          { value: "motore", label: "Motore elettrico + telecomando", multiplier: 1.50 },
          { value: "smart", label: "Motore smart (app + videocitofono)", multiplier: 1.90 }
        ]
      },
      {
        id: "finitura_fabbro",
        label: "Finitura Superficiale",
        type: "select",
        options: [
          { value: "verniciato", label: "Verniciato a polvere (RAL)", multiplier: 1.0 },
          { value: "zincato", label: "Zincato a caldo + verniciatura", multiplier: 1.25 },
          { value: "satinato", label: "Satinato / Spazzolato (inox)", multiplier: 1.15 }
        ]
      }
    ]
  },
  {
    id: "giardiniere",
    name: "Giardinaggio",
    description: "Progettazione giardini, prati, siepi e irrigazione",
    icon: "fa-seedling",
    color: "#16a34a",
    colorBg: "rgba(22,163,74,0.12)",
    unit: "mq",
    basePrice: 22.00,
    category: "esterni",
    questions: [
      {
        id: "tipo_giardino",
        label: "Tipo di Intervento",
        type: "select",
        options: [
          { value: "manutenzione", label: "Manutenzione ordinaria (taglio/pulizia)", multiplier: 1.0 },
          { value: "nuovo_prato", label: "Nuovo prato (semina o rotoli)", multiplier: 1.40 },
          { value: "progettazione", label: "Progettazione e realizzazione completa", multiplier: 2.80 },
          { value: "siepe", label: "Piantagione siepe / alberature", multiplier: 1.60 }
        ]
      },
      {
        id: "irrigazione",
        label: "Impianto di Irrigazione",
        type: "select",
        options: [
          { value: "no", label: "Non richiesto", multiplier: 1.0 },
          { value: "goccia", label: "Irrigazione a goccia (aiuole)", multiplier: 1.30 },
          { value: "interrato", label: "Impianto interrato automatico", multiplier: 1.80 },
          { value: "smart", label: "Irrigazione smart (sensori meteo)", multiplier: 2.20 }
        ]
      },
      {
        id: "terreno",
        label: "Condizioni del Terreno",
        type: "select",
        options: [
          { value: "buono", label: "Terreno già lavorato", multiplier: 1.0 },
          { value: "duro", label: "Terreno compatto (fresatura)", multiplier: 1.30 },
          { value: "bonifica", label: "Bonifica e riporto terra", multiplier: 1.70 }
        ]
      },
      {
        id: "illuminazione_giardino",
        label: "Illuminazione Esterna",
        type: "select",
        options: [
          { value: "no", label: "Non richiesta", multiplier: 1.0 },
          { value: "segnapasso", label: "Segnapasso / Faretti a LED", multiplier: 1.25 },
          { value: "completa", label: "Illuminazione scenografica completa", multiplier: 1.60 }
        ]
      }
    ]
  },
  {
    id: "tetto",
    name: "Coperture e Tetti",
    description: "Rifacimento tetti, impermeabilizzazioni e coibentazioni",
    icon: "fa-home",
    color: "#dc2626",
    colorBg: "rgba(220,38,38,0.12)",
    unit: "mq",
    basePrice: 85.00,
    category: "strutture",
    questions: [
      {
        id: "tipo_tetto",
        label: "Tipo di Intervento",
        type: "select",
        options: [
          { value: "manutenzione", label: "Manutenzione e sigillatura", multiplier: 0.60 },
          { value: "impermeabilizzazione", label: "Impermeabilizzazione terrazzo/lastrico", multiplier: 1.0 },
          { value: "rifacimento_parziale", label: "Rifacimento parziale (sostituzione coppi)", multiplier: 1.20 },
          { value: "rifacimento_totale", label: "Rifacimento totale con struttura", multiplier: 2.20 }
        ]
      },
      {
        id: "materiale_copertura",
        label: "Materiale di Copertura",
        type: "select",
        options: [
          { value: "coppi", label: "Coppi in cotto (tradizionale)", multiplier: 1.0 },
          { value: "tegole", label: "Tegole in cemento/fibrocemento", multiplier: 0.85 },
          { value: "lamiera", label: "Lamiera grecata / Pannello sandwich", multiplier: 0.90 },
          { value: "ardesia", label: "Ardesia naturale (pregiata)", multiplier: 1.80 },
          { value: "verde", label: "Tetto verde (giardino pensile)", multiplier: 2.50 }
        ]
      },
      {
        id: "coibentazione",
        label: "Coibentazione Termica",
        type: "select",
        options: [
          { value: "no", label: "Non inclusa", multiplier: 1.0 },
          { value: "lana_roccia", label: "Lana di roccia (cappotto interno)", multiplier: 1.35 },
          { value: "poliuretano", label: "Schiuma poliuretanica (spray)", multiplier: 1.50 },
          { value: "pannelli_rigidi", label: "Pannelli rigidi PIR/EPS", multiplier: 1.40 }
        ]
      },
      {
        id: "grondaie",
        label: "Grondaie e Pluviali",
        type: "select",
        options: [
          { value: "no", label: "Non incluse", multiplier: 1.0 },
          { value: "pvc", label: "Grondaie in PVC", multiplier: 1.15 },
          { value: "rame", label: "Grondaie in rame (pregiato)", multiplier: 1.40 },
          { value: "acciaio", label: "Grondaie in acciaio zincato", multiplier: 1.25 }
        ]
      }
    ]
  },
  {
    id: "pavimentazioni_esterne",
    name: "Pavimentazioni Esterne",
    description: "Vialetti, terrazzi, piscine e aree esterne",
    icon: "fa-road",
    color: "#0891b2",
    colorBg: "rgba(8,145,178,0.12)",
    unit: "mq",
    basePrice: 55.00,
    category: "esterni",
    questions: [
      {
        id: "tipo_pav_est",
        label: "Tipo di Pavimentazione",
        type: "select",
        options: [
          { value: "autobloccanti", label: "Autobloccanti in calcestruzzo", multiplier: 1.0 },
          { value: "porfido", label: "Porfido (cubetti o lastre)", multiplier: 1.60 },
          { value: "gres_esterno", label: "Gres porcellanato antiscivolo", multiplier: 1.40 },
          { value: "legno_composito", label: "Legno composito (deck WPC)", multiplier: 1.30 },
          { value: "ghiaia", label: "Ghiaia / Stabilizzato (vialetti)", multiplier: 0.60 }
        ]
      },
      {
        id: "sottofondo_est",
        label: "Preparazione Sottofondo",
        type: "select",
        options: [
          { value: "esistente", label: "Sottofondo esistente (solo pulizia)", multiplier: 1.0 },
          { value: "massetto", label: "Nuovo massetto in cls", multiplier: 1.35 },
          { value: "scavo", label: "Scavo + sottofondo + massetto", multiplier: 1.80 }
        ]
      },
      {
        id: "pendenza",
        label: "Pendenze e Drenaggio",
        type: "select",
        options: [
          { value: "standard", label: "Pendenza standard (1–2%)", multiplier: 1.0 },
          { value: "canalette", label: "Canalette di raccolta acque", multiplier: 1.20 },
          { value: "drenante", label: "Pavimentazione drenante (no scarichi)", multiplier: 1.40 }
        ]
      },
      {
        id: "bordure",
        label: "Bordure e Finiture",
        type: "select",
        options: [
          { value: "no", label: "Nessuna bordura", multiplier: 1.0 },
          { value: "cls", label: "Cordolo in calcestruzzo", multiplier: 1.10 },
          { value: "granito", label: "Cordolo in granito / Porfido", multiplier: 1.25 }
        ]
      }
    ]
  },
  {
    id: "pulizie",
    name: "Pulizie Post-Cantiere",
    description: "Pulizie professionali fine lavori e sanificazioni",
    icon: "fa-broom",
    color: "#7c3aed",
    colorBg: "rgba(124,58,237,0.12)",
    unit: "mq",
    basePrice: 8.50,
    category: "servizi",
    questions: [
      {
        id: "tipo_pulizia",
        label: "Tipo di Pulizia",
        type: "select",
        options: [
          { value: "post_cantiere", label: "Post-cantiere (rimozione polvere/detriti)", multiplier: 1.0 },
          { value: "fine_lavori", label: "Fine lavori (lucidatura/detailing)", multiplier: 1.40 },
          { value: "sanificazione", label: "Sanificazione certificata (COVID/muffa)", multiplier: 1.80 },
          { value: "straordinaria", label: "Pulizia straordinaria (abbandono)", multiplier: 2.20 }
        ]
      },
      {
        id: "superfici_speciali",
        label: "Superfici Speciali",
        type: "select",
        options: [
          { value: "no", label: "Solo pavimenti e pareti standard", multiplier: 1.0 },
          { value: "vetrate", label: "Vetrate e serramenti (lavaggio)", multiplier: 1.20 },
          { value: "marmo", label: "Marmo / Pietra (cristallizzazione)", multiplier: 1.50 },
          { value: "legno", label: "Parquet / Legno (trattamento)", multiplier: 1.35 }
        ]
      },
      {
        id: "smaltimento_rifiuti",
        label: "Smaltimento Rifiuti",
        type: "select",
        options: [
          { value: "no", label: "Non incluso", multiplier: 1.0 },
          { value: "sacco", label: "Raccolta differenziata in sacchi", multiplier: 1.15 },
          { value: "cassone", label: "Cassone scarrabile (grandi volumi)", multiplier: 1.40 }
        ]
      }
    ]
  }
];

// ===== FUNZIONI DI SUPPORTO =====

export function getAllTrades() {
  return TRADES;
}

export function getTradeById(id) {
  return TRADES.find(t => t.id === id);
}

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
  trade.questions.forEach(question => {
    const answer = answers[question.id];
    if (answer) {
      const option = question.options.find(opt => opt.value === answer);
      if (option && option.multiplier) {
        multiplier *= option.multiplier;
      }
    }
  });

  return multiplier;
}

export function calculateCostBreakdown(tradeId, totalPrice) {
  const breakdownRatios = {
    "finiture": { manodopera: 0.45, materiali: 0.55 },
    "impianti": { manodopera: 0.40, materiali: 0.60 },
    "strutture": { manodopera: 0.55, materiali: 0.45 },
    "esterni": { manodopera: 0.50, materiali: 0.50 },
    "servizi": { manodopera: 0.75, materiali: 0.25 }
  };

  const trade = getTradeById(tradeId);
  const ratio = breakdownRatios[trade.category] || { manodopera: 0.50, materiali: 0.50 };

  return {
    manodopera: Math.round(totalPrice * ratio.manodopera * 100) / 100,
    materiali: Math.round(totalPrice * ratio.materiali * 100) / 100
  };
}
