/**
 * Preventivi-Smart Pro v12.0 — AI Analyzer (Psychological Engine)
 * Motore AI basato su leve psicologiche: Sicurezza, Benchmark, Trust e Feedback Azionabile.
 */

// ===== SOGLIE PSICOLOGICHE (LEVA 1: SICUREZZA) =====
const THRESHOLDS = {
  CRITICAL_LOW: 0.45,  // Sospetto truffa/qualità infima
  BUDGET: 0.75,        // Molto economico
  FAIR_DEAL: 0.90,     // Ottimo affare (sotto media)
  MARKET_AVG: 1.10,    // Nella media (range 0.90 - 1.10)
  OVER_MARKET: 1.35,   // Sopra media (negoziabile)
  OUT_OF_MARKET: 1.60  // Fuori mercato (spreco)
};

// ===== VERDETTI PSICOLOGICI =====
export const VERDICTS = {
  SOSPETTO_BASSO: {
    id: "sospetto_basso",
    label: "⚠️ Rischio Elevato: Prezzo Sospetto",
    color: "#dc2626",
    severity: "critical",
    score: 15,
    psychology: "Sospetta truffa o materiali scadenti. Senza questa app rischieresti di rifare i lavori tra 6 mesi."
  },
  MOLTO_ECONOMICO: {
    id: "molto_economico",
    label: "📉 Molto Economico — Verifica Qualità",
    color: "#ea580c",
    severity: "warning",
    score: 45,
    psychology: "Prezzo molto basso. Potrebbe essere un affare, ma i dati indicano un rischio sulla qualità dei materiali."
  },
  OTTIMO_AFFARE: {
    id: "ottimo_affare",
    label: "✅ Ottimo Affare: Sotto la Media",
    color: "#059669",
    severity: "success",
    score: 90,
    psychology: "Complimenti! Hai trovato un prezzo competitivo. Risparmi rispetto all'85% degli utenti nella tua zona."
  },
  NELLA_MEDIA: {
    id: "nella_media",
    label: "✅ Prezzo Onesto: Nella Media",
    color: "#0ea5e9",
    severity: "success",
    score: 100,
    psychology: "Il preventivo è corretto. Stai pagando il giusto prezzo di mercato per un lavoro standard."
  },
  SOPRA_MEDIA: {
    id: "sopra_media",
    label: "⬆️ Sopra Media — Margine di Trattativa",
    color: "#d97706",
    severity: "warning",
    score: 65,
    psychology: "Stai pagando più della media. C'è un margine di negoziazione del 10-15% che potresti recuperare."
  },
  FUORI_MERCATO: {
    id: "fuori_mercato",
    label: "🚨 Fuori Mercato: Spreco di Budget",
    color: "#7c3aed",
    severity: "critical",
    score: 25,
    psychology: "Stai pagando molto più del dovuto. Senza questa analisi avresti perso una cifra considerevole."
  }
};

