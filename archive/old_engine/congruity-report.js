/**
 * Preventivi-Smart Pro v11.0 — Congruity Report Renderer
 * Rendering interattivo del Report di Congruità con grafici e analisi visuale
 */

export function renderCongruityReport(containerId, analysisResult) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const {
    trade,
    input,
    marketAnalysis,
    congruityAnalysis,
    hourlyBenchmark,
    timeline,
    breakdown,
    riskAssessment,
    professionalAdvice,
    reliabilityScore
  } = analysisResult;

  let html = `
    <div class="professional-report">
      <!-- HEADER -->
      <div class="report-header">
        <h2 class="report-title">📋 Report di Congruità di Mercato</h2>
        <p class="report-subtitle">Analisi Professionale del Preventivo Ricevuto</p>
        <div class="report-meta">
          <div class="report-meta-item">
            <span class="report-meta-label">Mestiere</span>
            <span class="report-meta-value">${trade.name}</span>
          </div>
          <div class="report-meta-item">
            <span class="report-meta-label">Regione</span>
            <span class="report-meta-value">${input.region}</span>
          </div>
          <div class="report-meta-item">
            <span class="report-meta-label">Qualità</span>
            <span class="report-meta-value">${capitalizeFirst(input.quality)}</span>
          </div>
          <div class="report-meta-item">
            <span class="report-meta-label">Data Analisi</span>
            <span class="report-meta-value">${new Date().toLocaleDateString("it-IT")}</span>
          </div>
        </div>
      </div>

      <!-- RELIABILITY SCORE -->
      <div style="margin-bottom: 2rem;">
        ${renderReliabilityScore(reliabilityScore)}
      </div>

      <!-- CONGRUITY ANALYSIS -->
      ${renderCongruityAnalysis(congruityAnalysis, marketAnalysis, input)}

      <!-- HOURLY BENCHMARK -->
      ${renderHourlyBenchmark(hourlyBenchmark)}

      <!-- TIMELINE & BREAKDOWN -->
      ${renderTimelineBreakdown(timeline, breakdown)}

      <!-- RISK ASSESSMENT -->
      ${renderRiskAssessment(riskAssessment)}

      <!-- PROFESSIONAL ADVICE -->
      ${renderProfessionalAdvice(professionalAdvice)}

      <!-- FOOTER -->
      <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e2e8f0; text-align: center; color: #6b7280; font-size: 0.85rem;">
        <p>Questo report è stato generato da Preventivi-Smart Pro v11.0</p>
        <p>Per uso personale - Non è un documento legale vincolante</p>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// ===== RELIABILITY SCORE =====
function renderReliabilityScore(score) {
  const getColor = (s) => {
    if (s >= 80) return { bg: "#dcfce7", border: "#22c55e", text: "#166534" };
    if (s >= 60) return { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" };
    if (s >= 40) return { bg: "#fed7aa", border: "#f97316", text: "#9a3412" };
    return { bg: "#fecaca", border: "#ef4444", text: "#991b1b" };
  };

  const color = getColor(score);
  const label = score >= 80 ? "Affidabile" : score >= 60 ? "Accettabile" : score >= 40 ? "Dubbio" : "Rischioso";

  return `
    <div style="background: ${color.bg}; border: 2px solid ${color.border}; border-radius: 12px; padding: 1.5rem; text-align: center;">
      <div style="font-size: 0.9rem; color: ${color.text}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Score di Affidabilità</div>
      <div style="font-size: 3rem; font-weight: 900; color: ${color.text}; line-height: 1;">${score}</div>
      <div style="font-size: 1rem; font-weight: 700; color: ${color.text}; margin-top: 0.5rem;">${label}</div>
    </div>
  `;
}

// ===== CONGRUITY ANALYSIS =====
function renderCongruityAnalysis(congruityAnalysis, marketAnalysis, input) {
  const { ratio, diffPercent, diffAmount, classification, severity, recommendation } = congruityAnalysis;
  const { marketMin, marketMid, marketMax } = marketAnalysis;
  const { receivedPrice } = input;

  // Calcolo percentuale sulla barra
  const percentile = ((receivedPrice - marketMin) / (marketMax - marketMin)) * 100;
  const clampedPercentile = Math.max(0, Math.min(100, percentile));

  const severityColors = {
    critical: { bg: "#fecaca", border: "#dc2626", text: "#991b1b" },
    high: { bg: "#fed7aa", border: "#f97316", text: "#9a3412" },
    medium: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    low: { bg: "#dcfce7", border: "#22c55e", text: "#166534" },
    info: { bg: "#dbeafe", border: "#0ea5e9", text: "#0c4a6e" }
  };

  const colors = severityColors[severity] || severityColors.info;

  return `
    <div class="congruity-section">
      <h3 class="congruity-title">
        <i class="fas fa-balance-scale"></i>
        Analisi di Congruità di Mercato
      </h3>

      <div class="congruity-grid">
        <div class="congruity-item">
          <div class="congruity-label">Prezzo Ricevuto</div>
          <div class="congruity-value">€${receivedPrice.toLocaleString("it-IT")}</div>
        </div>
        <div class="congruity-item">
          <div class="congruity-label">Media di Mercato</div>
          <div class="congruity-value">€${marketMid.toLocaleString("it-IT")}</div>
        </div>
        <div class="congruity-item">
          <div class="congruity-label">Differenza</div>
          <div class="congruity-value" style="color: ${diffAmount > 0 ? "#ef4444" : "#22c55e"};">
            ${diffAmount > 0 ? "+" : ""}€${diffAmount.toLocaleString("it-IT")}
          </div>
          <div class="congruity-unit">${diffPercent > 0 ? "+" : ""}${diffPercent}%</div>
        </div>
        <div class="congruity-item">
          <div class="congruity-label">Ratio Prezzo</div>
          <div class="congruity-value">${ratio.toFixed(2)}x</div>
          <div class="congruity-unit">vs media</div>
        </div>
      </div>

      <!-- PRICE RANGE BAR -->
      <div style="margin: 1.5rem 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight: 600; color: #6b7280;">
          <span>€${marketMin.toLocaleString("it-IT")}</span>
          <span>€${marketMax.toLocaleString("it-IT")}</span>
        </div>
        <div style="position: relative; height: 40px; background: linear-gradient(90deg, #dcfce7, #fef3c7, #fed7aa, #fecaca); border-radius: 8px; overflow: hidden; border: 2px solid #e5e7eb;">
          <div style="position: absolute; top: 50%; left: ${clampedPercentile}%; transform: translate(-50%, -50%); width: 3px; height: 100%; background: #1f2937; box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);"></div>
        </div>
      </div>

      <!-- CLASSIFICATION & RECOMMENDATION -->
      <div class="congruity-recommendation" style="background: ${colors.bg}; border-left-color: ${colors.border};">
        <div class="congruity-recommendation-title" style="color: ${colors.text};">
          <i class="fas fa-lightbulb"></i>
          ${classification}
        </div>
        <div class="congruity-recommendation-text" style="color: ${colors.text};">
          ${recommendation}
        </div>
      </div>
    </div>
  `;
}

// ===== HOURLY BENCHMARK =====
function renderHourlyBenchmark(hourlyBenchmark) {
  const { receivedHourly, marketHourly, hourlyDiff, hourlyDiffPercent, assessment, totalHours, workDays } = hourlyBenchmark;

  const assessmentColors = {
    EQUO: { bg: "#dcfce7", border: "#22c55e", text: "#166534" },
    ELEVATO: { bg: "#fecaca", border: "#ef4444", text: "#991b1b" },
    BASSO: { bg: "#fed7aa", border: "#f97316", text: "#9a3412" }
  };

  const colors = assessmentColors[assessment] || assessmentColors.EQUO;

  return `
    <div class="congruity-section">
      <h3 class="congruity-title">
        <i class="fas fa-hourglass-end"></i>
        Benchmark Orario
      </h3>

      <div class="congruity-grid">
        <div class="congruity-item">
          <div class="congruity-label">Ore Totali Stimate</div>
          <div class="congruity-value">${totalHours.toFixed(1)}</div>
          <div class="congruity-unit">ore/uomo</div>
        </div>
        <div class="congruity-item">
          <div class="congruity-label">Giorni Lavorativi</div>
          <div class="congruity-value">${workDays}</div>
          <div class="congruity-unit">~${Math.ceil(workDays * 1.4)} giorni calendario</div>
        </div>
        <div class="congruity-item">
          <div class="congruity-label">€/Ora Ricevuto</div>
          <div class="congruity-value">€${receivedHourly}</div>
        </div>
        <div class="congruity-item">
          <div class="congruity-label">€/Ora Mercato</div>
          <div class="congruity-value">€${marketHourly}</div>
        </div>
      </div>

      <div class="congruity-recommendation" style="background: ${colors.bg}; border-left-color: ${colors.border};">
        <div class="congruity-recommendation-title" style="color: ${colors.text};">
          <i class="fas fa-check-circle"></i>
          ${assessment === "EQUO" ? "✅ Prezzo Orario Equo" : assessment === "ELEVATO" ? "⚠️ Prezzo Orario Elevato" : "📉 Prezzo Orario Basso"}
        </div>
        <div class="congruity-recommendation-text" style="color: ${colors.text};">
          Stai pagando €${receivedHourly}/ora vs €${marketHourly}/ora di media (${hourlyDiffPercent > 0 ? "+" : ""}${hourlyDiffPercent}%).
          ${assessment === "EQUO" ? "Prezzo competitivo." : assessment === "ELEVATO" ? "Considera di negoziare uno sconto." : "Verifica che la qualità sia garantita."}
        </div>
      </div>
    </div>
  `;
}

// ===== TIMELINE & BREAKDOWN =====
function renderTimelineBreakdown(timeline, breakdown) {
  return `
    <div class="congruity-section">
      <h3 class="congruity-title">
        <i class="fas fa-chart-pie"></i>
        Composizione Costi
      </h3>

      <div class="congruity-grid">
        <div class="congruity-item">
          <div class="congruity-label">Manodopera</div>
          <div class="congruity-value">€${breakdown.labor.toLocaleString("it-IT")}</div>
          <div class="congruity-unit">${breakdown.laborPercentage}%</div>
        </div>
        <div class="congruity-item">
          <div class="congruity-label">Materiali</div>
          <div class="congruity-value">€${breakdown.materials.toLocaleString("it-IT")}</div>
          <div class="congruity-unit">${breakdown.materialsPercentage}%</div>
        </div>
        <div class="congruity-item">
          <div class="congruity-label">Oneri & Gestione</div>
          <div class="congruity-value">€${breakdown.overhead.toLocaleString("it-IT")}</div>
          <div class="congruity-unit">${breakdown.overheadPercentage}%</div>
        </div>
        <div class="congruity-item">
          <div class="congruity-label">€/Ora Manodopera</div>
          <div class="congruity-value">€${breakdown.laborPerHour}</div>
          <div class="congruity-unit">costo orario</div>
        </div>
      </div>
    </div>
  `;
}

// ===== RISK ASSESSMENT =====
function renderRiskAssessment(riskAssessment) {
  const { risks, warnings, recommendations } = riskAssessment;

  let html = `
    <div class="risk-assessment-section">
      <h3 class="risk-assessment-title">
        <i class="fas fa-shield-exclamation"></i>
        Valutazione Rischi
      </h3>

      <div class="risk-list">
  `;

  // Rischi critici
  risks.forEach(risk => {
    html += `
      <div class="risk-item">
        <div class="risk-item-header">
          <div class="risk-item-icon">⚠️</div>
          <div class="risk-item-title">${risk.title}</div>
        </div>
        <div class="risk-item-description">${risk.description}</div>
        <button class="risk-item-action">${risk.action}</button>
      </div>
    `;
  });

  // Avvisi
  warnings.forEach(warning => {
    html += `
      <div class="risk-item warning">
        <div class="risk-item-header">
          <div class="risk-item-icon">⚡</div>
          <div class="risk-item-title">${warning.title}</div>
        </div>
        <div class="risk-item-description">${warning.description}</div>
        <button class="risk-item-action">${warning.action}</button>
      </div>
    `;
  });

  // Raccomandazioni
  recommendations.forEach(rec => {
    html += `
      <div class="risk-item recommendation">
        <div class="risk-item-header">
          <div class="risk-item-icon">✅</div>
          <div class="risk-item-title">${rec.title}</div>
        </div>
        <div class="risk-item-description">${rec.description}</div>
      </div>
    `;
  });

  html += `</div></div>`;
  return html;
}

// ===== PROFESSIONAL ADVICE =====
function renderProfessionalAdvice(advice) {
  let html = `
    <div class="professional-advice-section">
      <h3 class="professional-advice-title">
        <i class="fas fa-lightbulb"></i>
        Consigli Professionali
      </h3>

      <div class="advice-list">
  `;

  advice.forEach(item => {
    html += `
      <div class="advice-item">
        <div class="advice-item-header">
          <div class="advice-item-icon">
            <i class="fas ${item.icon}"></i>
          </div>
          <div class="advice-item-title">${item.title}</div>
        </div>
        <div class="advice-item-text">${item.text}</div>
      </div>
    `;
  });

  html += `</div></div>`;
  return html;
}

// ===== UTILITY =====
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default {
  renderCongruityReport
};
