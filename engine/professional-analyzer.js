/**
 * Preventivi-Smart Pro v11.0 — Professional Analyzer
 * Motore di analisi premium con congruità di mercato, benchmark orari e rischi legali
 * Questo è il CUORE del prodotto premium
 */

import { getTradeById, REGIONAL_COEFFICIENTS, QUALITY_MULTIPLIERS } from "./database.js";
import { calculateTimeline, calculateDetailedBreakdown } from "./timeline-calculator.js";

// ===== ANALISI PROFESSIONALE COMPLETA =====
export function performProfessionalAnalysis(params) {
  const {
    tradeId,
    tradeName,
    quantity,
    region,
    quality,
    receivedPrice,
    answers = {}
  } = params;

  const trade = getTradeById(tradeId);
  if (!trade) {
    return {
      success: false,
      error: "Mestiere non trovato nel database"
    };
  }

  // Step 1: Calcolo del prezzo di mercato
  const marketAnalysis = calculateMarketPrice(trade, quantity, region, quality, answers);

  // Step 2: Timeline e manodopera
  const timeline = calculateTimeline(tradeId, quantity, answers);

  // Step 3: Breakdown costi
  const breakdown = calculateDetailedBreakdown(tradeId, marketAnalysis.marketMid, timeline);

  // Step 4: Analisi di congruità
  const congruityAnalysis = analyzeCongruity(receivedPrice, marketAnalysis, timeline, breakdown);

  // Step 5: Benchmark orari
  const hourlyBenchmark = calculateHourlyBenchmark(receivedPrice, marketAnalysis.marketMid, timeline);

  // Step 6: Rischi legali e tecnici
  const riskAssessment = performRiskAssessment(tradeId, receivedPrice, marketAnalysis, answers, congruityAnalysis);

  // Step 7: Consigli professionali personalizzati
  const professionalAdvice = generateProfessionalAdvice(
    tradeId,
    tradeName,
    receivedPrice,
    marketAnalysis,
    congruityAnalysis,
    riskAssessment
  );

  // Step 8: Score di affidabilità complessivo
  const reliabilityScore = calculateOverallReliabilityScore(
    congruityAnalysis,
    hourlyBenchmark,
    riskAssessment
  );

  return {
    success: true,
    sessionId: generateSessionId(),
    timestamp: new Date().toISOString(),
    trade: {
      id: tradeId,
      name: tradeName,
      category: trade.category
    },
    input: {
      quantity,
      region,
      quality,
      receivedPrice
    },
    marketAnalysis,
    timeline,
    breakdown,
    congruityAnalysis,
    hourlyBenchmark,
    riskAssessment,
    professionalAdvice,
    reliabilityScore
  };
}

// ===== CALCOLO PREZZO DI MERCATO CON PRECISIONE =====
function calculateMarketPrice(trade, quantity, region, quality, answers) {
  // Base price
  let basePrice = trade.basePrice * quantity;

  // Coefficiente regionale
  const regionalCoeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  basePrice *= regionalCoeff;

  // Coefficiente qualità
  const qualityCoeff = QUALITY_MULTIPLIERS[quality] || 1.0;
  basePrice *= qualityCoeff;

  // Moltiplicatori dalle risposte
  let answerMultiplier = 1.0;
  Object.values(answers).forEach(answer => {
    if (typeof answer === "string") {
      if (answer.includes("difficile") || answer.includes("grande")) answerMultiplier *= 1.2;
      if (answer.includes("facile") || answer.includes("piccolo")) answerMultiplier *= 0.9;
    }
  });
  basePrice *= answerMultiplier;

  // Calcolo range (min/max con deviazione standard)
  const minPrice = Math.round(basePrice * 0.75);
  const maxPrice = Math.round(basePrice * 1.35);
  const midPrice = Math.round(basePrice);

  return {
    basePrice: Math.round(basePrice),
    marketMin: minPrice,
    marketMid: midPrice,
    marketMax: maxPrice,
    regionalCoeff,
    qualityCoeff,
    answerMultiplier
  };
}

