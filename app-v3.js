/**
 * Preventivi-Smart Pro v13.0 — Core Application (Logic & UX Refactoring)
 * Gestione flussi differenziati: Analisi Professionale vs Stima Rapida.
 */

import { initSecurityShield } from "./engine/security-shield.js";
import { initUIProtection } from "./engine/ui-protection.js";
import { getAllTrades, getTradeById, REGIONAL_COEFFICIENTS } from "./engine/database.js";
import { analyzeQuote, computeStats, analyzeTrend } from "./engine/ai-analyzer.js";
import { renderDashboard } from "./engine/dashboard-ui.js";

// ===== INIT SICUREZZA =====
try {
  initSecurityShield();
  initUIProtection();
} catch (e) {
  console.warn("Security init skipped:", e);
}

// ===== STATO GLOBALE =====
let currentStep = 1;
let currentTrade = null;
let userHistory = [];
let wizardMode = 'professional'; // 'professional' (con prezzo) o 'quick' (senza prezzo)

// currentQuote esposto per PDF
window._psQuote = null;
const getQuote = () => window._psQuote;
const setQuote = (v) => { window._psQuote = v; };

// ===== INIZIALIZZAZIONE APP =====
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderTrades();
  renderRegions();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Hero Buttons - Flussi differenziati
  document.getElementById("startAnalysisBtn")?.addEventListener("click", () => startWizard("professional"));
  document.getElementById("startQuickBtn")?.addEventListener("click", () => startWizard("quick"));

  // Wizard Nav
  document.getElementById("prevStepBtn")?.addEventListener("click", prevStep);
  document.getElementById("nextStepBtn")?.addEventListener("click", nextStep);
  document.getElementById("prevStep3Btn")?.addEventListener("click", prevStep);
  document.getElementById("runAnalysisBtn")?.addEventListener("click", runAnalysis);

  // PDF Download
  document.getElementById("btnDownloadPDF")?.addEventListener("click", downloadPDF);

  // Dashboard
  document.getElementById("dashNewAnalysisBtn")?.addEventListener("click", () => {
    document.getElementById("dashboard")?.classList.add("hidden");
    startWizard("professional");
  });
}

// ===== WIZARD FLOW =====
function startWizard(mode) {
  wizardMode = mode;
  const hero = document.getElementById("hero-section");
  const appRoot = document.getElementById("app-root");
  
  if (hero) hero.style.display = "none";
  if (appRoot) {
    appRoot.style.display = "block";
    appRoot.classList.remove("hidden");
  }

  // Personalizza Step 3 Label in base al modo
  const step3Label = document.getElementById("step3Label");
  if (step3Label) {
    step3Label.textContent = (mode === 'professional') ? "Prezzo" : "Analisi";
  }

  currentStep = 1;
  goToStep(1);
}

function goToStep(step) {
  // Nascondi tutti i contenuti degli step
  for (let i = 1; i <= 4; i++) {
    const s = document.getElementById(`step${i}`);
    if (s) s.classList.add("hidden");
  }
  
  // Mostra lo step corrente
  const currentStepEl = document.getElementById(`step${step}`);
  if (currentStepEl) {
    currentStepEl.classList.remove("hidden");
    currentStepEl.classList.add("animate-scale-in");
  }

  updateProgress(step);
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
    
    // LOGICA DIFFERENZIATA: Se siamo in 'quick', saltiamo lo step 3 (prezzo) e andiamo direttamente all'analisi
    if (wizardMode === 'quick') {
      currentStep = 4;
      runAnalysis(); // Avvia l'analisi direttamente
      return;
    }
  }

  currentStep++;
  goToStep(currentStep);
}

function prevStep() {
  // Se siamo allo step 4 e veniamo da 'quick', torniamo allo step 2
  if (currentStep === 4 && wizardMode === 'quick') {
    currentStep = 2;
  } else {
    currentStep--;
  }
  goToStep(currentStep);
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
  
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    const totalSteps = 4;
    const progress = ((step - 1) / (totalSteps - 1)) * 100;
    progressBar.style.setProperty("--progress", `${progress}%`);
  }
}

// ===== RENDER TRADES =====
function renderTrades(category = "all") {
  const grid = document.getElementById("tradesGrid");
  if (!grid) return;

  const trades = getAllTrades();
  grid.innerHTML = trades.map(t => `
    <div class="trade-card ${currentTrade?.id === t.id ? 'selected' : ''}" onclick="selectTrade('${t.id}')">
      <div class="trade-icon" style="background: ${t.color}15; color: ${t.color}">
        <i class="fa-solid ${t.icon}"></i>
      </div>
      <h3 class="trade-name">${t.name}</h3>
      <p class="trade-desc">${t.description}</p>
    </div>
  `).join("");
}

window.selectTrade = (id) => {
  currentTrade = getTradeById(id);
  renderTrades();
  const unitLabel = document.getElementById("unitLabel");
  if (unitLabel) unitLabel.textContent = currentTrade.unit;
  renderDynamicQuestions(currentTrade);
  nextStep();
};

// ===== RENDER DOMANDE DINAMICHE =====
function renderDynamicQuestions(trade) {
  const container = document.getElementById("dynamicQuestions");
  if (!container) return;
  if (!trade.questions || trade.questions.length === 0) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = trade.questions.map(q => `
    <div class="form-group animate-slide-up" style="animation-delay: 0.1s">
      <label class="form-label">${q.label}</label>
      <select class="form-select" name="${q.id}" id="q_${q.id}">
        <option value="">-- Seleziona --</option>
        ${q.options.map(o => `<option value="${o.value}" data-multiplier="${o.multiplier}">${o.label}</option>`).join("")}
      </select>
    </div>
  `).join("");
}

