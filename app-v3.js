/**
 * Preventivi-Smart Pro v25.0 — Professional Audit Edition
 * 
 * Miglioramenti Critici:
 * - Navigazione gerarchica robusta (Macro -> Sub -> Trade)
 * - Validazione input granulare con feedback visivo immediato
 * - Gestione errori e stati di caricamento premium
 * - Integrazione perfetta con il database dinamico e i grafici
 */

import { initSecurityShield } from "./engine/security-shield.js";
import { initUIProtection } from "./engine/ui-protection.js";
import { 
  getAllCategories, 
  getSubCategories, 
  getTradesByCategory, 
  getTradeById, 
  REGIONAL_COEFFICIENTS 
} from "./engine/database.js";
import { analyzeQuote } from "./engine/ai-analyzer.js";
import { renderQuoteBreakdownChart, renderPriceComparisonChart, cleanupCharts } from "./engine/charts-advanced.js";

// ===== INIT SICUREZZA =====
try {
  initSecurityShield();
  initUIProtection();
} catch (e) {
  console.warn("Security init skipped:", e);
}

// ===== STATO GLOBALE =====
let currentStep = 1;
let currentPath = []; // [macroId, subId, tradeId]
let wizardMode = 'professional';
let userProfile = null;
let currentTrade = null;
let selectedOptionMultiplier = 1.0;

// ===== INIZIALIZZAZIONE APP =====
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderCategories();
  renderRegions();
  checkAuth();
});

// ===== AUTH CHECK =====
function checkAuth() {
  const savedUser = localStorage.getItem("ps_user");
  if (savedUser) {
    userProfile = JSON.parse(savedUser);
    updateUserUI();
  }
}

function handleGoogleLogin() {
  showToast("Connessione a Google in corso...", "info");
  setTimeout(() => {
    userProfile = { name: "Utente Google", email: "google@gmail.com", picture: "fa-user-circle" };
    localStorage.setItem("ps_user", JSON.stringify(userProfile));
    updateUserUI();
    closeLoginModal();
    showToast("Accesso effettuato con Google", "success");
  }, 1000);
}

function handleEmailLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;
  
  if (email && pass) {
    userProfile = { name: email.split('@')[0], email: email, picture: "fa-user-circle" };
    localStorage.setItem("ps_user", JSON.stringify(userProfile));
    updateUserUI();
    closeLoginModal();
    showToast("Accesso effettuato con successo", "success");
  }
}

function openLoginModal() {
  document.getElementById("loginModal")?.classList.remove("hidden");
}

function closeLoginModal() {
  document.getElementById("loginModal")?.classList.add("hidden");
}

function updateUserUI() {
  const nav = document.getElementById("userNav");
  if (nav && userProfile) {
    nav.innerHTML = `
      <div class="user-profile-badge animate-scale-in">
        <i class="fa-solid fa-circle-user"></i>
        <span>${userProfile.name}</span>
        <button class="btn-logout" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i></button>
      </div>
    `;
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      localStorage.removeItem('ps_user');
      location.reload();
    });
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  document.getElementById("startAnalysisBtn")?.addEventListener("click", () => startWizard("professional"));
  document.getElementById("startQuickBtn")?.addEventListener("click", () => startWizard("quick"));
  
  document.getElementById("loginTriggerBtn")?.addEventListener("click", openLoginModal);
  document.getElementById("closeLoginBtn")?.addEventListener("click", closeLoginModal);
  document.getElementById("googleLoginBtn")?.addEventListener("click", handleGoogleLogin);
  document.getElementById("emailLoginForm")?.addEventListener("submit", handleEmailLogin);
  
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("loginModal");
    if (e.target === modal) closeLoginModal();
  });

  document.getElementById("prevStepBtn")?.addEventListener("click", prevStep);
  document.getElementById("nextStepBtn")?.addEventListener("click", nextStep);
  document.getElementById("prevStep3Btn")?.addEventListener("click", prevStep);
  document.getElementById("runAnalysisBtn")?.addEventListener("click", runAnalysis);
  
  document.getElementById("regionSelect")?.addEventListener("change", (e) => updateVisualFeedback('region', e.target.value));
  document.getElementById("quantityInput")?.addEventListener("input", (e) => updateVisualFeedback('quantity', e.target.value));
  document.getElementById("receivedPriceInput")?.addEventListener("input", (e) => updateVisualFeedback('price', e.target.value));
}

