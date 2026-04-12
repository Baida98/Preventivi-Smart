/**
 * Preventivi-Smart Pro v12.0 — Core Application (Psychological Shield)
 * Integrazione delle 5 leve psicologiche nel flusso applicativo.
 */

import { initSecurityShield } from "./engine/security-shield.js";
import { initUIProtection } from "./engine/ui-protection.js";
import { getAllTrades, getTradeById, REGIONAL_COEFFICIENTS } from "./engine/database.js";
import { analyzeQuote, computeStats, analyzeTrend } from "./engine/ai-analyzer.js";
import { renderDashboard } from "./engine/dashboard-ui.js";

// ===== INIT SICUREZZA =====
initSecurityShield();
initUIProtection();

// ===== STATO GLOBALE =====
let currentStep = 1;
let currentTrade = null;
let currentQuote = null;
let userHistory = [];

// ===== INIZIALIZZAZIONE APP =====
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderTrades();
  renderRegions();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Hero Buttons
  document.getElementById("startAnalysisBtn")?.addEventListener("click", () => startWizard("professional"));
  document.getElementById("startQuickBtn")?.addEventListener("click", () => startWizard("quick"));

  // Wizard Nav
  document.getElementById("prevStepBtn")?.addEventListener("click", prevStep);
  document.getElementById("nextStepBtn")?.addEventListener("click", nextStep);
  document.getElementById("prevStep3Btn")?.addEventListener("click", prevStep);
  document.getElementById("runAnalysisBtn")?.addEventListener("click", runAnalysis);

  // Category Filters
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      renderTrades(e.target.dataset.cat);
    });
  });
}

// ===== WIZARD FLOW (LEVA 4: GUIDA) =====
function startWizard(mode) {
  document.getElementById("hero").classList.add("hidden");
  document.getElementById("wizard").classList.remove("hidden");
  updateProgress(1);
}

function nextStep() {
  if (currentStep === 1 && !currentTrade) {
    showToast("Seleziona prima un tipo di lavoro", "info");
    return;
  }
  
  if (currentStep === 2) {
    const qty = document.getElementById("quantityInput").value;
    if (!qty || qty <= 0) {
      showToast("Inserisci una quantità valida", "info");
      return;
    }
  }

  document.getElementById(`step${currentStep}`).classList.add("hidden");
  currentStep++;
  document.getElementById(`step${currentStep}`).classList.remove("hidden");
  updateProgress(currentStep);
}

function prevStep() {
  document.getElementById(`step${currentStep}`).classList.add("hidden");
  currentStep--;
  document.getElementById(`step${currentStep}`).classList.remove("hidden");
  updateProgress(currentStep);
}

function updateProgress(step) {
  for (let i = 1; i <= 4; i++) {
    const node = document.getElementById(`ps${i}`);
    if (node) {
      node.classList.remove("active", "done");
      if (i < step) node.classList.add("done");
      else if (i === step) node.classList.add("active");
    }
  }
  const line = document.getElementById("pl1");
  if (line) line.style.width = `${((step - 1) / 3) * 100}%`;
}

// ===== RENDER TRADES (LEVA 1: SICUREZZA) =====
function renderTrades(category = "all") {
  const grid = document.getElementById("tradesGrid");
  if (!grid) return;

  const trades = getAllTrades();
  const filtered = category === "all" ? trades : trades.filter(t => t.category === category);

  grid.innerHTML = filtered.map(t => `
    <div class="trade-card ${currentTrade?.id === t.id ? 'selected' : ''}" onclick="selectTrade('${t.id}')">
      <div class="trade-icon" style="background: ${t.color}20; color: ${t.color}">
        <i class="fas ${t.icon}"></i>
      </div>
      <h3 class="trade-name">${t.name}</h3>
      <p class="trade-desc">${t.description}</p>
    </div>
  `).join("");
}

window.selectTrade = (id) => {
  currentTrade = getTradeById(id);
  renderTrades(document.querySelector(".filter-btn.active")?.dataset.cat || "all");
  document.getElementById("unitLabel").textContent = currentTrade.unit;
  nextStep();
};

