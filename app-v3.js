/**
 * Preventivi-Smart Pro v12.1 — Bug Fix Edition
 * Risolto problema inizializzazione e interazione pulsanti
 */

import database from './engine/database.js';
import { auth, db } from './firebase.js';
import { 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { performProfessionalAnalysis } from './engine/professional-analyzer.js';
import { generateProfessionalPDF } from './engine/professional-pdf.js';

// ===== STATE MANAGEMENT =====
let currentStep = 1;
let selectedTrade = null;
let selectedSub = null;
let selectedMacro = null;
let isQuickMode = false;
let user = null;
let questionAnswers = {};
let lastAnalysis = null;

// ===== DOM ELEMENTS (Lazy access) =====
const getEl = (id) => document.getElementById(id);

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log("App initialized");
    initRegions();
    setupEventListeners();
    
    // Firebase Auth Observer
    onAuthStateChanged(auth, (firebaseUser) => {
        user = firebaseUser;
        updateUserUI();
        if (user) {
            loadSavedQuotes();
        }
    });

    // Global functions for HTML onclicks
    window.selectMacro = selectMacro;
    window.selectSub = selectSub;
    window.selectTrade = selectTrade;
    window.goBackSelection = goBackSelection;
    window.startWizard = startWizard;
    window.runAnalysis = runAnalysis;
    window.updateQuestionAnswer = updateQuestionAnswer;
    window.deleteQuote = deleteQuote;
    window.downloadSavedPDF = downloadSavedPDF;
});

function initRegions() {
    const regions = Object.keys(database.REGIONAL_COEFFICIENTS).sort();
    const regionSelect = getEl('regionSelect');
    if (regionSelect) {
        regionSelect.innerHTML = '<option value="" disabled selected>Seleziona Regione</option>' +
            regions.map(r => `<option value="${r}">${r}</option>`).join('');
    }
}

function updateUserUI() {
    const userNav = getEl('userNav');
    const loginModal = getEl('loginModal');
    if (!userNav) return;
    if (user) {
        userNav.innerHTML = `
            <div class="user-profile-nav" style="display: flex; align-items: center; gap: 12px;">
                <span class="user-name" style="font-weight: 600; font-size: 0.875rem;">${user.displayName || user.email.split('@')[0]}</span>
                <button class="btn btn-login-trigger" id="logoutBtn">Esci</button>
            </div>
        `;
        getEl('logoutBtn')?.addEventListener('click', () => signOut(auth));
        loginModal?.classList.add('hidden');
    } else {
        userNav.innerHTML = `<button class="btn btn-login-trigger" id="loginTriggerBtn">Accedi</button>`;
        getEl('loginTriggerBtn')?.addEventListener('click', () => loginModal?.classList.remove('hidden'));
    }
}

function setupEventListeners() {
    // Hero buttons
    getEl('startAnalysisBtn')?.addEventListener('click', () => startWizard(false));
    getEl('startQuickBtn')?.addEventListener('click', () => startWizard(true));
    
    // Login buttons
    getEl('googleLoginBtn')?.addEventListener('click', async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (e) {
            showToast("Errore login: " + e.message, "error");
        }
    });
    getEl('closeLoginBtn')?.addEventListener('click', () => getEl('loginModal')?.classList.add('hidden'));
    getEl('loginTriggerBtn')?.addEventListener('click', () => getEl('loginModal')?.classList.remove('hidden'));

    // Wizard navigation
    getEl('nextStepBtn')?.addEventListener('click', () => {
        if (validateStep2()) goToStep(3);
    });
    getEl('prevStepBtn')?.addEventListener('click', () => goToStep(1));
    getEl('prevStep3Btn')?.addEventListener('click', () => goToStep(2));
    getEl('runAnalysisBtn')?.addEventListener('click', runAnalysis);
    
    // Results
    getEl('btnDownloadPDF')?.addEventListener('click', () => {
        if (lastAnalysis) {
            generateProfessionalPDF(lastAnalysis, { name: user?.displayName, email: user?.email });
        } else {
            showToast("Esegui prima un'analisi", "error");
        }
    });
}

