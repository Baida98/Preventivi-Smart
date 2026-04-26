/**
 * Preventivi-Smart Pro v9.0 — Smart Calculator
 * Calcoli intelligenti per urgenza, complessità e engagement massimo
 */

import { getTradeById, calculateFinalPrice, QUALITY_MULTIPLIERS } from "./database.js";

// ===== ANALISI URGENZA =====
export function analyzeUrgency(tradeId, answers) {
  const trade = getTradeById(tradeId);
  if (!trade) return { level: "normale", multiplier: 1.0, message: "" };

  // Estrai urgenza dalle risposte
  const urgencyAnswer = answers.perdita_urgenza || answers.corto_urgenza || answers.caldaia_urgenza;

  const urgencyMap = {
    "non_urgente": { level: "bassa", multiplier: 0.7, message: "Puoi prenderti tempo" },
    "entro_settimana": { level: "media", multiplier: 1.0, message: "Entro questa settimana" },
    "domani": { level: "alta", multiplier: 1.3, message: "Domani se possibile" },
    "oggi": { level: "critica", multiplier: 2.0, message: "EMERGENZA - Oggi stesso" },
    "estate": { level: "bassa", multiplier: 0.8, message: "Non è inverno" },
    "autunno": { level: "media", multiplier: 1.2, message: "Autunno/inizio inverno" },
    "inverno": { level: "critica", multiplier: 2.0, message: "Pieno inverno - Emergenza" }
  };

  return urgencyMap[urgencyAnswer] || { level: "normale", multiplier: 1.0, message: "" };
}

// ===== ANALISI COMPLESSITÀ =====
export function analyzeComplexity(tradeId, answers) {
  const trade = getTradeById(tradeId);
  if (!trade) return { level: "bassa", score: 1, message: "" };

  let complexityScore = 0;
  let factorsCount = 0;

  // Analizza fattori di complessità
  Object.values(answers).forEach(answer => {
    if (answer) {
      factorsCount++;
      // Se la risposta contiene "difficile", "grande", "molto", aumenta complessità
      if (
        typeof answer === "string" &&
        (answer.includes("difficile") ||
          answer.includes("grande") ||
          answer.includes("molto") ||
          answer.includes("completo") ||
          answer.includes("lusso"))
      ) {
        complexityScore += 2;
      } else if (answer.includes("facile") || answer.includes("piccolo")) {
        complexityScore += 0.5;
      } else {
        complexityScore += 1;
      }
    }
  });

  const avgScore = factorsCount > 0 ? complexityScore / factorsCount : 1;

  let level = "bassa";
  if (avgScore > 2) level = "molto_alta";
  else if (avgScore > 1.5) level = "alta";
  else if (avgScore > 1) level = "media";

  return {
    level: level,
    score: Math.round(avgScore * 10) / 10,
    message: getComplexityMessage(level)
  };
}

function getComplexityMessage(level) {
  const messages = {
    bassa: "Lavoro semplice e veloce",
    media: "Lavoro di media complessità",
    alta: "Lavoro complesso, richiede esperienza",
    molto_alta: "Lavoro molto complesso, specializzato"
  };
  return messages[level] || "";
}

// ===== CALCOLO PREZZO CON INTELLIGENZA =====
export function calculateSmartPrice(tradeId, quantity, region, quality, answers) {
  const trade = getTradeById(tradeId);
  if (!trade) return { basePrice: 0, finalPrice: 0, breakdown: {} };

  // Calcolo base
  const basePrice = calculateFinalPrice(tradeId, quantity, region, quality, answers);

  // Analisi urgenza
  const urgency = analyzeUrgency(tradeId, answers);

  // Analisi complessità
  const complexity = analyzeComplexity(tradeId, answers);

  // Applica moltiplicatori intelligenti
  let finalPrice = basePrice;

  // Urgenza aumenta il prezzo
  if (urgency.multiplier > 1.0) {
    finalPrice *= urgency.multiplier;
  }

  // Complessità influenza il prezzo
  const complexityMultiplier = 0.8 + complexity.score * 0.1;
  finalPrice *= complexityMultiplier;

  // Calcola range (min/max)
  const minPrice = Math.round(finalPrice * 0.75);
  const maxPrice = Math.round(finalPrice * 1.35);

  // Breakdown costi
  const breakdown = {
    manodopera: Math.round(finalPrice * 0.55),
    materiali: Math.round(finalPrice * 0.35),
    oneri: Math.round(finalPrice * 0.10)
  };

  return {
    basePrice: Math.round(basePrice),
    finalPrice: Math.round(finalPrice),
    minPrice: minPrice,
    maxPrice: maxPrice,
    breakdown: breakdown,
    urgency: urgency,
    complexity: complexity
  };
}

