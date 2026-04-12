/**
 * Preventivi-Smart Pro v12.0 — Core Application (Psychological Shield)
 * Integrazione delle 5 leve psicologiche nel flusso applicativo.
 */

import { initSecurityShield } from "./engine/security-shield.js";
import { initUIProtection } from "./engine/ui-protection.js";
import { getAllTrades, getTradeById, REGIONAL_COEFFICIENTS } from "./engine/database.js";
import { analyzeQuote, computeStats, analyzeTrend } from "./engine/ai-analyzer.js";
import { renderDashboard } from "./engine/dashboard-ui.js";

// ===== INIT SICUREZZA (NON BLOCCANTE) =====
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

// currentQuote esposto direttamente su window per accesso da PDF e console
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
  // Hero Buttons
  document.getElementById("startAnalysisBtn")?.addEventListener("click", () => startWizard("professional"));
  document.getElementById("startQuickBtn")?.addEventListener("click", () => startWizard("quick"));

  // Wizard Nav
  document.getElementById("prevStepBtn")?.addEventListener("click", prevStep);
  document.getElementById("nextStepBtn")?.addEventListener("click", nextStep);
  document.getElementById("prevStep3Btn")?.addEventListener("click", prevStep);
  document.getElementById("runAnalysisBtn")?.addEventListener("click", runAnalysis);

  // PDF Download
  document.getElementById("btnDownloadPDF")?.addEventListener("click", downloadPDF);

  // Dashboard: nuova analisi
  document.getElementById("dashNewAnalysisBtn")?.addEventListener("click", () => {
    document.getElementById("dashboard")?.classList.add("hidden");
    startWizard("professional");
  });

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
  const hero = document.getElementById("hero-section");
  const appRoot = document.getElementById("app-root");
  if (hero) hero.style.display = "none";
  if (appRoot) {
    appRoot.style.display = "block";
    appRoot.classList.remove("hidden");
  }
  currentStep = 1;
  // Assicura che solo step1 sia visibile
  for (let i = 1; i <= 4; i++) {
    const s = document.getElementById(`step${i}`);
    if (s) s.classList.toggle("hidden", i !== 1);
  }
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
  // Aggiorna la barra di progresso visiva tramite CSS variable
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    progressBar.style.setProperty("--progress", `${((step - 1) / 3) * 100}%`);
  }
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
    <div class="form-group" data-question-id="${q.id}">
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
  const historyItem = {
    id: Date.now().toString(),
    tradeId: currentTrade.id,
    tradeName: currentTrade.name,
    region,
    receivedPrice,
    marketMid,
    analysis,
    createdAt: new Date().toISOString()
  };
  setQuote(historyItem); // Rende disponibile per il PDF
  saveToHistory(historyItem);
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
  // Aggiorna dashboard se visibile
  renderDashboardSafe(userHistory);
}

// Render dashboard sicuro: crea i nodi mancanti se non esistono
function renderDashboardSafe(history) {
  const dashStats = document.getElementById("dashStats");
  if (dashStats && !document.getElementById("statTotal")) {
    dashStats.innerHTML = `
      <div class="stat-card">
        <span class="stat-label">Analisi Totali</span>
        <span class="stat-value" id="statTotal">0</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Risparmio Stimato</span>
        <span class="stat-value" id="statSavings">€0</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Score Medio</span>
        <span class="stat-value" id="statScore">0%</span>
      </div>
    `;
  }
  // Aggiungi canvas trendChart se mancante
  const historyList = document.getElementById("historyList");
  if (historyList && !document.getElementById("trendChart")) {
    const chartWrapper = document.createElement("div");
    chartWrapper.style.cssText = "padding: 16px; margin-bottom: 16px;";
    chartWrapper.innerHTML = `<canvas id="trendChart" height="120"></canvas>`;
    historyList.parentNode.insertBefore(chartWrapper, historyList);
  }
  renderDashboard(history);
}

function showToast(msg, type) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
  document.getElementById("toastContainer").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== PDF DOWNLOAD =====
function downloadPDF() {
  const currentQuote = getQuote();
  if (!currentQuote) {
    showToast("Nessun preventivo da scaricare", "info");
    return;
  }
  // Lazy-load jsPDF e genera il report
  if (window.jspdf) {
    _buildPDF(window.jspdf.jsPDF, currentQuote);
    return;
  }
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  script.onload = () => _buildPDF(window.jspdf.jsPDF, getQuote());
  script.onerror = () => showToast("Errore caricamento libreria PDF", "error");
  document.head.appendChild(script);
}

function _buildPDF(jsPDF, q) {
  if (!q) { showToast("Dati preventivo non disponibili", "error"); return; }
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const navy = [15, 23, 42];
  const white = [255, 255, 255];
  const amber = [217, 119, 6];
  const gray = [100, 116, 139];
  const fmt = (v) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(v);
  const dateStr = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  const refId = "PS-" + Date.now().toString().slice(-8);
  const a = q.analysis;

  // Header
  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 45, "F");
  doc.setFillColor(...amber);
  doc.rect(0, 43, 210, 3, "F");
  doc.setTextColor(...white);
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("PREVENTIVI-SMART PRO", 15, 18);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Analisi Professionale del Preventivo · Prezzari 2025/2026", 15, 27);
  doc.setFontSize(8);
  doc.setTextColor(...white);
  doc.text(`Data: ${dateStr}`, 15, 38);
  doc.text(`Rif: ${refId}`, 105, 38);

  // Titolo lavoro
  let y = 58;
  doc.setTextColor(...navy);
  doc.setFontSize(15);
  doc.setFont(undefined, "bold");
  doc.text(q.tradeName, 15, y);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(...gray);
  doc.text(`Regione: ${q.region}  ·  Prezzo ricevuto: ${fmt(q.receivedPrice)}  ·  Media mercato: ${fmt(q.marketMid)}`, 15, y + 8);
  y += 20;

  // Verdetto
  if (a && a.verdict) {
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...navy);
    doc.text(`Verdetto: ${a.verdict.label.replace(/[^\x20-\x7E]/g, "")}`, 15, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...gray);
    doc.text(`Differenza vs mercato: ${a.diffPercent > 0 ? "+" : ""}${a.diffPercent}%  ·  Affidabilità AI: ${a.trustLevel}%`, 15, y);
    y += 10;
  }

  // Consigli
  if (a && a.advice && a.advice.length) {
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...navy);
    doc.text("Consigli d'Azione:", 15, y);
    y += 7;
    a.advice.forEach((tip, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${tip.replace(/[^\x20-\x7E]/g, "")}`, 175);
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.setTextColor(...navy);
      doc.text(lines, 15, y);
      y += lines.length * 5 + 2;
    });
  }

  // Footer
  doc.setFillColor(...navy);
  doc.rect(0, 282, 210, 15, "F");
  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.text("Preventivi-Smart Pro © 2026 · preventivi-smart.it", 15, 291);
  doc.text(`Rif: ${refId}`, 195, 291, { align: "right" });

  doc.save(`Analisi_${q.tradeName.replace(/\s+/g, "_")}_${refId}.pdf`);
}

// ===== DETTAGLIO ANALISI (DASHBOARD) =====
window.openAnalysisDetail = (id) => {
  const item = userHistory.find(h => h.id === id);
  if (!item) return;
  showToast(`Preventivo: ${item.tradeName} — ${item.analysis?.verdict?.label || "Analizzato"}`, "info");
};

// Export functions for global access
window.startWizard = startWizard;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.runAnalysis = runAnalysis;
window.downloadPDF = downloadPDF;