function validateStep2() {
    const region = getEl('regionSelect')?.value;
    const qty = parseFloat(getEl('quantityInput')?.value);
    if (!region) { showToast("Seleziona la tua regione", "error"); return false; }
    if (isNaN(qty) || qty <= 0) { showToast("Inserisci una quantità valida", "error"); return false; }
    return true;
}

// ===== WIZARD LOGIC =====
function startWizard(quick) {
    console.log("Starting wizard, quick mode:", quick);
    isQuickMode = quick;
    questionAnswers = {};
    lastAnalysis = null;
    
    const heroSection = getEl('hero-section');
    const appRoot = getEl('app-root');
    
    if (heroSection) heroSection.classList.add('hidden');
    if (appRoot) {
        appRoot.style.display = 'block';
        appRoot.classList.remove('hidden');
    }
    
    currentStep = 1;
    selectedMacro = null;
    selectedSub = null;
    selectedTrade = null;
    
    const step3Label = getEl('step3Label');
    if (step3Label) step3Label.textContent = isQuickMode ? "Stima" : "Verifica Prezzo";
    
    const receivedPriceGroup = getEl('receivedPriceGroup');
    if (receivedPriceGroup) {
        receivedPriceGroup.style.display = isQuickMode ? 'none' : 'block';
    }
    
    renderMacroCategories();
    goToStep(1);
}

function renderMacroCategories() {
    const tradesGrid = getEl('tradesGrid');
    if (!tradesGrid) return;
    const cats = database.MACRO_CATEGORIES;
    
    tradesGrid.innerHTML = cats.map(cat => `
        <div class="trade-card" onclick="selectMacro('${cat.id}')">
            <div class="icon-container" style="height: 56px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                <i class="fa-solid ${cat.icon}" style="font-size: 2.2rem; color: var(--primary);"></i>
            </div>
            <h4>${cat.name}</h4>
            <p style="font-size: 0.75rem; color: var(--gray-500); margin-top: 4px;">${cat.desc}</p>
        </div>
    `).join('');
    
    const backBtn = document.querySelector('.wizard-nav button[onclick="goBackSelection()"]');
    if (backBtn) backBtn.classList.add('hidden');
}

function selectMacro(id) {
    selectedMacro = id;
    renderSubCategories(id);
}

function renderSubCategories(macroId) {
    const tradesGrid = getEl('tradesGrid');
    if (!tradesGrid) return;
    const subs = database.SUB_CATEGORIES.filter(s => s.parent === macroId);
    
    tradesGrid.innerHTML = subs.map(sub => `
        <div class="trade-card" onclick="selectSub('${sub.id}')">
            <div class="icon-container" style="height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <i class="fa-solid ${sub.icon}" style="font-size: 1.8rem; color: var(--primary);"></i>
            </div>
            <h4>${sub.name}</h4>
        </div>
    `).join('');
    
    const backBtn = document.querySelector('.wizard-nav button[onclick="goBackSelection()"]');
    if (backBtn) backBtn.classList.remove('hidden');
}

function selectSub(id) {
    selectedSub = id;
    renderTrades(selectedMacro, id);
}

function renderTrades(macroId, subId) {
    const tradesGrid = getEl('tradesGrid');
    if (!tradesGrid) return;
    const trades = database.TRADES_DATABASE.filter(t => t.parent === subId);
    
    tradesGrid.innerHTML = trades.map(trade => `
        <div class="trade-card" onclick="selectTrade('${trade.id}')">
            <div class="icon-container" style="height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <i class="fa-solid ${trade.icon}" style="font-size: 1.6rem; color: var(--primary);"></i>
            </div>
            <h4>${trade.name}</h4>
            <p style="font-size: 0.75rem; color: var(--gray-500); margin-top: 4px;">€${trade.basePrice}/${trade.unit}</p>
        </div>
    `).join('');
}

function selectTrade(id) {
    selectedTrade = id;
    const tradeData = database.TRADES_DATABASE.find(t => t.id === id);
    
    const unitLabel = getEl('unitLabel');
    if (unitLabel) unitLabel.textContent = tradeData.unit;
    
    const tradeNameDisplay = getEl('tradeNameDisplay');
    if (tradeNameDisplay) tradeNameDisplay.textContent = tradeData.name;
    
    const basePriceDisplay = getEl('basePriceDisplay');
    if (basePriceDisplay) basePriceDisplay.textContent = `€${tradeData.basePrice}`;
    
    renderDynamicQuestions(tradeData.questions || []);
    goToStep(2);
}