// ===== GENERAZIONE INSIGHTS PSICOLOGICI =====
export function generatePsychologicalInsights(tradeId, answers, receivedPrice) {
  const trade = getTradeById(tradeId);
  if (!trade) return [];

  const insights = [];

  // Insight 1: Urgenza
  const urgency = analyzeUrgency(tradeId, answers);
  if (urgency.level === "critica") {
    insights.push({
      type: "urgenza",
      icon: "fa-exclamation-triangle",
      title: "Situazione Critica",
      message: "Questa è un'emergenza. Il prezzo potrebbe essere più alto del normale.",
      severity: "high"
    });
  }

  // Insight 2: Complessità
  const complexity = analyzeComplexity(tradeId, answers);
  if (complexity.level === "molto_alta") {
    insights.push({
      type: "complessita",
      icon: "fa-cogs",
      title: "Lavoro Specializzato",
      message: "Questo lavoro richiede esperienza e specializzazione. Assicurati che l'artigiano sia qualificato.",
      severity: "medium"
    });
  }

  // Insight 3: Rischi nascosti
  if (answers.umidita_muffa === "molta" || answers.umidita_muffa === "ovunque") {
    insights.push({
      type: "rischio",
      icon: "fa-virus",
      title: "Attenzione: Muffa Estesa",
      message: "La muffa potrebbe indicare problemi strutturali più gravi. Considera una consulenza specialistica.",
      severity: "high"
    });
  }

  // Insight 4: Qualità vs Prezzo
  if (answers.caldaia_eta === "molto_vecchio") {
    insights.push({
      type: "sostituzione",
      icon: "fa-refresh",
      title: "Considera la Sostituzione",
      message: "Una caldaia così vecchia potrebbe non valere la riparazione. Valuta la sostituzione.",
      severity: "medium"
    });
  }

  return insights;
}

// ===== DOMANDE CONDIZIONALI DINAMICHE =====
export function getConditionalQuestions(tradeId, answers) {
  const trade = getTradeById(tradeId);
  if (!trade || !trade.questions) return [];

  const conditionalQuestions = [];

  // Se la perdita è molto grave, chiedi se c'è allagamento
  if (answers.perdita_quantita === "abbondante" || answers.perdita_quantita === "allagamento") {
    conditionalQuestions.push({
      id: "perdita_danno_strutturale",
      label: "C'è danno strutturale (muri bagnati, soffitto che cede)?",
      type: "select",
      options: [
        { value: "no", label: "No, solo perdita", multiplier: 1.0 },
        { value: "si", label: "Sì, danno significativo", multiplier: 1.8 }
      ]
    });
  }

  // Se il corto circuito è ricorrente, chiedi se è stato controllato
  if (answers.corto_sintomi === "tutto_buio") {
    conditionalQuestions.push({
      id: "corto_controllo_precedente",
      label: "È stato controllato da un elettricista prima?",
      type: "select",
      options: [
        { value: "no", label: "No, è la prima volta", multiplier: 1.2 },
        { value: "si_non_risolto", label: "Sì, ma non è stato risolto", multiplier: 1.5 }
      ]
    });
  }

  // Se c'è muffa, chiedi se è ricorrente
  if (answers.umidita_muffa === "molta" || answers.umidita_muffa === "ovunque") {
    conditionalQuestions.push({
      id: "muffa_ricorrente",
      label: "La muffa ritorna dopo la pulizia?",
      type: "select",
      options: [
        { value: "no", label: "No, rimane pulito", multiplier: 0.9 },
        { value: "si", label: "Sì, ritorna velocemente", multiplier: 1.4 }
      ]
    });
  }

  return conditionalQuestions;
}

