/*
 * Preventivi-Smart Pro v27.0 — Versione Finale Professionale
 * Implementa le 5 regole base per stabilità e usabilità
 */

import database from './engine/database.js';
import { auth, db } from './firebase.js';
import { 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { performProfessionalAnalysis } from './engine/professional-analyzer.js';
import { generateProfessionalPDF } from './engine/professional-pdf.js';
import chartRenderer from './engine/chart-renderer.js';
import { loginUser } from './engine/auth.js';
import QuoteManager from './engine/quote-manager.js';
import uiFeedback from './engine/ui-feedback.js';

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
    getEl('basePriceDisplay').textContent = `€${trade.basePrice}`;
    
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
        
        // REGOLA 1 & 2: Salvataggio strutturato e protetto
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
            verdict = `Stima di Mercato`;
            verdictClass = 'info';
        } else {
            if (diff < -10) { verdict = `✅ Prezzo Conveniente (${diff}%)`; verdictClass = 'success'; }
            else if (diff > 20) { verdict = `⚠️ Prezzo Alto (+${diff}%)`; verdictClass = 'warning'; }
            else { verdict = `ℹ️ Prezzo Equo (${diff > 0 ? '+' : ''}${diff}%)`; verdictClass = 'info'; }
        }
        
        results.innerHTML = `
            <div class="result-card ${verdictClass}">
                <div class="result-card-header">
                    <div class="result-card-icon ${verdictClass}">
                        <i class="fa-solid ${verdictClass === 'success' ? 'fa-circle-check' : verdictClass === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i>
                    </div>
                    <h3 class="result-card-title">${verdict}</h3>
                </div>
                <div class="result-card-value">€${analysis.marketAnalysis.marketMid.toFixed(2)}</div>
                <div class="result-card-label">Prezzo Medio di Mercato</div>
                <p class="result-card-description">Basato su prezzari regionali 2026 per ${analysis.input.region}.</p>
            </div>
            
            ${!state.isQuickMode ? `
            <div class="result-card info">
                <div class="result-card-header">
                    <div class="result-card-icon info">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                    <h3 class="result-card-title">Il Tuo Preventivo</h3>
                </div>
                <div class="result-card-value">€${analysis.input.receivedPrice.toFixed(2)}</div>
                <div class="result-card-label">Prezzo Ricevuto</div>
                <p class="result-card-description">Analisi di congruità completata con score ${analysis.reliabilityScore}/100.</p>
            </div>
            ` : ''}
        `;

        // Renderizza grafico
        const chartsContainer = getEl('analysisCharts');
        if (chartsContainer) {
            chartsContainer.classList.remove('hidden');
            chartRenderer.renderPriceComparisonChart('priceChartContainer', analysis);
        }
    }
    if (nav) nav.classList.remove('hidden');
    goToStep(4);
}

// ===== QUOTE MANAGEMENT =====
async function loadSavedQuotes() {
    if (!state.quoteManager) return;
    const quotes = await state.quoteManager.getAllQuotes();
    renderSavedQuotes(quotes);
}

function renderSavedQuotes(quotes) {
    const list = getEl('savedQuotesList');
    if (!list) return;
    
    if (!quotes || quotes.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--muted);">
                <i class="fa-solid fa-inbox" style="font-size: 3rem; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                <p>Nessun preventivo salvato</p>
                <p style="font-size: 0.875rem; margin-top: 8px;">I tuoi preventivi analizzati appariranno qui</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = quotes.map(q => `
        <div class="saved-quote-item">
            <div class="saved-quote-info">
                <strong>${q.cliente}</strong>
                <p>${new Date(q.data).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="saved-quote-price">€${q.totale.toFixed(2)}</div>
            <div class="saved-quote-actions">
                <button class="btn btn-sm btn-primary" onclick="downloadQuotePDF('${q.id}')"><i class="fa-solid fa-file-pdf"></i> PDF</button>
            </div>
        </div>
    `).join('');
}

async function downloadPDF() {
    if (!state.lastAnalysis) {
        uiFeedback.showFeedback('Nessuna analisi disponibile', 'error');
        return;
    }
    
    const btn = getEl('btnDownloadPDF');
    uiFeedback.setButtonLoading(btn, true);
    
    try {
        const pdfData = state.quoteManager ? 
            await state.quoteManager.getPDFData(state.lastAnalysis) : 
            state.lastAnalysis;
        
        generateProfessionalPDF(pdfData);
        uiFeedback.showFeedback('Report scaricato con successo', 'success');
    } catch (e) {
        uiFeedback.showFeedback('Errore nel download del report', 'error');
    } finally {
        uiFeedback.setButtonLoading(btn, false);
    }
}

async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        getEl('loginModal')?.classList.add('hidden');
    } catch (e) {
        uiFeedback.showFeedback('Errore di accesso', 'error');
    }
}

function resetApp() {
    state.selectedTrade = null;
    state.selectedSub = null;
    state.selectedMacro = null;
    state.questionAnswers = {};
    state.lastAnalysis = null;
    
    getEl('regionSelect').value = '';
    getEl('quantityInput').value = '';
    getEl('receivedPriceInput').value = '';
    if (getEl('receivedPriceInputStep3')) getEl('receivedPriceInputStep3').value = '';
    
    getEl('analysisResults')?.classList.add('hidden');
    getEl('analysisCharts')?.classList.add('hidden');
    getEl('resultsNav')?.classList.add('hidden');
    
    renderMacroCategories();
    goToStep(1);
}

function startWizardFlow(quick) {
    state.isQuickMode = quick;
    getEl('hero-section').classList.add('hidden');
    getEl('app-root').style.display = 'block';
    goToStep(1);
}