// ===== ANALISI DI CONGRUITÀ DI MERCATO =====
function analyzeCongruity(receivedPrice, marketAnalysis, timeline, breakdown) {
  const { marketMin, marketMid, marketMax } = marketAnalysis;
  const ratio = receivedPrice / marketMid;
  const diffPercent = ((ratio - 1) * 100).toFixed(1);
  const diffAmount = receivedPrice - marketMid;

  // Percentile
  const percentile = calculatePercentile(receivedPrice, marketMin, marketMax);

  // Classificazione
  let classification = "NELLA_MEDIA";
  let severity = "info";
  let recommendation = "Procedi con fiducia";

  if (ratio < 0.45) {
    classification = "SOSPETTO_BASSO";
    severity = "critical";
    recommendation = "Non procedere senza ulteriori verifiche";
  } else if (ratio < 0.72) {
    classification = "MOLTO_BASSO";
    severity = "high";
    recommendation = "Richiedi dettagli sui materiali";
  } else if (ratio < 0.88) {
    classification = "SOTTO_MERCATO";
    severity = "low";
    recommendation = "Buon affare, verifica referenze";
  } else if (ratio <= 1.12) {
    classification = "NELLA_MEDIA";
    severity = "info";
    recommendation = "Prezzo equo e competitivo";
  } else if (ratio <= 1.30) {
    classification = "SOPRA_MERCATO";
    severity = "medium";
    recommendation = "Negozia uno sconto";
  } else if (ratio <= 1.60) {
    classification = "MOLTO_ALTO";
    severity = "high";
    recommendation = "Richiedi giustificazione dettagliata";
  } else {
    classification = "SOSPETTO_ALTO";
    severity = "critical";
    recommendation = "Non procedere, possibile gonfiatura";
  }

  return {
    ratio: parseFloat(ratio.toFixed(3)),
    diffPercent: parseFloat(diffPercent),
    diffAmount: Math.round(diffAmount),
    percentile,
    classification,
    severity,
    recommendation,
    savings: marketMid - receivedPrice
  };
}

// ===== BENCHMARK ORARI =====
function calculateHourlyBenchmark(receivedPrice, marketPrice, timeline) {
  const receivedHourly = Math.round(receivedPrice / timeline.totalHours);
  const marketHourly = Math.round(marketPrice / timeline.totalHours);
  const hourlyDiff = receivedHourly - marketHourly;
  const hourlyDiffPercent = ((hourlyDiff / marketHourly) * 100).toFixed(1);

  let assessment = "EQUO";
  if (hourlyDiff > marketHourly * 0.3) assessment = "ELEVATO";
  else if (hourlyDiff < -marketHourly * 0.2) assessment = "BASSO";

  return {
    receivedHourly,
    marketHourly,
    hourlyDiff,
    hourlyDiffPercent: parseFloat(hourlyDiffPercent),
    assessment,
    totalHours: timeline.totalHours,
    workDays: timeline.workDays
  };
}

// ===== VALUTAZIONE RISCHI LEGALI E TECNICI =====
function performRiskAssessment(tradeId, receivedPrice, marketAnalysis, answers, congruityAnalysis) {
  const risks = [];
  const warnings = [];
  const recommendations = [];

  // RISCHIO 1: Prezzo incongruente
  if (congruityAnalysis.severity === "critical") {
    risks.push({
      id: "price_incongruent",
      title: "Prezzo Incongruente",
      description: `Il prezzo è ${Math.abs(congruityAnalysis.diffPercent)}% ${congruityAnalysis.diffPercent > 0 ? "sopra" : "sotto"} la media di mercato`,
      severity: "critical",
      action: "Richiedere una perizia indipendente"
    });
  }

  // RISCHIO 2: Mancanza di dettagli contrattuali
  if (!answers || Object.keys(answers).length < 3) {
    warnings.push({
      id: "contract_vague",
      title: "Preventivo Vago",
      description: "Il preventivo manca di dettagli specifici su materiali e tempistiche",
      severity: "high",
      action: "Richiedere un preventivo dettagliato per voce di costo"
    });
  }

  // RISCHIO 3: Danni strutturali potenziali
  if (answers.umidita_muffa === "molta" || answers.crepa_umidita === "molto") {
    risks.push({
      id: "structural_damage",
      title: "Possibile Danno Strutturale",
      description: "I sintomi indicano problemi strutturali che potrebbero richiedere interventi più estesi",
      severity: "high",
      action: "Richiedere una perizia strutturale prima di procedere"
    });
  }

  // RISCHIO 4: Emergenza + Sovrapprezzo
  if ((answers.perdita_urgenza === "oggi" || answers.caldaia_urgenza === "inverno") && congruityAnalysis.diffPercent > 30) {
    warnings.push({
      id: "emergency_markup",
      title: "Sovrapprezzo per Emergenza",
      description: "Il sovrapprezzo è eccessivo anche considerando l'urgenza",
      severity: "medium",
      action: "Negoziare uno sconto per pagamento immediato"
    });
  }

  // RACCOMANDAZIONE 1: Contratto scritto
  recommendations.push({
    id: "written_contract",
    title: "Contratto Scritto",
    description: "Sempre obbligatorio per importi > €500",
    priority: "critical"
  });

  // RACCOMANDAZIONE 2: Verifiche preliminari
  recommendations.push({
    id: "preliminary_checks",
    title: "Verifiche Preliminari",
    description: "Iscrizione Camera di Commercio, Assicurazione RC, Certificazioni",
    priority: "high"
  });

  return {
    risks,
    warnings,
    recommendations,
    riskScore: calculateRiskScore(risks, warnings)
  };
}

