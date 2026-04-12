/**
 * Database Professionale Preventivi-Smart v4.5
 * Dati basati su ISTAT 2025, DEI e Prezzari Regionali
 * Logica di calcolo di precisione per ogni mestiere
 */

// ===== COEFFICIENTI REGIONALI ISTAT 2025 =====
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

// ===== MOLTIPLICATORI QUALITÀ MATERIALI =====
export const QUALITY_MULTIPLIERS = {
  "economica": 0.85,
  "standard": 1.00,
  "premium": 1.30,
  "lusso": 1.60
};

// ===== MESTIERI CON DATI REALI =====
export const TRADES = [
  {
    id: "imbiancatura",
    name: "Imbiancatura",
    description: "Tinteggiatura interni ed esterni",
    icon: "icon_imbiancatura.png",
    unit: "mq",
    basePrice: 12.00, // €/mq base nazionale
    category: "finiture",
    color: "rgba(100, 150, 200, 0.7)",
    questions: [
      {
        id: "wall_condition",
        label: "Stato dei muri",
        type: "select",
        options: [
          { value: "ottimo", label: "Ottimo (già pitturato)", multiplier: 1.0 },
          { value: "buono", label: "Buono (poche imperfezioni)", multiplier: 1.15 },
          { value: "medio", label: "Medio (rasatura necessaria)", multiplier: 1.35 },
          { value: "rovinato", label: "Rovinato (restauro completo)", multiplier: 1.65 }
        ]
      },
      {
        id: "paint_type",
        label: "Tipo di pittura",
        type: "select",
        options: [
          { value: "acrilica", label: "Acrilica standard", multiplier: 1.0 },
          { value: "lavabile", label: "Lavabile", multiplier: 1.15 },
          { value: "antimuffa", label: "Antimuffa", multiplier: 1.35 },
          { value: "premium", label: "Premium/Naturale", multiplier: 1.55 }
        ]
      },
      {
        id: "coats",
        label: "Numero di mani",
        type: "select",
        options: [
          { value: "una", label: "Una mano", multiplier: 0.85 },
          { value: "due", label: "Due mani", multiplier: 1.0 },
          { value: "tre", label: "Tre mani", multiplier: 1.25 }
        ]
      },
      {
        id: "colors",
        label: "Colori speciali",
        type: "select",
        options: [
          { value: "bianco", label: "Bianco standard", multiplier: 1.0 },
          { value: "colorato", label: "Colorato", multiplier: 1.10 },
          { value: "personalizzato", label: "Personalizzato/Effetti", multiplier: 1.35 }
        ]
      }
    ]
  },

  {
    id: "piastrellista",
    name: "Piastrellista",
    description: "Posa piastrelle e rivestimenti",
    icon: "icon_piastrellista.png",
    unit: "mq",
    basePrice: 35.00,
    category: "finiture",
    color: "rgba(200, 120, 80, 0.7)",
    questions: [
      {
        id: "tile_size",
        label: "Dimensione piastrelle",
        type: "select",
        options: [
          { value: "piccola", label: "Piccola (10x10 - 20x20)", multiplier: 1.25 },
          { value: "media", label: "Media (30x30 - 40x40)", multiplier: 1.0 },
          { value: "grande", label: "Grande (60x60+)", multiplier: 1.35 },
          { value: "mosaico", label: "Mosaico/Piccoli pezzi", multiplier: 1.65 }
        ]
      },
      {
        id: "surface_prep",
        label: "Preparazione superficie",
        type: "select",
        options: [
          { value: "buona", label: "Buona (poche correzioni)", multiplier: 1.0 },
          { value: "media", label: "Media (livellamento)", multiplier: 1.20 },
          { value: "cattiva", label: "Cattiva (demolizione vecchie)", multiplier: 1.50 }
        ]
      },
      {
        id: "grout_type",
        label: "Tipo di stucco",
        type: "select",
        options: [
          { value: "standard", label: "Standard", multiplier: 1.0 },
          { value: "epossidico", label: "Epossidico", multiplier: 1.30 },
          { value: "colorato", label: "Colorato/Speciale", multiplier: 1.15 }
        ]
      }
    ]
  },

  {
    id: "elettricista",
    name: "Elettricista",
    description: "Impianti elettrici e illuminazione",
    icon: "icon_elettrico.png",
    unit: "punto",
    basePrice: 55.00,
    category: "impianti",
    color: "rgba(255, 200, 50, 0.7)",
    questions: [
      {
        id: "point_type",
        label: "Tipo di punto",
        type: "select",
        options: [
          { value: "luce", label: "Punto luce semplice", multiplier: 1.0 },
          { value: "presa", label: "Presa corrente", multiplier: 0.95 },
          { value: "interruttore", label: "Interruttore", multiplier: 0.90 },
          { value: "complesso", label: "Punto complesso (domotica)", multiplier: 2.0 }
        ]
      },
      {
        id: "installation_type",
        label: "Tipo di posa",
        type: "select",
        options: [
          { value: "esterno", label: "Esterno (tracce)", multiplier: 1.0 },
          { value: "incasso", label: "Incasso (scanalature)", multiplier: 1.35 },
          { value: "sottopavimento", label: "Sottopavimento", multiplier: 1.65 }
        ]
      },
      {
        id: "urgency",
        label: "Urgenza lavori",
        type: "select",
        options: [
          { value: "normale", label: "Normale", multiplier: 1.0 },
          { value: "urgente", label: "Urgente (48h)", multiplier: 1.25 },
          { value: "emergenza", label: "Emergenza (24h)", multiplier: 1.50 }
        ]
      }
    ]
  },

  {
    id: "idraulico",
    name: "Idraulico",
    description: "Impianti idrici e sanitari",
    icon: "icon_idraulica.png",
    unit: "punto",
    basePrice: 180.00,
    category: "impianti",
    color: "rgba(100, 200, 200, 0.7)",
    questions: [
      {
        id: "point_type",
        label: "Tipo di punto",
        type: "select",
        options: [
          { value: "rubinetto", label: "Rubinetto semplice", multiplier: 0.80 },
          { value: "scarico", label: "Scarico (WC/Lavandino)", multiplier: 1.0 },
          { value: "punto_acqua", label: "Punto acqua completo", multiplier: 1.20 },
          { value: "caldaia", label: "Caldaia/Scaldabagno", multiplier: 2.5 }
        ]
      },
      {
        id: "pipe_material",
        label: "Materiale tubature",
        type: "select",
        options: [
          { value: "pvc", label: "PVC", multiplier: 1.0 },
          { value: "multistrato", label: "Multistrato", multiplier: 1.15 },
          { value: "rame", label: "Rame", multiplier: 1.35 },
          { value: "acciaio", label: "Acciaio inox", multiplier: 1.50 }
        ]
      },
      {
        id: "routing",
        label: "Percorso tubature",
        type: "select",
        options: [
          { value: "esterno", label: "Esterno (tracce)", multiplier: 1.0 },
          { value: "incasso", label: "Incasso (scanalature)", multiplier: 1.40 },
          { value: "sottopavimento", label: "Sottopavimento", multiplier: 1.70 }
        ]
      }
    ]
  },

  {
    id: "muratore",
    name: "Muratore",
    description: "Muratura e strutture",
    icon: "icon_muratore.png",
    unit: "mq",
    basePrice: 45.00,
    category: "strutture",
    color: "rgba(180, 120, 60, 0.7)",
    questions: [
      {
        id: "work_type",
        label: "Tipo di lavoro",
        type: "select",
        options: [
          { value: "demolizione", label: "Demolizione tramezzi", multiplier: 1.0 },
          { value: "ricostruzione", label: "Ricostruzione pareti", multiplier: 1.35 },
          { value: "completo", label: "Demolizione + Ricostruzione", multiplier: 1.75 }
        ]
      },
      {
        id: "material_type",
        label: "Materiale muratura",
        type: "select",
        options: [
          { value: "laterizio", label: "Laterizio (mattoni)", multiplier: 1.0 },
          { value: "cemento", label: "Blocchi cemento", multiplier: 0.95 },
          { value: "pietra", label: "Pietra naturale", multiplier: 1.50 }
        ]
      },
      {
        id: "debris",
        label: "Gestione macerie",
        type: "select",
        options: [
          { value: "incluso", label: "Incluso (smaltimento)", multiplier: 1.0 },
          { value: "escluso", label: "Escluso (cliente)", multiplier: 0.75 }
        ]
      }
    ]
  },

  {
    id: "cartongesso",
    name: "Cartongessista",
    description: "Pareti e controsoffitti",
    icon: "icon_cartongesso.png",
    unit: "mq",
    basePrice: 38.00,
    category: "finiture",
    color: "rgba(200, 200, 150, 0.7)",
    questions: [
      {
        id: "wall_type",
        label: "Tipo di parete",
        type: "select",
        options: [
          { value: "singola", label: "Singola lastra", multiplier: 0.85 },
          { value: "doppia", label: "Doppia lastra", multiplier: 1.0 },
          { value: "isolamento", label: "Con isolamento", multiplier: 1.35 },
          { value: "acustica", label: "Acustica/Speciale", multiplier: 1.50 }
        ]
      },
      {
        id: "finish_level",
        label: "Livello di finitura",
        type: "select",
        options: [
          { value: "base", label: "Base (tappabuchi)", multiplier: 1.0 },
          { value: "standard", label: "Standard (stuccatura)", multiplier: 1.15 },
          { value: "premium", label: "Premium (rasatura completa)", multiplier: 1.40 }
        ]
      }
    ]
  },

  {
    id: "serramenti",
    name: "Serramentista",
    description: "Finestre, porte e infissi",
    icon: "icon_serramenti.png",
    unit: "mq",
    basePrice: 450.00,
    category: "infissi",
    color: "rgba(100, 100, 100, 0.7)",
    questions: [
      {
        id: "material",
        label: "Materiale infisso",
        type: "select",
        options: [
          { value: "pvc", label: "PVC", multiplier: 1.0 },
          { value: "alluminio", label: "Alluminio", multiplier: 1.20 },
          { value: "legno", label: "Legno", multiplier: 1.50 },
          { value: "alluminio_legno", label: "Alluminio-Legno", multiplier: 1.80 }
        ]
      },
      {
        id: "glass_type",
        label: "Tipo di vetro",
        type: "select",
        options: [
          { value: "doppio", label: "Doppio vetro", multiplier: 1.0 },
          { value: "triplo", label: "Triplo vetro", multiplier: 1.35 },
          { value: "isolamento", label: "Isolamento termico", multiplier: 1.25 }
        ]
      },
      {
        id: "removal",
        label: "Rimozione vecchi infissi",
        type: "select",
        options: [
          { value: "incluso", label: "Incluso", multiplier: 1.0 },
          { value: "escluso", label: "Escluso", multiplier: 0.80 }
        ]
      }
    ]
  },

  {
    id: "climatizzazione",
    name: "Climatizzazione",
    description: "Impianti HVAC e condizionamento",
    icon: "icon_climatizzazione.png",
    unit: "unità",
    basePrice: 450.00,
    category: "impianti",
    color: "rgba(100, 200, 255, 0.7)",
    questions: [
      {
        id: "system_type",
        label: "Tipo di sistema",
        type: "select",
        options: [
          { value: "split", label: "Split monosplit", multiplier: 1.0 },
          { value: "multisplit", label: "Multisplit (2+ unità)", multiplier: 1.35 },
          { value: "canalizzato", label: "Canalizzato", multiplier: 1.70 },
          { value: "pompa_calore", label: "Pompa di calore", multiplier: 1.50 }
        ]
      },
      {
        id: "installation",
        label: "Tipo di installazione",
        type: "select",
        options: [
          { value: "interno", label: "Solo interno", multiplier: 1.0 },
          { value: "completo", label: "Interno + Esterno", multiplier: 1.25 },
          { value: "canalizzato_full", label: "Canalizzato completo", multiplier: 1.60 }
        ]
      },
      {
        id: "old_removal",
        label: "Rimozione vecchio impianto",
        type: "select",
        options: [
          { value: "incluso", label: "Incluso", multiplier: 1.0 },
          { value: "escluso", label: "Escluso", multiplier: 0.75 }
        ]
      }
    ]
  },

  {
    id: "giardiniere",
    name: "Giardiniere",
    description: "Realizzazione e manutenzione giardini",
    icon: "icon_giardiniere.png",
    unit: "mq",
    basePrice: 15.00,
    category: "esterni",
    color: "rgba(100, 180, 100, 0.7)",
    questions: [
      {
        id: "garden_type",
        label: "Tipo di giardino",
        type: "select",
        options: [
          { value: "prato", label: "Prato semplice", multiplier: 1.0 },
          { value: "misto", label: "Prato + Aiuole", multiplier: 1.35 },
          { value: "completo", label: "Completo (alberi, arbusti)", multiplier: 1.75 }
        ]
      },
      {
        id: "irrigation",
        label: "Impianto irrigazione",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "goccia", label: "A goccia", multiplier: 1.25 },
          { value: "automatico", label: "Automatico", multiplier: 1.50 }
        ]
      },
      {
        id: "soil_prep",
        label: "Preparazione terreno",
        type: "select",
        options: [
          { value: "buono", label: "Buono", multiplier: 1.0 },
          { value: "medio", label: "Medio (livellamento)", multiplier: 1.15 },
          { value: "cattivo", label: "Cattivo (bonifica)", multiplier: 1.50 }
        ]
      }
    ]
  },

  {
    id: "pulizie",
    name: "Pulizie Post-Cantiere",
    description: "Pulizia profonda post-ristrutturazione",
    icon: "icon_pulizie.png",
    unit: "mq",
    basePrice: 5.00,
    category: "servizi",
    color: "rgba(200, 150, 100, 0.7)",
    questions: [
      {
        id: "dirt_level",
        label: "Livello di sporcizia",
        type: "select",
        options: [
          { value: "leggera", label: "Leggera (polvere)", multiplier: 1.0 },
          { value: "media", label: "Media (polvere + residui)", multiplier: 1.35 },
          { value: "pesante", label: "Pesante (cantiere completo)", multiplier: 1.75 }
        ]
      },
      {
        id: "areas",
        label: "Aree da pulire",
        type: "select",
        options: [
          { value: "interni", label: "Solo interni", multiplier: 1.0 },
          { value: "completo", label: "Interni + Esterni", multiplier: 1.40 }
        ]
      }
    ]
  }
];

