/**
 * Preventivi-Smart Pro v7.0 — Core Application
 * Wizard 5-step, Analisi AI, Dashboard, Google Login + Security Shield
 */

// ===== SECURITY FIRST =====
import { initSecurityShield } from "./engine/security-shield.js";
import { initUIProtection } from "./engine/ui-protection.js";
import { secureLoader } from "./engine/secure-loader.js";

// Inizializza protezione PRIMA di qualsiasi altra cosa
initSecurityShield();
initUIProtection();

import { auth, db } from "./firebase.js";
import {
  getAllTrades,
  getTradeById,
  calculateFinalPrice,
  calculateCostBreakdown,
  calculateAnswerMultiplier,
  REGIONAL_COEFFICIENTS,
  QUALITY_MULTIPLIERS
} from "./engine/database.js";
import { generatePDF } from "./engine/pdf.js";
import { quoteHistory } from "./engine/history.js";
import { analyzeQuote, analyzeTrend, computeStats } from "./engine/ai-analyzer.js";
import {
  loginUser,
  registerUser,
  loginWithGoogle,
  logoutUser,
  onAuthStateChange
} from "./engine/auth.js";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// ===== STATO GLOBALE =====
let currentUser = null;
let currentTrade = null;
let currentMarketData = null;   // dati calcolati step 3
let currentQuote = null;        // dati finali con analisi AI
let currentStep = 1;
let breakdownChartInstance = null;
let rangeChartInstance = null;
let dashTrendChartInstance = null;
let dashTradeChartInstance = null;
let cloudQuotes = [];

// ===== UTILITY =====
const fmt = (v) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(v);

function getQualitySelected() {
  const checked = document.querySelector('input[name="quality"]:checked');
  return checked ? checked.value : "standard";
}

function getQualityLabel(val) {
  return { economica: "Economico", standard: "Standard", premium: "Premium", lusso: "Luxury" }[val] || val;
}

function getQualityBadgeStyle(val) {
  return {
    economica: "background:#f1f5f9;color:#64748b;",
    standard:  "background:#d1fae5;color:#059669;",
    premium:   "background:#fef3c7;color:#d97706;",
    lusso:     "background:#ede9fe;color:#7c3aed;"
  }[val] || "";
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const icons = { success: "fa-check-circle", error: "fa-xmark-circle", info: "fa-info-circle" };
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ===== PROGRESS BAR =====
function updateProgress(step) {
  for (let i = 1; i <= 5; i++) {
    const ps = document.getElementById(`ps${i}`);
    const pl = document.getElementById(`pl${i}`);
    if (!ps) continue;
    ps.classList.remove("active", "done");
    if (i < step) ps.classList.add("done");
    else if (i === step) ps.classList.add("active");
    if (pl) { pl.classList.remove("done"); if (i < step) pl.classList.add("done"); }
  }
}

// ===== NAVIGAZIONE =====
const backBtn         = document.getElementById("backBtn");
const progressBarWrap = document.getElementById("progressBarWrap");
const headerTitle     = document.getElementById("headerTitle");

function showStep(stepNumber) {
  document.querySelectorAll(".step-section").forEach(s => s.style.display = "none");
  const target = document.getElementById(`step${stepNumber}`);
  if (target) target.style.display = "block";

  const isDash = stepNumber === "Dashboard";
  backBtn.style.display = (stepNumber > 1 || isDash) ? "flex" : "none";
  progressBarWrap.style.display = (!isDash && stepNumber > 1) ? "block" : "none";
  if (!isDash) updateProgress(stepNumber);

  const titles = {
    1: "Accesso", 2: "Scegli il Mestiere", 3: "Dettagli Lavoro",
    4: "Preventivo Ricevuto", 5: "Analisi AI", Dashboard: "La Mia Dashboard"
  };
  headerTitle.textContent = titles[stepNumber] || "Preventivi Smart";
  currentStep = stepNumber;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== STEP 1: AUTH =====
document.querySelectorAll(".auth-tab-new").forEach(tab => {
  tab.addEventListener("click", () => {
    const t = tab.getAttribute("data-tab");
    document.querySelectorAll(".auth-tab-new").forEach(b => b.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".auth-form").forEach(f => {
      f.classList.remove("active");
      if (f.id === `${t}Form`) f.classList.add("active");
    });
    document.getElementById("loginError").textContent = "";
    document.getElementById("registerError").textContent = "";
  });
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("loginError");
  errEl.textContent = "";
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (!email || !password) { errEl.textContent = "Compila tutti i campi."; return; }
  const result = await loginUser(email, password);
  if (result.success) { showToast("Bentornato! 👋", "success"); showStep(2); }
  else errEl.textContent = result.error;
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("registerError");
  errEl.textContent = "";
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirm = document.getElementById("registerPasswordConfirm").value;
  if (!name || !email || !password || !confirm) { errEl.textContent = "Compila tutti i campi."; return; }
  if (password !== confirm) { errEl.textContent = "Le password non coincidono."; return; }
  if (password.length < 6) { errEl.textContent = "Password minimo 6 caratteri."; return; }
  const result = await registerUser(email, password, name);
  if (result.success) { showToast("Account creato!", "success"); showStep(2); }
  else errEl.textContent = result.error;
});

document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  const result = await loginWithGoogle();
  if (result.success) { showToast(`Benvenuto, ${result.user.displayName}!`, "success"); showStep(2); }
  else showToast(result.error, "error");
});