// ===== SCORE DI AFFIDABILITÀ PREVENTIVO =====
export function calculateTrustScore(tradeId, receivedPrice, marketPrice, answers) {
  let score = 100;

  // Fattore 1: Differenza prezzo
  const priceDiff = Math.abs(receivedPrice - marketPrice) / marketPrice;
  if (priceDiff > 0.5) score -= 30; // Troppo diverso
  else if (priceDiff > 0.3) score -= 15; // Abbastanza diverso
  else if (priceDiff < 0.1) score -= 5; // Troppo simile (sospetto)

  // Fattore 2: Urgenza (prezzi alti in emergenza sono normali)
  const urgency = analyzeUrgency(tradeId, answers);
  if (urgency.level === "critica" && receivedPrice > marketPrice * 1.5) {
    score -= 10; // Ancora accettabile in emergenza
  }

  // Fattore 3: Complessità
  const complexity = analyzeComplexity(tradeId, answers);
  if (complexity.level === "molto_alta" && receivedPrice > marketPrice * 1.4) {
    score -= 5; // Accettabile per lavori complessi
  }

  // Fattore 4: Red flags nel preventivo
  if (answers.perdita_quantita === "allagamento" && receivedPrice < marketPrice * 0.6) {
    score -= 40; // Troppo basso per emergenza grave
  }

  return Math.max(0, Math.min(100, score));
}

// ===== CONSIGLI INTELLIGENTI =====
export function generateSmartAdvice(tradeId, receivedPrice, marketPrice, answers) {
  const advice = [];
  const trade = getTradeById(tradeId);

  if (!trade) return advice;

  const priceDiff = receivedPrice - marketPrice;
  const priceDiffPercent = (priceDiff / marketPrice) * 100;

  // Consiglio 1: Prezzo
  if (priceDiffPercent > 40) {
    advice.push({
      icon: "fa-arrow-up",
      title: "Prezzo Elevato",
      text: `Il preventivo è ${Math.round(priceDiffPercent)}% sopra la media. Chiedi uno sconto o confronta altri preventivi.`,
      color: "#ef4444"
    });
  } else if (priceDiffPercent < -30) {
    advice.push({
      icon: "fa-arrow-down",
      title: "Prezzo Molto Basso",
      text: `Attenzione! Il preventivo è ${Math.round(Math.abs(priceDiffPercent))}% sotto la media. Verifica la qualità dei materiali.`,
      color: "#f97316"
    });
  } else {
    advice.push({
      icon: "fa-check",
      title: "Prezzo Nella Media",
      text: "Il preventivo è in linea con il mercato. Buon affare!",
      color: "#22c55e"
    });
  }

  // Consiglio 2: Urgenza
  const urgency = analyzeUrgency(tradeId, answers);
  if (urgency.level === "critica") {
    advice.push({
      icon: "fa-exclamation-circle",
      title: "Emergenza Confermata",
      text: "In caso di emergenza, i prezzi possono essere più alti. Considera se è veramente urgente.",
      color: "#dc2626"
    });
  }

  // Consiglio 3: Domande da fare
  advice.push({
    icon: "fa-question-circle",
    title: "Domande Importanti",
    text: "Chiedi all'artigiano: garanzia, tempistiche, materiali usati, se è assicurato.",
    color: "#0ea5e9"
  });

  return advice;
}

export default {
  analyzeUrgency,
  analyzeComplexity,
  calculateSmartPrice,
  generatePsychologicalInsights,
  getConditionalQuestions,
  calculateTrustScore,
  generateSmartAdvice
};
