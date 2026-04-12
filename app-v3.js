/**
 * Preventivi-Smart Pro v17.0 — Hierarchical Flow & Google Auth
 */

import { initSecurityShield } from "./engine/security-shield.js";
import { initUIProtection } from "./engine/ui-protection.js";
import { getAllCategories, getTradesByCategory, getTradeById, REGIONAL_COEFFICIENTS } from "./engine/database.js";
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
let currentCategory = null;
let currentTrade = null;
let userHistory = [];
let wizardMode = 'professional';
let userProfile = null; // Per Google Login

window._psQuote = null;
const setQuote = (v) => { window._psQuote = v; };

// ===== INIZIALIZZAZIONE APP =====
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderCategories();
  renderRegions();
  checkAuth();
});

// ===== AUTH CHECK (MOCK) =====
function checkAuth() {
  const savedUser = localStorage.getItem("ps_user");
  if (savedUser) {
    userProfile = JSON.parse(savedUser);
    updateUserUI();
  }
}

function handleGoogleLogin() {
  // Mock Google Login
  userProfile = { name: "Utente Demo", email: "demo@gmail.com", picture: "fa-user-circle" };
  localStorage.setItem("ps_user", JSON.stringify(userProfile));
  updateUserUI();
  showToast("Accesso effettuato con Google", "success");
}

function updateUserUI() {
  const nav = document.getElementById("userNav");
  if (nav && userProfile) {
    nav.innerHTML = `
      <div class="user-profile-badge animate-scale-in">
        <i class="fa-solid fa-circle-user"></i>
        <span>${userProfile.name}</span>
        <button class="btn-logout" onclick="localStorage.removeItem('ps_user'); location.reload();"><i class="fa-solid fa-right-from-bracket"></i></button>
      </div>
    `;
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  document.getElementById("startAnalysisBtn")?.addEventListener("click", () => startWizard("professional"));
  document.getElementById("startQuickBtn")?.addEventListener("click", () => startWizard("quick"));
  document.getElementById("googleLoginBtn")?.addEventListener("click", handleGoogleLogin);
  document.getElementById("prevStepBtn")?.addEventListener("click", prevStep);
  document.getElementById("nextStepBtn")?.addEventListener("click", nextStep);
  document.getElementById("prevStep3Btn")?.addEventListener("click", prevStep);
  document.getElementById("runAnalysisBtn")?.addEventListener("click", runAnalysis);
  document.getElementById("btnDownloadPDF")?.addEventListener("click", downloadPDF);
  
  // Visual Feedback: Update icons on input
  document.getElementById("regionSelect")?.addEventListener("change", (e) => {
    updateVisualFeedback('region', e.target.value);
  });
  document.getElementById("quantityInput")?.addEventListener("input", (e) => {
    updateVisualFeedback('quantity', e.target.value);
  });
  document.getElementById("receivedPriceInput")?.addEventListener("input", (e) => {
    updateVisualFeedback('price', e.target.value);
  });
}

function updateVisualFeedback(type, value) {
  const iconMap = {
    region: 'fa-location-dot',
    quantity: 'fa-ruler-combined',
    price: 'fa-coins'
  };
  const feedbackEl = document.getElementById(`feedback-${type}`);
  if (feedbackEl) {
    feedbackEl.innerHTML = value ? `<i class="fa-solid ${iconMap[type]} animate-pulse-soft"></i>` : '';
  }
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

  const step3Label = document.getElementById("step3Label");
  if (step3Label) step3Label.textContent = (mode === 'professional') ? "Prezzo" : "Analisi";

  currentStep = 1;
  goToStep(1);
}

function goToStep(step) {
  for (let i = 1; i <= 4; i++) {
    const s = document.getElementById(`step${i}`);
    if (s) s.classList.add("hidden");
  }
  
  const currentStepEl = document.getElementById(`step${step}`);
  if (currentStepEl) {
    currentStepEl.classList.remove("hidden");
    currentStepEl.classList.add("animate-scale-in");
  }

  updateProgress(step);
}

function nextStep() {
  if (currentStep === 1) {
    if (!currentCategory) {
      showToast("Seleziona una categoria", "info");
      return;
    }
    // Se abbiamo selezionato la categoria, mostriamo le sottocategorie nello stesso step o avanziamo?
    // Facciamo uno step intermedio 1.5 per le sottocategorie
    renderSubTrades(currentCategory.id);
    return; 
  }
  
  if (currentStep === 2) {
    const qty = document.getElementById("quantityInput").value;
    if (!qty || qty <= 0) {
      showToast("Inserisci una quantità valida", "info");
      return;
    }
    if (wizardMode === 'quick') {
      currentStep = 4;
      runAnalysis();
      return;
    }
  }

  currentStep++;
  goToStep(currentStep);
}

function prevStep() {
  if (currentStep === 1 && document.getElementById("tradesGrid").dataset.view === "sub") {
    renderCategories();
    return;
  }
  if (currentStep === 4 && wizardMode === 'quick') currentStep = 2;
  else currentStep--;
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
    const progress = ((step - 1) / 3) * 100;
    progressBar.style.setProperty("--progress", `${progress}%`);
  }
}

// ===== RENDERING CATEGORIES & TRADES =====
function renderCategories() {
  const grid = document.getElementById("tradesGrid");
  if (!grid) return;
  grid.dataset.view = "main";
  const cats = getAllCategories();
  grid.innerHTML = cats.map(c => `
    <div class="trade-card animate-slide-up" onclick="selectCategory('${c.id}')">
      <div class="trade-icon" style="background: ${c.color}15; color: ${c.color}">
        <i class="fa-solid ${c.icon}"></i>
      </div>
      <h3 class="trade-name">${c.name}</h3>
      <p class="trade-desc">${c.desc}</p>
    </div>
  `).join("");
  
  // Update Header
  document.querySelector("#step1 .step-title").textContent = "Cosa dobbiamo analizzare?";
  document.querySelector("#step1 .step-subtitle").textContent = "Seleziona il tipo di professionista";
}