// ===== CONSIGLI PROFESSIONALI PERSONALIZZATI =====
function generateProfessionalAdvice(tradeId, tradeName, receivedPrice, marketAnalysis, congruityAnalysis, riskAssessment) {
  const advice = [];

  // Consiglio 1: Posizionamento prezzo
  if (congruityAnalysis.classification === "SOTTO_MERCATO") {
    advice.push({
      icon: "fa-thumbs-up",
      title: "✅ Buon Affare",
      text: `Stai risparmiando €${Math.abs(congruityAnalysis.diffAmount)} rispetto alla media. Verifica le referenze dell'artigiano e procedi.`,
      priority: "high"
    });
  } else if (congruityAnalysis.classification === "SOPRA_MERCATO") {
    advice.push({
      icon: "fa-handshake",
      title: "💬 Negoziazione Consigliata",
      text: `Proponi uno sconto del 10-15%. Molti artigiani hanno margine di trattativa senza compromettere la qualità.`,
      priority: "high"
    });
  }

  // Consiglio 2: Benchmark orario
  advice.push({
    icon: "fa-hourglass",
    title: "⏱️ Analisi Oraria",
    text: `Stai pagando €${marketAnalysis.hourlyBenchmark.receivedHourly}/ora vs media di €${marketAnalysis.hourlyBenchmark.marketHourly}/ora. ${marketAnalysis.hourlyBenchmark.assessment === "EQUO" ? "Prezzo equo." : "Verifica la specializzazione."}`,
    priority: "medium"
  });

  // Consiglio 3: Documentazione
  advice.push({
    icon: "fa-file-contract",
    title: "📋 Documentazione Essenziale",
    text: "Richiedi: Dichiarazione di Conformità (se applicabile), Garanzia scritta (min. 12 mesi), Cronoprogramma dettagliato.",
    priority: "high"
  });

  return advice;
}

// ===== SCORE DI AFFIDABILITÀ COMPLESSIVO =====
function calculateOverallReliabilityScore(congruityAnalysis, hourlyBenchmark, riskAssessment) {
  let score = 100;

  // Fattore 1: Congruità prezzo
  if (congruityAnalysis.severity === "critical") score -= 40;
  else if (congruityAnalysis.severity === "high") score -= 20;
  else if (congruityAnalysis.severity === "medium") score -= 10;

  // Fattore 2: Benchmark orario
  if (hourlyBenchmark.assessment === "ELEVATO") score -= 15;
  else if (hourlyBenchmark.assessment === "BASSO") score -= 10;

  // Fattore 3: Rischi
  score -= riskAssessment.risks.length * 15;
  score -= riskAssessment.warnings.length * 5;

  return Math.max(0, Math.min(100, score));
}

// ===== UTILITY =====
function calculatePercentile(price, min, max) {
  if (price <= min) return 0;
  if (price >= max) return 100;
  return Math.round(((price - min) / (max - min)) * 100);
}

function calculateRiskScore(risks, warnings) {
  return (risks.length * 3 + warnings.length * 1);
}

function generateSessionId() {
  return `PA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  performProfessionalAnalysis,
  calculateMarketPrice,
  analyzeCongruity,
  calculateHourlyBenchmark,
  performRiskAssessment,
  generateProfessionalAdvice
};