// ===== RENDER REGIONS =====
function renderRegions() {
  const select = document.getElementById("regionSelect");
  if (!select) return;

  select.innerHTML = Object.keys(REGIONAL_COEFFICIENTS).map(r => `
    <option value="${r}">${r}</option>
  `).join("");
}

// ===== RUN ANALYSIS (LEVA 1, 2, 5) =====
async function runAnalysis() {
  const receivedPrice = parseFloat(document.getElementById("receivedPriceInput").value);
  if (!receivedPrice || receivedPrice <= 0) {
    showToast("Inserisci l'importo del preventivo", "info");
    return;
  }

  // Mostra loading (Leva 3: AI Percepibile)
  nextStep();
  const loading = document.getElementById("analysisLoading");
  const results = document.getElementById("analysisResults");
  const nav = document.getElementById("resultsNav");
  
  loading.classList.remove("hidden");
  results.classList.add("hidden");
  nav.classList.add("hidden");

  // Simula calcolo AI (Leva 3)
  await new Promise(r => setTimeout(r, 2000));

  // Calcolo dati mercato (Simulato per brevità)
  const qty = parseFloat(document.getElementById("quantityInput").value);
  const region = document.getElementById("regionSelect").value;
  const coeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  
  const marketMid = currentTrade.basePrice * qty * coeff;
  const marketMin = marketMid * 0.85;
  const marketMax = marketMid * 1.25;

  const analysis = analyzeQuote({
    receivedPrice,
    marketMin,
    marketMid,
    marketMax,
    tradeId: currentTrade.id,
    region
  }, { marketMin, marketMid, marketMax });

  // Render Risultati (Leva 5: Feedback utile)
  renderAnalysisResults(analysis);

  loading.classList.add("hidden");
  results.classList.remove("hidden");
  nav.classList.remove("hidden");

  // Salva nello storico (Leva 3)
  saveToHistory({
    id: Date.now().toString(),
    tradeId: currentTrade.id,
    tradeName: currentTrade.name,
    receivedPrice,
    marketMid,
    analysis,
    createdAt: new Date().toISOString()
  });
}

function renderAnalysisResults(analysis) {
  const container = document.getElementById("analysisResults");
  const v = analysis.verdict;

  container.innerHTML = `
    <div class="result-header">
      <div class="verdict-badge" style="background: ${v.color}20; color: ${v.color}; border: 1px solid ${v.color}">
        ${v.label}
      </div>
      <h2 class="result-score">Affidabilità AI: ${analysis.trustLevel}%</h2>
      <p class="psychology-text">${v.psychology}</p>
    </div>

    <div class="benchmark-grid">
      <div class="benchmark-item">
        <span class="b-label">Differenza vs Mercato</span>
        <span class="b-value ${analysis.diffPercent > 10 ? 'text-danger' : 'text-success'}">
          ${analysis.diffPercent > 0 ? '+' : ''}${analysis.diffPercent}%
        </span>
      </div>
      <div class="benchmark-item">
        <span class="b-label">Media Città (${analysis.benchmark.region})</span>
        <span class="b-value">€${analysis.benchmark.cityAvg.toLocaleString("it-IT", { maximumFractionDigits: 0 })}</span>
      </div>
    </div>

    <div class="advice-section">
      <h3><i class="fas fa-lightbulb text-primary"></i> Consigli d'Azione</h3>
      <ul class="advice-list">
        ${analysis.advice.map(a => `<li><i class="fas fa-check"></i> ${a}</li>`).join("")}
      </ul>
    </div>

    <div class="trust-footer">
      <p><i class="fas fa-database"></i> Analisi basata su ${analysis.benchmark.totalDataPoints.toLocaleString()} dati reali di mercato.</p>
    </div>
  `;
}

// ===== HISTORY & DASHBOARD (LEVA 3) =====
function saveToHistory(item) {
  userHistory.unshift(item);
  localStorage.setItem("quote_history", JSON.stringify(userHistory));
  renderDashboard(userHistory);
}

function showToast(msg, type) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
  document.getElementById("toastContainer").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Export functions for global access
window.startWizard = startWizard;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.runAnalysis = runAnalysis;
