/**
 * Preventivi-Smart Pro v6.0 - Core Application Logic
 * UI elegante, 14 mestieri, grafici integrati, login semplificato
 */

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
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  onAuthStateChange 
} from "./engine/auth.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// ===== STATO GLOBALE =====
let currentUser = null;
let currentTrade = null;
let currentQuote = null;
let currentStep = 1;
let breakdownChartInstance = null;
let rangeChartInstance = null;

// ===== ELEMENTI DOM =====
const heroSection      = document.getElementById("heroSection");
const appContainer     = document.getElementById("appContainer");
const startBtn         = document.getElementById("startBtn");
const backBtn          = document.getElementById("backBtn");
const logoutBtn        = document.getElementById("logoutBtn");
const historyBtn       = document.getElementById("historyBtn");
const headerTitle      = document.getElementById("headerTitle");
const progressBarWrap  = document.getElementById("progressBarWrap");
const userBadge        = document.getElementById("userBadge");
const userBadgeName    = document.getElementById("userBadgeName");

// Step 1 - Auth
const step1                  = document.getElementById("step1");
const skipLoginBtn           = document.getElementById("skipLoginBtn");
const authTabsNew            = document.querySelectorAll(".auth-tab-new");
const authForms              = document.querySelectorAll(".auth-form");
const loginForm              = document.getElementById("loginForm");
const registerForm           = document.getElementById("registerForm");
const loginEmail             = document.getElementById("loginEmail");
const loginPassword          = document.getElementById("loginPassword");
const loginError             = document.getElementById("loginError");
const registerName           = document.getElementById("registerName");
const registerEmail          = document.getElementById("registerEmail");
const registerPassword       = document.getElementById("registerPassword");
const registerPasswordConfirm = document.getElementById("registerPasswordConfirm");
const registerError          = document.getElementById("registerError");

// Step 2 - Mestieri
const step2          = document.getElementById("step2");
const tradesGrid     = document.getElementById("tradesGrid");
const categoryFilter = document.getElementById("categoryFilter");

// Step 3 - Dettagli
const step3              = document.getElementById("step3");
const step3Title         = document.getElementById("step3Title");
const step3Subtitle      = document.getElementById("step3Subtitle");
const quantityInput      = document.getElementById("quantity");
const regionSelect       = document.getElementById("region");
const unitLabel          = document.getElementById("unitLabel");
const dynamicQuestions   = document.getElementById("dynamicQuestions");
const calculateBtn       = document.getElementById("calculateBtn");
const tradeSelectedIcon  = document.getElementById("tradeSelectedIcon");
const tradeSelectedHeader = document.getElementById("tradeSelectedHeader");

// Step 4 - Risultati
const step4             = document.getElementById("step4");
const quoteTrade        = document.getElementById("quoteTrade");
const quoteDetails      = document.getElementById("quoteDetails");
const priceMin          = document.getElementById("priceMin");
const priceMid          = document.getElementById("priceMid");
const priceMax          = document.getElementById("priceMax");
const quoteBreakdown    = document.getElementById("quoteBreakdown");
const coeffGrid         = document.getElementById("coeffGrid");
const newQuoteBtn       = document.getElementById("newQuoteBtn");
const saveQuoteBtn      = document.getElementById("saveQuoteBtn");
const exportPdfBtn      = document.getElementById("exportPdfBtn");
const resultTradeIcon   = document.getElementById("resultTradeIcon");
const resultQualityBadge = document.getElementById("resultQualityBadge");

// Modal
const historyModal    = document.getElementById("historyModal");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const historyList     = document.getElementById("historyList");

// ===== UTILITY =====
function formatCurrency(value) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);
}

function getQualitySelected() {
  const checked = document.querySelector('input[name="quality"]:checked');
  return checked ? checked.value : "standard";
}

function getQualityLabel(val) {
  const map = { economica: "Economico", standard: "Standard", premium: "Premium", lusso: "Luxury" };
  return map[val] || val;
}

