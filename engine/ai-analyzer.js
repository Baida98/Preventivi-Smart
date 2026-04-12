/**
 * Preventivi-Smart Pro — Motore AI di Analisi Preventivo
 * Confronto con mercato reale, alert truffa, consigli intelligenti
 * v6.0 — Aprile 2025
 */

// ===== SOGLIE DI ANALISI =====
// Definisce quanto uno scostamento dal prezzo di mercato è accettabile
const THRESHOLDS = {
  TRUFFA_BASSO:    0.45,  // Sotto il 45% del mercato → sospetto (qualità zero o truffa)
  MOLTO_BASSO:     0.72,  // 45–72% → molto economico, rischio qualità
  BASSO:           0.88,  // 72–88% → sotto mercato, buon affare
  NELLA_MEDIA:     1.12,  // 88–112% → nella norma
  ALTO:            1.30,  // 112–130% → sopra mercato, verificare
  MOLTO_ALTO:      1.60,  // 130–160% → significativamente caro
  TRUFFA_ALTO:     1.61   // Oltre 160% → probabile gonfiatura
};

// ===== VERDETTI =====
export const VERDICTS = {
  TRUFFA_BASSO: {
    id: "truffa_basso",
    label: "⚠️ Attenzione: Prezzo Sospetto",
    shortLabel: "Sospetto",
    color: "#dc2626",
    bgColor: "rgba(220,38,38,0.08)",
    borderColor: "#dc2626",
    icon: "fa-triangle-exclamation",
    score: 1
  },
  MOLTO_BASSO: {
    id: "molto_basso",
    label: "📉 Molto Economico — Rischio Qualità",
    shortLabel: "Molto Basso",
    color: "#ea580c",
    bgColor: "rgba(234,88,12,0.08)",
    borderColor: "#ea580c",
    icon: "fa-arrow-trend-down",
    score: 3
  },
  BASSO: {
    id: "basso",
    label: "✅ Sotto Mercato — Buon Affare",
    shortLabel: "Sotto Mercato",
    color: "#059669",
    bgColor: "rgba(5,150,105,0.08)",
    borderColor: "#059669",
    icon: "fa-circle-check",
    score: 8
  },
  NELLA_MEDIA: {
    id: "nella_media",
    label: "✅ Nella Media di Mercato",
    shortLabel: "Nella Media",
    color: "#0ea5e9",
    bgColor: "rgba(14,165,233,0.08)",
    borderColor: "#0ea5e9",
    icon: "fa-bullseye",
    score: 10
  },
  ALTO: {
    id: "alto",
    label: "⬆️ Sopra Mercato — Valuta Alternativa",
    shortLabel: "Sopra Mercato",
    color: "#d97706",
    bgColor: "rgba(217,119,6,0.08)",
    borderColor: "#d97706",
    icon: "fa-arrow-trend-up",
    score: 5
  },
  MOLTO_ALTO: {
    id: "molto_alto",
    label: "🔴 Significativamente Caro",
    shortLabel: "Molto Alto",
    color: "#dc2626",
    bgColor: "rgba(220,38,38,0.08)",
    borderColor: "#dc2626",
    icon: "fa-circle-exclamation",
    score: 2
  },
  TRUFFA_ALTO: {
    id: "truffa_alto",
    label: "🚨 Prezzo Gonfiato — Verifica Urgente",
    shortLabel: "Gonfiato",
    color: "#7c3aed",
    bgColor: "rgba(124,58,237,0.08)",
    borderColor: "#7c3aed",
    icon: "fa-shield-exclamation",
    score: 1
  }
};

