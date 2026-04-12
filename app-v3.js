/**
 * Preventivi-Smart Pro v5.0 - Core Application Logic
 * Gestione preventivazione avanzata con breakdown dettagliato
 */

import { auth, db } from "./firebase.js";
import { 
  getAllTrades, 
  getTradeById, 
  calculateFinalPrice, 
  calculateCostBreakdown,
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
  setupRealtimeValidation, 
  showEmailError, 
  showPasswordError, 
  validateForm,
  showErrorMessage,
  showSuccessMessage
} from "./engine/validation.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// ===== STATO GLOBALE =====
let currentUser = null;
let currentTrade = null;
let currentQuote = null;
let currentStep = 1;

// ===== ELEMENTI DOM =====
const heroSection = document.getElementById("heroSection");
const appContainer = document.getElementById("appContainer");
const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logoutBtn");
const historyBtn = document.getElementById("historyBtn");
const headerTitle = document.getElementById("headerTitle");

// Step 1 - Auth
const step1 = document.getElementById("step1");
const skipLoginBtn = document.getElementById("skipLoginBtn");
const authTabs = document.querySelectorAll(".auth-tab");
const authForms = document.querySelectorAll(".auth-form");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Input Login
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginEmailError = document.getElementById("loginEmailError");
const loginPasswordError = document.getElementById("loginPasswordError");
const loginError = document.getElementById("loginError");

// Input Register
const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerPasswordConfirm = document.getElementById("registerPasswordConfirm");
const registerNameError = document.getElementById("registerNameError");
const registerEmailError = document.getElementById("registerEmailError");
const registerPasswordError = document.getElementById("registerPasswordError");
const registerPasswordConfirmError = document.getElementById("registerPasswordConfirmError");
const registerError = document.getElementById("registerError");

// Step 2 - Mestieri
const step2 = document.getElementById("step2");
const tradesGrid = document.getElementById("tradesGrid");

// Step 3 - Dettagli
const step3 = document.getElementById("step3");
const step3Title = document.getElementById("step3Title");
const quantityInput = document.getElementById("quantity");
const regionSelect = document.getElementById("region");
const qualitySelect = document.getElementById("quality");
const unitLabel = document.getElementById("unitLabel");
const dynamicQuestions = document.getElementById("dynamicQuestions");
const calculateBtn = document.getElementById("calculateBtn");

// Step 4 - Risultati
const step4 = document.getElementById("step4");
const quoteTrade = document.getElementById("quoteTrade");
const quoteDetails = document.getElementById("quoteDetails");
const quoteIcon = document.getElementById("quoteIcon");
const priceMin = document.getElementById("priceMin");
const priceMid = document.getElementById("priceMid");
const priceMax = document.getElementById("priceMax");
const breakdownBase = document.getElementById("breakdownBase");
const breakdownRegional = document.getElementById("breakdownRegional");
const breakdownQuality = document.getElementById("breakdownQuality");
const breakdownSpecifics = document.getElementById("breakdownSpecifics");
const newQuoteBtn = document.getElementById("newQuoteBtn");
const saveQuoteBtn = document.getElementById("saveQuoteBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");

// Modal
const historyModal = document.getElementById("historyModal");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const historyList = document.getElementById("historyList");

// ===== FUNZIONI UTILITY =====
function formatCurrency(value) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

function showStep(stepNumber) {
  document.querySelectorAll(".step-section").forEach(s => s.style.display = "none");
  const targetStep = document.getElementById(`step${stepNumber}`);
  if (targetStep) {
    targetStep.style.display = "block";
    targetStep.style.animation = "fadeIn 0.6s ease-out";
  }
  
  backBtn.style.display = stepNumber > 1 ? "block" : "none";
  
  const titles = {
    1: "Autenticazione",
    2: "Seleziona il Mestiere",
    3: "Configurazione Tecnica",
    4: "Preventivo Dettagliato"
  };
  headerTitle.textContent = titles[stepNumber] || "Preventivo";
  
  currentStep = stepNumber;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== STEP 1: AUTH =====
authTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const targetTab = tab.getAttribute("data-tab");
    authTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    authForms.forEach(form => {
      form.classList.remove("active");
      if (form.id === `${targetTab}Form`) form.classList.add("active");
    });
  });
});

if (loginEmail) setupRealtimeValidation(loginEmail, showEmailError, loginEmailError);
if (loginPassword) setupRealtimeValidation(loginPassword, showPasswordError, loginPasswordError);

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  const result = await loginUser(email, password);
  if (result.success) {
    showSuccessMessage("Bentornato!");
    showStep(2);
  } else {
    loginError.textContent = result.error;
    showErrorMessage("Login fallito");
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = registerName.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  const passwordConfirm = registerPasswordConfirm.value;
  
  if (password !== passwordConfirm) {
    registerError.textContent = "Le password non coincidono";
    return;
  }

  const result = await registerUser(email, password, name);
  if (result.success) {
    showSuccessMessage("Account creato!");
    showStep(2);
  } else {
    registerError.textContent = result.error;
    showErrorMessage("Registrazione fallita");
  }
});

skipLoginBtn.addEventListener("click", () => showStep(2));

// ===== STEP 2: MESTIERI =====
function renderTrades() {
  tradesGrid.innerHTML = "";
  getAllTrades().forEach(trade => {
    const card = document.createElement("div");
    card.className = "trade-card";
    card.innerHTML = `
      <div class="trade-icon-wrapper">
        <img src="assets/${trade.icon}" alt="${trade.name}" onerror="this.src='https://via.placeholder.com/80?text=${trade.name}'">
      </div>
      <div class="trade-info">
        <h3>${trade.name}</h3>
        <p>${trade.description}</p>
      </div>
    `;
    card.addEventListener("click", (e) => selectTrade(trade.id, e));
    tradesGrid.appendChild(card);
  });
}