// ===== FUNZIONI EXPORT =====
export function getAllTrades() {
  return TRADES;
}

export function getTradeById(id) {
  return TRADES.find(t => t.id === id);
}

/**
 * Calcola il prezzo finale considerando tutti i fattori
 */
export function calculateFinalPrice(tradeId, quantity, region, quality, answers) {
  const trade = getTradeById(tradeId);
  if (!trade) return 0;

  const basePrice = trade.basePrice * quantity;
  const regionalCoeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  const qualityCoeff = QUALITY_MULTIPLIERS[quality] || 1.0;
  const answerMultiplier = calculateMultiplier(tradeId, answers);

  return Math.round(basePrice * regionalCoeff * qualityCoeff * answerMultiplier * 100) / 100;
}

/**
 * Calcola il moltiplicatore basato sulle risposte alle domande
 */
export function calculateMultiplier(tradeId, answers) {
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

/**
 * Calcola il breakdown manodopera vs materiali
 */
export function calculateCostBreakdown(tradeId, totalPrice) {
  // Percentuali medie per categoria
  const breakdownRatios = {
    "finiture": { manodopera: 0.40, materiali: 0.60 },
    "impianti": { manodopera: 0.50, materiali: 0.50 },
    "strutture": { manodopera: 0.35, materiali: 0.65 },
    "infissi": { manodopera: 0.30, materiali: 0.70 },
    "esterni": { manodopera: 0.45, materiali: 0.55 },
    "servizi": { manodopera: 0.85, materiali: 0.15 }
  };

  const trade = getTradeById(tradeId);
  const ratio = breakdownRatios[trade.category] || { manodopera: 0.50, materiali: 0.50 };

  return {
    manodopera: Math.round(totalPrice * ratio.manodopera * 100) / 100,
    materiali: Math.round(totalPrice * ratio.materiali * 100) / 100
  };
}

/**
 * Valida i dati di input
 */
export function validateInput(quantity, region, quality) {
  const errors = [];

  if (!quantity || quantity <= 0) {
    errors.push("Quantità deve essere maggiore di 0");
  }

  if (!region || !REGIONAL_COEFFICIENTS[region]) {
    errors.push("Regione non valida");
  }

  if (!quality || !QUALITY_MULTIPLIERS[quality]) {
    errors.push("Qualità non valida");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ===== EXPORT DATI PER ANALYTICS =====
export function getTradeStats() {
  return {
    totalTrades: TRADES.length,
    categories: [...new Set(TRADES.map(t => t.category))],
    averageBasePrice: Math.round(
      TRADES.reduce((sum, t) => sum + t.basePrice, 0) / TRADES.length * 100
    ) / 100
  };
}