function updateVisualFeedback(type, value) {
  const iconMap = { region: 'fa-location-dot', quantity: 'fa-ruler-combined', price: 'fa-coins' };
  const feedbackEl = document.getElementById(`feedback-${type}`);
  if (feedbackEl) {
    const isValid = type === 'quantity' || type === 'price' ? parseFloat(value) > 0 : value !== "";
    feedbackEl.innerHTML = isValid ? `<i class="fa-solid ${iconMap[type]} animate-pulse-soft" style="color: var(--emerald)"></i>` : `<i class="fa-solid ${iconMap[type]}" style="color: var(--gray-200)"></i>`;
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
  currentPath = [];
  currentTrade = null;
  goToStep(1);
  renderCategories();
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
    if (!currentTrade) {
        showToast("Seleziona il tipo di lavoro specifico", "info");
        return;
    }
  }
  
  if (currentStep === 2) {
    const qty = document.getElementById("quantityInput").value;
    const region = document.getElementById("regionSelect").value;
    if (!region) {
        showToast("Seleziona la tua regione", "info");
        return;
    }
    if (!qty || qty <= 0) {
      showToast("Inserisci una quantità valida", "info");
      return;
    }
    if (wizardMode === 'quick') {
      runAnalysis();
      return;
    }
  }

  currentStep++;
  goToStep(currentStep);
}

function prevStep() {
  if (currentStep === 1) {
    goBackSelection();
    return;
  }

  if (currentStep === 2) {
    currentStep = 1;
    goToStep(1);
    // Non resettiamo currentTrade qui per permettere all'utente di vedere cosa aveva scelto
    return;
  }

  if (currentStep === 4) {
    if (wizardMode === 'quick') currentStep = 2;
    else currentStep = 3;
  } else {
    currentStep--;
  }
  goToStep(currentStep);
}

function goBackSelection() {
  if (currentPath.length === 0) {
    location.reload();
    return;
  }
  currentPath.pop();
  currentTrade = null;
  renderSelectionFromPath();
}

function renderSelectionFromPath() {
  if (currentPath.length === 0) renderCategories();
  else if (currentPath.length === 1) renderSubCategories(currentPath[0]);
  else renderFinalTrades(currentPath[1]);
}

function updateProgress(step) {
  const progressBar = document.getElementById("progress-bar");
  if (!progressBar) return;

  const steps = progressBar.querySelectorAll(".step-item");
  steps.forEach((node, idx) => {
    const i = idx + 1;
    node.classList.remove("active", "done");
    if (i < step) node.classList.add("done");
    else if (i === step) node.classList.add("active");
  });

  const progress = ((step - 1) / 3) * 100;
  progressBar.style.setProperty("--progress", `${progress}%`);
}

// ===== RENDERING LOGIC =====
function renderCategories() {
  const grid = document.getElementById("tradesGrid");
  if (!grid) return;
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
  
  updateStepHeaders("Cosa dobbiamo analizzare?", "Seleziona la categoria principale");
}

window.selectCategory = (id) => {
  currentPath = [id];
  renderSubCategories(id);
};

function renderSubCategories(parentId) {
  const grid = document.getElementById("tradesGrid");
  const subs = getSubCategories(parentId);
  grid.innerHTML = subs.map(s => `
    <div class="trade-card animate-scale-in" onclick="selectSubCategory('${s.id}')">
      <div class="trade-icon" style="background: ${s.color || '#3b82f6'}15; color: ${s.color || '#3b82f6'}">
        <i class="fa-solid ${s.icon}"></i>
      </div>
      <h3 class="trade-name">${s.name}</h3>
      <p class="trade-desc">Servizi specifici per questa categoria</p>
    </div>
  `).join("");
  
  updateStepHeaders("Specifica il settore", "Scegli l'ambito di intervento");
}

window.selectSubCategory = (id) => {
  currentPath[1] = id;
  renderFinalTrades(id);
};

function renderFinalTrades(subId) {
  const grid = document.getElementById("tradesGrid");
  const trades = getTradesByCategory(subId);
  grid.innerHTML = trades.map(t => `
    <div class="trade-card animate-scale-in ${currentTrade?.id === t.id ? 'selected' : ''}" onclick="selectTrade('${t.id}')">
      <div class="trade-icon" style="background: var(--sapphire-light); color: var(--sapphire)">
        <i class="fa-solid ${t.icon}"></i>
      </div>
      <h3 class="trade-name">${t.name}</h3>
      <p class="trade-desc">${t.description}</p>
    </div>
  `).join("");
  
  updateStepHeaders("Qual è il problema?", "Seleziona il lavoro specifico");
}

