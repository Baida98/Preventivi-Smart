/**
 * Preventivi-Smart Pro v9.0 — Wizard UI
 * Gestione dinamica del wizard con domande condizionali e engagement
 */

import { getAllTrades, getTradeById } from "./database.js";
import { getConditionalQuestions } from "./smart-calculator.js";

// ===== RENDERING STEP 2: SELEZIONE MESTIERE CON ICONE =====
export function renderStep2TradeSelection(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const trades = getAllTrades();

  // Raggruppa per categoria
  const categories = {};
  trades.forEach(trade => {
    if (!categories[trade.category]) {
      categories[trade.category] = [];
    }
    categories[trade.category].push(trade);
  });

  const categoryLabels = {
    impianti: "🔧 Impianti",
    finiture: "🎨 Finiture",
    strutture: "🏗️ Strutture",
    esterni: "🌳 Esterni",
    servizi: "🧹 Servizi"
  };

  let html = '<div class="trades-grid">';

  Object.entries(categories).forEach(([category, categoryTrades]) => {
    html += `<div class="category-section">
      <h3 class="category-title">${categoryLabels[category] || category}</h3>
      <div class="trades-row">`;

    categoryTrades.forEach(trade => {
      html += `
        <div class="trade-card" data-trade-id="${trade.id}" style="border-top: 4px solid ${trade.color};">
          <div class="trade-icon" style="color: ${trade.color}; background: ${trade.color}15;">
            <i class="fa-solid ${trade.icon}"></i>
          </div>
          <h4 class="trade-name">${trade.name}</h4>
          <p class="trade-desc">${trade.description}</p>
          <div class="trade-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--gray-100);">
            <div class="trade-price">
                <span style="font-size: 0.7rem; color: var(--gray-400); display: block; text-transform: uppercase;">da</span>
                <span style="font-weight: 700; color: var(--gray-800);">€${trade.basePrice}</span>
                <span style="font-size: 0.8rem; color: var(--gray-500);">/${trade.unit}</span>
            </div>
            <div class="trade-complexity" style="font-size: 0.75rem; color: ${trade.color}; font-weight: 600; background: ${trade.color}15; padding: 4px 8px; border-radius: 6px;">
                <i class="fa-solid fa-chart-line"></i> ${trade.complexity}
            </div>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
  });

  html += '</div>';

  container.innerHTML = html;

  // Event listeners
  document.querySelectorAll(".trade-card").forEach(card => {
    card.addEventListener("click", function() {
      const tradeId = this.dataset.tradeId;
      selectTrade(tradeId);
    });
  });
}

function selectTrade(tradeId) {
  // Salva selezione
  window.selectedTradeId = tradeId;

  // Evidenzia card selezionata
  document.querySelectorAll(".trade-card").forEach(card => {
    card.classList.remove("selected");
  });
  document.querySelector(`[data-trade-id="${tradeId}"]`).classList.add("selected");

  // Mostra feedback
  const trade = getTradeById(tradeId);
  if (trade) {
    showToast(`✓ Hai selezionato: ${trade.name}`, "success");
  }
}

// ===== RENDERING STEP 3: DOMANDE MIRATE CON CONDIZIONALI =====
export function renderStep3Questions(containerId, tradeId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const trade = getTradeById(tradeId);
  if (!trade || !trade.questions) {
    container.innerHTML = "<p>Nessuna domanda disponibile</p>";
    return;
  }

  let html = `
    <div class="questions-container">
      <div class="questions-header">
        <h3>
          <i class="fas ${trade.icon}" style="color: ${trade.color}; margin-right: 0.5rem;"></i>
          Dettagli per ${trade.name}
        </h3>
        <p class="questions-subtitle">Rispondi alle domande per un calcolo preciso</p>
      </div>
      <div class="questions-list">
  `;

  trade.questions.forEach((question, index) => {
    html += renderQuestion(question, index + 1, trade.questions.length);
  });

  html += `</div></div>`;

  container.innerHTML = html;

  // Aggiungi event listeners
  setupQuestionListeners(tradeId);
}

function renderQuestion(question, index, total) {
  const progressPercent = (index / total) * 100;

  let html = `
    <div class="question-card" data-question-id="${question.id}">
      <div class="question-progress">
        <div class="progress-bar" style="width: ${progressPercent}%"></div>
      </div>
      <div class="question-content">
        <div class="question-header">
          <span class="question-number">${index}/${total}</span>
          <h4 class="question-label">${question.label}</h4>
        </div>
        <div class="question-options">
  `;

  if (question.type === "select") {
    question.options.forEach(option => {
      html += `
        <label class="option-label">
          <input type="radio" name="${question.id}" value="${option.value}" class="option-input">
          <span class="option-text">${option.label}</span>
          <span class="option-multiplier">×${option.multiplier.toFixed(2)}</span>
        </label>
      `;
    });
  }

  html += `</div></div></div>`;

  return html;
}

function setupQuestionListeners(tradeId) {
  document.querySelectorAll(".option-input").forEach(input => {
    input.addEventListener("change", function() {
      const questionId = this.name;
      const value = this.value;

      // Salva risposta
      if (!window.userAnswers) window.userAnswers = {};
      window.userAnswers[questionId] = value;

      // Mostra domande condizionali
      showConditionalQuestions(tradeId, window.userAnswers);

      // Aggiorna preview prezzo in tempo reale
      updatePricePreview(tradeId);

      // Animazione
      this.closest(".option-label").classList.add("selected");
    });
  });
}

// ===== DOMANDE CONDIZIONALI DINAMICHE =====
function showConditionalQuestions(tradeId, answers) {
  const conditionalQuestions = getConditionalQuestions(tradeId, answers);

  if (conditionalQuestions.length === 0) {
    // Nascondi sezione condizionali se non ce ne sono
    const section = document.getElementById("conditional-questions");
    if (section) section.style.display = "none";
    return;
  }

  let section = document.getElementById("conditional-questions");
  if (!section) {
    section = document.createElement("div");
    section.id = "conditional-questions";
    section.className = "conditional-questions-section";
    document.querySelector(".questions-list").appendChild(section);
  }

  let html = `
    <div class="conditional-header">
      <i class="fas fa-lightbulb" style="color: #fbbf24;"></i>
      <span>Domande Aggiuntive Rilevanti</span>
    </div>
  `;

  conditionalQuestions.forEach((question, index) => {
    html += renderQuestion(question, index + 1, conditionalQuestions.length);
  });

  section.innerHTML = html;
  section.style.display = "block";

  // Setup listeners per domande condizionali
  setupQuestionListeners(tradeId);

  // Animazione di entrata
  section.style.animation = "slideInUp 0.4s ease-out";
}

// ===== PREVIEW PREZZO IN TEMPO REALE =====
function updatePricePreview(tradeId) {
  const previewContainer = document.getElementById("price-preview");
  if (!previewContainer) return;

  const trade = getTradeById(tradeId);
  if (!trade) return;

  const quantity = parseFloat(document.querySelector('input[name="quantity"]')?.value || 1);
  const region = document.querySelector('select[name="region"]')?.value || "Lazio";
  const quality = document.querySelector('input[name="quality"]:checked')?.value || "standard";

  // Calcolo semplice per preview
  let multiplier = 1.0;
  Object.values(window.userAnswers || {}).forEach(answer => {
    if (typeof answer === "string" && answer.includes("grande")) multiplier *= 1.2;
    if (typeof answer === "string" && answer.includes("difficile")) multiplier *= 1.3;
  });

  const estimatedPrice = Math.round(trade.basePrice * quantity * multiplier * 1.15);

  previewContainer.innerHTML = `
    <div class="price-preview-card">
      <span class="preview-label">Stima Indicativa:</span>
      <span class="preview-price">€${estimatedPrice.toLocaleString("it-IT")}</span>
      <span class="preview-note">*Prezzo finale dipende da altri fattori</span>
    </div>
  `;
}

// ===== RENDERING STEP 5: RISULTATI CON INSIGHTS =====
export function renderStep5Results(containerId, analysis) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { verdict, priceRange, insights, advice, trustScore } = analysis;

  let html = `
    <div class="results-container">
      <!-- VERDETTO PRINCIPALE -->
      <div class="verdict-card verdict-${verdict.level}">
        <div class="verdict-icon">
          <i class="fas ${verdict.icon}"></i>
        </div>
        <div class="verdict-content">
          <h2 class="verdict-title">${verdict.title}</h2>
          <p class="verdict-message">${verdict.message}</p>
          <div class="verdict-score">
            <span class="score-label">Score Affidabilità:</span>
            <div class="score-bar">
              <div class="score-fill" style="width: ${trustScore}%; background: ${getTrustScoreColor(trustScore)};"></div>
            </div>
            <span class="score-value">${trustScore}/100</span>
          </div>
        </div>
      </div>

      <!-- RANGE PREZZO -->
      <div class="price-range-card">
        <h3>Range Prezzo di Mercato</h3>
        <div class="price-range-visual">
          <div class="range-min">
            <span class="range-label">Min</span>
            <span class="range-price">€${priceRange.min.toLocaleString("it-IT")}</span>
          </div>
          <div class="range-bar">
            <div class="range-marker" style="left: ${(priceRange.received - priceRange.min) / (priceRange.max - priceRange.min) * 100}%;">
              <span class="marker-label">Tuo Preventivo</span>
            </div>
          </div>
          <div class="range-max">
            <span class="range-label">Max</span>
            <span class="range-price">€${priceRange.max.toLocaleString("it-IT")}</span>
          </div>
        </div>
      </div>

      <!-- INSIGHTS PSICOLOGICI -->
      <div class="insights-section">
        <h3>Fattori Importanti</h3>
        <div class="insights-grid">
  `;

  insights.forEach(insight => {
    html += `
      <div class="insight-card insight-${insight.severity}">
        <div class="insight-icon" style="color: ${insight.color || "#0ea5e9"};">
          <i class="fas ${insight.icon}"></i>
        </div>
        <div class="insight-content">
          <h4>${insight.title}</h4>
          <p>${insight.message}</p>
        </div>
      </div>
    `;
  });

  html += `</div></div>`;

  // CONSIGLI
  html += `<div class="advice-section"><h3>Consigli Esperti</h3><div class="advice-list">`;

  advice.forEach(adv => {
    html += `
      <div class="advice-card" style="border-left: 4px solid ${adv.color};">
        <div class="advice-icon" style="color: ${adv.color};">
          <i class="fas ${adv.icon}"></i>
        </div>
        <div class="advice-content">
          <h4>${adv.title}</h4>
          <p>${adv.text}</p>
        </div>
      </div>
    `;
  });

  html += `</div></div></div>`;

  container.innerHTML = html;
}

function getTrustScoreColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#fbbf24";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

// ===== UTILITY =====
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icons = { success: "fa-circle-check", error: "fa-circle-xmark", info: "fa-circle-info" };
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    background: var(--white);
    border-left: 4px solid var(--${type === 'success' ? 'emerald' : type === 'error' ? 'ruby' : 'sapphire'});
    box-shadow: var(--shadow-lg);
    padding: 16px 24px;
    border-radius: 12px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    color: var(--gray-800);
    animation: slideInRight 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  `;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success}" style="color: var(--${type === 'success' ? 'emerald' : type === 'error' ? 'ruby' : 'sapphire'}); font-size: 1.2rem;"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.4s';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

export default {
  renderStep2TradeSelection,
  renderStep3Questions,
  renderStep5Results
};