function getQualityBadgeStyle(val) {
  const styles = {
    economica: "background:#f1f5f9;color:#64748b;",
    standard:  "background:#d1fae5;color:#059669;",
    premium:   "background:#fef3c7;color:#d97706;",
    lusso:     "background:#ede9fe;color:#7c3aed;"
  };
  return styles[val] || "";
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  const icons = { success: "fa-check-circle", error: "fa-xmark-circle", info: "fa-info-circle" };
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ===== PROGRESS BAR =====
function updateProgress(step) {
  for (let i = 1; i <= 4; i++) {
    const ps = document.getElementById(`ps${i}`);
    const pl = document.getElementById(`pl${i}`);
    if (!ps) continue;
    ps.classList.remove("active", "done");
    if (i < step) ps.classList.add("done");
    else if (i === step) ps.classList.add("active");
    if (pl) {
      pl.classList.remove("done");
      if (i < step) pl.classList.add("done");
    }
  }
}

// ===== NAVIGAZIONE =====
function showStep(stepNumber) {
  document.querySelectorAll(".step-section").forEach(s => s.style.display = "none");
  const target = document.getElementById(`step${stepNumber}`);
  if (target) {
    target.style.display = "block";
  }

  backBtn.style.display = stepNumber > 1 ? "flex" : "none";
  progressBarWrap.style.display = stepNumber > 1 ? "block" : "none";
  updateProgress(stepNumber);

  const titles = {
    1: "Accesso",
    2: "Scegli il Mestiere",
    3: "Configurazione",
    4: "Preventivo"
  };
  headerTitle.textContent = titles[stepNumber] || "Preventivi Smart";
  currentStep = stepNumber;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== STEP 1: AUTH =====
authTabsNew.forEach(tab => {
  tab.addEventListener("click", () => {
    const targetTab = tab.getAttribute("data-tab");
    authTabsNew.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    authForms.forEach(form => {
      form.classList.remove("active");
      if (form.id === `${targetTab}Form`) form.classList.add("active");
    });
    loginError.textContent = "";
    registerError.textContent = "";
  });
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!email || !password) { loginError.textContent = "Compila tutti i campi."; return; }
  const result = await loginUser(email, password);
  if (result.success) {
    showToast("Bentornato! 👋", "success");
    showStep(2);
  } else {
    loginError.textContent = result.error || "Credenziali non valide.";
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  registerError.textContent = "";
  const name = registerName.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  const passwordConfirm = registerPasswordConfirm.value;

  if (!name || !email || !password || !passwordConfirm) {
    registerError.textContent = "Compila tutti i campi."; return;
  }
  if (password !== passwordConfirm) {
    registerError.textContent = "Le password non coincidono."; return;
  }
  if (password.length < 6) {
    registerError.textContent = "Password minimo 6 caratteri."; return;
  }

  const result = await registerUser(email, password, name);
  if (result.success) {
    showToast("Account creato con successo!", "success");
    showStep(2);
  } else {
    registerError.textContent = result.error || "Errore durante la registrazione.";
  }
});

skipLoginBtn.addEventListener("click", () => showStep(2));

// ===== STEP 2: MESTIERI =====
function renderTrades(filterCat = "all") {
  tradesGrid.innerHTML = "";
  const trades = getAllTrades().filter(t => filterCat === "all" || t.category === filterCat);
  
  trades.forEach(trade => {
    const card = document.createElement("div");
    card.className = "trade-card";
    card.style.setProperty("--trade-color", trade.color);
    card.style.setProperty("--trade-color-bg", trade.colorBg);
    
    const unitMap = {
      mq: "al mq", punti: "per punto", pz: "per pezzo"
    };
    const unitLabel = unitMap[trade.unit] || trade.unit;
    
    card.innerHTML = `
      <div class="trade-icon-circle">
        <i class="fas ${trade.icon}"></i>
      </div>
      <div>
        <h3>${trade.name}</h3>
        <p>${trade.description}</p>
      </div>
      <div class="trade-price-hint">
        <i class="fas fa-tag" style="font-size:0.7rem;"></i>
        da €${trade.basePrice.toFixed(0)} ${unitLabel}
      </div>
    `;
    card.addEventListener("click", (e) => selectTrade(trade.id, e));
    tradesGrid.appendChild(card);
  });
}

// Filtro categorie
categoryFilter.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    categoryFilter.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTrades(btn.getAttribute("data-cat"));
  });
});

