/**
 * Preventivi-Smart Pro v10.0 — Timeline & Labor Calculator
 * Calcolo ore di manodopera, timeline e consigli professionali
 */

import { getTradeById, QUALITY_MULTIPLIERS } from "./database.js";

// ===== CALCOLO TIMELINE COMPLETO =====
export function calculateTimeline(tradeId, quantity, answers) {
  const trade = getTradeById(tradeId);
  if (!trade) return null;

  // Base hours dal database
  let baseHours = trade.estimatedHours || 1;

  // Moltiplicatore per complessità dalle risposte
  let complexityMult = 1.0;
  Object.values(answers || {}).forEach(answer => {
    if (typeof answer === "string") {
      if (answer.includes("difficile") || answer.includes("muro") || answer.includes("grande")) {
        complexityMult *= 1.3;
      } else if (answer.includes("facile") || answer.includes("piccolo")) {
        complexityMult *= 0.8;
      }
    }
  });

  // Calcolo totale ore
  const totalHours = baseHours * quantity * complexityMult;
  const hourlyRate = trade.hourlyRate || 60;
  const laborCost = totalHours * hourlyRate;

  // Stima giorni lavorativi (8 ore al giorno)
  const workDays = Math.ceil(totalHours / 8);
  const calendarDays = workDays + Math.floor(workDays / 5) * 2; // +weekend

  return {
    baseHours: baseHours,
    totalHours: Math.round(totalHours * 10) / 10,
    hourlyRate: hourlyRate,
    laborCost: Math.round(laborCost),
    workDays: workDays,
    calendarDays: calendarDays,
    complexityMult: Math.round(complexityMult * 100) / 100
  };
}

// ===== BREAKDOWN COSTI DETTAGLIATO =====
export function calculateDetailedBreakdown(tradeId, totalPrice, timeline) {
  const trade = getTradeById(tradeId);
  if (!trade) return {};

  // Percentuali tipiche per mestiere
  const breakdownRatios = {
    idraulica: { labor: 0.55, materials: 0.35, overhead: 0.10 },
    elettricita: { labor: 0.50, materials: 0.40, overhead: 0.10 },
    muratura: { labor: 0.45, materials: 0.45, overhead: 0.10 },
    pavimenti: { labor: 0.40, materials: 0.50, overhead: 0.10 },
    esterni: { labor: 0.50, materials: 0.40, overhead: 0.10 },
    finiture: { labor: 0.45, materials: 0.45, overhead: 0.10 },
    servizi: { labor: 0.60, materials: 0.30, overhead: 0.10 }
  };

  const category = trade.category || "finiture";
  const ratios = breakdownRatios[category] || breakdownRatios.finiture;

  const labor = Math.round(totalPrice * ratios.labor);
  const materials = Math.round(totalPrice * ratios.materials);
  const overhead = Math.round(totalPrice * ratios.overhead);

  return {
    labor: labor,
    materials: materials,
    overhead: overhead,
    laborPercentage: Math.round(ratios.labor * 100),
    materialsPercentage: Math.round(ratios.materials * 100),
    overheadPercentage: Math.round(ratios.overhead * 100),
    laborPerHour: timeline ? Math.round(labor / timeline.totalHours) : 0
  };
}