document.getElementById("skipLoginBtn").addEventListener("click", () => showStep(2));

// ===== STEP 2: MESTIERI =====
function renderTrades(filterCat = "all") {
  const grid = document.getElementById("tradesGrid");
  grid.innerHTML = "";
  const trades = getAllTrades().filter(t => filterCat === "all" || t.category === filterCat);
  trades.forEach(trade => {
    const card = document.createElement("div");
    card.className = "trade-card";
    card.style.setProperty("--trade-color", trade.color);
    card.style.setProperty("--trade-color-bg", trade.colorBg);
    const unitMap = { mq: "al mq", punti: "per punto", pz: "per pezzo" };
    card.innerHTML = `
      <div class="trade-icon-circle"><i class="fas ${trade.icon}"></i></div>
      <div>
        <h3>${trade.name}</h3>
        <p>${trade.description}</p>
      </div>
      <div class="trade-price-hint">
        <i class="fas fa-tag" style="font-size:0.7rem;"></i>
        da €${trade.basePrice.toFixed(0)} ${unitMap[trade.unit] || trade.unit}
      </div>`;
    card.addEventListener("click", (ev) => selectTrade(trade.id, ev));
    grid.appendChild(card);
  });
}

document.getElementById("categoryFilter").querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("categoryFilter").querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTrades(btn.getAttribute("data-cat"));
  });
});

function selectTrade(tradeId, event) {
  currentTrade = getTradeById(tradeId);
  document.querySelectorAll(".trade-card").forEach(c => c.classList.remove("active"));
  event.currentTarget.classList.add("active");
  setTimeout(() => {
    document.getElementById("unitLabel").textContent = currentTrade.unit;
    document.getElementById("step3Title").textContent = currentTrade.name;
    document.getElementById("step3Subtitle").textContent = currentTrade.description;
    const icon = document.getElementById("tradeSelectedIcon");
    icon.innerHTML = `<i class="fas ${currentTrade.icon}" style="font-size:1.6rem;color:${currentTrade.color};"></i>`;
    icon.style.background = currentTrade.colorBg;
    renderDynamicQuestions();
    showStep(3);
  }, 300);
}

// ===== STEP 3: DETTAGLI =====
function renderDynamicQuestions() {
  const container = document.getElementById("dynamicQuestions");
  container.innerHTML = "";
  currentTrade.questions.forEach(question => {
    const group = document.createElement("div");
    group.className = "form-group";
    let html = `<label for="${question.id}"><i class="fas fa-chevron-right" style="font-size:0.7rem;"></i> ${question.label}</label>`;
    if (question.type === "select") {
      html += `<select id="${question.id}"><option value="">— Seleziona —</option>`;
      question.options.forEach(opt => {
        html += `<option value="${opt.value}">${opt.label}</option>`;
      });
      html += `</select>`;
    }
    group.innerHTML = html;
    container.appendChild(group);
  });
}