function selectTrade(tradeId, event) {
  currentTrade = getTradeById(tradeId);
  document.querySelectorAll(".trade-card").forEach(c => c.classList.remove("active"));
  event.currentTarget.classList.add("active");

  setTimeout(() => {
    unitLabel.textContent = currentTrade.unit;

    // Aggiorna header step 3
    step3Title.textContent = currentTrade.name;
    step3Subtitle.textContent = currentTrade.description;
    tradeSelectedIcon.innerHTML = `<i class="fas ${currentTrade.icon}" style="font-size:1.6rem;color:${currentTrade.color};"></i>`;
    tradeSelectedIcon.style.background = currentTrade.colorBg;

    renderDynamicQuestions();
    showStep(3);
  }, 350);
}

// ===== STEP 3: DETTAGLI =====
function renderDynamicQuestions() {
  dynamicQuestions.innerHTML = "";
  currentTrade.questions.forEach(question => {
    const group = document.createElement("div");
    group.className = "form-group";
    let html = `<label for="${question.id}"><i class="fas fa-chevron-right" style="font-size:0.7rem;"></i> ${question.label}</label>`;
    if (question.type === "select") {
      html += `<select id="${question.id}" required>
        <option value="">— Seleziona opzione —</option>`;
      question.options.forEach(opt => {
        html += `<option value="${opt.value}">${opt.label}</option>`;
      });
      html += `</select>`;
    }
    group.innerHTML = html;
    dynamicQuestions.appendChild(group);
  });
}

calculateBtn.addEventListener("click", () => {
  const qty = parseFloat(quantityInput.value);
  const reg = regionSelect.value;
  const qual = getQualitySelected();

  if (!qty || qty <= 0) { showToast("Inserisci una quantità valida.", "error"); return; }
  if (!reg) { showToast("Seleziona la regione del cantiere.", "error"); return; }

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
  const finalPrice     = calculateFinalPrice(currentTrade.id, qty, reg, qual, answers);
  const breakdown      = calculateCostBreakdown(currentTrade.id, finalPrice);

  currentQuote = {
    tradeId:        currentTrade.id,
    tradeName:      currentTrade.name,
    tradeIcon:      currentTrade.icon,
    tradeColor:     currentTrade.color,
    tradeColorBg:   currentTrade.colorBg,
    quantity:       qty,
    unit:           currentTrade.unit,
    region:         reg,
    quality:        qual,
    answers:        answers,
    basePrice:      currentTrade.basePrice,
    regionalCoeff:  regionalCoeff,
    qualityCoeff:   qualityCoeff,
    answerMultiplier: answerMult,
    midPrice:       finalPrice,
    minPrice:       Math.round(finalPrice * 0.88),
    maxPrice:       Math.round(finalPrice * 1.18),
    manodopera:     breakdown.manodopera,
    materiali:      breakdown.materiali,
    timestamp:      new Date().toISOString()
  };

  quoteHistory.add(currentQuote);
  displayQuote();
  showStep(4);
});