// ===== FUNZIONE PRINCIPALE DI ANALISI =====
export function analyzeQuote(params) {
  const {
    receivedPrice,    // Prezzo ricevuto dall'utente
    marketMin,        // Prezzo minimo di mercato calcolato
    marketMid,        // Prezzo medio di mercato calcolato
    marketMax,        // Prezzo massimo di mercato calcolato
    tradeId,
    tradeName,
    quantity,
    unit,
    region,
    quality
  } = params;

  const ratio = receivedPrice / marketMid;
  const diffAmount = receivedPrice - marketMid;
  const diffPercent = ((ratio - 1) * 100).toFixed(1);

  // Determina verdetto
  let verdict;
  if (ratio < THRESHOLDS.TRUFFA_BASSO)      verdict = VERDICTS.TRUFFA_BASSO;
  else if (ratio < THRESHOLDS.MOLTO_BASSO)  verdict = VERDICTS.MOLTO_BASSO;
  else if (ratio < THRESHOLDS.BASSO)        verdict = VERDICTS.BASSO;
  else if (ratio <= THRESHOLDS.NELLA_MEDIA) verdict = VERDICTS.NELLA_MEDIA;
  else if (ratio <= THRESHOLDS.ALTO)        verdict = VERDICTS.ALTO;
  else if (ratio <= THRESHOLDS.MOLTO_ALTO)  verdict = VERDICTS.MOLTO_ALTO;
  else                                       verdict = VERDICTS.TRUFFA_ALTO;

  // Percentile rispetto al mercato
  const percentile = calculatePercentile(receivedPrice, marketMin, marketMax);

  // Risparmio o sovrapprezzo
  const savings = marketMid - receivedPrice;

  // Genera consigli AI
  const advice = generateAdvice(verdict.id, {
    tradeId, tradeName, receivedPrice, marketMid, marketMin, marketMax,
    diffPercent, diffAmount, region, quality, savings
  });

  // Genera domande da fare all'artigiano
  const questions = generateQuestionsForArtisan(verdict.id, tradeId);

  // Genera segnali di allarme
  const redFlags = generateRedFlags(verdict.id, ratio, tradeId);

  // Score affidabilità (0-10)
  const reliabilityScore = calculateReliabilityScore(ratio, verdict.id);

  return {
    verdict,
    ratio,
    diffPercent: parseFloat(diffPercent),
    diffAmount,
    savings,
    percentile,
    reliabilityScore,
    advice,
    questions,
    redFlags,
    marketData: { min: marketMin, mid: marketMid, max: marketMax },
    receivedPrice,
    timestamp: new Date().toISOString()
  };
}

// ===== PERCENTILE =====
function calculatePercentile(price, min, max) {
  if (price <= min) return 0;
  if (price >= max) return 100;
  return Math.round(((price - min) / (max - min)) * 100);
}

// ===== SCORE AFFIDABILITÀ =====
function calculateReliabilityScore(ratio, verdictId) {
  const scores = {
    truffa_basso: 1,
    molto_basso:  3,
    basso:        8,
    nella_media:  10,
    alto:         6,
    molto_alto:   3,
    truffa_alto:  1
  };
  return scores[verdictId] || 5;
}