// ===== CONSIGLI "KILLER" PROFESSIONALI =====
export function generateKillerAdvice(tradeId, receivedPrice, marketPrice, timeline, breakdown) {
  const trade = getTradeById(tradeId);
  if (!trade) return [];

  const advice = [];
  const priceDiff = receivedPrice - marketPrice;
  const priceDiffPercent = (priceDiff / marketPrice) * 100;

  // CONSIGLIO 1: Verifica ore vs prezzo
  const pricePerHour = receivedPrice / timeline.totalHours;
  const marketPricePerHour = marketPrice / timeline.totalHours;

  if (pricePerHour > marketPricePerHour * 1.3) {
    advice.push({
      icon: "fa-hourglass-end",
      title: "⚠️ Prezzo/Ora Elevato",
      text: `Stai pagando €${Math.round(pricePerHour)}/ora vs media di €${Math.round(marketPricePerHour)}/ora. Chiedi giustificazione per la specializzazione.`,
      severity: "high",
      action: "Negozia il prezzo orario"
    });
  }

  // CONSIGLIO 2: Durata realistica
  if (timeline.workDays > 5) {
    advice.push({
      icon: "fa-calendar-days",
      title: "📅 Durata Stimata",
      text: `Il lavoro richiede circa ${timeline.workDays} giorni lavorativi (${timeline.calendarDays} giorni calendario). Chiedi una data di inizio e fine.`,
      severity: "medium",
      action: "Richiedi un cronoprogramma scritto"
    });
  }

  // CONSIGLIO 3: Composizione costi
  if (breakdown.laborPercentage > 60) {
    advice.push({
      icon: "fa-person-digging",
      title: "👷 Manodopera Prevalente",
      text: `La manodopera rappresenta il ${breakdown.laborPercentage}% del costo. Verifica che l'artigiano sia qualificato e assicurato.`,
      severity: "medium",
      action: "Richiedi certificazioni e referenze"
    });
  } else if (breakdown.materialsPercentage > 60) {
    advice.push({
      icon: "fa-box",
      title: "📦 Materiali Prevalenti",
      text: `I materiali rappresentano il ${breakdown.materialsPercentage}% del costo. Chiedi marca, modello e certificazioni dei prodotti.`,
      severity: "medium",
      action: "Richiedi specifiche tecniche dettagliate"
    });
  }

  // CONSIGLIO 4: Fair Price Indicator
  if (Math.abs(priceDiffPercent) < 10) {
    advice.push({
      icon: "fa-thumbs-up",
      title: "✅ Fair Price",
      text: `Il prezzo è equo e competitivo. Puoi procedere con fiducia se l'artigiano ha buone referenze.`,
      severity: "low",
      action: "Verifica referenze e firma il contratto"
    });
  }

  // CONSIGLIO 5: Garanzia e Contratto
  advice.push({
    icon: "fa-file-contract",
    title: "📋 Contratto Essenziale",
    text: `Assicurati che il contratto includa: descrizione lavori, materiali, tempistiche, modalità pagamento, garanzia (min. 12 mesi).`,
    severity: "high",
    action: "Non firmare senza contratto scritto"
  });

  // CONSIGLIO 6: Certificazioni specifiche per mestiere
  const certifications = getCertificationsForTrade(tradeId);
  if (certifications.length > 0) {
    advice.push({
      icon: "fa-certificate",
      title: "🎓 Certificazioni Richieste",
      text: `Per questo lavoro, richiedi: ${certifications.join(", ")}.`,
      severity: "high",
      action: "Verifica le certificazioni prima di affidare il lavoro"
    });
  }

  return advice;
}

// ===== CERTIFICAZIONI SPECIFICHE PER MESTIERE =====
function getCertificationsForTrade(tradeId) {
  const certMap = {
    idraulica_caldaia: ["Certificazione FGAS (gas refrigeranti)", "Patentino caldaia", "Iscrizione Albo Installatori"],
    idraulica: ["Iscrizione Albo Idraulici", "Certificazione impianti a norma"],
    elettricita: ["Certificazione Impianti Elettrici (CEI 64-8)", "Iscrizione CNAIE"],
    elettricita_impianto: ["Certificazione CEI 64-8", "Collaudo impianti", "Dichiarazione di Conformità"],
    muratura: ["Iscrizione Albo Muratori", "Certificazione Strutture"],
    muratura_umidita: ["Certificazione Umidità", "Iscrizione Albo Muratori"],
    esterni_tetto: ["Certificazione Lavori in Quota", "Patentino Ponteggio", "Iscrizione Albo Coperturisti"],
    pavimenti_posa: ["Iscrizione Albo Piastrellisti", "Certificazione Posa Professionale"]
  };

  return certMap[tradeId] || ["Iscrizione Camera di Commercio"];
}