// ===== STEP 4: RISULTATI =====
function displayQuote() {
  const q = currentQuote;

  // Header
  resultTradeIcon.innerHTML = `<i class="fas ${q.tradeIcon}" style="font-size:1.6rem;color:${q.tradeColor};"></i>`;
  resultTradeIcon.style.background = q.tradeColorBg;
  quoteTrade.textContent = q.tradeName;
  quoteDetails.textContent = `${q.quantity} ${q.unit} · ${q.region} · Qualità ${getQualityLabel(q.quality)}`;

  // Badge qualità
  resultQualityBadge.setAttribute("style", getQualityBadgeStyle(q.quality));
  resultQualityBadge.textContent = getQualityLabel(q.quality);

  // Prezzi
  priceMid.textContent = formatCurrency(q.midPrice);
  priceMin.textContent = formatCurrency(q.minPrice);
  priceMax.textContent = formatCurrency(q.maxPrice);

  // Breakdown testuale
  const oneri = Math.round(q.midPrice * 0.05 * 100) / 100;
  quoteBreakdown.innerHTML = `
    <div class="breakdown-row">
      <div class="breakdown-label">
        <i class="fas fa-person-digging" style="background:rgba(59,130,246,0.1);color:#3b82f6;"></i>
        Manodopera Specializzata
      </div>
      <div class="breakdown-value">${formatCurrency(q.manodopera)}</div>
    </div>
    <div class="breakdown-row">
      <div class="breakdown-label">
        <i class="fas fa-boxes-stacked" style="background:rgba(245,158,11,0.1);color:#f59e0b;"></i>
        Materiali e Forniture
      </div>
      <div class="breakdown-value">${formatCurrency(q.materiali)}</div>
    </div>
    <div class="breakdown-row">
      <div class="breakdown-label">
        <i class="fas fa-shield-halved" style="background:rgba(5,150,105,0.1);color:#059669;"></i>
        Oneri di Sicurezza (PSC)
      </div>
      <div class="breakdown-value">${formatCurrency(oneri)}</div>
    </div>
    <div class="breakdown-row total-row">
      <div class="breakdown-label" style="color:var(--primary);font-weight:800;">
        <i class="fas fa-equals" style="background:rgba(15,23,42,0.08);color:var(--primary);"></i>
        Totale Stimato
      </div>
      <div class="breakdown-value" style="color:var(--accent);font-size:1.1rem;">${formatCurrency(q.midPrice)}</div>
    </div>
  `;

  // Coefficienti applicati
  const regDiff = ((q.regionalCoeff - 1) * 100).toFixed(0);
  const qualDiff = ((q.qualityCoeff - 1) * 100).toFixed(0);
  const answerDiff = ((q.answerMultiplier - 1) * 100).toFixed(0);

  coeffGrid.innerHTML = `
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
    </div>
  `;

  // Salva pulsante
  saveQuoteBtn.style.display = currentUser ? "flex" : "none";

  // Grafici
  renderCharts(q);
}

function renderCharts(q) {
  // Distruggi istanze precedenti
  if (breakdownChartInstance) { breakdownChartInstance.destroy(); breakdownChartInstance = null; }
  if (rangeChartInstance) { rangeChartInstance.destroy(); rangeChartInstance = null; }

  // Grafico 1: Doughnut breakdown
  const ctx1 = document.getElementById("breakdownChart");
  if (ctx1) {
    breakdownChartInstance = new Chart(ctx1.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Manodopera", "Materiali", "Oneri"],
        datasets: [{
          data: [q.manodopera, q.materiali, Math.round(q.midPrice * 0.05)],
          backgroundColor: [
            "rgba(59,130,246,0.85)",
            "rgba(245,158,11,0.85)",
            "rgba(5,150,105,0.85)"
          ],
          borderColor: ["#3b82f6", "#f59e0b", "#059669"],
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { size: 11, weight: "600", family: "Inter" },
              padding: 12,
              usePointStyle: true,
              pointStyle: "circle",
              color: "#334155"
            }
          },
          tooltip: {
            backgroundColor: "rgba(15,23,42,0.92)",
            titleFont: { size: 12, weight: "bold" },
            bodyFont: { size: 11 },
            padding: 10,
            borderRadius: 8,
            callbacks: {
              label: ctx => {
                const val = ctx.parsed;
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((val / total) * 100).toFixed(1);
                return ` ${formatCurrency(val)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Grafico 2: Barre fascia prezzo
  const ctx2 = document.getElementById("rangeChart");
  if (ctx2) {
    rangeChartInstance = new Chart(ctx2.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Minimo", "Stimato", "Massimo"],
        datasets: [{
          label: "€",
          data: [q.minPrice, q.midPrice, q.maxPrice],
          backgroundColor: [
            "rgba(100,116,139,0.75)",
            "rgba(217,119,6,0.85)",
            "rgba(220,38,38,0.75)"
          ],
          borderColor: ["#64748b", "#d97706", "#dc2626"],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(15,23,42,0.92)",
            titleFont: { size: 12, weight: "bold" },
            bodyFont: { size: 11 },
            padding: 10,
            borderRadius: 8,
            callbacks: {
              label: ctx => ` ${formatCurrency(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#334155", font: { size: 11, weight: "600" } }
          },
          y: {
            beginAtZero: false,
            grid: { color: "rgba(226,232,240,0.6)", drawBorder: false },
            ticks: {
              color: "#64748b",
              font: { size: 10 },
              callback: v => "€" + v.toLocaleString("it-IT")
            }
          }
        }
      }
    });
  }
}

// ===== AZIONI RISULTATI =====
newQuoteBtn.addEventListener("click", () => {
  quantityInput.value = "";
  regionSelect.value = "";
  document.querySelectorAll('input[name="quality"]').forEach(r => {
    r.checked = r.value === "standard";
  });
  showStep(2);
});

saveQuoteBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  try {
    await addDoc(collection(db, "quotes"), {
      ...currentQuote,
      uid: currentUser.uid,
      createdAt: new Date()
    });
    showToast("Preventivo salvato nel cloud!", "success");
  } catch (e) {
    showToast("Errore salvataggio: " + e.message, "error");
  }
});

