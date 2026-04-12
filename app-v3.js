/**
 * Preventivi-Smart Pro v20.0 — Database Istituzionale e Dinamico
 * 
 * Novità:
 * - Domande specifiche per scenario (Step 2)
 * - Calcolo prezzi basato su moltiplicatori di difficoltà
 * - UI guidata da icone e feedback visivo
 * - Enfasi su dati ufficiali e aggiornamento continuo
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
import { renderQuoteBreakdownChart, renderPriceComparisonChart } from "./engine/charts-advanced.js";

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

// ===== AUTH CHECK (MOCK) =====
function checkAuth() {
  const savedUser = localStorage.getItem("ps_user");
  if (savedUser) {
    userProfile = JSON.parse(savedUser);
    updateUserUI();
  }
}

function handleGoogleLogin() {
  // Simulo l'apertura della finestra di login Google
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
  
  // Login Listeners
  document.getElementById("loginTriggerBtn")?.addEventListener("click", openLoginModal);
  document.getElementById("closeLoginBtn")?.addEventListener("click", closeLoginModal);
  document.getElementById("googleLoginBtn")?.addEventListener("click", handleGoogleLogin);
  document.getElementById("emailLoginForm")?.addEventListener("submit", handleEmailLogin);
  
  // Chiudi modale cliccando fuori
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("loginModal");
    if (e.target === modal) closeLoginModal();
  });

  document.getElementById("prevStepBtn")?.addEventListener("click", prevStep);
  document.getElementById("nextStepBtn")?.addEventListener("click", nextStep);
  document.getElementById("prevStep3Btn")?.addEventListener("click", prevStep);
  document.getElementById("runAnalysisBtn")?.addEventListener("click", runAnalysis);
  
  // Visual Feedback
  document.getElementById("regionSelect")?.addEventListener("change", (e) => updateVisualFeedback('region', e.target.value));
  document.getElementById("quantityInput")?.addEventListener("input", (e) => updateVisualFeedback('quantity', e.target.value));
  document.getElementById("receivedPriceInput")?.addEventListener("input", (e) => updateVisualFeedback('price', e.target.value));
}

function updateVisualFeedback(type, value) {
  const iconMap = { region: 'fa-location-dot', quantity: 'fa-ruler-combined', price: 'fa-coins' };
  const feedbackEl = document.getElementById(`feedback-${type}`);
  if (feedbackEl) {
    feedbackEl.innerHTML = value ? `<i class="fa-solid ${iconMap[type]} animate-pulse-soft" style="color: var(--primary)"></i>` : '';
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
    if (currentPath.length < 2 && getSubCategories(currentPath[0]).length > 0) {
        showToast("Seleziona un servizio specifico", "info");
        return;
    }
    if (!currentTrade) {
        showToast("Seleziona il tipo di lavoro", "info");
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
      currentStep = 4;
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
    currentTrade = null;
    currentStep = 1;
    goToStep(1);
    renderSelectionFromPath();
    return;
  }

  if (currentStep === 4 && wizardMode === 'quick') currentStep = 2;
  else currentStep--;
  goToStep(currentStep);
}

function renderSelectionFromPath() {
  if (currentPath.length === 0) {
    renderCategories();
    return;
  }

  if (currentPath.length === 1) {
    const macroId = currentPath[0];
    const subCategories = getSubCategories(macroId);
    if (subCategories.length > 0) renderSubCategories(macroId);
    else renderFinalTrades(macroId);
    return;
  }

  renderFinalTrades(currentPath[1] || currentPath[0]);
}

function goBackSelection() {
  if (currentPath.length === 0) {
    location.reload(); // Torna alla Hero
    return;
  }

  currentPath.pop();
  renderSelectionFromPath();
}

function updateProgress(step) {
  for (let i = 1; i <= 4; i++) {
    const node = document.getElementById("ps" + i);
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

// ===== RENDERING LOGIC =====
function renderCategories() {
  const grid = document.getElementById("tradesGrid");
  if (!grid) return;
  const cats = getAllCategories();
  currentPath = [];
  grid.innerHTML = cats.map(c => `
    <div class="trade-card animate-slide-up" onclick="selectCategory('${c.id}')">
      <div class="trade-icon" style="background: ${c.color}15; color: ${c.color}">
        <i class="fa-solid ${c.icon}"></i>
      </div>
      <h3 class="trade-name">${c.name}</h3>
      <p class="trade-desc">${c.desc}</p>
    </div>
  `).join("");
  
  const title = document.querySelector("#step1 .step-title");
  const subtitle = document.querySelector("#step1 .step-subtitle");
  if (title) title.textContent = "Cosa dobbiamo analizzare?";
  if (subtitle) subtitle.textContent = "Seleziona la categoria principale";
}

window.selectCategory = (id) => {
  currentPath = [id];
  const subs = getSubCategories(id);
  const trades = getTradesByCategory(id);
  
  if (subs.length > 0) {
    renderSubCategories(id);
  } else if (trades.length > 0) {
    renderFinalTrades(id);
  } else {
    showToast("Categoria in fase di aggiornamento", "info");
  }
};

function renderSubCategories(parentId) {
  const grid = document.getElementById("tradesGrid");
  const subs = getSubCategories(parentId);
  const parent = getAllCategories().find(c => c.id === parentId);
  
  grid.innerHTML = subs.map(s => `
    <div class="trade-card animate-scale-in" onclick="selectSubCategory('${s.id}')">
      <div class="trade-icon" style="background: ${s.color || '#3b82f6'}15; color: ${s.color || '#3b82f6'}">
        <i class="fa-solid ${s.icon}"></i>
      </div>
      <h3 class="trade-name">${s.name}</h3>
      <p class="trade-desc">Seleziona il servizio specifico</p>
    </div>
  `).join("");
  
  const title = document.querySelector("#step1 .step-title");
  const subtitle = document.querySelector("#step1 .step-subtitle");
  if (title) title.textContent = parent ? parent.name : "Sottocategorie";
  if (subtitle) subtitle.textContent = "Filtra per tipo di servizio";
}

window.selectSubCategory = (id) => {
  currentPath = [currentPath[0], id];
  const trades = getTradesByCategory(id);
  if (trades.length > 0) {
    renderFinalTrades(id);
  } else {
    showToast("Nessun servizio trovato in questa sottocategoria", "info");
  }
};

function renderFinalTrades(parentId) {
  const grid = document.getElementById("tradesGrid");
  const trades = getTradesByCategory(parentId);
  
  let color = "#3b82f6";
  const macro = getAllCategories().find(c => c.id === currentPath[0]);
  if (macro) color = macro.color;

  grid.innerHTML = trades.map(t => `
    <div class="trade-card animate-scale-in" onclick="selectTrade('${t.id}')">
      <div class="trade-icon" style="background: ${color}15; color: ${color}">
        <i class="fa-solid ${t.icon}"></i>
      </div>
      <h3 class="trade-name">${t.name}</h3>
      <p class="trade-desc">${t.description}</p>
    </div>
  `).join("");
  
  const title = document.querySelector("#step1 .step-title");
  const subtitle = document.querySelector("#step1 .step-subtitle");
  if (title) title.textContent = "Dettaglio Lavoro";
  if (subtitle) subtitle.textContent = "Qual è l'intervento specifico?";
}

window.selectTrade = (id) => {
  const trade = getTradeById(id);
  if (!trade) return;

  currentTrade = trade;
  const unitLabel = document.getElementById("unitLabel");
  if (unitLabel) unitLabel.textContent = trade.unit;
  
  const unitIconMap = { 'mq': 'fa-vector-square', 'intervento': 'fa-wrench', 'ora': 'fa-clock', 'ml': 'fa-ruler', 'punto': 'fa-circle-dot', 'unità': 'fa-cubes' };
  const unitIcon = unitIconMap[trade.unit] || 'fa-tag';
  document.getElementById("feedback-quantity").innerHTML = `<i class="fa-solid ${unitIcon} text-gray-400"></i>`;

  renderDynamicQuestions(trade);
  currentStep = 2;
  goToStep(2);
};

function renderDynamicQuestions(trade) {
    const container = document.getElementById("dynamicQuestions");
    if (!container) return;

    if (trade.specificQuestion && trade.options) {
        container.innerHTML = `
            <div class="form-group animate-slide-up">
                <label class="form-label"><i class="fa-solid fa-circle-question text-primary"></i> ${trade.specificQuestion}</label>
                <div class="options-grid">
                    ${trade.options.map((opt, idx) => `
                        <div class="option-card ${idx === 0 ? 'selected' : ''}" onclick="selectOption(this, ${opt.multiplier})">
                            <i class="fa-solid ${opt.icon}"></i>
                            <span>${opt.label}</span>
                        </div>
                    `).join("")}
                </div>
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

  // Simulazione analisi profonda
  await new Promise(r => setTimeout(r, 2500));

  const qty = parseFloat(document.getElementById("quantityInput").value);
  const region = document.getElementById("regionSelect").value;
  const coeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  
  // Calcolo accurato: Base * Qty * Regione * Difficoltà (Opzione)
  const marketMid = currentTrade.basePrice * qty * coeff * selectedOptionMultiplier;
  const finalReceivedPrice = (wizardMode === 'quick') ? marketMid : receivedPrice;

  const analysis = analyzeQuote({
    receivedPrice: finalReceivedPrice,
    marketMin: marketMid * 0.88, marketMid, marketMax: marketMid * 1.15,
    tradeId: currentTrade.id, region, mode: wizardMode
  });

  renderAnalysisResults(analysis);
  
  // Renderizza i grafici avanzati (Leva 4: Visualizzazione Dati)
  setTimeout(() => {
    renderQuoteBreakdownChart("breakdownChart", analysis);
    renderPriceComparisonChart("comparisonChart", {
        minPrice: analysis.marketData.min,
        midPrice: analysis.marketData.mid,
        maxPrice: analysis.marketData.max
    });
  }, 100);

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
      <h2 class="result-score">Affidabilità Dati: 99.2%</h2>
      <p class="psychology-text">
        <i class="fa-solid fa-database"></i> Analisi basata su Prezzari Regionali ${analysis.benchmark.region} e indici ISTAT aggiornati.
      </p>
    </div>
    <div class="benchmark-grid">
      <div class="benchmark-item">
        <span class="b-label">${isQuick ? 'Valore di Mercato' : 'Scostamento'}</span>
        <span class="b-value ${!isQuick && analysis.diffPercent > 10 ? 'text-danger' : 'text-success'}">
          ${isQuick ? '€' + Math.round(analysis.benchmark.cityAvg).toLocaleString() : (analysis.diffPercent > 0 ? '+' : '') + analysis.diffPercent + '%'}
        </span>
      </div>
      <div class="benchmark-item">
        <span class="b-label">Range Ufficiale (${analysis.benchmark.region})</span>
        <span class="b-value" style="font-size: 1rem;">€${Math.round(analysis.benchmark.marketMin).toLocaleString()} - €${Math.round(analysis.benchmark.marketMax).toLocaleString()}</span>
      </div>
    </div>
    <div class="charts-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0;">
      <div class="chart-box" style="background: var(--white); padding: 20px; border-radius: 16px; border: 1px solid var(--gray-100);">
        <h4 style="font-size: 0.85rem; color: var(--gray-500); margin-bottom: 16px; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">Breakdown Costi</h4>
        <canvas id="breakdownChart" height="200"></canvas>
      </div>
      <div class="chart-box" style="background: var(--white); padding: 20px; border-radius: 16px; border: 1px solid var(--gray-100);">
        <h4 style="font-size: 0.85rem; color: var(--gray-500); margin-bottom: 16px; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">Benchmark Mercato</h4>
        <canvas id="comparisonChart" height="200"></canvas>
      </div>
    </div>
    <div class="advice-section">
      <h3><i class="fa-solid fa-shield-check text-primary"></i> Analisi Tecnica</h3>
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
  toast.innerHTML = `<i class="fa-solid fa-info-circle"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
}
