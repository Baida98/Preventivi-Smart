/**
 * Preventivi-Smart Pro v17.0 — AI Semantic Parser
 * Analizza i dettagli particolari del lavoro e applica moltiplicatori dinamici
 */

// ===== KEYWORD PATTERNS & MULTIPLIERS =====
export const SEMANTIC_KEYWORDS = {
  // Difficoltà di accesso
  "quota": { multiplier: 1.25, category: "accesso", severity: "high", label: "Lavoro in quota" },
  "ponteggio": { multiplier: 1.20, category: "accesso", severity: "high", label: "Richiede ponteggio" },
  "difficile accesso": { multiplier: 1.15, category: "accesso", severity: "medium", label: "Accesso difficile" },
  "scala": { multiplier: 1.10, category: "accesso", severity: "low", label: "Richiede scala" },
  "tetto": { multiplier: 1.18, category: "accesso", severity: "high", label: "Lavoro su tetto" },
  "cantina": { multiplier: 0.95, category: "accesso", severity: "low", label: "In cantina" },
  
  // Materiali di pregio
  "marmo": { multiplier: 1.30, category: "materiali", severity: "high", label: "Marmo (materiale pregiato)" },
  "granito": { multiplier: 1.25, category: "materiali", severity: "high", label: "Granito (materiale pregiato)" },
  "parquet": { multiplier: 1.20, category: "materiali", severity: "medium", label: "Parquet di qualità" },
  "legno pregiato": { multiplier: 1.22, category: "materiali", severity: "high", label: "Legno pregiato" },
  "ceramica": { multiplier: 1.08, category: "materiali", severity: "low", label: "Ceramica di qualità" },
  "piastrelle": { multiplier: 1.05, category: "materiali", severity: "low", label: "Piastrelle premium" },
  
  // Complessità tecnica
  "impianto complesso": { multiplier: 1.35, category: "complessita", severity: "high", label: "Impianto complesso" },
  "domotica": { multiplier: 1.40, category: "complessita", severity: "high", label: "Integrazione domotica" },
  "certificazione": { multiplier: 1.15, category: "complessita", severity: "medium", label: "Richiede certificazione" },
  "collaudo": { multiplier: 1.10, category: "complessita", severity: "medium", label: "Richiede collaudo" },
  "manutenzione": { multiplier: 0.85, category: "complessita", severity: "low", label: "Manutenzione ordinaria" },
  
  // Urgenza e tempistiche
  "urgente": { multiplier: 1.50, category: "urgenza", severity: "high", label: "Lavoro urgente" },
  "emergenza": { multiplier: 1.60, category: "urgenza", severity: "high", label: "Situazione di emergenza" },
  "notturno": { multiplier: 1.35, category: "urgenza", severity: "high", label: "Lavoro notturno" },
  "weekend": { multiplier: 1.25, category: "urgenza", severity: "medium", label: "Lavoro nel weekend" },
  "festivo": { multiplier: 1.40, category: "urgenza", severity: "high", label: "Lavoro in giorno festivo" },
  
  // Condizioni particolari
  "umidità": { multiplier: 1.20, category: "condizioni", severity: "medium", label: "Problemi di umidità" },
  "muffa": { multiplier: 1.25, category: "condizioni", severity: "high", label: "Presenza di muffa" },
  "amianto": { multiplier: 1.50, category: "condizioni", severity: "high", label: "Rimozione amianto" },
  "piombo": { multiplier: 1.45, category: "condizioni", severity: "high", label: "Rimozione piombo" },
  "contamination": { multiplier: 1.35, category: "condizioni", severity: "high", label: "Contaminazione" },
  "smaltimento": { multiplier: 1.15, category: "condizioni", severity: "medium", label: "Smaltimento speciale" },
  
  // Materiali speciali
  "acciaio inox": { multiplier: 1.20, category: "materiali", severity: "medium", label: "Acciaio inox" },
  "alluminio": { multiplier: 1.10, category: "materiali", severity: "low", label: "Alluminio" },
  "vetro temperato": { multiplier: 1.15, category: "materiali", severity: "medium", label: "Vetro temperato" },
  "pvc": { multiplier: 0.95, category: "materiali", severity: "low", label: "PVC" },
  
  // Superfici e dimensioni
  "grande superficie": { multiplier: 1.05, category: "scala", severity: "low", label: "Grande superficie" },
  "piccolo intervento": { multiplier: 1.10, category: "scala", severity: "low", label: "Piccolo intervento" },
  "dettagli minuti": { multiplier: 1.20, category: "scala", severity: "medium", label: "Dettagli minuti" },
  
  // Conformità normativa
  "antisismica": { multiplier: 1.25, category: "normativa", severity: "high", label: "Conformità antisismica" },
  "antincendio": { multiplier: 1.20, category: "normativa", severity: "high", label: "Conformità antincendio" },
  "accessibilità": { multiplier: 1.15, category: "normativa", severity: "medium", label: "Conformità accessibilità" }
};