document.getElementById("calculateBtn").addEventListener("click", () => {
  const qty = parseFloat(document.getElementById("quantity").value);
  const reg = document.getElementById("region").value;
  const qual = getQualitySelected();

  if (!qty || qty <= 0) { showToast("Inserisci una quantità valida.", "error"); return; }
  if (!reg) { showToast("Seleziona la regione.", "error"); return; }

  const answers = {};
  let valid = true;
  currentTrade.questions.forEach(q => {
    const el = document.getElementById(q.id);
    if (!el || !el.value) { valid = false; return; }
    answers[q.id] = el.value;
  });
  if (!valid) { showToast("Rispondi a tutte le domande tecniche.", "error"); return; }

  const regionalCoeff  = REGIONAL_COEFFICIENTS[reg] || 1.0;
  const qualityCoeff   = QUALITY_MULTIPLIERS[qual] || 1.0;
  const answerMult     = calculateAnswerMultiplier(currentTrade.id, answers);
  const midPrice       = calculateFinalPrice(currentTrade.id, qty, reg, qual, answers);
  const breakdown      = calculateCostBreakdown(currentTrade.id, midPrice);

  currentMarketData = {
    tradeId: currentTrade.id,
    tradeName: currentTrade.name,
    tradeIcon: currentTrade.icon,
    tradeColor: currentTrade.color,
    tradeColorBg: currentTrade.colorBg,
    quantity: qty,
    unit: currentTrade.unit,
    region: reg,
    quality: qual,
    answers,
    basePrice: currentTrade.basePrice,
    regionalCoeff,
    qualityCoeff,
    answerMultiplier: answerMult,
    midPrice,
    minPrice: Math.round(midPrice * 0.88),
    maxPrice: Math.round(midPrice * 1.18),
    manodopera: breakdown.manodopera,
    materiali: breakdown.materiali
  };

  // Aggiorna preview step 4
  document.getElementById("mp_min").textContent = fmt(currentMarketData.minPrice);
  document.getElementById("mp_mid").textContent = fmt(currentMarketData.midPrice);
  document.getElementById("mp_max").textContent = fmt(currentMarketData.maxPrice);

  showStep(4);
});

// ===== STEP 4: PREVENTIVO RICEVUTO =====
// Toggle sezione opzionale
document.getElementById("optionalToggle").addEventListener("click", () => {
  const body = document.getElementById("optionalBody");
  const chevron = document.getElementById("optionalChevron");
  const isOpen = body.style.display !== "none";
  body.style.display = isOpen ? "none" : "block";
  chevron.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
});

document.getElementById("analyzeBtn").addEventListener("click", () => {
  const receivedPrice = parseFloat(document.getElementById("receivedPriceInput").value);
  if (!receivedPrice || receivedPrice <= 0) {
    showToast("Inserisci l'importo del preventivo ricevuto.", "error");
    return;
  }

  const clientName    = document.getElementById("clientName").value.trim();
  const clientAddress = document.getElementById("clientAddress").value.trim();
  const clientNotes   = document.getElementById("clientNotes").value.trim();

  // Esegui analisi AI
  const analysis = analyzeQuote({
    receivedPrice,
    marketMin:  currentMarketData.minPrice,
    marketMid:  currentMarketData.midPrice,
    marketMax:  currentMarketData.maxPrice,
    tradeId:    currentMarketData.tradeId,
    tradeName:  currentMarketData.tradeName,
    quantity:   currentMarketData.quantity,
    unit:       currentMarketData.unit,
    region:     currentMarketData.region,
    quality:    currentMarketData.quality
  });

  currentQuote = {
    ...currentMarketData,
    receivedPrice,
    clientName,
    clientAddress,
    clientNotes,
    analysis,
    timestamp: new Date().toISOString()
  };

  quoteHistory.add(currentQuote);
  displayResults();
  showStep(5);
});

