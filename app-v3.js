/**
 * Preventivi-Smart Pro v12.3 — Final Robust Edition
 * Risolto definitivamente il problema dell'interazione pulsanti.
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
let state = {
    currentStep: 1,
    selectedTrade: null,
    selectedSub: null,
    selectedMacro: null,
    isQuickMode: false,
    user: null,
    questionAnswers: {},
    lastAnalysis: null
};

// ===== UTILITIES =====
const getEl = (id) => document.getElementById(id);

function showToast(msg, type) {
    const container = getEl('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: white; 
        padding: 12px 24px; 
        border-radius: 12px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
        border-left: 4px solid ${type === 'error' ? '#ef4444' : '#10b981'}; 
        margin-bottom: 12px; 
        font-size: 0.9rem; 
        font-weight: 500; 
        transition: opacity 0.3s;
    `;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== AUTH LOGIC =====
function updateUserUI() {
    const userNav = getEl('userNav');
    const loginModal = getEl('loginModal');
    if (!userNav) return;

    if (state.user) {
        userNav.innerHTML = `
            <div class="user-profile-nav" style="display: flex; align-items: center; gap: 12px;">
                <span class="user-name" style="font-weight: 600; font-size: 0.875rem;">${state.user.displayName || state.user.email.split('@')[0]}</span>
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

// ===== WIZARD NAVIGATION =====
function goToStep(step) {
    console.log("Navigating to step:", step);
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    const targetStep = getEl(`step${step}`);
    if (targetStep) targetStep.classList.remove('hidden');
    
    document.querySelectorAll('.step-item').forEach((el, idx) => {
        el.classList.remove('active', 'completed');
        if (idx + 1 === step) el.classList.add('active');
        if (idx + 1 < step) el.classList.add('completed');
    });
    state.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== RENDER LOGIC =====
function renderMacroCategories() {
    const tradesGrid = getEl('tradesGrid');
    if (!tradesGrid) return;
    
    tradesGrid.innerHTML = database.MACRO_CATEGORIES.map(cat => `
        <div class="trade-card" data-id="${cat.id}">
            <div class="icon-container" style="height: 56px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                <i class="fa-solid ${cat.icon}" style="font-size: 2.2rem; color: var(--primary);"></i>
            </div>
            <h4>${cat.name}</h4>
            <p style="font-size: 0.75rem; color: var(--gray-500); margin-top: 4px;">${cat.desc}</p>
        </div>
    `).join('');

    tradesGrid.querySelectorAll('.trade-card').forEach(card => {
        card.addEventListener('click', () => {
            state.selectedMacro = card.dataset.id;
            renderSubCategories(state.selectedMacro);
        });
    });
    
    const backBtn = getEl('backSelectionBtn');
    if (backBtn) backBtn.style.display = 'none';
}

function renderSubCategories(macroId) {
    const tradesGrid = getEl('tradesGrid');
    if (!tradesGrid) return;
    
    const subs = database.SUB_CATEGORIES.filter(s => s.parent === macroId);
    tradesGrid.innerHTML = subs.map(sub => `
        <div class="trade-card" data-id="${sub.id}">
            <div class="icon-container" style="height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <i class="fa-solid ${sub.icon}" style="font-size: 1.8rem; color: var(--primary);"></i>
            </div>
            <h4>${sub.name}</h4>
        </div>
    `).join('');

    tradesGrid.querySelectorAll('.trade-card').forEach(card => {
        card.addEventListener('click', () => {
            state.selectedSub = card.dataset.id;
            renderTrades(state.selectedSub);
        });
    });
    
    const backBtn = getEl('backSelectionBtn');
    if (backBtn) backBtn.style.display = 'inline-flex';
}

function renderTrades(subId) {
    const tradesGrid = getEl('tradesGrid');
    if (!tradesGrid) return;
    
    const trades = database.TRADES_DATABASE.filter(t => t.parent === subId);
    tradesGrid.innerHTML = trades.map(trade => `
        <div class="trade-card" data-id="${trade.id}">
            <div class="icon-container" style="height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <i class="fa-solid ${trade.icon}" style="font-size: 1.6rem; color: var(--primary);"></i>
            </div>
            <h4>${trade.name}</h4>
            <p style="font-size: 0.75rem; color: var(--gray-500); margin-top: 4px;">€${trade.basePrice}/${trade.unit}</p>
        </div>
    `).join('');

    tradesGrid.querySelectorAll('.trade-card').forEach(card => {
        card.addEventListener('click', () => selectTrade(card.dataset.id));
    });
}

function selectTrade(id) {
    state.selectedTrade = id;
    const tradeData = database.TRADES_DATABASE.find(t => t.id === id);
    
    getEl('unitLabel').textContent = tradeData.unit;
    getEl('tradeNameDisplay').textContent = tradeData.name;
    getEl('basePriceDisplay').textContent = `€${tradeData.basePrice}`;
    
    renderDynamicQuestions(tradeData.questions || []);
    goToStep(2);
}

function goBackSelection() {
    if (state.selectedSub) {
        state.selectedSub = null;
        renderSubCategories(state.selectedMacro);
    } else if (state.selectedMacro) {
        state.selectedMacro = null;
        renderMacroCategories();
    }
}

function renderDynamicQuestions(questions) {
    const container = getEl('dynamicQuestions');
    if (!container) return;
    
    container.innerHTML = questions.map((q, idx) => `
        <div class="form-group" style="margin-bottom: 20px;">
            <label class="form-label" style="display: block; font-weight: 600; margin-bottom: 8px; color: var(--gray-900);">${q.label}</label>
            <select class="form-select dynamic-q" data-idx="${idx}" style="width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: 8px; font-size: 0.95rem;">
                <option value="" disabled selected>Seleziona un'opzione</option>
                ${q.options.map(opt => `<option value="${opt.multiplier}">${opt.text}</option>`).join('')}
            </select>
        </div>
    `).join('');

    container.querySelectorAll('.dynamic-q').forEach(select => {
        select.addEventListener('change', (e) => {
            state.questionAnswers[e.target.dataset.idx] = parseFloat(e.target.value);
        });
    });
}

// ===== CORE ACTIONS =====
async function runAnalysis() {
    const region = getEl('regionSelect')?.value;
    const qty = parseFloat(getEl('quantityInput')?.value);
    // Leggi il prezzo da Step 3 se disponibile, altrimenti da Step 2
    const price = parseFloat(getEl('receivedPriceInputStep3')?.value) || parseFloat(getEl('receivedPriceInput')?.value);
    
    if (!region || isNaN(qty) || (!state.isQuickMode && isNaN(price))) {
        showToast("Completa tutti i campi obbligatori.", "error");
        return;
    }
    
    const tradeData = database.TRADES_DATABASE.find(t => t.id === state.selectedTrade);
    
    const analysis = performProfessionalAnalysis({
        tradeId: state.selectedTrade,
        tradeName: tradeData.name,
        quantity: qty,
        region: region,
        quality: 'standard', 
        receivedPrice: state.isQuickMode ? 0 : price,
        answers: state.questionAnswers
    });

    if (!analysis.success) {
        showToast(analysis.error, "error");
        return;
    }

    state.lastAnalysis = analysis;
    displayResults(analysis);
    
    if (state.user) saveQuoteToCloud(analysis);
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
        
        if (state.isQuickMode) {
            verdict = `Prezzo di Mercato Stimato`;
            verdictClass = 'info';
        } else {
            const diff = analysis.congruityAnalysis.diffPercent;
            if (diff < -10) { verdict = `✅ Prezzo CONVENIENTE (${diff}%)`; verdictClass = 'success'; }
            else if (diff > 20) { verdict = `⚠️ Prezzo ALTO (+${diff}%)`; verdictClass = 'warning'; }
            else { verdict = `ℹ️ Prezzo NELLA MEDIA (${diff > 0 ? '+' : ''}${diff}%)`; verdictClass = 'info'; }
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
                    ${!state.isQuickMode ? `<div style="padding: 12px; background: var(--gray-50); border-radius: 8px;">
                        <p style="font-size: 0.85rem; color: var(--gray-500); margin: 0 0 4px 0;">Prezzo Ricevuto</p>
                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: 0;">€${analysis.input.receivedPrice.toFixed(2)}</p>
                    </div>` : ''}
                </div>
                <div style="background: var(--gray-50); padding: 12px; border-radius: 8px; font-size: 0.85rem; color: var(--gray-700);">
                    <p style="margin: 4px 0;"><strong>Quantità:</strong> ${analysis.input.quantity}</p>
                    <p style="margin: 4px 0;"><strong>Score Affidabilità:</strong> ${analysis.reliabilityScore}/100</p>
                </div>
            </div>
        `;
    }
    if (nav) nav.classList.remove('hidden');
    goToStep(4);
}

// ===== FIREBASE SYNC =====
async function saveQuoteToCloud(analysis) {
    try {
        const col = collection(db, "quotes");
        const snap = await getDocs(query(col, where("uid", "==", state.user.uid)));
        await addDoc(col, {
            uid: state.user.uid,
            numero: snap.size + 1,
            cliente: state.user.displayName || "Cliente",
            tradeName: analysis.trade.name,
            totale: analysis.input.receivedPrice || analysis.marketAnalysis.marketMid,
            analysis: analysis,
            createdAt: Date.now()
        });
        showToast("Analisi salvata nel cloud", "success");
        loadSavedQuotes();
    } catch (e) { console.error("Save error:", e); }
}

async function loadSavedQuotes() {
    if (!state.user) return;
    try {
        const q = query(collection(db, "quotes"), where("uid", "==", state.user.uid), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        renderSavedQuotes(snap);
    } catch (e) { console.error("Load error:", e); }
}

function renderSavedQuotes(snap) {
    const list = getEl('savedQuotesList');
    if (!list) return;
    if (snap.empty) { list.innerHTML = "<p style='color: var(--gray-500); font-size: 0.9rem;'>Nessun preventivo salvato.</p>"; return; }

    list.innerHTML = "";
    snap.forEach(d => {
        const data = d.data();
        const item = document.createElement('div');
        item.className = "card";
        item.style.cssText = "background: white; padding: 15px; border-radius: 12px; border: 1px solid var(--gray-100); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;";
        item.innerHTML = `
            <div>
                <b style="color: var(--primary);">#${data.numero}</b> - ${data.tradeName}<br>
                <span style="font-size: 0.85rem; color: var(--gray-500);">€ ${data.totale.toFixed(2)}</span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-ghost btn-pdf" data-id="${d.id}"><i class="fa-solid fa-file-pdf"></i></button>
                <button class="btn btn-ghost btn-del" data-id="${d.id}" style="color: var(--danger);"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        item.querySelector('.btn-del').onclick = () => deleteQuote(d.id);
        item.querySelector('.btn-pdf').onclick = () => {
            if (data.analysis) {
                generateProfessionalPDF(data.analysis, { name: data.cliente, email: state.user?.email });
            } else {
                showToast("Dati analisi non disponibili", "error");
            }
        };
        list.appendChild(item);
    });
}

async function deleteQuote(id) {
    if (!confirm("Eliminare questo preventivo?")) return;
    try {
        await deleteDoc(doc(db, "quotes", id));
        showToast("Eliminato", "success");
        loadSavedQuotes();
    } catch (e) { showToast("Errore eliminazione", "error"); }
}

// ===== INITIALIZATION =====
function resetApp() {
    // Reset dello stato senza ricaricare la pagina
    state = {
        currentStep: 1,
        selectedTrade: null,
        selectedSub: null,
        selectedMacro: null,
        isQuickMode: false,
        user: state.user, // Mantieni l'utente loggato
        questionAnswers: {},
        lastAnalysis: null
    };
    
    // Pulisci i form
    getEl('regionSelect').value = '';
    getEl('quantityInput').value = '';
    getEl('receivedPriceInput').value = '';
    const priceStep3 = getEl('receivedPriceInputStep3');
    if (priceStep3) priceStep3.value = '';
    getEl('context-text').value = '';
    getEl('dynamicQuestions').innerHTML = '';
    
    // Nascondi risultati e mostra hero
    getEl('hero-section')?.classList.remove('hidden');
    const appRoot = getEl('app-root');
    if (appRoot) appRoot.style.display = 'none';
    
    // Ripristina il primo step
    goToStep(1);
    renderMacroCategories();
    
    showToast("Analisi azzerata. Pronto per una nuova analisi.", "success");
}

function startWizardFlow(quick) {
    console.log("Starting wizard flow, quick:", quick);
    state.isQuickMode = quick;
    state.questionAnswers = {};
    state.lastAnalysis = null;
    
    getEl('hero-section')?.classList.add('hidden');
    const appRoot = getEl('app-root');
    if (appRoot) {
        appRoot.style.display = 'block';
        appRoot.classList.remove('hidden');
    }
    
    getEl('step3Label').textContent = quick ? "Stima" : "Verifica Prezzo";
    getEl('receivedPriceGroup').style.display = quick ? 'none' : 'block';
    
    renderMacroCategories();
    goToStep(1);
}

function setupEventListeners() {
    // Hero
    getEl('startAnalysisBtn')?.addEventListener('click', () => startWizardFlow(false));
    getEl('startQuickBtn')?.addEventListener('click', () => startWizardFlow(true));
    
    // Login
    getEl('googleLoginBtn')?.addEventListener('click', async () => {
        try { await signInWithPopup(auth, new GoogleAuthProvider()); } 
        catch (e) { showToast("Errore login: " + e.message, "error"); }
    });
    getEl('closeLoginBtn')?.addEventListener('click', () => getEl('loginModal')?.classList.add('hidden'));
    
    // Wizard
    getEl('nextStepBtn')?.addEventListener('click', () => {
        const region = getEl('regionSelect')?.value;
        const qty = parseFloat(getEl('quantityInput')?.value);
        if (!region || isNaN(qty) || qty <= 0) {
            showToast("Inserisci regione e quantità valida", "error");
            return;
        }
        goToStep(3);
    });
    getEl('prevStepBtn')?.addEventListener('click', () => goToStep(1));
    getEl('prevStep3Btn')?.addEventListener('click', () => goToStep(2));
    getEl('runAnalysisBtn')?.addEventListener('click', runAnalysis);
    getEl('backSelectionBtn')?.addEventListener('click', goBackSelection);
    getEl('resetAppBtn')?.addEventListener('click', () => resetApp());
    
    getEl('btnDownloadPDF')?.addEventListener('click', () => {
        if (state.lastAnalysis) {
            generateProfessionalPDF(state.lastAnalysis, { name: state.user?.displayName, email: state.user?.email });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded - Initializing App");
    
    // Init Regions
    const regions = Object.keys(database.REGIONAL_COEFFICIENTS).sort();
    const regionSelect = getEl('regionSelect');
    if (regionSelect) {
        regionSelect.innerHTML = '<option value="" disabled selected>Seleziona Regione</option>' +
            regions.map(r => `<option value="${r}">${r}</option>`).join('');
    }

    setupEventListeners();
    
    onAuthStateChanged(auth, (firebaseUser) => {
        state.user = firebaseUser;
        updateUserUI();
        if (state.user) loadSavedQuotes();
    });
});
