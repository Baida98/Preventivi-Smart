/*
 * Preventivi-Smart Pro v28.0 — Versione Migliorata
 * Correzioni bug + Miglioramenti grafici + Effetto semitrasparente login
 */

import database from './database.js';
import { auth, db } from './firebase.js';
import { 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { performProfessionalAnalysis } from './professional-analyzer.js';
import { generateProfessionalPDF } from './professional-pdf.js';
import chartRenderer from './chart-renderer.js';
import { loginUser, loginWithGoogle } from './auth.js';
import QuoteManager from './quote-manager.js';
import uiFeedback from './ui-feedback.js';

// ===== STATE MANAGEMENT =====
let state = {
    currentStep: 1,
    selectedTrade: null,
    selectedSub: null,
    selectedMacro: null,
    isQuickMode: false,
    user: null,
    questionAnswers: {},
    lastAnalysis: null,
    quoteManager: null
};

// ===== UTILITIES =====
const getEl = (id) => document.getElementById(id);

// ===== AUTH LOGIC =====
onAuthStateChanged(auth, (user) => {
    state.user = user;
    if (user) {
        state.quoteManager = new QuoteManager(db, user.uid);
        loadSavedQuotes();
    }
    updateUserUI();
});

function updateUserUI() {
    const userNav = getEl('userNav');
    const loginModal = getEl('loginModal');
    if (!userNav) return;

    if (state.user) {
        userNav.innerHTML = `
            <div class="user-profile-nav" style="display: flex; align-items: center; gap: 12px;">
                <span class="user-name" style="font-weight: 600; font-size: 0.875rem; color: var(--gray-100);">${state.user.displayName || state.user.email.split('@')[0]}</span>
                <button class="btn btn-secondary btn-sm" id="logoutBtn">Esci</button>
            </div>
        `;
        const logoutBtn = getEl('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth));
        loginModal?.classList.add('hidden');
    } else {
        userNav.innerHTML = `<button class="btn btn-login-trigger" id="loginTriggerBtn">Accedi</button>`;
        getEl('loginTriggerBtn')?.addEventListener('click', () => loginModal?.classList.remove('hidden'));
    }
}

// ===== NAVIGATION =====
function goToStep(step) {
    const targetStep = getEl(`step${step}`);
    if (!targetStep) {
        console.error(`Step ${step} non trovato`);
        return;
    }
    
    document.querySelectorAll('.step-content').forEach(s => s.classList.add('hidden'));
    targetStep.classList.remove('hidden');
    
    document.querySelectorAll('.step-item').forEach((item, idx) => {
        idx + 1 <= step ? item.classList.add('active') : item.classList.remove('active');
    });
    
    state.currentStep = step;
}

// ===== CATEGORY RENDERING =====
function renderMacroCategories() {
    const container = getEl('macro-grid');
    if (!container) {
        console.error('macro-grid non trovato');
        return;
    }
    
    state.selectedMacro = null;
    state.selectedSub = null;
    state.selectedTrade = null;
    
    container.innerHTML = database.MACRO_CATEGORIES.map((macro, idx) => `
        <div class="trade-card" onclick="window.selectMacro('${macro.id}')">
            <div class="trade-card-icon" style="background: ${macro.color};">
                <i class="fa-solid ${macro.icon}"></i>
            </div>
            <h3 class="trade-card-title">${macro.name}</h3>
            <p class="trade-card-desc">${macro.description}</p>
        </div>
    `).join('');
}

window.selectMacro = (macroId) => {
    state.selectedMacro = macroId;
    const macro = database.MACRO_CATEGORIES.find(m => m.id === macroId);
    
    getEl('step1-title').textContent = macro.name;
    getEl('step1-subtitle').textContent = "Seleziona il tipo di intervento";
    
    const container = getEl('macro-grid');
    if (!container) return;
    
    const subs = database.SUB_CATEGORIES.filter(s => s.parent === macroId);
    if (subs.length === 0) {
        container.innerHTML = `<p class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--muted);">Nessuna sottocategoria trovata.</p>`;
    } else {
        container.innerHTML = subs.map((sub, idx) => `
            <div class="trade-card" onclick="window.selectSub('${sub.id}')">
                <div class="trade-card-icon" style="background: ${sub.color};">
                    <i class="fa-solid ${sub.icon}"></i>
                </div>
                <h3 class="trade-card-title">${sub.name}</h3>
            </div>
        `).join('');
    }
    
    getEl('homeFromStep1Btn').classList.remove('hidden');
};

window.selectSub = (subId) => {
    state.selectedSub = subId;
    
    getEl('step1-title').textContent = "Intervento Specifico";
    getEl('step1-subtitle').textContent = "Qual è il lavoro da svolgere?";
    
    const container = getEl('macro-grid');
    if (!container) return;
    
    const trades = database.TRADES_DATABASE.filter(t => t.subId === subId);
    container.innerHTML = trades.map((trade, idx) => `
        <div class="trade-card" onclick="window.selectTrade('${trade.id}')">
            <div class="trade-card-icon" style="background: ${trade.color};">
                <i class="fa-solid ${trade.icon}"></i>
            </div>
            <h3 class="trade-card-title">${trade.name}</h3>
        </div>
    `).join('');
};

window.selectTrade = (tradeId) => {
    state.selectedTrade = tradeId;
    const trade = database.TRADES_DATABASE.find(t => t.id === tradeId);
    
    getEl('unitLabel').textContent = trade.unit;
    getEl('quantityInput').placeholder = `Es: 10 ${trade.unit}`;
    getEl('tradeNameDisplay').textContent = trade.name;
    // Rimosso: getEl('basePriceDisplay').textContent = `€${trade.basePrice}`;
    
    renderQuestions(trade);
    goToStep(2);
};

function renderQuestions(trade) {
    const container = getEl('dynamicQuestions');
    if (!container || !trade.questions) return;
    
    state.questionAnswers = {};
    container.innerHTML = trade.questions.map((q, idx) => `
        <div class="form-group">
            <label class="form-label">${q.label}</label>
            <select class="form-select dynamic-q" data-idx="${idx}">
                <option value="" disabled selected>Seleziona un'opzione</option>
                ${q.options.map((opt, optIdx) => `<option value="${optIdx}">${opt.text}</option>`).join('')}
            </select>
        </div>
    `).join('');

    container.querySelectorAll('.dynamic-q').forEach(select => {
        select.addEventListener('change', (e) => {
            const qIdx = e.target.dataset.idx;
            const optIdx = e.target.value;
            const question = trade.questions[qIdx];
            const option = question.options[optIdx];
            
            state.questionAnswers[qIdx] = {
                label: question.label,
                text: option.text,
                multiplier: option.multiplier
            };
        });
    });
}

// ===== CORE ACTIONS =====
async function runAnalysis() {
    const region = getEl('regionSelect')?.value;
    const qty = parseFloat(getEl('quantityInput')?.value);
    const priceInput = getEl('receivedPriceInputStep3')?.value || getEl('receivedPriceInput')?.value;
    const price = parseFloat(priceInput) || 0;
    
    if (!state.selectedTrade || !region || !qty) {
        uiFeedback.showFeedback('Compila tutti i campi obbligatori', 'error');
        return;
    }

    // Se non siamo in quick mode, il prezzo è obbligatorio
    if (!state.isQuickMode && price <= 0) {
        uiFeedback.showFeedback('Inserisci un prezzo valido per l\'analisi', 'error');
        return;
    }

    const runBtn = getEl('runAnalysisBtn');
    if (runBtn) uiFeedback.setButtonLoading(runBtn, true);
    
    // Mostra caricamento
    goToStep(4);
    const results = getEl('analysisResults');
    const loading = getEl('analysisLoading');
    if (results) results.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');

    setTimeout(async () => {
        const trade = database.TRADES_DATABASE.find(t => t.id === state.selectedTrade);
        const analysis = await performProfessionalAnalysis({
            tradeId: state.selectedTrade,
            tradeName: trade ? trade.name : 'Lavoro',
            region: region,
            quantity: qty,
            quality: 'standard', 
            receivedPrice: state.isQuickMode ? 0 : price,
            answers: state.questionAnswers
        });

        if (!analysis.success) {
            uiFeedback.setButtonLoading(runBtn, false);
            uiFeedback.showFeedback(analysis.error, "error");
            return;
        }

        state.lastAnalysis = analysis;
        uiFeedback.setButtonLoading(runBtn, false);
        displayResults(analysis);
        
        // Salvataggio strutturato e protetto
        if (state.user && state.quoteManager) {
            uiFeedback.showSaveState('saving');
            try {
                await state.quoteManager.saveQuote({
                    cliente: state.user.displayName || "Mio Preventivo",
                    servizi: [`${analysis.trade.name} (${analysis.input.quantity} ${analysis.trade.unit})`],
                    totale: analysis.input.receivedPrice || analysis.marketAnalysis.marketMid,
                    note: `Analisi effettuata per regione ${analysis.input.region}`
                });
                uiFeedback.showSaveState('saved');
                loadSavedQuotes();
            } catch (e) {
                uiFeedback.showSaveState('error');
            }
        }
    }, 800);
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
        
        const diff = analysis.congruityAnalysis.diffPercent;
        if (state.isQuickMode) {
            verdict = `📊 Stima di Mercato`;
            verdictClass = 'info';
        } else {
            if (diff < -10) { 
                verdict = `✅ Prezzo Conveniente (${Math.abs(diff).toFixed(1)}% sotto mercato)`;
                verdictClass = 'success';
            } else if (diff > 10) {
                verdict = `⚠️ Prezzo Alto (${diff.toFixed(1)}% sopra mercato)`;
                verdictClass = 'warning';
            } else {
                verdict = `ℹ️ Prezzo Allineato al Mercato`;
                verdictClass = 'info';
            }
        }

        results.innerHTML = `
            <div class="result-card ${verdictClass}">
                <h2 class="result-card-title">${verdict}</h2>
                <p style="color: var(--text-secondary); margin-top: 8px;">
                    Prezzo ricevuto: <strong>€${analysis.input.receivedPrice.toLocaleString('it-IT')}</strong><br>
                    Prezzo medio mercato: <strong>€${analysis.marketAnalysis.marketMid.toLocaleString('it-IT')}</strong>
                </p>
            </div>
        `;

        if (nav) nav.classList.remove('hidden');
    }
}

function loadSavedQuotes() {
    if (!state.user || !state.quoteManager) return;

    const container = getEl('savedQuotesList');
    if (!container) return;

    state.quoteManager.getQuotes().then(quotes => {
        if (!quotes || quotes.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Nessun preventivo salvato</p>';
            return;
        }

        container.innerHTML = quotes.map(q => `
            <div class="result-card info" style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 8px 0; font-size: 1rem;">${q.cliente}</h4>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                    ${q.servizi.join(', ')}<br>
                    <strong>€${q.totale.toLocaleString('it-IT')}</strong>
                </p>
            </div>
        `).join('');
    });
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Mostra hero
    const heroSection = getEl('hero-section');
    const appRoot = getEl('app-root');
    
    getEl('startAnalysisBtn')?.addEventListener('click', () => {
        state.isQuickMode = false;
        if (heroSection) heroSection.style.display = 'none';
        if (appRoot) appRoot.style.display = 'block';
        renderMacroCategories();
        goToStep(1);
    });

    getEl('startQuickBtn')?.addEventListener('click', () => {
        state.isQuickMode = true;
        if (heroSection) heroSection.style.display = 'none';
        if (appRoot) appRoot.style.display = 'block';
        renderMacroCategories();
        goToStep(1);
    });

    // Pulsanti di navigazione
    getEl('backSelectionBtn')?.addEventListener('click', renderMacroCategories);
    getEl('homeFromStep1Btn')?.addEventListener('click', () => {
        if (heroSection) heroSection.style.display = 'block';
        if (appRoot) appRoot.style.display = 'none';
    });

    getEl('prevStepBtn')?.addEventListener('click', () => goToStep(state.currentStep - 1));
    getEl('nextStepBtn')?.addEventListener('click', () => goToStep(state.currentStep + 1));
    getEl('prevStep3Btn')?.addEventListener('click', () => goToStep(state.currentStep - 1));
    getEl('runAnalysisBtn')?.addEventListener('click', runAnalysis);

    getEl('resetAppBtn')?.addEventListener('click', () => {
        if (heroSection) heroSection.style.display = 'block';
        if (appRoot) appRoot.style.display = 'none';
        state = {
            currentStep: 1,
            selectedTrade: null,
            selectedSub: null,
            selectedMacro: null,
            isQuickMode: false,
            user: state.user,
            questionAnswers: {},
            lastAnalysis: null,
            quoteManager: state.quoteManager
        };
    });

    getEl('btnDownloadPDF')?.addEventListener('click', async () => {
        if (!state.lastAnalysis) return;
        const pdf = await generateProfessionalPDF(state.lastAnalysis);
        const link = document.createElement('a');
        link.href = pdf;
        link.download = 'analisi-preventivo.pdf';
        link.click();
    });

    // Login
    getEl('closeLoginBtn')?.addEventListener('click', () => {
        getEl('loginModal')?.classList.add('hidden');
    });

    getEl('googleLoginBtn')?.addEventListener('click', async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            getEl('loginModal')?.classList.add('hidden');
        } catch (error) {
            console.error('Errore login Google:', error);
        }
    });

    getEl('emailLoginBtn')?.addEventListener('click', async () => {
        const email = getEl('loginEmail')?.value;
        const password = getEl('loginPassword')?.value;
        if (email && password) {
            try {
                await loginUser(email, password);
                getEl('loginModal')?.classList.add('hidden');
            } catch (error) {
                uiFeedback.showFeedback('Errore di login', 'error');
            }
        }
    });

    // Regioni
    const regionSelect = getEl('regionSelect');
    if (regionSelect) {
        Object.keys(database.REGIONAL_COEFFICIENTS).forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });
    }

    // Mostra/nascondi prezzo ricevuto
    getEl('receivedPriceGroup')?.style.display = state.isQuickMode ? 'none' : 'block';
});