function goBackSelection() {
    if (selectedSub) {
        selectedSub = null;
        renderSubCategories(selectedMacro);
    } else if (selectedMacro) {
        selectedMacro = null;
        renderMacroCategories();
    }
}

function renderDynamicQuestions(questions) {
    const dynamicQuestions = getEl('dynamicQuestions');
    if (!dynamicQuestions) return;
    
    dynamicQuestions.innerHTML = questions.map((q, idx) => `
        <div class="form-group" style="margin-bottom: 20px;">
            <label class="form-label" style="display: block; font-weight: 600; margin-bottom: 8px; color: var(--gray-900);">${q.label}</label>
            <select class="form-select dynamic-q" data-idx="${idx}" onchange="updateQuestionAnswer(${idx}, this.value)" style="width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: 8px; font-size: 0.95rem;">
                <option value="" disabled selected>Seleziona un'opzione</option>
                ${q.options.map((opt, optIdx) => `<option value="${opt.multiplier}">${opt.text}</option>`).join('')}
            </select>
        </div>
    `).join('');
}

function updateQuestionAnswer(idx, value) {
    questionAnswers[idx] = parseFloat(value);
}

function goToStep(step) {
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    const targetStep = getEl(`step${step}`);
    if (targetStep) targetStep.classList.remove('hidden');
    document.querySelectorAll('.step-item').forEach((el, idx) => {
        el.classList.remove('active', 'completed');
        if (idx + 1 === step) el.classList.add('active');
        if (idx + 1 < step) el.classList.add('completed');
    });
    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function runAnalysis() {
    const region = getEl('regionSelect')?.value;
    const qty = parseFloat(getEl('quantityInput')?.value);
    const price = parseFloat(getEl('receivedPriceInput')?.value);
    
    if (!region || isNaN(qty) || (!isQuickMode && isNaN(price))) {
        showToast("Completa tutti i campi obbligatori.", "error");
        return;
    }
    
    const tradeData = database.TRADES_DATABASE.find(t => t.id === selectedTrade);
    
    // Professional Analysis
    const analysis = performProfessionalAnalysis({
        tradeId: selectedTrade,
        tradeName: tradeData.name,
        quantity: qty,
        region: region,
        quality: 'standard', 
        receivedPrice: isQuickMode ? 0 : price,
        answers: questionAnswers
    });

    if (!analysis.success) {
        showToast(analysis.error, "error");
        return;
    }

    lastAnalysis = analysis;
    displayResults(analysis);
    
    // Save to Firebase if logged in
    if (user) {
        saveQuoteToCloud(analysis);
    }
}

async function saveQuoteToCloud(analysis) {
    try {
        const col = collection(db, "quotes");
        const snap = await getDocs(query(col, where("uid", "==", user.uid)));
        const numero = snap.size + 1;

        await addDoc(col, {
            uid: user.uid,
            numero,
            cliente: user.displayName || "Cliente",
            tradeName: analysis.trade.name,
            totale: analysis.input.receivedPrice || analysis.marketAnalysis.marketMid,
            analysis: analysis,
            createdAt: Date.now()
        });
        showToast("Analisi salvata nel cloud", "success");
        loadSavedQuotes();
    } catch (e) {
        console.error("Errore salvataggio:", e);
    }
}

async function loadSavedQuotes() {
    if (!user) return;
    try {
        const q = query(
            collection(db, "quotes"),
            where("uid", "==", user.uid),
            orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        renderSavedQuotes(snap);
    } catch (e) {
        console.error("Errore caricamento:", e);
    }
}

function renderSavedQuotes(snap) {
    const listContainer = getEl('savedQuotesList');
    if (!listContainer) return;
    
    if (snap.empty) {
        listContainer.innerHTML = "<p style='color: var(--gray-500); font-size: 0.9rem;'>Nessun preventivo salvato.</p>";
        return;
    }

    let html = "";
    snap.forEach(d => {
        const data = d.data();
        html += `
            <div class="card" style="background: white; padding: 15px; border-radius: 12px; border: 1px solid var(--gray-100); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <b style="color: var(--primary);">#${data.numero}</b> - ${data.tradeName}<br>
                    <span style="font-size: 0.85rem; color: var(--gray-500);">€ ${data.totale.toFixed(2)}</span>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-ghost" onclick="downloadSavedPDF('${d.id}')" style="padding: 6px 10px;"><i class="fa-solid fa-file-pdf"></i></button>
                    <button class="btn btn-ghost" onclick="deleteQuote('${d.id}')" style="padding: 6px 10px; color: var(--danger);"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    listContainer.innerHTML = html;
}

async function deleteQuote(id) {
    if (!confirm("Eliminare questo preventivo?")) return;
    try {
        await deleteDoc(doc(db, "quotes", id));
        showToast("Eliminato", "success");
        loadSavedQuotes();
    } catch (e) {
        showToast("Errore eliminazione", "error");
    }
}

async function downloadSavedPDF(id) {
    showToast("Generazione PDF...", "info");
    // Implementation can be added here
}

function displayResults(analysis) {
    const results = getEl('analysisResults');
    const loading = getEl('analysisLoading');
    const nav = getEl('resultsNav');
    
    if (loading) loading.classList.add('hidden');
    
    if (results) {
        results.classList.remove('hidden');
        
        let verdict = '';
        let verdictClass = '';
        
        if (isQuickMode) {
            verdict = `Prezzo di Mercato Stimato`;
            verdictClass = 'info';
        } else {
            const diff = analysis.congruityAnalysis.diffPercent;
            if (diff < -10) {
                verdict = `✅ Prezzo CONVENIENTE (${diff}%)`;
                verdictClass = 'success';
            } else if (diff > 20) {
                verdict = `⚠️ Prezzo ALTO (+${diff}%)`;
                verdictClass = 'warning';
            } else {
                verdict = `ℹ️ Prezzo NELLA MEDIA (${diff > 0 ? '+' : ''}${diff}%)`;
                verdictClass = 'info';
            }
        }
        
        results.innerHTML = `
            <div class="result-card result-${verdictClass}" style="background: white; padding: 24px; border-radius: 16px; border-left: 4px solid ${verdictClass === 'success' ? '#10b981' : verdictClass === 'warning' ? '#f59e0b' : '#3b82f6'}; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: var(--gray-900);">${verdict}</h3>
                <p style="color: var(--gray-600); margin-bottom: 16px;">${analysis.trade.name} - ${analysis.input.region}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div style="padding: 12px; background: var(--gray-50); border-radius: 8px;">
                        <p style="font-size: 0.85rem; color: var(--gray-500); margin: 0 0 4px 0;">Prezzo Stimato</p>
                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 0;">€${analysis.marketAnalysis.marketMid.toFixed(2)}</p>
                    </div>
                    ${!isQuickMode ? `<div style="padding: 12px; background: var(--gray-50); border-radius: 8px;">
                        <p style="font-size: 0.85rem; color: var(--gray-500); margin: 0 0 4px 0;">Prezzo Ricevuto</p>
                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: 0;">€${analysis.input.receivedPrice.toFixed(2)}</p>
                    </div>` : ''}
                </div>
                
                <div style="background: var(--gray-50); padding: 12px; border-radius: 8px; font-size: 0.85rem; color: var(--gray-700);">
                    <p style="margin: 4px 0;"><strong>Quantità:</strong> ${analysis.input.quantity}</p>
                    <p style="margin: 4px 0;"><strong>Coefficiente Regionale:</strong> ${analysis.marketAnalysis.regionalCoeff.toFixed(2)}x</p>
                    <p style="margin: 4px 0;"><strong>Score Affidabilità:</strong> ${analysis.reliabilityScore}/100</p>
                </div>
            </div>
        `;
    }
    
    if (nav) nav.classList.remove('hidden');
    goToStep(4);
}

function showToast(msg, type) {
    const container = getEl('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = "background: white; padding: 12px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-left: 4px solid " + (type==='error'?'#ef4444':'#10b981') + "; margin-bottom: 12px; font-size: 0.9rem; font-weight: 500; transition: opacity 0.3s;";
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