exportPdfBtn.addEventListener("click", () => generatePDF(currentQuote));

// ===== CRONOLOGIA =====
historyBtn.addEventListener("click", () => {
  renderHistory();
  historyModal.style.display = "flex";
});

closeHistoryBtn.addEventListener("click", () => historyModal.style.display = "none");
historyModal.addEventListener("click", (e) => {
  if (e.target === historyModal) historyModal.style.display = "none";
});

function renderHistory() {
  const history = quoteHistory.getAll();
  if (!history.length) {
    historyList.innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--text-muted);">
        <i class="fas fa-inbox" style="font-size:2rem;margin-bottom:0.75rem;display:block;"></i>
        Nessun preventivo salvato.
      </div>`;
    return;
  }
  historyList.innerHTML = "";
  history.forEach(quote => {
    const item = document.createElement("div");
    item.className = "history-item";
    const icon = quote.tradeIcon || "fa-briefcase";
    const color = quote.tradeColor || "#d97706";
    item.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div style="width:40px;height:40px;border-radius:8px;background:${quote.tradeColorBg || 'rgba(217,119,6,0.1)'};display:flex;align-items:center;justify-content:center;color:${color};font-size:1.1rem;flex-shrink:0;">
          <i class="fas ${icon}"></i>
        </div>
        <div class="history-item-info">
          <h4>${quote.tradeName}</h4>
          <p>${new Date(quote.timestamp).toLocaleDateString("it-IT")} · ${quote.region}</p>
        </div>
      </div>
      <div class="history-item-price">${formatCurrency(quote.midPrice)}</div>
    `;
    item.addEventListener("click", () => {
      currentQuote = quote;
      displayQuote();
      showStep(4);
      historyModal.style.display = "none";
    });
    historyList.appendChild(item);
  });
}

// ===== NAVIGAZIONE =====
backBtn.addEventListener("click", () => {
  if (currentStep > 1) showStep(currentStep - 1);
});

startBtn.addEventListener("click", () => {
  heroSection.style.display = "none";
  appContainer.style.display = "block";
  showStep(currentUser ? 2 : 1);
});

logoutBtn.addEventListener("click", async () => {
  await logoutUser();
  location.reload();
});

// ===== AUTH STATE =====
onAuthStateChange((user) => {
  currentUser = user;
  if (user) {
    if (logoutBtn) logoutBtn.style.display = "flex";
    if (userBadge) {
      userBadge.style.display = "flex";
      if (userBadgeName) userBadgeName.textContent = user.displayName || user.email.split("@")[0];
    }
    if (currentStep === 1 && appContainer.style.display !== "none") showStep(2);
  } else {
    if (logoutBtn) logoutBtn.style.display = "none";
    if (userBadge) userBadge.style.display = "none";
  }
});

// ===== INIT =====
renderTrades();