// ===== SEMANTIC PARSER FUNCTION =====
export function parseSemanticContext(contextText) {
  if (!contextText || contextText.trim().length === 0) {
    return {
      detected: [],
      totalMultiplier: 1.0,
      impact: 0,
      confidence: 0
    };
  }

  const textLower = contextText.toLowerCase();
  const detected = [];
  let totalMultiplier = 1.0;
  let highSeverityCount = 0;
  let mediumSeverityCount = 0;

  // Cerca keyword nel testo
  for (const [keyword, data] of Object.entries(SEMANTIC_KEYWORDS)) {
    if (textLower.includes(keyword)) {
      detected.push({
        keyword: data.label,
        multiplier: data.multiplier,
        category: data.category,
        severity: data.severity
      });

      // Applica moltiplicatore (non moltiplicare direttamente, ma sommare gli effetti)
      const effect = data.multiplier - 1.0;
      totalMultiplier += effect * 0.7; // Riduce l'effetto cumulativo per evitare stime troppo alte

      if (data.severity === "high") highSeverityCount++;
      if (data.severity === "medium") mediumSeverityCount++;
    }
  }

  // Calcola la confidenza dell'analisi
  let confidence = Math.min(100, 20 + detected.length * 15 + highSeverityCount * 20);

  // Limita il moltiplicatore totale a un massimo ragionevole
  totalMultiplier = Math.min(totalMultiplier, 2.5);

  return {
    detected,
    totalMultiplier: Math.max(1.0, totalMultiplier),
    impact: Math.round((totalMultiplier - 1.0) * 100),
    confidence,
    summary: generateSummary(detected)
  };
}

// ===== GENERATE SUMMARY =====
function generateSummary(detected) {
  if (detected.length === 0) return null;

  const highSeverity = detected.filter(d => d.severity === "high");
  const mediumSeverity = detected.filter(d => d.severity === "medium");

  let summary = "L'AI ha rilevato: ";

  if (highSeverity.length > 0) {
    summary += highSeverity.map(d => d.keyword).join(", ");
    if (mediumSeverity.length > 0) summary += " e ";
  }

  if (mediumSeverity.length > 0) {
    summary += mediumSeverity.map(d => d.keyword).join(", ");
  }

  return summary;
}

// ===== CALCULATE ADJUSTED PRICE =====
export function calculateAdjustedPrice(basePrice, contextMultiplier) {
  return Math.round(basePrice * contextMultiplier);
}

// ===== FORMAT IMPACT TEXT =====
export function formatImpactText(impact) {
  if (impact === 0) return "Nessun impatto";
  if (impact > 0) return `+${impact}% sulla stima`;
  return `${impact}% sulla stima`;
}

// ===== EXPORT FUNCTIONS =====
export default {
  parseSemanticContext,
  calculateAdjustedPrice,
  formatImpactText,
  SEMANTIC_KEYWORDS
};