// ===== CONSIGLI AI =====
function generateAdvice(verdictId, data) {
  const fmt = (v) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v);
  const absDiff = Math.abs(data.diffAmount);
  const absPct = Math.abs(data.diffPercent);

  const adviceMap = {
    truffa_basso: [
      `Il prezzo ricevuto (${fmt(data.receivedPrice)}) è il ${absPct}% sotto la media di mercato (${fmt(data.marketMid)}). Uno scostamento così elevato è un segnale di allarme serio.`,
      `Prezzi così bassi possono indicare: materiali di scarsissima qualità, manodopera non qualificata, o un preventivo "esca" che crescerà durante i lavori.`,
      `Richiedi sempre un contratto scritto dettagliato con specifica dei materiali utilizzati (marca, modello, certificazioni) prima di accettare.`,
      `Verifica l'iscrizione alla Camera di Commercio e la presenza di assicurazione RC professionale.`
    ],
    molto_basso: [
      `Il preventivo è il ${absPct}% sotto la media di mercato. Potrebbe essere un buon affare, ma richiede verifica.`,
      `Chiedi esplicitamente quali materiali verranno usati e confronta le specifiche tecniche con preventivi più alti.`,
      `Un risparmio di ${fmt(absDiff)} rispetto alla media è possibile con artigiani locali o in periodi di bassa stagione.`,
      `Assicurati che siano inclusi: smaltimento materiali, pulizia finale e garanzia post-lavoro.`
    ],
    basso: [
      `Ottimo! Il preventivo è ${absPct}% sotto la media di mercato — stai risparmiando ${fmt(absDiff)}.`,
      `Questo range è tipico di artigiani con bassa struttura di costi fissi o che cercano lavoro continuativo.`,
      `Prima di accettare, verifica referenze di lavori precedenti simili e chiedi un sopralluogo gratuito.`,
      `Assicurati che il preventivo includa tutto: materiali, smontaggio, smaltimento e pulizia finale.`
    ],
    nella_media: [
      `Il preventivo è perfettamente allineato con i prezzi di mercato per ${data.tradeName} nella zona di ${data.region}.`,
      `La differenza di ${fmt(Math.abs(data.diffAmount))} rispetto alla media è fisiologica e rientra nella normale variabilità.`,
      `Puoi procedere con fiducia. Valuta l'artigiano anche su: puntualità, referenze, garanzia offerta e chiarezza contrattuale.`,
      `Chiedi sempre un contratto scritto con tempi di consegna, materiali specificati e modalità di pagamento.`
    ],
    alto: [
      `Il preventivo è ${absPct}% sopra la media di mercato. Stai pagando ${fmt(absDiff)} in più rispetto alla media.`,
      `Questo può essere giustificato da: artigiano molto qualificato, materiali premium, tempi rapidi o zona ad alta domanda.`,
      `Prima di accettare, chiedi almeno un secondo preventivo comparativo per verificare se il prezzo è giustificato.`,
      `Negozia: molti artigiani hanno margine di trattativa del 10-15% senza compromettere la qualità.`
    ],
    molto_alto: [
      `Attenzione: il preventivo è ${absPct}% sopra la media. Stai pagando ${fmt(absDiff)} in più del normale.`,
      `Richiedi una dettagliata giustificazione scritta delle voci di costo prima di accettare.`,
      `Ottieni almeno 2-3 preventivi comparativi da altri professionisti della stessa zona.`,
      `Verifica se il prezzo alto è giustificato da: certificazioni specifiche, garanzie estese, materiali particolari.`
    ],
    truffa_alto: [
      `🚨 ATTENZIONE: Il preventivo è ${absPct}% sopra la media di mercato. Questo livello di sovrapprezzo è anomalo.`,
      `Stai potenzialmente pagando ${fmt(absDiff)} in più del dovuto. Richiedi giustificazione scritta di ogni voce.`,
      `Non firmare nulla prima di aver ottenuto almeno 3 preventivi comparativi da professionisti diversi.`,
      `Segnali tipici di gonfiatura: voci vaghe, prezzi "tutto compreso" senza dettaglio, pressione a firmare subito.`
    ]
  };

  return adviceMap[verdictId] || adviceMap.nella_media;
}

// ===== DOMANDE DA FARE ALL'ARTIGIANO =====
function generateQuestionsForArtisan(verdictId, tradeId) {
  const baseQuestions = [
    "Puoi fornire un preventivo dettagliato con ogni voce di costo separata?",
    "Quali materiali specifici verranno utilizzati? (marca, modello, certificazioni)",
    "Sei iscritto alla Camera di Commercio? Hai assicurazione RC professionale?",
    "Puoi fornire referenze di lavori simili completati negli ultimi 12 mesi?",
    "Qual è la garanzia offerta sui lavori eseguiti e sui materiali?"
  ];

  const verdictQuestions = {
    truffa_basso: [
      "Come riesci a offrire un prezzo così basso rispetto al mercato?",
      "Il preventivo include TUTTI i materiali necessari o ci saranno extra?",
      "Hai un contratto standard che posso far revisionare da un legale?"
    ],
    molto_basso: [
      "Ci sono costi aggiuntivi non inclusi nel preventivo?",
      "Quali materiali specifici utilizzerai e posso scegliere io la marca?"
    ],
    alto: [
      "Cosa giustifica il prezzo superiore alla media di mercato?",
      "C'è margine di trattativa sul prezzo finale?",
      "Offri garanzie estese o servizi aggiuntivi rispetto alla concorrenza?"
    ],
    molto_alto: [
      "Puoi dettagliare ogni singola voce di costo?",
      "Sei disposto a ridurre il preventivo del 15-20%?",
      "Cosa include esattamente questo prezzo che altri non includono?"
    ],
    truffa_alto: [
      "Puoi giustificare per iscritto ogni singola voce di costo?",
      "Sei disposto a fare un sopralluogo gratuito con un secondo professionista presente?",
      "Perché il tuo prezzo è così superiore a tutti gli altri preventivi?"
    ]
  };

  const specific = verdictQuestions[verdictId] || [];
  return [...specific, ...baseQuestions].slice(0, 6);
}

