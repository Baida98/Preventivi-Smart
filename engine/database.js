/**
 * Database professionale di mestieri, parametri e coefficienti regionali
 * Versione 3.0 Pro
 */

// Coefficienti regionali basati su indici ISTAT 2025
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

// Qualità dei materiali
export const QUALITY_MULTIPLIERS = {
  "economica": 0.85,
  "standard": 1.0,
  "premium": 1.3,
  "lusso": 1.8
};

// Mestieri con parametri dettagliati
export const TRADES = {
  "imbiancatura": {
    id: "imbiancatura",
    name: "Imbiancatura",
    icon: "icon_imbiancatura.png",
    unit: "mq",
    basePrice: 12,
    color: "#3B82F6",
    description: "Tinteggiatura e pittura interni/esterni",
    questions: [
      {
        id: "stato_muri",
        label: "Stato dei muri",
        type: "select",
        options: [
          { value: "buono", label: "Buono", multiplier: 1.0 },
          { value: "medio", label: "Medio (qualche crepa)", multiplier: 1.15 },
          { value: "rovinato", label: "Rovinato (molte crepe)", multiplier: 1.30 }
        ]
      },
      {
        id: "tipo_pittura",
        label: "Tipo di pittura",
        type: "select",
        options: [
          { value: "base", label: "Base", multiplier: 1.0 },
          { value: "lavabile", label: "Lavabile", multiplier: 1.10 },
          { value: "premium", label: "Antimuffa/Premium", multiplier: 1.25 }
        ]
      },
      {
        id: "colori",
        label: "Colori speciali",
        type: "select",
        options: [
          { value: "bianco", label: "Bianco", multiplier: 1.0 },
          { value: "colorato", label: "Colorato", multiplier: 1.15 }
        ]
      }
    ]
  },

  "piastrellista": {
    id: "piastrellista",
    name: "Piastrellista",
    icon: "icon_piastrellista.png",
    unit: "mq",
    basePrice: 35,
    color: "#8B5CF6",
    description: "Posa piastrelle e rivestimenti",
    questions: [
      {
        id: "rimozione_vecchio",
        label: "Rimozione piastrelle vecchie",
        type: "select",
        options: [
          { value: "no", label: "No, superficie nuova", multiplier: 1.0 },
          { value: "si", label: "Si, da rimuovere", multiplier: 1.40 }
        ]
      },
      {
        id: "formato_piastrelle",
        label: "Formato piastrelle",
        type: "select",
        options: [
          { value: "piccolo", label: "Piccolo (10x10)", multiplier: 1.0 },
          { value: "medio", label: "Medio (30x30)", multiplier: 1.10 },
          { value: "grande", label: "Grande (60x60+)", multiplier: 1.20 }
        ]
      },
      {
        id: "schema_posa",
        label: "Schema di posa",
        type: "select",
        options: [
          { value: "semplice", label: "Semplice", multiplier: 1.0 },
          { value: "spina", label: "Spina di pesce", multiplier: 1.25 },
          { value: "complesso", label: "Complesso (mosaico)", multiplier: 1.40 }
        ]
      }
    ]
  },

  "elettricista": {
    id: "elettricista",
    name: "Elettricista",
    icon: "icon_elettrico.png",
    unit: "punto",
    basePrice: 65,
    color: "#FBBF24",
    description: "Impianti elettrici e illuminazione",
    questions: [
      {
        id: "certificazione",
        label: "Certificazione richiesta",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "si", label: "Si (SAI)", multiplier: 1.20 }
        ]
      },
      {
        id: "tracce_muro",
        label: "Tracce nel muro",
        type: "select",
        options: [
          { value: "no", label: "No, canalette", multiplier: 1.0 },
          { value: "si", label: "Si, scasso", multiplier: 1.30 }
        ]
      },
      {
        id: "domotica",
        label: "Impianto domotico",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "si", label: "Si (WiFi/Smart)", multiplier: 1.50 }
        ]
      }
    ]
  },

  "idraulico": {
    id: "idraulico",
    name: "Idraulico",
    icon: "icon_idraulica.png",
    unit: "punto",
    basePrice: 180,
    color: "#06B6D4",
    description: "Impianti idrici e sanitari",
    questions: [
      {
        id: "urgenza",
        label: "Urgenza del lavoro",
        type: "select",
        options: [
          { value: "normale", label: "Normale", multiplier: 1.0 },
          { value: "urgente", label: "Urgente (24h)", multiplier: 1.30 }
        ]
      },
      {
        id: "materiale_tubature",
        label: "Materiale tubature",
        type: "select",
        options: [
          { value: "pvc", label: "PVC", multiplier: 1.0 },
          { value: "rame", label: "Rame", multiplier: 1.20 },
          { value: "multistrato", label: "Multistrato", multiplier: 1.10 }
        ]
      },
      {
        id: "incasso",
        label: "Tipo di posa",
        type: "select",
        options: [
          { value: "esterno", label: "Esterno (visibile)", multiplier: 1.0 },
          { value: "incasso", label: "Incasso (in muro)", multiplier: 1.15 }
        ]
      }
    ]
  },

  "muratore": {
    id: "muratore",
    name: "Muratore",
    icon: "icon_muratore.png",
    unit: "mq",
    basePrice: 50,
    color: "#EF4444",
    description: "Muratura e strutture",
    questions: [
      {
        id: "tipo_lavoro",
        label: "Tipo di lavoro",
        type: "select",
        options: [
          { value: "demolizione", label: "Demolizione", multiplier: 1.30 },
          { value: "costruzione", label: "Costruzione", multiplier: 1.0 },
          { value: "intonaco", label: "Intonaco", multiplier: 1.20 }
        ]
      },
      {
        id: "materiale",
        label: "Materiale",
        type: "select",
        options: [
          { value: "laterizio", label: "Laterizio", multiplier: 1.0 },
          { value: "cemento_armato", label: "Cemento armato", multiplier: 1.50 },
          { value: "blocchi_calcestruzzo", label: "Blocchi calcestruzzo", multiplier: 1.15 }
        ]
      },
      {
        id: "complessita",
        label: "Complessità strutturale",
        type: "select",
        options: [
          { value: "semplice", label: "Semplice", multiplier: 1.0 },
          { value: "media", label: "Media", multiplier: 1.20 },
          { value: "complessa", label: "Complessa (archi, volte)", multiplier: 1.50 }
        ]
      }
    ]
  },

  "cartongessista": {
    id: "cartongessista",
    name: "Cartongessista",
    icon: "icon_cartongessista.png",
    unit: "mq",
    basePrice: 40,
    color: "#10B981",
    description: "Pareti e controsoffitti in cartongesso",
    questions: [
      {
        id: "isolamento",
        label: "Isolamento termico",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "si", label: "Si (lana di roccia)", multiplier: 1.25 }
        ]
      },
      {
        id: "doppia_struttura",
        label: "Struttura",
        type: "select",
        options: [
          { value: "singola", label: "Singola", multiplier: 1.0 },
          { value: "doppia", label: "Doppia (fonoassorbente)", multiplier: 1.30 }
        ]
      },
      {
        id: "faretti",
        label: "Faretti integrati",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "si", label: "Si", multiplier: 1.15 }
        ]
      }
    ]
  },

  "serramentista": {
    id: "serramentista",
    name: "Serramentista",
    icon: "icon_serramenti.png",
    unit: "unità",
    basePrice: 600,
    color: "#8B4513",
    description: "Finestre, porte e infissi",
    questions: [
      {
        id: "materiale_infissi",
        label: "Materiale infissi",
        type: "select",
        options: [
          { value: "pvc", label: "PVC", multiplier: 1.0 },
          { value: "legno", label: "Legno", multiplier: 1.40 },
          { value: "alluminio", label: "Alluminio", multiplier: 1.30 }
        ]
      },
      {
        id: "tipo_vetro",
        label: "Tipo di vetro",
        type: "select",
        options: [
          { value: "doppio", label: "Doppio", multiplier: 1.0 },
          { value: "triplo", label: "Triplo (isolamento)", multiplier: 1.20 },
          { value: "basso_emissivo", label: "Basso emissivo", multiplier: 1.30 }
        ]
      },
      {
        id: "installazione",
        label: "Tipo di installazione",
        type: "select",
        options: [
          { value: "sostituzione", label: "Sostituzione", multiplier: 1.0 },
          { value: "nuova_apertura", label: "Nuova apertura", multiplier: 1.50 }
        ]
      }
    ]
  },

  "climatizzazione": {
    id: "climatizzazione",
    name: "Climatizzazione",
    icon: "icon_climatizzazione.png",
    unit: "unità",
    basePrice: 450,
    color: "#3B82F6",
    description: "Impianti di riscaldamento e raffreddamento",
    questions: [
      {
        id: "tipo_impianto",
        label: "Tipo di impianto",
        type: "select",
        options: [
          { value: "monosplit", label: "Monosplit", multiplier: 1.0 },
          { value: "dualsplit", label: "Dual split", multiplier: 1.80 },
          { value: "canalizzato", label: "Canalizzato", multiplier: 2.50 }
        ]
      },
      {
        id: "potenza_termica",
        label: "Potenza termica",
        type: "select",
        options: [
          { value: "piccola", label: "Piccola (3-5 kW)", multiplier: 1.0 },
          { value: "media", label: "Media (5-10 kW)", multiplier: 1.30 },
          { value: "grande", label: "Grande (10+ kW)", multiplier: 1.60 }
        ]
      },
      {
        id: "smart_control",
        label: "Controllo intelligente",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "si", label: "Si (WiFi/App)", multiplier: 1.10 }
        ]
      }
    ]
  },

  "giardiniere": {
    id: "giardiniere",
    name: "Giardiniere",
    icon: "icon_giardiniere.png",
    unit: "mq",
    basePrice: 15,
    color: "#10B981",
    description: "Realizzazione e manutenzione giardini",
    questions: [
      {
        id: "tipo_prato",
        label: "Tipo di prato",
        type: "select",
        options: [
          { value: "semina", label: "Semina", multiplier: 1.0 },
          { value: "prato_pronto", label: "Prato pronto", multiplier: 1.40 }
        ]
      },
      {
        id: "irrigazione",
        label: "Sistema di irrigazione",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "goccia", label: "A goccia", multiplier: 1.30 },
          { value: "automatica", label: "Automatica", multiplier: 1.50 }
        ]
      },
      {
        id: "potatura",
        label: "Potatura alberi",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "ordinaria", label: "Ordinaria", multiplier: 1.20 },
          { value: "alto_fusto", label: "Alto fusto", multiplier: 1.50 }
        ]
      }
    ]
  },

  "pulizie": {
    id: "pulizie",
    name: "Pulizie Post-Cantiere",
    icon: "icon_pulizie.png",
    unit: "mq",
    basePrice: 8,
    color: "#F59E0B",
    description: "Pulizie professionali post-ristrutturazione",
    questions: [
      {
        id: "livello_sporco",
        label: "Livello di sporcizia",
        type: "select",
        options: [
          { value: "basso", label: "Basso", multiplier: 1.0 },
          { value: "medio", label: "Medio", multiplier: 1.20 },
          { value: "alto", label: "Alto (molto sporco)", multiplier: 1.40 }
        ]
      },
      {
        id: "vetrate",
        label: "Pulizia vetrate",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "si", label: "Si (ampie)", multiplier: 1.20 }
        ]
      },
      {
        id: "smaltimento_rifiuti",
        label: "Smaltimento rifiuti",
        type: "select",
        options: [
          { value: "no", label: "No (già fatto)", multiplier: 1.0 },
          { value: "si", label: "Si (incluso)", multiplier: 1.30 }
        ]
      }
    ]
  }
};

/**
 * Ottiene la lista di tutti i mestieri disponibili
 */
export function getAllTrades() {
  return Object.values(TRADES);
}

/**
 * Ottiene un mestiere specifico per ID
 */
export function getTradeById(id) {
  return TRADES[id];
}

/**
 * Calcola il moltiplicatore totale basato sulle risposte
 */
export function calculateMultiplier(tradeId, answers) {
  const trade = TRADES[tradeId];
  if (!trade) return 1;

  let multiplier = 1;
  
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

/**
 * Calcola il prezzo finale con tutti i fattori
 */
export function calculateFinalPrice(tradeId, quantity, region, quality, answers) {
  const trade = TRADES[tradeId];
  if (!trade) return 0;

  const regionalCoeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  const qualityCoeff = QUALITY_MULTIPLIERS[quality] || 1.0;
  const answerMultiplier = calculateMultiplier(tradeId, answers);

  const basePrice = trade.basePrice;
  const finalPrice = basePrice * quantity * regionalCoeff * qualityCoeff * answerMultiplier;

  return Math.round(finalPrice * 100) / 100;
}
