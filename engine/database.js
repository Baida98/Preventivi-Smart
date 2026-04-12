/**
 * Preventivi-Smart Pro v15.0 — Database Mestieri & Scenari Ultra-Visual
 * Icone dettagliate, colori vibranti e palette per ogni categoria di lavoro
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

// ===== PALETTE COLORI PER CATEGORIA =====
export const CATEGORY_COLORS = {
  impianti: { primary: "#3b82f6", light: "#dbeafe", dark: "#1e40af", accent: "#60a5fa" },
  finiture: { primary: "#f59e0b", light: "#fef3c7", dark: "#b45309", accent: "#fbbf24" },
  strutture: { primary: "#8b5cf6", light: "#f3e8ff", dark: "#5b21b6", accent: "#c4b5fd" },
  esterni: { primary: "#10b981", light: "#d1fae5", dark: "#065f46", accent: "#6ee7b7" },
  servizi: { primary: "#ef4444", light: "#fee2e2", dark: "#7f1d1d", accent: "#f87171" }
};

// ===== DATABASE 25+ SCENARI INTERVENTO =====
export const TRADES_DATABASE = [
  // ===== IDRAULICA (5 scenari) =====
  {
    id: "idraulica_perdita",
    name: "Tubo che Perde",
    category: "impianti",
    icon: "fa-faucet-drip",
    color: "#3b82f6",
    colorBg: "#dbeafe",
    colorDark: "#1e40af",
    description: "Perdita d'acqua da tubo o raccordo",
    basePrice: 150,
    unit: "intervento",
    urgencyMultiplier: 1.5,
    complexity: "media",
    estimatedHours: 2.5,
    hourlyRate: 60,
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
    color: "#3b82f6",
    colorBg: "#dbeafe",
    colorDark: "#1e40af",
    description: "Lavandino, doccia o WC intasato",
    basePrice: 120,
    unit: "intervento",
    urgencyMultiplier: 1.3,
    complexity: "bassa",
    estimatedHours: 1.5,
    hourlyRate: 50,
    questions: [
      {
        id: "scarico_tipo",
        label: "Quale scarico è intasato?",
        type: "select",
        options: [
          { value: "lavandino", label: "Lavandino cucina", multiplier: 0.9 },
          { value: "bagno", label: "Lavandino bagno", multiplier: 0.85 },
          { value: "doccia", label: "Doccia", multiplier: 1.0 },
          { value: "wc", label: "WC", multiplier: 1.3 }
        ]
      }
    ]
  },

  {
    id: "idraulica_caldaia",
    name: "Caldaia Rotta",
    category: "impianti",
    icon: "fa-water",
    color: "#3b82f6",
    colorBg: "#dbeafe",
    colorDark: "#1e40af",
    description: "Caldaia non funzionante o malfunzionante",
    basePrice: 250,
    unit: "intervento",
    urgencyMultiplier: 2.0,
    complexity: "alta",
    estimatedHours: 3,
    hourlyRate: 80,
    questions: []
  },

  // ===== ELETTRICITÀ (5 scenari) =====
  {
    id: "elettrico_corto",
    name: "Corto Circuito",
    category: "impianti",
    icon: "fa-bolt",
    color: "#f59e0b",
    colorBg: "#fef3c7",
    colorDark: "#b45309",
    description: "Scintille, odore di bruciato, interruttore scattato",
    basePrice: 180,
    unit: "intervento",
    urgencyMultiplier: 2.5,
    complexity: "alta",
    estimatedHours: 2,
    hourlyRate: 90,
    questions: []
  },

  {
    id: "elettrico_presa",
    name: "Presa Rotta",
    category: "impianti",
    icon: "fa-plug",
    color: "#f59e0b",
    colorBg: "#fef3c7",
    colorDark: "#b45309",
    description: "Presa non funzionante o danneggiata",
    basePrice: 80,
    unit: "intervento",
    urgencyMultiplier: 1.1,
    complexity: "bassa",
    estimatedHours: 1,
    hourlyRate: 50,
    questions: []
  },

  {
    id: "elettrico_lampadina",
    name: "Lampadina/Plafoniera",
    category: "finiture",
    icon: "fa-lightbulb",
    color: "#f59e0b",
    colorBg: "#fef3c7",
    colorDark: "#b45309",
    description: "Sostituzione lampadina o plafoniera",
    basePrice: 60,
    unit: "intervento",
    urgencyMultiplier: 1.0,
    complexity: "bassa",
    estimatedHours: 0.5,
    hourlyRate: 40,
    questions: []
  },

  // ===== MURATURA (5 scenari) =====
  {
    id: "muratura_crepa",
    name: "Crepa nel Muro",
    category: "strutture",
    icon: "fa-square-full",
    color: "#8b5cf6",
    colorBg: "#f3e8ff",
    colorDark: "#5b21b6",
    description: "Crepa o spaccatura in muro",
    basePrice: 200,
    unit: "mq",
    urgencyMultiplier: 1.2,
    complexity: "media",
    estimatedHours: 4,
    hourlyRate: 55,
    questions: []
  },

  {
    id: "muratura_umidita",
    name: "Umidità e Muffa",
    category: "strutture",
    icon: "fa-droplet-slash",
    color: "#8b5cf6",
    colorBg: "#f3e8ff",
    colorDark: "#5b21b6",
    description: "Muri umidi con muffa o efflorescenze",
    basePrice: 300,
    unit: "mq",
    urgencyMultiplier: 1.5,
    complexity: "alta",
    estimatedHours: 6,
    hourlyRate: 70,
    questions: []
  },

  {
    id: "muratura_intonaco",
    name: "Intonaco Scrostato",
    category: "strutture",
    icon: "fa-brush",
    color: "#8b5cf6",
    colorBg: "#f3e8ff",
    colorDark: "#5b21b6",
    description: "Intonaco che si stacca dal muro",
    basePrice: 150,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "media",
    estimatedHours: 3,
    hourlyRate: 50,
    questions: []
  },

  // ===== FINITURE (5 scenari) =====
  {
    id: "finiture_imbiancatura",
    name: "Imbiancatura",
    category: "finiture",
    icon: "fa-paint-roller",
    color: "#f59e0b",
    colorBg: "#fef3c7",
    colorDark: "#b45309",
    description: "Pittura e imbiancatura pareti",
    basePrice: 10.5,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "bassa",
    estimatedHours: 0.5,
    hourlyRate: 25,
    questions: []
  },

  {
    id: "finiture_pavimenti",
    name: "Posa Pavimenti",
    category: "finiture",
    icon: "fa-square",
    color: "#f59e0b",
    colorBg: "#fef3c7",
    colorDark: "#b45309",
    description: "Posa piastrelle o pavimenti",
    basePrice: 32,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "media",
    estimatedHours: 1,
    hourlyRate: 35,
    questions: []
  },

  {
    id: "finiture_parquet",
    name: "Posa Parquet",
    category: "finiture",
    icon: "fa-border-all",
    color: "#f59e0b",
    colorBg: "#fef3c7",
    colorDark: "#b45309",
    description: "Posa e finitura parquet",
    basePrice: 45,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "alta",
    estimatedHours: 1.5,
    hourlyRate: 45,
    questions: []
  },

  // ===== ESTERNI (5 scenari) =====
  {
    id: "esterni_giardinaggio",
    name: "Giardinaggio",
    category: "esterni",
    icon: "fa-leaf",
    color: "#10b981",
    colorBg: "#d1fae5",
    colorDark: "#065f46",
    description: "Manutenzione giardino e potatura",
    basePrice: 22,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "bassa",
    estimatedHours: 0.5,
    hourlyRate: 30,
    questions: []
  },

  {
    id: "esterni_pavimentazione",
    name: "Pavimentazione Esterna",
    category: "esterni",
    icon: "fa-road",
    color: "#10b981",
    colorBg: "#d1fae5",
    colorDark: "#065f46",
    description: "Posa pavimenti esterni e vialetti",
    basePrice: 55,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "media",
    estimatedHours: 1,
    hourlyRate: 50,
    questions: []
  },

  {
    id: "esterni_tetto",
    name: "Coperture e Tetti",
    category: "strutture",
    icon: "fa-house",
    color: "#8b5cf6",
    colorBg: "#f3e8ff",
    colorDark: "#5b21b6",
    description: "Riparazione e manutenzione tetti",
    basePrice: 85,
    unit: "mq",
    urgencyMultiplier: 1.3,
    complexity: "alta",
    estimatedHours: 2,
    hourlyRate: 70,
    questions: []
  },

  // ===== SERVIZI (3 scenari) =====
  {
    id: "servizi_pulizie",
    name: "Pulizie Post-Cantiere",
    category: "servizi",
    icon: "fa-broom",
    color: "#ef4444",
    colorBg: "#fee2e2",
    colorDark: "#7f1d1d",
    description: "Pulizia e smaltimento macerie",
    basePrice: 8.5,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "bassa",
    estimatedHours: 0.5,
    hourlyRate: 20,
    questions: []
  },

  {
    id: "servizi_fabbro",
    name: "Fabbro/Serramentista",
    category: "strutture",
    icon: "fa-key",
    color: "#8b5cf6",
    colorBg: "#f3e8ff",
    colorDark: "#5b21b6",
    description: "Serrature, cancelli e ferramenta",
    basePrice: 280,
    unit: "intervento",
    urgencyMultiplier: 1.2,
    complexity: "media",
    estimatedHours: 2,
    hourlyRate: 60,
    questions: []
  },

  {
    id: "servizi_cartongesso",
    name: "Cartongesso",
    category: "finiture",
    icon: "fa-layer-group",
    color: "#f59e0b",
    colorBg: "#fef3c7",
    colorDark: "#b45309",
    description: "Pareti in cartongesso e controsoffitti",
    basePrice: 38,
    unit: "mq",
    urgencyMultiplier: 1.0,
    complexity: "media",
    estimatedHours: 1,
    hourlyRate: 40,
    questions: []
  }
];

// ===== FUNZIONI UTILITY =====
export function getAllTrades() {
  return TRADES_DATABASE;
}

export function getTradeById(id) {
  return TRADES_DATABASE.find(t => t.id === id);
}

export function getTradesByCategory(category) {
  return TRADES_DATABASE.filter(t => t.category === category);
}

/**
 * Calcola il prezzo finale applicando coefficienti regionali, qualità e risposte utente.
 * @param {string} tradeId - ID del mestiere
 * @param {number} quantity - Quantità (mq, intervento, ecc.)
 * @param {string} region - Regione italiana
 * @param {string} quality - Livello qualità (economica|standard|premium|lusso)
 * @param {Object} answers - Risposte alle domande dinamiche {questionId: value}
 * @returns {number} Prezzo finale stimato
 */
export function calculateFinalPrice(tradeId, quantity, region, quality, answers = {}) {
  const trade = getTradeById(tradeId);
  if (!trade) return 0;

  const regionalCoeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  const qualityCoeff = QUALITY_MULTIPLIERS[quality] || 1.0;

  // Calcola moltiplicatore dalle risposte alle domande
  let answerMultiplier = 1.0;
  if (trade.questions && trade.questions.length > 0) {
    trade.questions.forEach(q => {
      const answer = answers[q.id];
      if (answer) {
        const option = q.options.find(o => o.value === answer);
        if (option && option.multiplier) {
          answerMultiplier *= option.multiplier;
        }
      }
    });
  }

  const baseTotal = trade.basePrice * (quantity || 1);
  return Math.round(baseTotal * regionalCoeff * qualityCoeff * answerMultiplier);
}

export default {
  TRADES_DATABASE,
  REGIONAL_COEFFICIENTS,
  QUALITY_MULTIPLIERS,
  CATEGORY_COLORS,
  getAllTrades,
  getTradeById,
  getTradesByCategory,
  calculateFinalPrice
};
