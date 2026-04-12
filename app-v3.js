/**
 * Preventivi-Smart Pro v3.0 - Corretto e Ottimizzato
 * Applicazione completa con gestione sessione, mestieri dinamici e calcoli regionali
 */

import { auth, db } from "./firebase.js";
import { 
  getAllTrades, 
  getTradeById, 
  calculateFinalPrice, 
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
  if (targetStep) targetStep.style.display = "block";
  
  backBtn.style.display = stepNumber > 1 ? "block" : "none";
  
  if (stepNumber === 1) headerTitle.textContent = "Accedi";
  else if (stepNumber === 2) headerTitle.textContent = "Seleziona Mestiere";
  else if (stepNumber === 3) headerTitle.textContent = "Dettagli Preventivo";
  else if (stepNumber === 4) headerTitle.textContent = "Preventivo Calcolato";
  
  currentStep = stepNumber;
  window.scrollTo(0, 0);
}

// ===== STEP 1: AUTH (LOGIN / REGISTER) =====

// Gestione Tab
authTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const targetTab = tab.getAttribute("data-tab");
    
    authTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    
    authForms.forEach(form => {
      form.classList.remove("active");
      if (form.id === `${targetTab}Form`) {
        form.classList.add("active");
      }
    });
  });
});

// Validazione Real-time
if (loginEmail && loginEmailError) setupRealtimeValidation(loginEmail, showEmailError, loginEmailError);
if (loginPassword && loginPasswordError) setupRealtimeValidation(loginPassword, showPasswordError, loginPasswordError);
if (registerEmail && registerEmailError) setupRealtimeValidation(registerEmail, showEmailError, registerEmailError);
if (registerPassword && registerPasswordError) setupRealtimeValidation(registerPassword, showPasswordError, registerPasswordError);

// Submit Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  
  const validation = validateForm({ email, password });
  if (!validation.isValid) {
    loginError.textContent = Object.values(validation.errors)[0];
    return;
  }
  
  loginError.textContent = "";
  const result = await loginUser(email, password);
  
  if (result.success) {
    showSuccessMessage("Bentornato!");
    showStep(2);
  } else {
    loginError.textContent = "Errore: " + result.error;
    showErrorMessage("Login fallito");
  }
});

// Submit Registrazione
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = registerName.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  const passwordConfirm = registerPasswordConfirm.value;
  
  const validation = validateForm({ name, email, password, passwordConfirm });
  if (!validation.isValid) {
    registerError.textContent = Object.values(validation.errors)[0];
    return;
  }
  
  registerError.textContent = "";
  const result = await registerUser(email, password, name);
  
  if (result.success) {
    showSuccessMessage("Account creato!");
    showStep(2);
  } else {
    registerError.textContent = "Errore: " + result.error;
    showErrorMessage("Registrazione fallita");
  }
});

skipLoginBtn.addEventListener("click", () => {
  showStep(2);
});

// ===== STEP 2: MESTIERI =====
function renderTrades() {
  tradesGrid.innerHTML = "";
  getAllTrades().forEach(trade => {
    const card = document.createElement("div");
    card.className = "trade-card";
    card.innerHTML = `
      <img src="assets/${trade.icon}" alt="${trade.name}" onerror="this.src='https://via.placeholder.com/80?text=${trade.name}'">
      <h3>${trade.name}</h3>
      <p>${trade.description}</p>
    `;
    card.addEventListener("click", (e) => selectTrade(trade.id, e));
    tradesGrid.appendChild(card);
  });
}

function selectTrade(tradeId, event) {
  currentTrade = getTradeById(tradeId);
  document.querySelectorAll(".trade-card").forEach(card => card.classList.remove("active"));
  
  const selectedCard = event.currentTarget;
  selectedCard.classList.add("active");
  
  setTimeout(() => {
    unitLabel.textContent = currentTrade.unit;
    renderDynamicQuestions();
    showStep(3);
  }, 300);
}

// ===== STEP 3: DETTAGLI =====
function renderDynamicQuestions() {
  dynamicQuestions.innerHTML = "";
  
  currentTrade.questions.forEach(question => {
    const group = document.createElement("div");
    group.className = "form-group";
    
    let html = `<label for="${question.id}">${question.label}</label>`;
    
    if (question.type === "select") {
      html += `<select id="${question.id}" required>
        <option value="">-- Seleziona --</option>`;
      question.options.forEach(opt => {
        html += `<option value="${opt.value}">${opt.label}</option>`;
      });
      html += `</select>`;
    }
    
    group.innerHTML = html;
    dynamicQuestions.appendChild(group);
  });
  
  step3Title.textContent = `Dettagli - ${currentTrade.name}`;
}