// ===== STEP 5: RISULTATI + ANALISI AI =====
function displayResults() {
  const q = currentQuote;
  const a = q.analysis;
  const v = a.verdict;

  // Header
  const rIcon = document.getElementById("resultTradeIcon");
  rIcon.innerHTML = `<i class="fas ${q.tradeIcon}" style="font-size:1.6rem;color:${q.tradeColor};"></i>`;
  rIcon.style.background = q.tradeColorBg;
  document.getElementById("quoteTrade").textContent = q.tradeName;
  document.getElementById("quoteDetails").textContent =
    `${q.quantity} ${q.unit} · ${q.region} · Qualità ${getQualityLabel(q.quality)}`;
  const qBadge = document.getElementById("resultQualityBadge");
  qBadge.setAttribute("style", getQualityBadgeStyle(q.quality));
  qBadge.textContent = getQualityLabel(q.quality);

  // Verdict card
  const vCard = document.getElementById("verdictCard");
  vCard.style.borderColor = v.color;
  vCard.style.background = v.bgColor;

  const vIconWrap = document.getElementById("verdictIcon");
  vIconWrap.style.background = v.color;
  vIconWrap.style.color = "white";
  vIconWrap.innerHTML = `<i class="fas ${v.icon}"></i>`;

  document.getElementById("verdictLabel").textContent = v.label;
  document.getElementById("verdictLabel").style.color = v.color;

  const diffSign = a.diffAmount >= 0 ? "+" : "";
  document.getElementById("verdictSublabel").textContent =
    `${diffSign}${fmt(a.diffAmount)} (${diffSign}${a.diffPercent}%) rispetto alla media di mercato`;

  const scoreEl = document.getElementById("verdictScore");
  scoreEl.textContent = `${a.reliabilityScore}/10`;
  scoreEl.style.color = a.reliabilityScore >= 8 ? "#059669" : a.reliabilityScore >= 5 ? "#d97706" : "#dc2626";

  // Confronto prezzi
  document.getElementById("receivedPriceDisplay").textContent = fmt(q.receivedPrice);
  document.getElementById("marketMidDisplay").textContent = fmt(q.midPrice);

  const diffBadge = document.getElementById("priceDiffBadge");
  const diffColor = a.diffAmount > 0 ? "#dc2626" : a.diffAmount < 0 ? "#059669" : "#64748b";
  diffBadge.textContent = `${diffSign}${fmt(a.diffAmount)}`;
  diffBadge.style.background = diffColor + "20";
  diffBadge.style.color = diffColor;

  document.getElementById("priceDiffText").textContent =
    a.diffAmount > 0 ? "sopra la media di mercato" :
    a.diffAmount < 0 ? `risparmio potenziale di ${fmt(Math.abs(a.diffAmount))}` :
    "esattamente nella media";

  // Barra visiva
  const pct = a.percentile;
  document.getElementById("priceBarMarker").style.left = `${Math.min(Math.max(pct, 2), 98)}%`;
  document.getElementById("barLabelMin").textContent = fmt(q.minPrice);
  document.getElementById("barLabelMax").textContent = fmt(q.maxPrice);

  // Consigli AI
  const adviceList = document.getElementById("aiAdviceList");
  adviceList.innerHTML = "";
  a.advice.forEach((tip, idx) => {
    const item = document.createElement("div");
    item.className = "ai-advice-item";
    item.innerHTML = `<div class="ai-advice-num">${idx + 1}</div><div>${tip}</div>`;
    adviceList.appendChild(item);
  });

  // Red flags
  const rfCard = document.getElementById("redFlagsCard");
  const rfList = document.getElementById("redFlagsList");
  if (a.redFlags && a.redFlags.length) {
    rfCard.style.display = "block";
    rfList.innerHTML = "";
    a.redFlags.forEach(flag => {
      const item = document.createElement("div");
      item.className = `red-flag-item ${flag.severity}`;
      item.innerHTML = `<i class="fas ${flag.icon}"></i> ${flag.text}`;
      rfList.appendChild(item);
    });
  } else {
    rfCard.style.display = "none";
  }

  // Domande
  const qList = document.getElementById("questionsList");
  qList.innerHTML = "";
  a.questions.forEach(question => {
    const li = document.createElement("li");
    li.textContent = question;
    qList.appendChild(li);
  });

  // Breakdown
  const oneri = Math.round(q.midPrice * 0.05);
  document.getElementById("quoteBreakdown").innerHTML = `
    <div class="breakdown-row">
      <div class="breakdown-label">
        <i class="fas fa-person-digging" style="background:rgba(59,130,246,0.1);color:#3b82f6;"></i>
        Manodopera Specializzata
      </div>
      <div class="breakdown-value">${fmt(q.manodopera)}</div>
    </div>
    <div class="breakdown-row">
      <div class="breakdown-label">
        <i class="fas fa-boxes-stacked" style="background:rgba(245,158,11,0.1);color:#f59e0b;"></i>
        Materiali e Forniture
      </div>
      <div class="breakdown-value">${fmt(q.materiali)}</div>
    </div>
    <div class="breakdown-row">
      <div class="breakdown-label">
        <i class="fas fa-shield-halved" style="background:rgba(5,150,105,0.1);color:#059669;"></i>
        Oneri di Sicurezza (PSC)
      </div>
      <div class="breakdown-value">${fmt(oneri)}</div>
    </div>
    <div class="breakdown-row total-row">
      <div class="breakdown-label" style="color:var(--primary);font-weight:800;">
        <i class="fas fa-equals" style="background:rgba(15,23,42,0.08);color:var(--primary);"></i>
        Totale Mercato Stimato
      </div>
      <div class="breakdown-value" style="color:var(--accent);font-size:1.1rem;">${fmt(q.midPrice)}</div>
    </div>`;

  // Coefficienti
  document.getElementById("coeffGrid").innerHTML = `
    <div class="coeff-item">
      <div class="coeff-item-label">Prezzo Base</div>
      <div class="coeff-item-value neutral">€${q.basePrice}/u.</div>
    </div>
    <div class="coeff-item">
      <div class="coeff-item-label">Coeff. Regionale</div>
      <div class="coeff-item-value ${q.regionalCoeff >= 1 ? 'positive' : 'negative'}">${q.regionalCoeff.toFixed(2)}x</div>
    </div>
    <div class="coeff-item">
      <div class="coeff-item-label">Qualità Materiali</div>
      <div class="coeff-item-value ${q.qualityCoeff >= 1 ? 'positive' : 'negative'}">${q.qualityCoeff.toFixed(2)}x</div>
    </div>
    <div class="coeff-item">
      <div class="coeff-item-label">Specifiche Lavoro</div>
      <div class="coeff-item-value ${q.answerMultiplier >= 1 ? 'positive' : 'negative'}">${q.answerMultiplier.toFixed(2)}x</div>
    </div>`;

  // Salva button
  document.getElementById("saveQuoteBtn").style.display = currentUser ? "flex" : "none";

  // Grafici
  renderResultCharts(q);
}