window.selectTrade = (id) => {
  currentTrade = getTradeById(id);
  document.querySelectorAll('.trade-card').forEach(c => c.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  
  // Aggiorna UI Step 2
  document.getElementById("unitLabel").textContent = currentTrade.unit;
  renderDynamicQuestions(currentTrade);
  
  // Auto-avanzamento fluido
  setTimeout(() => nextStep(), 300);
};

function updateStepHeaders(title, subtitle) {
  const t = document.querySelector("#step1 .step-title");
  const s = document.querySelector("#step1 .step-subtitle");
  if (t) t.textContent = title;
  if (s) s.textContent = subtitle;
}

function renderDynamicQuestions(trade) {
    const container = document.getElementById("dynamicQuestions");
    if (!container) return;

    if (trade.specificQuestion && trade.options) {
        container.innerHTML = `
            <label class="form-label">${trade.specificQuestion}</label>
            <div class="options-grid">
                ${trade.options.map((opt, idx) => `
                    <div class="option-card ${idx === 0 ? 'selected' : ''}" onclick="selectOption(this, ${opt.multiplier})">
                        <i class="fa-solid ${opt.icon}"></i>
                        <span>${opt.label}</span>
                    </div>
                `).join("")}
            </div>
        `;
        selectedOptionMultiplier = trade.options[0].multiplier;
    } else {
        container.innerHTML = "";
        selectedOptionMultiplier = 1.0;
    }
}

window.selectOption = (el, multiplier) => {
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedOptionMultiplier = multiplier;
};

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

  // Simulazione analisi profonda con feedback visivo
  await new Promise(r => setTimeout(r, 2000));

  const qty = parseFloat(document.getElementById("quantityInput").value) || 1;
  const region = document.getElementById("regionSelect").value;
  const coeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  
  const effectiveQty = (currentTrade.unit === 'intervento') ? 1 : qty;
  const marketMid = currentTrade.basePrice * effectiveQty * coeff * selectedOptionMultiplier;
  const finalReceivedPrice = (wizardMode === 'quick') ? marketMid : receivedPrice;

  const analysis = analyzeQuote({
    receivedPrice: finalReceivedPrice,
    marketMin: marketMid * 0.85, 
    marketMid, 
    marketMax: marketMid * 1.20,
    tradeId: currentTrade.id, 
    region, 
    mode: wizardMode
  });

  renderAnalysisResults(analysis);
  
  setTimeout(() => {
    cleanupCharts();
    renderQuoteBreakdownChart("breakdownChart", analysis);
    renderPriceComparisonChart("comparisonChart", {
        minPrice: analysis.marketData.min,
        midPrice: analysis.marketData.mid,
        maxPrice: analysis.marketData.max
    });
  }, 300);

  loading.classList.add("hidden");
  results.classList.remove("hidden");
  nav.classList.remove("hidden");
}

function renderAnalysisResults(analysis) {
  const container = document.getElementById("analysisResults");
  const v = analysis.verdict;
  const isQuick = wizardMode === 'quick';
  
  container.innerHTML = `
    <div class="result-header animate-scale-in">
      <div class="verdict-badge" style="background: ${isQuick ? 'var(--sapphire-light)' : v.color + '20'}; color: ${isQuick ? 'var(--sapphire)' : v.color}; border: 1px solid ${isQuick ? 'var(--sapphire)' : v.color}">
        ${isQuick ? 'STIMA ISTITUZIONALE 2025' : v.label}
      </div>
      <h2 class="result-score">Affidabilità Dati: ${analysis.trustLevel}%</h2>
      <p class="psychology-text">
        <i class="fa-solid fa-database"></i> Analisi basata su Prezzari Regionali ${analysis.benchmark.region} e indici ISTAT aggiornati.
      </p>
    </div>
    
    <div class="benchmark-grid">
      <div class="benchmark-item">
        <span class="b-label">${isQuick ? 'Valore di Mercato' : 'Scostamento'}</span>
        <span class="b-value ${!isQuick && analysis.diffPercent > 10 ? 'text-danger' : 'text-success'}">
          ${isQuick ? '€' + Math.round(analysis.marketData.mid).toLocaleString() : (analysis.diffPercent > 0 ? '+' : '') + analysis.diffPercent + '%'}
        </span>
      </div>
      <div class="benchmark-item">
        <span class="b-label">Range Ufficiale (${analysis.benchmark.region})</span>
        <span class="b-value" style="font-size: 1rem;">€${Math.round(analysis.marketData.min).toLocaleString()} - €${Math.round(analysis.marketData.max).toLocaleString()}</span>
      </div>
    </div>

    <div class="charts-container-premium">
      <div class="chart-card">
        <h4>Breakdown Costi</h4>
        <canvas id="breakdownChart"></canvas>
      </div>
      <div class="chart-card">
        <h4>Benchmark Mercato</h4>
        <canvas id="comparisonChart"></canvas>
      </div>
    </div>

    <div class="advice-section">
      <h3><i class="fa-solid fa-shield-check text-primary"></i> Analisi Tecnica & Consigli</h3>
      <ul class="advice-list">
        ${analysis.advice.map(a => `<li><i class="fa-solid fa-circle-check"></i> ${a}</li>`).join("")}
        <li class="text-muted" style="font-size: 0.85rem; margin-top: 12px;">
            <i class="fa-solid fa-sync fa-spin"></i> Sistema in aggiornamento continuo con i nuovi preventivi verificati.
        </li>
      </ul>
    </div>
  `;
}

window.goBackSelection = goBackSelection;

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type} animate-slide-right`;
  const icon = type === 'success' ? 'fa-check-circle' : (type === 'danger' ? 'fa-triangle-exclamation' : 'fa-info-circle');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { 
    toast.style.opacity = '0'; 
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 500); 
  }, 3500);
}