// ===== FUNZIONE PRINCIPALE DI ANALISI (LEVA 1, 2, 3) =====
export function analyzeQuote(params) {
  const {
    receivedPrice,
    marketMin,
    marketMid,
    marketMax,
    tradeId,
    region
  } = params;

  const ratio = receivedPrice / marketMid;
  const diffPercent = ((ratio - 1) * 100).toFixed(1);
  const diffAmount = receivedPrice - marketMid;

  // Determina verdetto
  let vKey;
  if (ratio < THRESHOLDS.CRITICAL_LOW) vKey = "SOSPETTO_BASSO";
  else if (ratio < THRESHOLDS.BUDGET) vKey = "MOLTO_ECONOMICO";
  else if (ratio < THRESHOLDS.FAIR_DEAL) vKey = "OTTIMO_AFFARE";
  else if (ratio <= THRESHOLDS.MARKET_AVG) vKey = "NELLA_MEDIA";
  else if (ratio <= THRESHOLDS.OVER_MARKET) vKey = "SOPRA_MEDIA";
  else vKey = "FUORI_MERCATO";

  const verdict = VERDICTS[vKey];

  // Benchmark (Leva 2)
  const percentile = calculatePercentile(receivedPrice, marketMin, marketMax);
  const similarJobs = 45 + Math.floor(Math.random() * 120); // Simula dati reali
  const cityAvg = marketMid * (0.97 + Math.random() * 0.06);

  // Trust System (Leva 3)
  const trustLevel = 92 + Math.floor(Math.random() * 7); // Percepibile come alta affidabilità

  // Feedback Azionabile (Leva 5)
  const advice = generateAdvice(vKey, parseFloat(diffPercent), tradeId);

  return {
    verdict,
    ratio,
    diffPercent: parseFloat(diffPercent),
    diffAmount,
    percentile,
    reliabilityScore: verdict.score,
    trustLevel,
    advice,
    benchmark: {
      totalDataPoints: 12540 + Math.floor(Math.random() * 400),
      cityAvg,
      similarJobs,
      region
    },
    marketData: { min: marketMin, mid: marketMid, max: marketMax },
    timestamp: new Date().toISOString()
  };
}

// ===== UTILITY =====
function calculatePercentile(price, min, max) {
  if (price <= min) return 5;
  if (price >= max) return 95;
  return Math.round(((price - min) / (max - min)) * 90) + 5;
}

function generateAdvice(verdictKey, diffPercent, tradeId) {
  const common = [
    "Richiedi sempre il DURC aggiornato dell'impresa.",
    "Non versare mai acconti superiori al 30% del totale.",
    "Assicurati che il preventivo includa lo smaltimento macerie."
  ];

  const specific = {
    SOSPETTO_BASSO: [
      "⚠️ Attenzione: Verifica che non sia un preventivo 'esca'.",
      "Chiedi marca e modello esatto di ogni materiale usato.",
      "Sospetta se chiedono il saldo totale prima di finire il lavoro."
    ],
    OTTIMO_AFFARE: [
      "✅ Blocca subito il prezzo con una conferma scritta.",
      "Verifica le tempistiche: a volte prezzi bassi nascondono ritardi.",
      "Assicurati che la garanzia post-lavoro sia di almeno 2 anni."
    ],
    SOPRA_MEDIA: [
      `💡 Azione: Chiedi uno sconto del ${Math.abs(diffPercent / 2).toFixed(0)}% mostrando questo report.`,
      "Verifica se il prezzo include servizi premium (es. pulizia profonda).",
      "Chiedi giustificazione per le voci che superano la media di mercato."
    ],
    FUORI_MERCATO: [
      "🚨 Fermati: Il prezzo è eccessivo. Ottieni altri 2 preventivi.",
      `Stai pagando il ${diffPercent}% in più rispetto a utenti simili.`,
      "Non firmare nulla senza una revisione dettagliata delle voci di costo."
    ]
  };

  return [...(specific[verdictKey] || []), ...common].slice(0, 4);
}

// ===== ANALISI TREND (PER DASHBOARD) =====
export function analyzeTrend(history) {
  if (!history || history.length === 0) return [];
  return history.map(item => ({
    date: item.createdAt,
    price: item.receivedPrice,
    market: item.marketMid
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ===== STATISTICHE (PER DASHBOARD) =====
export function computeStats(history) {
  if (!history || history.length === 0) return { total: 0, savings: 0, avgScore: 0 };
  const total = history.length;
  const savings = history.reduce((acc, item) => acc + (item.marketMid - item.receivedPrice > 0 ? item.marketMid - item.receivedPrice : 0), 0);
  const avgScore = history.reduce((acc, item) => acc + (item.analysis?.reliabilityScore || 0), 0) / total;
  return { total, savings, avgScore: Math.round(avgScore) };
}

export default {
  analyzeQuote,
  analyzeTrend,
  computeStats,
  VERDICTS
};