function renderResultCharts(q) {
  if (breakdownChartInstance) { breakdownChartInstance.destroy(); breakdownChartInstance = null; }
  if (rangeChartInstance) { rangeChartInstance.destroy(); rangeChartInstance = null; }

  const ctx1 = document.getElementById("breakdownChart");
  if (ctx1) {
    breakdownChartInstance = new Chart(ctx1.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Manodopera", "Materiali", "Oneri"],
        datasets: [{
          data: [q.manodopera, q.materiali, Math.round(q.midPrice * 0.05)],
          backgroundColor: ["rgba(59,130,246,0.85)", "rgba(245,158,11,0.85)", "rgba(5,150,105,0.85)"],
          borderColor: ["#3b82f6", "#f59e0b", "#059669"],
          borderWidth: 3, hoverOffset: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "65%",
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11, weight: "600", family: "Inter" }, padding: 12, usePointStyle: true, pointStyle: "circle", color: "#334155" } },
          tooltip: {
            backgroundColor: "rgba(15,23,42,0.92)", titleFont: { size: 12, weight: "bold" }, bodyFont: { size: 11 }, padding: 10, borderRadius: 8,
            callbacks: { label: ctx => { const total = ctx.dataset.data.reduce((a, b) => a + b, 0); return ` ${fmt(ctx.parsed)} (${((ctx.parsed / total) * 100).toFixed(1)}%)`; } }
          }
        }
      }
    });
  }

  const ctx2 = document.getElementById("rangeChart");
  if (ctx2) {
    const received = q.receivedPrice;
    rangeChartInstance = new Chart(ctx2.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Min Mercato", "Media Mercato", "Max Mercato", "Tuo Preventivo"],
        datasets: [{
          label: "€",
          data: [q.minPrice, q.midPrice, q.maxPrice, received],
          backgroundColor: [
            "rgba(100,116,139,0.7)", "rgba(14,165,233,0.8)", "rgba(100,116,139,0.7)",
            received > q.maxPrice ? "rgba(220,38,38,0.85)" :
            received < q.minPrice ? "rgba(5,150,105,0.85)" : "rgba(217,119,6,0.85)"
          ],
          borderColor: ["#64748b", "#0ea5e9", "#64748b",
            received > q.maxPrice ? "#dc2626" : received < q.minPrice ? "#059669" : "#d97706"],
          borderWidth: 2, borderRadius: 8, borderSkipped: false
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: "rgba(15,23,42,0.92)", padding: 10, borderRadius: 8, callbacks: { label: ctx => ` ${fmt(ctx.parsed.y)}` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#334155", font: { size: 10, weight: "600" } } },
          y: { beginAtZero: false, grid: { color: "rgba(226,232,240,0.6)" }, ticks: { color: "#64748b", font: { size: 10 }, callback: v => "€" + v.toLocaleString("it-IT") } }
        }
      }
    });
  }
}