// ===== EXTENDED KEYWORDS v18.0 (50+ nuovi tag) =====
export const EXTENDED_KEYWORDS = {
  // Costi e fatturazione
  "fornitura esclusa": { multiplier: 0.70, category: "costi", severity: "high", label: "Fornitura esclusa" },
  "fornitura inclusa": { multiplier: 1.20, category: "costi", severity: "low", label: "Fornitura inclusa" },
  "solo manodopera": { multiplier: 1.10, category: "costi", severity: "medium", label: "Solo manodopera" },
  "chiavi in mano": { multiplier: 1.35, category: "costi", severity: "low", label: "Chiavi in mano" },
  "smaltimento macerie": { multiplier: 1.25, category: "costi", severity: "medium", label: "Smaltimento macerie" },
  "trasporto materiali": { multiplier: 1.15, category: "costi", severity: "medium", label: "Trasporto materiali" },
  
  // Accesso e logistica
  "ascensore": { multiplier: 1.20, category: "accesso", severity: "medium", label: "Noleggio ascensore" },
  "parcheggio": { multiplier: 1.10, category: "accesso", severity: "low", label: "Costo parcheggio" },
  "accesso limitato": { multiplier: 1.30, category: "accesso", severity: "high", label: "Accesso molto limitato" },
  
  // Specifiche tecniche
  "punti luce": { multiplier: 1.15, category: "specifiche", severity: "medium", label: "Punti luce aggiuntivi" },
  "prese aggiuntive": { multiplier: 1.12, category: "specifiche", severity: "low", label: "Prese aggiuntive" },
  "interruttori": { multiplier: 1.08, category: "specifiche", severity: "low", label: "Interruttori speciali" },
  "cablaggio": { multiplier: 1.20, category: "specifiche", severity: "high", label: "Nuovo cablaggio" },
  "tubature": { multiplier: 1.15, category: "specifiche", severity: "medium", label: "Nuove tubature" },
  "valvole": { multiplier: 1.10, category: "specifiche", severity: "medium", label: "Valvole di sicurezza" },
  "contatori": { multiplier: 1.25, category: "specifiche", severity: "high", label: "Nuovo contatore" },
  
  // Pericoli e contaminazioni
  "amianto": { multiplier: 2.00, category: "pericolo", severity: "critical", label: "Rimozione amianto" },
  "radon": { multiplier: 1.50, category: "pericolo", severity: "high", label: "Bonifica radon" },
  "asbesto": { multiplier: 2.00, category: "pericolo", severity: "critical", label: "Rimozione asbesto" },
  "muffa nera": { multiplier: 1.60, category: "pericolo", severity: "high", label: "Muffa nera (tossica)" },
  "legionella": { multiplier: 1.70, category: "pericolo", severity: "critical", label: "Bonifica legionella" },
  
  // Conformità normativa
  "cee": { multiplier: 1.20, category: "normativa", severity: "high", label: "Conformità CEE" },
  "marcatura ce": { multiplier: 1.15, category: "normativa", severity: "medium", label: "Marcatura CE" },
  "norma uni": { multiplier: 1.10, category: "normativa", severity: "medium", label: "Conformità UNI" },
  "iso": { multiplier: 1.12, category: "normativa", severity: "medium", label: "Certificazione ISO" },
  "durc": { multiplier: 1.08, category: "normativa", severity: "low", label: "Verifica DURC" },
  
  // Tempistiche
  "entro domani": { multiplier: 1.40, category: "urgenza", severity: "high", label: "Consegna entro domani" },
  "entro 48 ore": { multiplier: 1.25, category: "urgenza", severity: "medium", label: "Consegna entro 48 ore" },
  "entro una settimana": { multiplier: 1.10, category: "urgenza", severity: "low", label: "Consegna entro una settimana" },
  "manutenzione programmata": { multiplier: 0.85, category: "urgenza", severity: "low", label: "Manutenzione programmata" },
  
  // Qualità materiali
  "premium": { multiplier: 1.25, category: "materiali", severity: "low", label: "Materiali premium" },
  "lusso": { multiplier: 1.40, category: "materiali", severity: "low", label: "Materiali di lusso" },
  "eco": { multiplier: 1.15, category: "materiali", severity: "low", label: "Materiali ecologici" },
  "riciclato": { multiplier: 0.95, category: "materiali", severity: "low", label: "Materiali riciclati" },
  "biodegradabile": { multiplier: 1.20, category: "materiali", severity: "low", label: "Biodegradabile" },
  
  // Condizioni di lavoro
  "lavoro sporco": { multiplier: 1.15, category: "condizioni", severity: "medium", label: "Lavoro molto sporco" },
  "lavoro pulito": { multiplier: 0.95, category: "condizioni", severity: "low", label: "Lavoro pulito" },
  "protezione ambiente": { multiplier: 1.20, category: "condizioni", severity: "medium", label: "Protezione ambientale" },
  "rumore limitato": { multiplier: 1.10, category: "condizioni", severity: "low", label: "Vincolo rumore" },
  "orari limitati": { multiplier: 1.15, category: "condizioni", severity: "medium", label: "Orari di lavoro limitati" },
  "vicinato sensibile": { multiplier: 1.20, category: "condizioni", severity: "medium", label: "Vicinato sensibile" }
};