// Esporta funzioni globali per onclick handlers
window.selectMacro = window.selectMacro || ((macroId) => {
    state.selectedMacro = macroId;
    const macro = database.MACRO_CATEGORIES.find(m => m.id === macroId);
    
    getEl('step1-title').textContent = macro.name;
    getEl('step1-subtitle').textContent = "Seleziona il tipo di intervento";
    
    const container = getEl('macro-grid');
    if (!container) return;
    
    const subs = database.SUB_CATEGORIES.filter(s => s.parent === macroId);
    if (subs.length === 0) {
        container.innerHTML = `<p class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--muted);">Nessuna sottocategoria trovata.</p>`;
    } else {
        container.innerHTML = subs.map((sub, idx) => `
            <div class="trade-card" onclick="window.selectSub('${sub.id}')">
                <div class="trade-card-icon" style="background: ${sub.color};">
                    <i class="fa-solid ${sub.icon}"></i>
                </div>
                <h3 class="trade-card-title">${sub.name}</h3>
            </div>
        `).join('');
    }
    
    getEl('homeFromStep1Btn').classList.remove('hidden');
});

window.selectSub = window.selectSub || ((subId) => {
    state.selectedSub = subId;
    
    getEl('step1-title').textContent = "Intervento Specifico";
    getEl('step1-subtitle').textContent = "Qual è il lavoro da svolgere?";
    
    const container = getEl('macro-grid');
    if (!container) return;
    
    const trades = database.TRADES_DATABASE.filter(t => t.subId === subId);
    container.innerHTML = trades.map((trade, idx) => `
        <div class="trade-card" onclick="window.selectTrade('${trade.id}')">
            <div class="trade-card-icon" style="background: ${trade.color};">
                <i class="fa-solid ${trade.icon}"></i>
            </div>
            <h3 class="trade-card-title">${trade.name}</h3>
        </div>
    `).join('');
});

window.selectTrade = window.selectTrade || ((tradeId) => {
    state.selectedTrade = tradeId;
    const trade = database.TRADES_DATABASE.find(t => t.id === tradeId);
    
    getEl('unitLabel').textContent = trade.unit;
    getEl('quantityInput').placeholder = `Es: 10 ${trade.unit}`;
    getEl('tradeNameDisplay').textContent = trade.name;
    
    renderQuestions(trade);
    goToStep(2);
});

export { renderMacroCategories };