// ===== AZIONI STEP 5 =====
document.getElementById("newQuoteBtn").addEventListener("click", () => {
  document.getElementById("quantity").value = "";
  document.getElementById("region").value = "";
  document.getElementById("receivedPriceInput").value = "";
  document.getElementById("clientName").value = "";
  document.getElementById("clientAddress").value = "";
  document.getElementById("clientNotes").value = "";
  document.querySelectorAll('input[name="quality"]').forEach(r => { r.checked = r.value === "standard"; });
  showStep(2);
});

document.getElementById("saveQuoteBtn").addEventListener("click", async () => {
  if (!currentUser) return;
  try {
    await addDoc(collection(db, "quotes"), {
      ...currentQuote,
      uid: currentUser.uid,
      createdAt: new Date()
    });
    showToast("Preventivo salvato nel cloud!", "success");
    document.getElementById("saveQuoteBtn").style.display = "none";
  } catch (e) {
    showToast("Errore salvataggio: " + e.message, "error");
  }
});

document.getElementById("exportPdfBtn").addEventListener("click", () => {
  generatePDF(currentQuote, currentQuote.analysis);
});

// ===== DASHBOARD =====
document.getElementById("dashboardBtn").addEventListener("click", () => {
  renderDashboard();
  showStep("Dashboard");
});

document.getElementById("dashNewQuoteBtn").addEventListener("click", () => showStep(2));

