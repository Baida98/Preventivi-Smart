/**
 * Preventivi-Smart Pro v11.0 — Quality Control
 * Validazione, test e controllo qualità per garantire precisione e affidabilità
 */

// ===== VALIDAZIONE DATI INPUT =====
export function validateAnalysisInput(data) {
  const errors = [];
  const warnings = [];

  // Validazioni critiche
  if (!data.tradeId) errors.push("Mestiere non selezionato");
  if (!data.region) errors.push("Regione non selezionata");
  if (!data.quality) errors.push("Qualità non selezionata");
  if (!data.quantity || data.quantity <= 0) errors.push("Quantità non valida (deve essere > 0)");

  // Validazioni per modalità Premium
  if (data.isPremium) {
    if (!data.receivedPrice || data.receivedPrice <= 0) {
      errors.push("Prezzo ricevuto non valido (deve essere > 0)");
    }
    if (!data.answers || Object.keys(data.answers).length === 0) {
      errors.push("Nessuna risposta fornita alle domande");
    }
  }

  // Avvisi
  if (data.quantity > 1000) {
    warnings.push("Quantità molto elevata - verificare l'input");
  }
  if (data.receivedPrice && data.receivedPrice > 1000000) {
    warnings.push("Prezzo molto elevato - verificare l'input");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ===== VALIDAZIONE RISULTATI ANALISI =====
export function validateAnalysisResults(results) {
  const errors = [];
  const warnings = [];

  // Validazione struttura
  if (!results.marketAnalysis) errors.push("Market analysis mancante");
  if (!results.congruityAnalysis) errors.push("Congruity analysis mancante");
  if (!results.timeline) errors.push("Timeline mancante");
  if (!results.breakdown) errors.push("Breakdown mancante");

  // Validazione valori numerici
  if (results.marketAnalysis) {
    const { marketMin, marketMid, marketMax } = results.marketAnalysis;
    if (marketMin >= marketMid || marketMid >= marketMax) {
      errors.push("Range di prezzo non valido (min >= mid o mid >= max)");
    }
  }

  if (results.congruityAnalysis) {
    const { ratio } = results.congruityAnalysis;
    if (ratio < 0 || ratio > 10) {
      warnings.push(`Ratio prezzo anomalo: ${ratio}x (intervallo normale: 0.5-2.0)`);
    }
  }

  if (results.timeline) {
    const { totalHours, workDays } = results.timeline;
    if (totalHours <= 0) errors.push("Ore totali non valide");
    if (workDays <= 0) errors.push("Giorni lavorativi non validi");
    if (workDays > 365) warnings.push("Durata lavoro > 1 anno - verificare");
  }

  if (results.breakdown) {
    const { labor, materials, overhead } = results.breakdown;
    const total = labor + materials + overhead;
    if (total <= 0) errors.push("Breakdown costi non valido");
  }

  if (results.reliabilityScore) {
    if (results.reliabilityScore < 0 || results.reliabilityScore > 100) {
      errors.push(`Reliability score fuori range: ${results.reliabilityScore}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ===== TEST DI COERENZA INTERNA =====
export function testInternalCoherence(results) {
  const issues = [];

  // Test 1: Prezzo ricevuto vs range di mercato
  const { receivedPrice } = results.input;
  const { marketMin, marketMax } = results.marketAnalysis;
  if (receivedPrice < marketMin * 0.1 || receivedPrice > marketMax * 10) {
    issues.push({
      type: "warning",
      message: `Prezzo ricevuto (€${receivedPrice}) è molto fuori dal range di mercato (€${marketMin}-€${marketMax})`
    });
  }

  // Test 2: Coerenza timeline vs breakdown
  const { totalHours, hourlyRate } = results.timeline;
  const { labor } = results.breakdown;
  const calculatedLabor = totalHours * hourlyRate;
  const laborDiff = Math.abs(labor - calculatedLabor) / calculatedLabor;
  if (laborDiff > 0.2) {
    issues.push({
      type: "warning",
      message: `Incoerenza tra ore stimate e costo manodopera (differenza: ${(laborDiff * 100).toFixed(1)}%)`
    });
  }

  // Test 3: Percentuale breakdown
  const { labor: laborPct, materials: materialsPct, overhead: overheadPct } = results.breakdown;
  const totalPct = laborPct + materialsPct + overheadPct;
  if (totalPct !== results.input.receivedPrice) {
    issues.push({
      type: "warning",
      message: `Breakdown non corrisponde al prezzo ricevuto (differenza: €${Math.abs(totalPct - results.input.receivedPrice)})`
    });
  }

  // Test 4: Congruità vs reliability score
  const { severity } = results.congruityAnalysis;
  const { reliabilityScore } = results;
  if (severity === "critical" && reliabilityScore > 50) {
    issues.push({
      type: "warning",
      message: "Severity critica ma reliability score elevato - verificare"
    });
  }

  return {
    isCoherent: issues.length === 0,
    issues
  };
}

// ===== BENCHMARK SANITY CHECK =====
export function performSanityCheck(tradeId, marketAnalysis, timeline) {
  const issues = [];

  // Check 1: Prezzo ragionevole per mestiere
  const { marketMid } = marketAnalysis;
  const { totalHours, hourlyRate } = timeline;
  const impliedHourlyRate = marketMid / totalHours;

  // Intervalli ragionevoli di tariffe orarie per mestiere
  const reasonableRates = {
    idraulica: { min: 40, max: 100 },
    elettricita: { min: 45, max: 120 },
    muratura: { min: 35, max: 90 },
    pavimenti: { min: 35, max: 85 },
    esterni: { min: 40, max: 95 },
    finiture: { min: 30, max: 80 },
    servizi: { min: 25, max: 70 }
  };

  const category = tradeId.split("_")[0];
  const rates = reasonableRates[category] || { min: 30, max: 100 };

  if (impliedHourlyRate < rates.min) {
    issues.push({
      type: "warning",
      message: `Tariffa oraria implicita (€${impliedHourlyRate.toFixed(0)}) è sotto il range ragionevole (€${rates.min}-€${rates.max})`
    });
  } else if (impliedHourlyRate > rates.max) {
    issues.push({
      type: "warning",
      message: `Tariffa oraria implicita (€${impliedHourlyRate.toFixed(0)}) è sopra il range ragionevole (€${rates.min}-€${rates.max})`
    });
  }

  return {
    passed: issues.length === 0,
    issues
  };
}

// ===== REPORT DI QUALITÀ COMPLETO =====
export function generateQualityReport(data, results) {
  const inputValidation = validateAnalysisInput(data);
  const resultsValidation = validateAnalysisResults(results);
  const coherenceTest = testInternalCoherence(results);
  const sanityCheck = performSanityCheck(data.tradeId, results.marketAnalysis, results.timeline);

  const allPassed = 
    inputValidation.isValid && 
    resultsValidation.isValid && 
    coherenceTest.isCoherent && 
    sanityCheck.passed;

  return {
    timestamp: new Date().toISOString(),
    overallStatus: allPassed ? "PASSED" : "WARNINGS",
    inputValidation,
    resultsValidation,
    coherenceTest,
    sanityCheck,
    summary: {
      totalIssues: [
        ...inputValidation.errors,
        ...resultsValidation.errors,
        ...coherenceTest.issues.filter(i => i.type === "error"),
        ...sanityCheck.issues.filter(i => i.type === "error")
      ].length,
      totalWarnings: [
        ...inputValidation.warnings,
        ...resultsValidation.warnings,
        ...coherenceTest.issues.filter(i => i.type === "warning"),
        ...sanityCheck.issues.filter(i => i.type === "warning")
      ].length
    }
  };
}

// ===== LOGGING E DEBUGGING =====
export function logAnalysisDebug(data, results, qualityReport) {
  if (process.env.NODE_ENV !== "development") return;

  console.group("🔍 Preventivi-Smart Analysis Debug");
  console.log("Input Data:", data);
  console.log("Analysis Results:", results);
  console.log("Quality Report:", qualityReport);
  console.groupEnd();
}

// ===== EXPORT DATI PER AUDIT =====
export function exportAuditData(data, results, qualityReport) {
  return {
    version: "11.0",
    exportDate: new Date().toISOString(),
    input: data,
    results: results,
    qualityReport: qualityReport,
    hash: generateDataHash(data, results)
  };
}

function generateDataHash(data, results) {
  // Semplice hash per verificare integrità dati
  const str = JSON.stringify({ data, results });
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export default {
  validateAnalysisInput,
  validateAnalysisResults,
  testInternalCoherence,
  performSanityCheck,
  generateQualityReport,
  logAnalysisDebug,
  exportAuditData
};