function goHome() {
    getEl('app-root').style.display = 'none';
    getEl('hero-section').classList.remove('hidden');
    resetApp();
}

// ===== INITIALIZATION =====
function populateRegions() {
    const regionSelect = getEl('regionSelect');
    if (!regionSelect) return;
    
    const regions = Object.keys(database.REGIONAL_COEFFICIENTS).sort();
    regionSelect.innerHTML = `
        <option value="" disabled selected>Seleziona la tua regione</option>
        ${regions.map(r => `<option value="${r}">${r}</option>`).join('')}
    `;
}

window.downloadQuotePDF = async (quoteId) => {
    if (!state.quoteManager) return;
    try {
        uiFeedback.showFeedback('Generazione PDF in corso...', 'info');
        const pdfData = await state.quoteManager.getPDFData(quoteId);
        generateProfessionalPDF(pdfData);
        uiFeedback.showFeedback('PDF scaricato con successo', 'success');
    } catch (e) {
        console.error('Errore download PDF:', e);
        uiFeedback.showFeedback('Errore nella generazione del PDF', 'error');
    }
};

async function handleEmailLogin(e) {
    e.preventDefault();
    const email = getEl('loginEmail')?.value;
    const password = getEl('loginPassword')?.value;
    const btn = getEl('emailLoginBtn');

    if (!email || !password) {
        uiFeedback.showFeedback('Inserisci email e password', 'error');
        return;
    }

    uiFeedback.setButtonLoading(btn, true);
    const result = await loginUser(email, password);
    uiFeedback.setButtonLoading(btn, false);

    if (result.success) {
        getEl('loginModal')?.classList.add('hidden');
        uiFeedback.showFeedback('Accesso effettuato', 'success');
    } else {
        uiFeedback.showFeedback(result.error, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Preventivi-Smart Pro: Inizializzazione in corso...');
    
    try {
        renderMacroCategories();
        populateRegions();
        console.log('✅ Categorie e Regioni caricate');
    } catch (e) {
        console.error('❌ Errore nell\'inizializzazione:', e);
    }
    
    // Hero buttons
    const startAnalysisBtn = getEl('startAnalysisBtn');
    const startQuickBtn = getEl('startQuickBtn');
    
    if (startAnalysisBtn) {
        startAnalysisBtn.addEventListener('click', () => startWizardFlow(false));
        console.log('✅ startAnalysisBtn collegato');
    }
    if (startQuickBtn) {
        startQuickBtn.addEventListener('click', () => startWizardFlow(true));
        console.log('✅ startQuickBtn collegato');
    }
    
    // Step navigation
    const prevStepBtn = getEl('prevStepBtn');
    const prevStep3Btn = getEl('prevStep3Btn');
    const nextStepBtn = getEl('nextStepBtn');
    
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', () => goToStep(1));
        console.log('✅ prevStepBtn collegato');
    }
    if (prevStep3Btn) {
        prevStep3Btn.addEventListener('click', () => goToStep(2));
        console.log('✅ prevStep3Btn collegato');
    }
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', () => {
            if (state.isQuickMode) {
                runAnalysis();
            } else {
                goToStep(3);
            }
        });
        console.log('✅ nextStepBtn collegato');
    }

    // Aggiungi listener per feedback visuale immediato sul prezzo
    const priceInputStep3 = getEl('receivedPriceInputStep3');
    if (priceInputStep3) {
        priceInputStep3.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const feedback = getEl('feedback-price');
            if (feedback) {
                if (val > 0) {
                    feedback.innerHTML = '<i class="fa-solid fa-check-circle text-success animate-bounce"></i>';
                } else {
                    feedback.innerHTML = '';
                }
            }
        });
    }
    
    // Analysis & Reset
    const runAnalysisBtn = getEl('runAnalysisBtn');
    const resetAppBtn = getEl('resetAppBtn');
    const btnDownloadPDF = getEl('btnDownloadPDF');
    
    if (runAnalysisBtn) {
        runAnalysisBtn.addEventListener('click', runAnalysis);
        console.log('✅ runAnalysisBtn collegato');
    }
    if (resetAppBtn) {
        resetAppBtn.addEventListener('click', resetApp);
        console.log('✅ resetAppBtn collegato');
    }
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', downloadPDF);
        console.log('✅ btnDownloadPDF collegato');
    }
    
    // Step 1 Navigation
    const homeFromStep1Btn = getEl('homeFromStep1Btn');
    const backSelectionBtn = getEl('backSelectionBtn');
    
    if (homeFromStep1Btn) {
        homeFromStep1Btn.addEventListener('click', goHome);
    }
    if (backSelectionBtn) {
        backSelectionBtn.addEventListener('click', () => {
            if (state.selectedTrade) {
                window.selectSub(state.selectedSub);
                state.selectedTrade = null;
            } else if (state.selectedSub) {
                window.selectMacro(state.selectedMacro);
                state.selectedSub = null;
            } else if (state.selectedMacro) {
                renderMacroCategories();
                state.selectedMacro = null;
                if (homeFromStep1Btn) homeFromStep1Btn.classList.remove('hidden');
            } else {
                goHome();
            }
        });
    }
    
    // Login modal
    const closeLoginBtn = getEl('closeLoginBtn');
    const googleLoginBtn = getEl('googleLoginBtn');
    const loginModal = getEl('loginModal');
    
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', () => {
            if (loginModal) loginModal.classList.add('hidden');
        });
        console.log('✅ closeLoginBtn collegato');
    }
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', loginWithGoogle);
        console.log('✅ googleLoginBtn collegato');
    }

    const emailLoginForm = getEl('emailLoginForm');
    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', handleEmailLogin);
        console.log('✅ emailLoginForm collegato');
    }
    
    console.log('✅ Tutti i listener inizializzati correttamente');
});