async function loadCloudQuotes() {
  if (!currentUser) return quoteHistory.getAll();
  try {
    const q = query(
      collection(db, "quotes"),
      where("uid", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    cloudQuotes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return cloudQuotes;
  } catch {
    return quoteHistory.getAll();
  }
}

async function renderDashboard() {
  const quotes = await loadCloudQuotes();

  // Stats
  const totalCount = quotes.length;
  const totalSavings = quotes.reduce((acc, q) => {
    const saved = (q.midPrice || 0) - (q.receivedPrice || q.midPrice || 0);
    return acc + (saved > 0 ? saved : 0);
  }, 0);
  const scores = quotes.filter(q => q.analysis?.reliabilityScore).map(q => q.analysis.reliabilityScore);
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";
  const alertCount = quotes.filter(q => {
    const id = q.analysis?.verdict?.id;
    return id === "truffa_basso" || id === "truffa_alto" || id === "molto_alto";
  }).length;

  document.getElementById("dashTotalCount").textContent = totalCount;
  document.getElementById("dashTotalSavings").textContent = fmt(totalSavings);
  document.getElementById("dashAvgScore").textContent = avgScore;
  document.getElementById("dashAlertCount").textContent = alertCount;

  // Grafici dashboard
  if (dashTrendChartInstance) { dashTrendChartInstance.destroy(); dashTrendChartInstance = null; }
  if (dashTradeChartInstance) { dashTradeChartInstance.destroy(); dashTradeChartInstance = null; }

  // Trend nel tempo
  const trendCtx = document.getElementById("dashTrendChart");
  if (trendCtx && quotes.length > 0) {
    const sorted = [...quotes].sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt));
    const labels = sorted.map(q => new Date(q.timestamp || q.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString("it-IT", { day: "2-digit", month: "short" }));
    const received = sorted.map(q => q.receivedPrice || q.midPrice || 0);
    const market = sorted.map(q => q.midPrice || 0);

    dashTrendChartInstance = new Chart(trendCtx.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Preventivo Ricevuto",
            data: received,
            borderColor: "#d97706",
            backgroundColor: "rgba(217,119,6,0.1)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#d97706",
            pointRadius: 5
          },
          {
            label: "Media Mercato",
            data: market,
            borderColor: "#0ea5e9",
            backgroundColor: "rgba(14,165,233,0.05)",
            tension: 0.4,
            borderDash: [6, 3],
            fill: false,
            pointBackgroundColor: "#0ea5e9",
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, usePointStyle: true } }, tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.parsed.y)}` } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 10 } } },
          y: { grid: { color: "rgba(226,232,240,0.6)" }, ticks: { color: "#64748b", font: { size: 10 }, callback: v => "€" + v.toLocaleString("it-IT") } }
        }
      }
    });
  }

  // Torta per mestiere
  const tradeCtx = document.getElementById("dashTradeChart");
  if (tradeCtx && quotes.length > 0) {
    const stats = computeStats(quotes);
    if (stats) {
      const tradeNames = Object.keys(stats.byTrade);
      const tradeCounts = tradeNames.map(t => stats.byTrade[t].count);
      const colors = ["#3b82f6","#f59e0b","#059669","#dc2626","#7c3aed","#0ea5e9","#d97706","#64748b","#10b981","#ef4444"];

      dashTradeChartInstance = new Chart(tradeCtx.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: tradeNames,
          datasets: [{
            data: tradeCounts,
            backgroundColor: colors.slice(0, tradeNames.length),
            borderWidth: 3,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "55%",
          plugins: { legend: { position: "bottom", labels: { font: { size: 10 }, usePointStyle: true, pointStyle: "circle" } } }
        }
      });
    }
  }

  // Lista storico
  const list = document.getElementById("dashHistoryList");
  list.innerHTML = "";
  if (!quotes.length) {
    list.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted);"><i class="fas fa-inbox" style="font-size:2rem;margin-bottom:0.75rem;display:block;"></i>Nessun preventivo salvato.</div>`;
    return;
  }
  quotes.forEach(q => {
    const vId = q.analysis?.verdict?.id || "nella_media";
    const vLabel = q.analysis?.verdict?.shortLabel || "—";
    const vColor = q.analysis?.verdict?.color || "#64748b";
    const item = document.createElement("div");
    item.className = "dash-history-item";
    item.innerHTML = `
      <div class="dash-history-icon" style="background:${q.tradeColorBg || 'rgba(217,119,6,0.1)'};color:${q.tradeColor || '#d97706'};">
        <i class="fas ${q.tradeIcon || 'fa-briefcase'}"></i>
      </div>
      <div class="dash-history-info">
        <h4>${q.tradeName}</h4>
        <p>${new Date(q.timestamp || q.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString("it-IT")} · ${q.region} · ${q.quantity} ${q.unit}</p>
      </div>
      <div class="dash-history-right">
        <div class="dash-history-price">${fmt(q.receivedPrice || q.midPrice)}</div>
        <div class="dash-history-verdict" style="background:${vColor}20;color:${vColor};">${vLabel}</div>
      </div>`;
    item.addEventListener("click", () => {
      currentQuote = q;
      displayResults();
      showStep(5);
    });
    list.appendChild(item);
  });
}