// ===== RED FLAGS =====
function generateRedFlags(verdictId, ratio, tradeId) {
  const allFlags = {
    truffa_basso: [
      { icon: "fa-triangle-exclamation", text: "Prezzo inferiore al 50% della media di mercato", severity: "high" },
      { icon: "fa-file-circle-xmark", text: "Rischio preventivo esca (prezzo cresce durante lavori)", severity: "high" },
      { icon: "fa-hard-hat", text: "Possibile manodopera non qualificata o in nero", severity: "high" },
      { icon: "fa-box-open", text: "Materiali probabilmente di qualità scadente", severity: "medium" }
    ],
    molto_basso: [
      { icon: "fa-box-open", text: "Verificare qualità dei materiali inclusi", severity: "medium" },
      { icon: "fa-file-lines", text: "Richiedere contratto dettagliato", severity: "medium" }
    ],
    basso: [
      { icon: "fa-magnifying-glass", text: "Verificare referenze prima di procedere", severity: "low" }
    ],
    nella_media: [],
    alto: [
      { icon: "fa-scale-balanced", text: "Richiedere secondo preventivo comparativo", severity: "low" },
      { icon: "fa-comments-dollar", text: "Verificare se il prezzo è negoziabile", severity: "low" }
    ],
    molto_alto: [
      { icon: "fa-circle-exclamation", text: "Prezzo significativamente sopra la media", severity: "medium" },
      { icon: "fa-scale-balanced", text: "Ottenere almeno 2-3 preventivi comparativi", severity: "medium" },
      { icon: "fa-file-invoice-dollar", text: "Richiedere dettaglio scritto di ogni voce", severity: "medium" }
    ],
    truffa_alto: [
      { icon: "fa-shield-exclamation", text: "Prezzo anomalo — verifica urgente consigliata", severity: "high" },
      { icon: "fa-scale-balanced", text: "Ottenere minimo 3 preventivi comparativi", severity: "high" },
      { icon: "fa-file-invoice-dollar", text: "Non firmare senza revisione legale del contratto", severity: "high" },
      { icon: "fa-magnifying-glass", text: "Verificare iscrizione CCIAA e assicurazione RC", severity: "high" }
    ]
  };

  return allFlags[verdictId] || [];
}

// ===== ANALISI TREND (per dashboard) =====
export function analyzeTrend(quotes) {
  if (!quotes || quotes.length < 2) return null;

  const sorted = [...quotes].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const prices = sorted.map(q => q.receivedPrice || q.midPrice);

  const first = prices[0];
  const last = prices[prices.length - 1];
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const trend = ((last - first) / first) * 100;

  return {
    trend: trend.toFixed(1),
    direction: trend > 5 ? "up" : trend < -5 ? "down" : "stable",
    average: avg,
    min: Math.min(...prices),
    max: Math.max(...prices),
    count: quotes.length
  };
}

// ===== STATISTICHE AGGREGATE =====
export function computeStats(quotes) {
  if (!quotes || !quotes.length) return null;

  const byTrade = {};
  const byRegion = {};
  const byMonth = {};

  quotes.forEach(q => {
    const price = q.receivedPrice || q.midPrice || 0;
    const trade = q.tradeName || "Altro";
    const region = q.region || "N/D";
    const month = q.timestamp ? q.timestamp.slice(0, 7) : "N/D";

    if (!byTrade[trade]) byTrade[trade] = { total: 0, count: 0 };
    byTrade[trade].total += price;
    byTrade[trade].count++;

    if (!byRegion[region]) byRegion[region] = { total: 0, count: 0 };
    byRegion[region].total += price;
    byRegion[region].count++;

    if (!byMonth[month]) byMonth[month] = { total: 0, count: 0 };
    byMonth[month].total += price;
    byMonth[month].count++;
  });

  return { byTrade, byRegion, byMonth };
}