calculateBtn.addEventListener("click", () => {
  const qty = parseFloat(quantityInput.value);
  const reg = regionSelect.value;
  const qual = qualitySelect.value;
  
  if (!qty || !reg || !qual) {
    showErrorMessage("Compila tutti i campi obbligatori");
    return;
  }
  
  // Raccogli risposte dinamiche
  const answers = {};
  let allQuestionsAnswered = true;
  currentTrade.questions.forEach(question => {
    const val = document.getElementById(question.id).value;
    if (!val) allQuestionsAnswered = false;
    answers[question.id] = val;
  });

  if (!allQuestionsAnswered) {
    showErrorMessage("Rispondi a tutte le domande specifiche");
    return;
  }
  
  // Calcola prezzo tramite database engine
  const finalPrice = calculateFinalPrice(currentTrade.id, qty, reg, qual, answers);
  
  // Recupera coefficienti per il breakdown visivo
  const basePrice = currentTrade.basePrice * qty;
  const regionalCoeff = REGIONAL_COEFFICIENTS[reg];
  const qualityCoeff = QUALITY_MULTIPLIERS[qual];
  
  // Calcola moltiplicatore dalle risposte per il breakdown
  let answerMultiplier = 1;
  currentTrade.questions.forEach(question => {
    const answer = answers[question.id];
    const option = question.options.find(opt => opt.value === answer);
    if (option && option.multiplier) {
      answerMultiplier *= option.multiplier;
    }
  });
  
  const minPrice = Math.round(finalPrice * 0.85 * 100) / 100;
  const maxPrice = Math.round(finalPrice * 1.2 * 100) / 100;
  
  // Salva quote nello stato corrente
  currentQuote = {
    trade: currentTrade.id,
    tradeName: currentTrade.name,
    quantity: qty,
    unit: currentTrade.unit,
    region: reg,
    quality: qual,
    answers: answers,
    basePrice: basePrice,
    regionalCoeff: regionalCoeff,
    qualityCoeff: qualityCoeff,
    answerMultiplier: answerMultiplier,
    minPrice: minPrice,
    midPrice: finalPrice,
    maxPrice: maxPrice,
    timestamp: new Date().toLocaleString('it-IT')
  };
  
  // Aggiungi alla cronologia locale (genera ID e timestamp ISO internamente)
  quoteHistory.add(currentQuote);
  
  // Recupera l'ultimo preventivo con ID generato per l'esportazione corretta
  const history = quoteHistory.getAll();
  currentQuote = history[0];
  
  displayQuote();
  showStep(4);
});

// ===== STEP 4: RISULTATI =====
function displayQuote() {
  quoteTrade.textContent = currentQuote.tradeName;
  quoteDetails.textContent = `${currentQuote.quantity} ${currentQuote.unit} - ${currentQuote.region}`;
  
  quoteIcon.innerHTML = `<img src="assets/icon_${currentQuote.trade}.png" alt="${currentQuote.tradeName}" style="width: 60px; height: 60px; object-fit: contain;" onerror="this.innerHTML='<i class=\"fas fa-tools\"></i>'">`;
  
  priceMin.textContent = formatCurrency(currentQuote.minPrice);
  priceMid.textContent = formatCurrency(currentQuote.midPrice);
  priceMax.textContent = formatCurrency(currentQuote.maxPrice);
  
  breakdownBase.textContent = formatCurrency(currentQuote.basePrice);
  breakdownRegional.textContent = currentQuote.regionalCoeff.toFixed(2) + "x";
  breakdownQuality.textContent = currentQuote.qualityCoeff.toFixed(2) + "x";
  breakdownSpecifics.textContent = currentQuote.answerMultiplier.toFixed(2) + "x";
  
  saveQuoteBtn.style.display = currentUser ? "block" : "none";
}

newQuoteBtn.addEventListener("click", () => {
  quantityInput.value = "";
  regionSelect.value = "";
  qualitySelect.value = "standard";
  showStep(2);
});

saveQuoteBtn.addEventListener("click", async () => {
  if (!currentUser) {
    showErrorMessage("Devi essere loggato per salvare");
    return;
  }
  
  try {
    await addDoc(collection(db, "quotes"), {
      ...currentQuote,
      uid: currentUser.uid,
      createdAt: new Date()
    });
    showSuccessMessage("Preventivo salvato nel cloud!");
  } catch (e) {
    showErrorMessage("Errore salvataggio: " + e.message);
  }
});

exportPdfBtn.addEventListener("click", () => {
  generatePDF(currentQuote);
});

// ===== CRONOLOGIA =====
historyBtn.addEventListener("click", () => {
  renderHistory();
  historyModal.style.display = "flex";
});

closeHistoryBtn.addEventListener("click", () => {
  historyModal.style.display = "none";
});

function renderHistory() {
  const history = quoteHistory.getAll();
  historyList.innerHTML = "";
  
  if (history.length === 0) {
    historyList.innerHTML = "<p style='text-align: center; color: var(--text-secondary);'>Nessun preventivo nella cronologia</p>";
    return;
  }
  
  history.forEach(quote => {
    const item = document.createElement("div");
    item.className = "history-item";
    
    // Gestione timestamp se ISO o già formattato
    let displayTime = quote.timestamp;
    if (displayTime.includes('T')) {
      displayTime = new Date(displayTime).toLocaleString('it-IT');
    }

    item.innerHTML = `
      <div class="history-item-info">
        <h4>${quote.tradeName}</h4>
        <p>${displayTime}</p>
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
  appContainer.style.display = "flex";
  showStep(currentUser ? 2 : 1);
});

logoutBtn.addEventListener("click", async () => {
  const result = await logoutUser();
  if (result.success) {
    showSuccessMessage("Logout effettuato");
    location.reload(); // Ricarica per resettare lo stato
  }
});

// ===== AUTH STATE =====
onAuthStateChange((user) => {
  currentUser = user;
  if (user) {
    if (skipLoginBtn) skipLoginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
    // Se siamo nello step 1 e l'utente si logga, passiamo allo step 2
    if (currentStep === 1 && appContainer.style.display !== "none") {
      showStep(2);
    }
  } else {
    if (skipLoginBtn) skipLoginBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});

// ===== INIT =====
renderTrades();