function selectTrade(tradeId, event) {
  currentTrade = getTradeById(tradeId);
  document.querySelectorAll(".trade-card").forEach(card => card.classList.remove("active"));
  event.currentTarget.classList.add("active");
  
  setTimeout(() => {
    unitLabel.textContent = currentTrade.unit;
    renderDynamicQuestions();
    showStep(3);
  }, 400);
}

// ===== STEP 3: DETTAGLI =====
function renderDynamicQuestions() {
  dynamicQuestions.innerHTML = "";
  currentTrade.questions.forEach(question => {
    const group = document.createElement("div");
    group.className = "form-group";
    let html = `<label for="${question.id}">${question.label}</label>`;
    if (question.type === "select") {
      html += `<select id="${question.id}" required><option value="">-- Seleziona opzione --</option>`;
      question.options.forEach(opt => {
        html += `<option value="${opt.value}">${opt.label}</option>`;
      });
      html += `</select>`;
    }
    group.innerHTML = html;
    dynamicQuestions.appendChild(group);
  });
  step3Title.textContent = `Configurazione: ${currentTrade.name}`;
}

calculateBtn.addEventListener("click", () => {
  const qty = parseFloat(quantityInput.value);
  const reg = regionSelect.value;
  const qual = qualitySelect.value;
  
  if (!qty || !reg || !qual) {
    showErrorMessage("Tutti i campi sono obbligatori");
    return;
  }
  
  const answers = {};
  let valid = true;
  currentTrade.questions.forEach(q => {
    const val = document.getElementById(q.id).value;
    if (!val) valid = false;
    answers[q.id] = val;
  });

  if (!valid) {
    showErrorMessage("Rispondi a tutte le domande tecniche");
    return;
  }
  
  const finalPrice = calculateFinalPrice(currentTrade.id, qty, reg, qual, answers);
  const breakdown = calculateCostBreakdown(currentTrade.id, finalPrice);
  
  currentQuote = {
    ...currentTrade,
    tradeId: currentTrade.id,
    tradeName: currentTrade.name,
    quantity: qty,
    unit: currentTrade.unit,
    region: reg,
    quality: qual,
    answers: answers,
    midPrice: finalPrice,
    minPrice: Math.round(finalPrice * 0.90),
    maxPrice: Math.round(finalPrice * 1.15),
    manodopera: breakdown.manodopera,
    materiali: breakdown.materiali,
    timestamp: new Date().toISOString()
  };
  
  quoteHistory.add(currentQuote);
  displayQuote();
  showStep(4);
});

// ===== STEP 4: RISULTATI =====
function displayQuote() {
  quoteTrade.textContent = currentQuote.tradeName;
  quoteDetails.textContent = `${currentQuote.quantity} ${currentQuote.unit} • ${currentQuote.region} • Qualità ${currentQuote.quality.toUpperCase()}`;
  
  priceMid.textContent = formatCurrency(currentQuote.midPrice);
  priceMin.textContent = formatCurrency(currentQuote.minPrice);
  priceMax.textContent = formatCurrency(currentQuote.maxPrice);
  
  // Breakdown dettagliato nel DOM
  const breakdownContainer = document.querySelector(".quote-breakdown");
  if (breakdownContainer) {
    breakdownContainer.innerHTML = `
      <h4>Analisi dei Costi</h4>
      <div class="breakdown-item">
        <span>Manodopera Specializzata</span>
        <span>${formatCurrency(currentQuote.manodopera)}</span>
      </div>
      <div class="breakdown-item">
        <span>Materiali e Forniture</span>
        <span>${formatCurrency(currentQuote.materiali)}</span>
      </div>
      <div class="breakdown-item">
        <span>Oneri e Sicurezza</span>
        <span>Inclusi</span>
      </div>
      <div class="breakdown-item" style="border-top: 2px solid rgba(255,255,255,0.2); margin-top: 1rem; padding-top: 1rem;">
        <span style="font-weight: 800;">TOTALE STIMATO</span>
        <span style="font-weight: 800; color: var(--accent-light);">${formatCurrency(currentQuote.midPrice)}</span>
      </div>
    `;
  }
  
  saveQuoteBtn.style.display = currentUser ? "flex" : "none";
}

newQuoteBtn.addEventListener("click", () => {
  quantityInput.value = "";
  regionSelect.value = "";
  qualitySelect.value = "standard";
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
    showSuccessMessage("Salvato nel Cloud!");
  } catch (e) {
    showErrorMessage("Errore Cloud: " + e.message);
  }
});

exportPdfBtn.addEventListener("click", () => generatePDF(currentQuote));

// ===== CRONOLOGIA & NAVIGAZIONE =====
historyBtn.addEventListener("click", () => {
  renderHistory();
  historyModal.style.display = "flex";
});

closeHistoryBtn.addEventListener("click", () => historyModal.style.display = "none");

function renderHistory() {
  const history = quoteHistory.getAll();
  historyList.innerHTML = history.length ? "" : "<p>Nessun preventivo salvato.</p>";
  history.forEach(quote => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-item-info">
        <h4>${quote.tradeName}</h4>
        <p>${new Date(quote.timestamp).toLocaleDateString('it-IT')}</p>
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

onAuthStateChange((user) => {
  currentUser = user;
  if (user) {
    if (logoutBtn) logoutBtn.style.display = "flex";
    if (currentStep === 1 && appContainer.style.display !== "none") showStep(2);
  } else {
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});

// Init
renderTrades();