// ===== RENDER REGIONS =====
function renderRegions() {
  const select = document.getElementById("regionSelect");
  if (!select) return;
  select.innerHTML = Object.keys(REGIONAL_COEFFICIENTS).map(r => `<option value="${r}">${r}</option>`).join("");
}

// ===== RUN ANALYSIS (LEVA 1, 2, 5) =====
async function runAnalysis() {
  let receivedPrice = 0;
  
  if (wizardMode === 'professional') {
    receivedPrice = parseFloat(document.getElementById("receivedPriceInput").value);
    if (!receivedPrice || receivedPrice <= 0) {
      showToast("Inserisci l'importo del preventivo", "info");
      return;
    }
  }

  // Assicura che siamo allo step 4
  if (currentStep !== 4) {
    currentStep = 4;
    goToStep(4);
  }

  const loading = document.getElementById("analysisLoading");
  const results = document.getElementById("analysisResults");
  const nav = document.getElementById("resultsNav");
  
  loading.classList.remove("hidden");
  results.classList.add("hidden");
  nav.classList.add("hidden");

  // Simula calcolo AI (Effetto "Scansione")
  await new Promise(r => setTimeout(r, 2500));

  const qty = parseFloat(document.getElementById("quantityInput").value);
  const region = document.getElementById("regionSelect").value;
  const coeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  
  const marketMid = currentTrade.basePrice * qty * coeff;
  const marketMin = marketMid * 0.85;
  const marketMax = marketMid * 1.25;

  // Se siamo in 'quick', usiamo il marketMid come receivedPrice per mostrare i dati senza verdetto negativo
  const finalReceivedPrice = (wizardMode === 'quick') ? marketMid : receivedPrice;

  const analysis = analyzeQuote({
    receivedPrice: finalReceivedPrice,
    marketMin, marketMid, marketMax,
    tradeId: currentTrade.id,
    region,
    mode: wizardMode // Passiamo il modo all'analyzer
  }, { marketMin, marketMid, marketMax });

  renderAnalysisResults(analysis);

  loading.classList.add("hidden");
  results.classList.remove("hidden");
  nav.classList.remove("hidden");

  const historyItem = {
    id: Date.now().toString(),
    tradeId: currentTrade.id,
    tradeName: currentTrade.name,
    region,
    receivedPrice: finalReceivedPrice,
    marketMid,
    analysis,
    mode: wizardMode,
    createdAt: new Date().toISOString()
  };
  setQuote(historyItem);
  saveToHistory(historyItem);
}

function renderAnalysisResults(analysis) {
  const container = document.getElementById("analysisResults");
  const v = analysis.verdict;
  const isQuick = wizardMode === 'quick';

  container.innerHTML = `
    <div class="result-header animate-scale-in">
      ${!isQuick ? `
        <div class="verdict-badge" style="background: ${v.color}20; color: ${v.color}; border: 1px solid ${v.color}">
          ${v.label}
        </div>
      ` : `
        <div class="verdict-badge" style="background: var(--sapphire-light); color: var(--sapphire); border: 1px solid var(--sapphire)">
          STIMA DI MERCATO
        </div>
      `}
      <h2 class="result-score">Precisione AI: ${analysis.trustLevel}%</h2>
      <p class="psychology-text">${isQuick ? "Ecco il valore stimato basato sui dati correnti per la tua regione." : v.psychology}</p>
    </div>

    <div class="benchmark-grid">
      <div class="benchmark-item">
        <span class="b-label">${isQuick ? 'Valore Stimato' : 'Differenza vs Mercato'}</span>
        <span class="b-value ${!isQuick && analysis.diffPercent > 10 ? 'text-danger' : 'text-success'}">
          ${isQuick ? '€' + Math.round(analysis.benchmark.cityAvg).toLocaleString() : (analysis.diffPercent > 0 ? '+' : '') + analysis.diffPercent + '%'}
        </span>
      </div>
      <div class="benchmark-item">
        <span class="b-label">Range Prezzi (${analysis.benchmark.region})</span>
        <span class="b-value" style="font-size: 1rem;">
          €${Math.round(analysis.benchmark.marketMin).toLocaleString()} - €${Math.round(analysis.benchmark.marketMax).toLocaleString()}
        </span>
      </div>
    </div>

    <div class="advice-section">
      <h3><i class="fa-solid fa-lightbulb text-primary"></i> ${isQuick ? 'Note per il Preventivo' : 'Consigli d\'Azione'}</h3>
      <ul class="advice-list">
        ${analysis.advice.map(a => `<li><i class="fa-solid fa-circle-check"></i> ${a}</li>`).join("")}
      </ul>
    </div>
  `;
}

function saveToHistory(item) {
  userHistory.unshift(item);
  localStorage.setItem("quote_history", JSON.stringify(userHistory));
  // Render dashboard solo se esiste
  if (document.getElementById("dashboard")) {
    renderDashboard(userHistory);
  }
}

function downloadPDF() {
  const quote = getQuote();
  if (!quote) return;
  
  if (window._buildPDF) {
    window._buildPDF(quote);
  } else {
    showToast("Generatore PDF non pronto", "error");
  }
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  
  const toast = document.createElement("div");
  toast.className = `toast toast-${type} animate-slide-right`;
  toast.innerHTML = `<i class="fa-solid fa-info-circle"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}