window.selectCategory = (id) => {
  const cats = getAllCategories();
  currentCategory = cats.find(c => c.id === id);
  renderSubTrades(id);
};

function renderSubTrades(catId) {
  const grid = document.getElementById("tradesGrid");
  grid.dataset.view = "sub";
  const trades = getTradesByCategory(catId);
  grid.innerHTML = trades.map(t => `
    <div class="trade-card animate-scale-in" onclick="selectTrade('${t.id}')">
      <div class="trade-icon" style="background: ${currentCategory.color}15; color: ${currentCategory.color}">
        <i class="fa-solid ${t.icon}"></i>
      </div>
      <h3 class="trade-name">${t.name}</h3>
      <p class="trade-desc">${t.description}</p>
    </div>
  `).join("");
  
  // Update Header
  document.querySelector("#step1 .step-title").textContent = currentCategory.name;
  document.querySelector("#step1 .step-subtitle").textContent = "Qual è il problema specifico?";
}

window.selectTrade = (id) => {
  currentTrade = getTradeById(id);
  const unitLabel = document.getElementById("unitLabel");
  if (unitLabel) unitLabel.textContent = currentTrade.unit;
  currentStep = 2;
  goToStep(2);
};

// ===== RENDER REGIONS =====
function renderRegions() {
  const select = document.getElementById("regionSelect");
  if (!select) return;
  select.innerHTML = `<option value="">-- Seleziona Regione --</option>` + 
    Object.keys(REGIONAL_COEFFICIENTS).map(r => `<option value="${r}">${r}</option>`).join("");
}

// ===== RUN ANALYSIS =====
async function runAnalysis() {
  let receivedPrice = 0;
  if (wizardMode === 'professional') {
    receivedPrice = parseFloat(document.getElementById("receivedPriceInput").value);
    if (!receivedPrice || receivedPrice <= 0) {
      showToast("Inserisci l'importo del preventivo", "info");
      return;
    }
  }

  currentStep = 4;
  goToStep(4);

  const loading = document.getElementById("analysisLoading");
  const results = document.getElementById("analysisResults");
  const nav = document.getElementById("resultsNav");
  
  loading.classList.remove("hidden");
  results.classList.add("hidden");
  nav.classList.add("hidden");

  await new Promise(r => setTimeout(r, 2500));

  const qty = parseFloat(document.getElementById("quantityInput").value);
  const region = document.getElementById("regionSelect").value;
  const coeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  const marketMid = currentTrade.basePrice * qty * coeff;
  const finalReceivedPrice = (wizardMode === 'quick') ? marketMid : receivedPrice;

  const analysis = analyzeQuote({
    receivedPrice: finalReceivedPrice,
    marketMin: marketMid * 0.85, marketMid, marketMax: marketMid * 1.25,
    tradeId: currentTrade.id, region, mode: wizardMode
  }, { marketMin: marketMid * 0.85, marketMid, marketMax: marketMid * 1.25 });

  renderAnalysisResults(analysis);
  loading.classList.add("hidden");
  results.classList.remove("hidden");
  nav.classList.remove("hidden");

  const historyItem = {
    id: Date.now().toString(),
    tradeName: currentTrade.name,
    region, receivedPrice: finalReceivedPrice, marketMid, analysis, createdAt: new Date().toISOString()
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
      <div class="verdict-badge" style="background: ${isQuick ? 'var(--sapphire-light)' : v.color + '20'}; color: ${isQuick ? 'var(--sapphire)' : v.color}; border: 1px solid ${isQuick ? 'var(--sapphire)' : v.color}">
        ${isQuick ? 'STIMA DI MERCATO' : v.label}
      </div>
      <h2 class="result-score">Precisione AI: ${analysis.trustLevel}%</h2>
      <p class="psychology-text">${isQuick ? "Valore stimato basato sui dati regionali correnti." : v.psychology}</p>
    </div>
    <div class="benchmark-grid">
      <div class="benchmark-item">
        <span class="b-label">${isQuick ? 'Valore Stimato' : 'Differenza vs Mercato'}</span>
        <span class="b-value ${!isQuick && analysis.diffPercent > 10 ? 'text-danger' : 'text-success'}">
          ${isQuick ? '€' + Math.round(analysis.benchmark.cityAvg).toLocaleString() : (analysis.diffPercent > 0 ? '+' : '') + analysis.diffPercent + '%'}
        </span>
      </div>
      <div class="benchmark-item">
        <span class="b-label">Range (${analysis.benchmark.region})</span>
        <span class="b-value" style="font-size: 1rem;">€${Math.round(analysis.benchmark.marketMin).toLocaleString()} - €${Math.round(analysis.benchmark.marketMax).toLocaleString()}</span>
      </div>
    </div>
    <div class="advice-section">
      <h3><i class="fa-solid fa-lightbulb text-primary"></i> Consigli</h3>
      <ul class="advice-list">${analysis.advice.map(a => `<li><i class="fa-solid fa-circle-check"></i> ${a}</li>`).join("")}</ul>
    </div>
  `;
}

function saveToHistory(item) {
  userHistory.unshift(item);
  localStorage.setItem("quote_history", JSON.stringify(userHistory));
  if (document.getElementById("dashboard")) renderDashboard(userHistory);
}

function downloadPDF() {
  if (window._buildPDF) window._buildPDF(window._psQuote);
  else showToast("Generatore PDF non pronto", "error");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type} animate-slide-right`;
  toast.innerHTML = `<i class="fa-solid fa-info-circle"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
}
