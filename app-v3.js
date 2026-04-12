/**
 * Preventivi-Smart Pro v3.0
 * Applicazione completa con gestione sessione, mestieri dinamici e calcoli regionali
 */

import { auth, db } from "./firebase.js";
import { getAllTrades, getTradeById, calculateFinalPrice, REGIONAL_COEFFICIENTS, QUALITY_MULTIPLIERS } from "./engine/database.js";
import { generatePDF } from "./engine/pdf.js";
import { quoteHistory } from "./engine/history.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

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

// Step 1 - Login
const step1 = document.getElementById("step1");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const skipLoginBtn = document.getElementById("skipLoginBtn");

// Step 2 - Mestieri
const step2 = document.getElementById("step2");
const tradesGrid = document.getElementById("tradesGrid");

// Step 3 - Dettagli
const step3 = document.getElementById("step3");
const step3Title = document.getElementById("step3Title");
const quantity = document.getElementById("quantity");
const region = document.getElementById("region");
const quality = document.getElementById("quality");
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
  document.getElementById(`step${stepNumber}`).style.display = "block";
  
  backBtn.style.display = stepNumber > 1 ? "block" : "none";
  
  if (stepNumber === 1) headerTitle.textContent = "Accedi";
  else if (stepNumber === 2) headerTitle.textContent = "Seleziona Mestiere";
  else if (stepNumber === 3) headerTitle.textContent = "Dettagli Preventivo";
  else if (stepNumber === 4) headerTitle.textContent = "Preventivo Calcolato";
  
  currentStep = stepNumber;
  window.scrollTo(0, 0);
}

// ===== STEP 1: LOGIN =====
googleLoginBtn.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert("Errore login: " + e.message);
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
    card.addEventListener("click", () => selectTrade(trade.id));
    tradesGrid.appendChild(card);
  });
}

function selectTrade(tradeId) {
  currentTrade = getTradeById(tradeId);
  document.querySelectorAll(".trade-card").forEach(card => card.classList.remove("active"));
  event.target.closest(".trade-card").classList.add("active");
  
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
  const qty = parseFloat(quantity.value);
  const reg = region.value;
  const qual = quality.value;
  
  if (!qty || !reg || !qual) {
    alert("Compila tutti i campi obbligatori");
    return;
  }
  
  // Raccogli risposte dinamiche
  const answers = {};
  currentTrade.questions.forEach(question => {
    answers[question.id] = document.getElementById(question.id).value;
  });
  
  // Calcola prezzo
  const basePrice = currentTrade.basePrice * qty;
  const regionalCoeff = REGIONAL_COEFFICIENTS[reg];
  const qualityCoeff = QUALITY_MULTIPLIERS[qual];
  
  // Calcola moltiplicatore dalle risposte
  let answerMultiplier = 1;
  currentTrade.questions.forEach(question => {
    const answer = answers[question.id];
    if (answer) {
      const option = question.options.find(opt => opt.value === answer);
      if (option && option.multiplier) {
        answerMultiplier *= option.multiplier;
      }
    }
  });
  
  const finalPrice = calculateFinalPrice(currentTrade.id, qty, reg, qual, answers);
  const minPrice = Math.round(finalPrice * 0.85 * 100) / 100;
  const maxPrice = Math.round(finalPrice * 1.2 * 100) / 100;
  
  // Salva quote
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
  
  quoteHistory.add(currentQuote);
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
  quantity.value = "";
  region.value = "";
  quality.value = "standard";
  showStep(2);
});

saveQuoteBtn.addEventListener("click", async () => {
  if (!currentUser) {
    alert("Devi essere loggato per salvare");
    return;
  }
  
  try {
    await addDoc(collection(db, "quotes"), {
      ...currentQuote,
      uid: currentUser.uid,
      createdAt: new Date()
    });
    alert("Preventivo salvato con successo!");
  } catch (e) {
    alert("Errore salvataggio: " + e.message);
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
    item.innerHTML = `
      <div class="history-item-info">
        <h4>${quote.tradeName}</h4>
        <p>${quote.timestamp}</p>
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
  showStep(1);
});

logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

// ===== AUTH STATE =====
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    skipLoginBtn.style.display = "none";
    googleLoginBtn.textContent = "✓ Loggato";
    googleLoginBtn.disabled = true;
  }
});

// ===== INIT =====
renderTrades();
