/**
 * Database Professionale Preventivi-Smart v5.0
 * Dati aggiornati 2025/2026 basati su Prezzari Regionali e Indici DEI
 * Logica di calcolo granulare per preventivi accurati
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
    name: "Imbiancatura Professionale",
    description: "Tinteggiatura interni ed esterni con trattamenti specifici",
    icon: "icon_imbiancatura.png",
    unit: "mq",
    basePrice: 10.50, // €/mq base
    category: "finiture",
    questions: [
      {
        id: "surface_prep",
        label: "Preparazione Superficie",
        type: "select",
        options: [
          { value: "nessuna", label: "Superficie già pronta", multiplier: 1.0 },
          { value: "stuccatura", label: "Stuccatura fori e crepe", multiplier: 1.20 },
          { value: "rasatura", label: "Rasatura completa (intonaco civile)", multiplier: 1.60 },
          { value: "rimozione", label: "Rimozione vecchia carta da parati", multiplier: 1.40 }
        ]
      },
      {
        id: "paint_tech",
        label: "Tecnica e Materiale",
        type: "select",
        options: [
          { value: "idropittura", label: "Idropittura traspirante", multiplier: 1.0 },
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
      }
    ]
  },
  {
    id: "elettricista",
    name: "Impianto Elettrico",
    description: "Realizzazione e messa a norma impianti civili",
    icon: "icon_elettrico.png",
    unit: "punti",
    basePrice: 65.00, // € per punto luce/presa
    category: "impianti",
    questions: [
      {
        id: "impianto_tipo",
        label: "Tipo di Impianto",
        type: "select",
        options: [
          { value: "nuovo", label: "Nuovo impianto sottotraccia", multiplier: 1.0 },
          { value: "rifacimento", label: "Rifacimento su tubazioni esistenti", multiplier: 0.85 },
          { value: "esterno", label: "Impianto esterno a vista", multiplier: 0.90 },
          { value: "domotica", label: "Impianto Domotico (Smart Home)", multiplier: 1.80 }
        ]
      },
      {
        id: "quadro",
        label: "Quadro Elettrico",
        type: "select",
        options: [
          { value: "standard", label: "Quadro standard (fino a 12 moduli)", multiplier: 1.0 },
          { value: "avanzato", label: "Quadro sezionato (protezioni avanzate)", multiplier: 1.40 }
        ]
      },
      {
        id: "certificazione",
        label: "Certificazione Di.Co.",
        type: "select",
        options: [
          { value: "si", label: "Inclusa (obbligatoria per legge)", multiplier: 1.10 }
        ]
      }
    ]
  },
  {
    id: "idraulico",
    name: "Impianto Idraulico",
    description: "Distribuzione idrica e scarichi sanitari",
    icon: "icon_idraulica.png",
    unit: "punti",
    basePrice: 195.00, // € per punto acqua
    category: "impianti",
    questions: [
      {
        id: "tubazioni",
        label: "Materiale Tubazioni",
        type: "select",
        options: [
          { value: "multistrato", label: "Multistrato (standard moderno)", multiplier: 1.0 },
          { value: "rame", label: "Rame saldato", multiplier: 1.35 },
          { value: "ppr", label: "Polipropilene a saldare", multiplier: 0.95 }
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
        label: "Distribuzione",
        type: "select",
        options: [
          { value: "serie", label: "In serie (tradizionale)", multiplier: 1.0 },
          { value: "collettore", label: "A collettore (singola intercettazione)", multiplier: 1.25 }
        ]
      }
    ]
  },
  {
    id: "piastrellista",
    name: "Posa Pavimenti e Rivestimenti",
    description: "Installazione professionale ceramica e gres",
    icon: "icon_piastrellista.png",
    unit: "mq",
    basePrice: 32.00, // €/mq posa
    category: "finiture",
    questions: [
      {
        id: "formato",
        label: "Formato Piastrelle",
        type: "select",
        options: [
          { value: "standard", label: "Standard (30x30, 60x60)", multiplier: 1.0 },
          { value: "piccolo", label: "Piccolo / Mosaico", multiplier: 1.50 },
          { value: "grande", label: "Grandi Lastre (120x120+)", multiplier: 1.80 },
          { value: "listoni", label: "Effetto Legno (posa sfalsata)", multiplier: 1.20 }
        ]
      },
      {
        id: "posa_tipo",
        label: "Schema di Posa",
        type: "select",
        options: [
          { value: "dritta", label: "Posa dritta a giunto unito", multiplier: 1.0 },
          { value: "diagonale", label: "Posa in diagonale", multiplier: 1.25 },
          { value: "spina", label: "A spina di pesce", multiplier: 1.45 }
        ]
      },
      {
        id: "massetto",
        label: "Stato Sottofondo",
        type: "select",
        options: [
          { value: "pronto", label: "Massetto esistente planare", multiplier: 1.0 },
          { value: "autolivellante", label: "Necessario autolivellante", multiplier: 1.30 },
          { value: "sovrapposizione", label: "Incollaggio su vecchio pavimento", multiplier: 1.15 }
        ]
      }
    ]
  },
  {
    id: "muratore",
    name: "Opere Murarie",
    description: "Costruzione pareti, intonaci e massetti",
    icon: "icon_muratore.png",
    unit: "mq",
    basePrice: 55.00, // €/mq
    category: "strutture",
    questions: [
      {
        id: "parete_tipo",
        label: "Tipologia Parete",
        type: "select",
        options: [
          { value: "foratini", label: "Laterizio forato 8-10cm", multiplier: 1.0 },
          { value: "gasbeton", label: "Blocchi cemento cellulare (Ytong)", multiplier: 0.90 },
          { value: "portante", label: "Muratura portante", multiplier: 1.80 }
        ]
      },
      {
        id: "intonaco",
        label: "Finitura Intonaco",
        type: "select",
        options: [
          { value: "grezzo", label: "Solo rinzaffo grezzo", multiplier: 0.80 },
          { value: "civile", label: "Intonaco civile finito", multiplier: 1.0 },
          { value: "premiscelato", label: "Premiscelato a macchina", multiplier: 0.95 }
        ]
      },
      {
        id: "macerie",
        label: "Smaltimento",
        type: "select",
        options: [
          { value: "incluso", label: "Carico e trasporto a discarica incluso", multiplier: 1.25 },
          { value: "escluso", label: "Solo accatastamento in cantiere", multiplier: 1.0 }
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
    "strutture": { manodopera: 0.55, materiali: 0.45 }
  };

  const trade = getTradeById(tradeId);
  const ratio = breakdownRatios[trade.category] || { manodopera: 0.50, materiali: 0.50 };

  return {
    manodopera: Math.round(totalPrice * ratio.manodopera * 100) / 100,
    materiali: Math.round(totalPrice * ratio.materiali * 100) / 100
  };
}