// ===== STORICO MODAL =====
document.getElementById("historyBtn").addEventListener("click", () => {
  renderHistoryModal();
  document.getElementById("historyModal").style.display = "flex";
});

document.getElementById("closeHistoryBtn").addEventListener("click", () => {
  document.getElementById("historyModal").style.display = "none";
});

document.getElementById("historyModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("historyModal"))
    document.getElementById("historyModal").style.display = "none";
});

function renderHistoryModal() {
  const history = quoteHistory.getAll();
  const list = document.getElementById("historyList");
  if (!history.length) {
    list.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted);"><i class="fas fa-inbox" style="font-size:2rem;margin-bottom:0.75rem;display:block;"></i>Nessun preventivo salvato.</div>`;
    return;
  }
  list.innerHTML = "";
  history.forEach(q => {
    const vColor = q.analysis?.verdict?.color || "#64748b";
    const vLabel = q.analysis?.verdict?.shortLabel || "—";
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div style="width:40px;height:40px;border-radius:8px;background:${q.tradeColorBg || 'rgba(217,119,6,0.1)'};display:flex;align-items:center;justify-content:center;color:${q.tradeColor || '#d97706'};font-size:1.1rem;flex-shrink:0;">
          <i class="fas ${q.tradeIcon || 'fa-briefcase'}"></i>
        </div>
        <div class="history-item-info">
          <h4>${q.tradeName}</h4>
          <p>${new Date(q.timestamp).toLocaleDateString("it-IT")} · ${q.region}</p>
        </div>
      </div>
      <div style="text-align:right;">
        <div class="history-item-price">${fmt(q.receivedPrice || q.midPrice)}</div>
        <div style="font-size:0.72rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:999px;background:${vColor}20;color:${vColor};margin-top:0.2rem;">${vLabel}</div>
      </div>`;
    item.addEventListener("click", () => {
      currentQuote = q;
      displayResults();
      showStep(5);
      document.getElementById("historyModal").style.display = "none";
    });
    list.appendChild(item);
  });
}

// ===== NAVIGAZIONE BACK =====
backBtn.addEventListener("click", () => {
  if (currentStep === "Dashboard") { showStep(2); return; }
  if (currentStep > 1) showStep(currentStep - 1);
});

// ===== START =====
document.getElementById("startBtn").addEventListener("click", () => {
  document.getElementById("heroSection").style.display = "none";
  document.getElementById("appContainer").style.display = "block";
  showStep(currentUser ? 2 : 1);
});

// ===== LOGOUT =====
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await logoutUser();
  location.reload();
});

// ===== AUTH STATE =====
onAuthStateChange((user) => {
  currentUser = user;
  const logoutBtn = document.getElementById("logoutBtn");
  const userBadge = document.getElementById("userBadge");
  const userBadgeName = document.getElementById("userBadgeName");
  const dashBtn = document.getElementById("dashboardBtn");

  if (user) {
    if (logoutBtn) logoutBtn.style.display = "flex";
    if (userBadge) { userBadge.style.display = "flex"; userBadgeName.textContent = user.displayName || user.email.split("@")[0]; }
    if (dashBtn) dashBtn.style.display = "flex";
    if (currentStep === 1 && document.getElementById("appContainer").style.display !== "none") showStep(2);
  } else {
    if (logoutBtn) logoutBtn.style.display = "none";
    if (userBadge) userBadge.style.display = "none";
    if (dashBtn) dashBtn.style.display = "none";
  }
});

// ===== INIT =====
renderTrades();