// ===== ANALISI RISCHI NASCOSTI =====
export function analyzeHiddenRisks(tradeId, answers, receivedPrice, marketPrice) {
  const risks = [];

  // RISCHIO 1: Prezzo troppo basso per il tempo
  const priceDiff = receivedPrice - marketPrice;
  if (priceDiff < -marketPrice * 0.3) {
    risks.push({
      icon: "fa-triangle-exclamation",
      title: "⚠️ Prezzo Sospettosamente Basso",
      description: "Potrebbe indicare: materiali scadenti, lavoro non completato, o preventivo esca",
      level: "high"
    });
  }

  // RISCHIO 2: Urgenza + Prezzo alto
  if ((answers.perdita_urgenza === "oggi" || answers.caldaia_urgenza === "inverno") && priceDiff > marketPrice * 0.2) {
    risks.push({
      icon: "fa-exclamation-circle",
      title: "⚠️ Sovrapprezzo per Emergenza",
      description: "L'emergenza è reale, ma il sovrapprezzo è eccessivo. Chiedi uno sconto per pagamento immediato.",
      level: "medium"
    });
  }

  // RISCHIO 3: Danni strutturali non menzionati
  if (answers.crepa_umidita === "molto" || answers.umidita_muffa === "molta") {
    risks.push({
      icon: "fa-building-exclamation",
      title: "🏗️ Possibile Danno Strutturale",
      description: "Richiedi una perizia strutturale prima di procedere. Potrebbe essere necessario un intervento più esteso.",
      level: "high"
    });
  }

  // RISCHIO 4: Mancanza di dettagli nel preventivo
  if (!answers || Object.keys(answers).length < 3) {
    risks.push({
      icon: "fa-file-circle-xmark",
      title: "📄 Preventivo Vago",
      description: "Il preventivo manca di dettagli. Richiedi una descrizione specifica di ogni voce di costo.",
      level: "high"
    });
  }

  return risks;
}

// ===== DOMANDE PROFESSIONALI DA FARE =====
export function generateProfessionalQuestions(tradeId, timeline) {
  const baseQuestions = [
    "Puoi fornire un cronoprogramma scritto con date di inizio e fine?",
    "Qual è la garanzia sui lavori? (minimo 12 mesi consigliato)",
    "Sei iscritto alla Camera di Commercio e in regola con le tasse?",
    "Hai assicurazione RC professionale?",
    "Puoi fornire referenze di lavori simili completati negli ultimi 12 mesi?",
    "Quali sono i termini di pagamento? (es. 30% anticipo, 70% a fine lavori)",
    "Chi gestisce lo smaltimento dei materiali di scarto?",
    "Cosa succede se il lavoro richiede più tempo del previsto?"
  ];

  const tradeSpecific = {
    idraulica_caldaia: [
      "La caldaia è nuova o ricondizionata?",
      "Incluye l'installazione e il collaudo?",
      "Qual è la garanzia del produttore?"
    ],
    elettricita_impianto: [
      "Incluye la Dichiarazione di Conformità (Di.Co.)?",
      "Sarà effettuato il collaudo dell'impianto?",
      "Quali protezioni verranno installate (interruttori differenziali, magnetotermici)?"
    ],
    muratura_umidita: [
      "Quale soluzione proponi per risolvere l'umidità?",
      "Sarà necessario un intervento strutturale?",
      "Incluye il trattamento antimuffa?"
    ],
    esterni_tetto: [
      "Incluye il ponteggio nel prezzo?",
      "Quali materiali di copertura verranno usati?",
      "Qual è la garanzia sulla tenuta?"
    ]
  };

  const specific = tradeSpecific[tradeId] || [];
  return [...specific, ...baseQuestions].slice(0, 8);
}

// ===== SCORE COMPETITIVITÀ =====
export function calculateCompetitivenessScore(receivedPrice, marketPrice, timeline, breakdown) {
  let score = 100;

  // Fattore 1: Prezzo
  const priceDiff = Math.abs(receivedPrice - marketPrice) / marketPrice;
  if (priceDiff > 0.3) score -= 20;
  else if (priceDiff > 0.15) score -= 10;

  // Fattore 2: Prezzo/ora ragionevole
  const pricePerHour = receivedPrice / timeline.totalHours;
  const marketPricePerHour = marketPrice / timeline.totalHours;
  if (pricePerHour > marketPricePerHour * 1.2) score -= 15;

  // Fattore 3: Composizione costi equilibrata
  if (breakdown.laborPercentage < 30 || breakdown.laborPercentage > 70) score -= 10;

  // Fattore 4: Durata realistica
  if (timeline.workDays > 20) score -= 5; // Potrebbe essere un progetto complesso

  return Math.max(0, Math.min(100, score));
}

export default {
  calculateTimeline,
  calculateDetailedBreakdown,
  generateKillerAdvice,
  analyzeHiddenRisks,
  generateProfessionalQuestions,
  calculateCompetitivenessScore
};
