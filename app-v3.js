/**
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
        getEl('logoutBtn')?.addEventListener('click', () => signOut(auth));
        loginModal?.classList.add('hidden');
    } else {
        userNav.innerHTML = `<button class="btn btn-primary btn-sm" id="loginTriggerBtn">Accedi</button>`;
        getEl('loginTriggerBtn')?.addEventListener('click', () => loginModal?.classList.remove('hidden'));
    }
}

// ===== WIZARD NAVIGATION =====
function goToStep(step) {
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
    const container = getEl('macro-grid');
    if (!container) return;
    
    container.innerHTML = database.MACRO_CATEGORIES.map((macro, idx) => `
        <div class="trade-card trade-card-macro animate-fade-in-up" onclick="selectMacro('${macro.id}')" style="animation-delay: ${idx * 0.1}s;">
            <div class="card-icon-wrapper" style="background: ${macro.color}15; border: 1px solid ${macro.color}30;">
                <i class="fa-solid ${macro.icon}" style="font-size: 1.75rem; color: ${macro.color};"></i>
            </div>
            <h4>${macro.name}</h4>
            <p>${macro.description}</p>
            <div class="card-footer-action">Seleziona →</div>
        </div>
    `).join('');
}

window.selectMacro = (macroId) => {
    state.selectedMacro = macroId;
    const macro = database.MACRO_CATEGORIES.find(m => m.id === macroId);
    getEl('step1-title').textContent = macro.name;
    getEl('step1-subtitle').textContent = "Seleziona il tipo di intervento";
    
    const container = getEl('macro-grid');
    const subs = database.SUB_CATEGORIES.filter(s => s.parent === macroId);
    container.innerHTML = subs.map((sub, idx) => `
        <div class="trade-card trade-card-sub animate-fade-in-up" onclick="selectSub('${sub.id}')" style="animation-delay: ${idx * 0.1}s;">
            <div class="card-icon-wrapper" style="background: ${sub.color}20; border: 2px solid ${sub.color}40; border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; height: 60px;">
                <i class="fa-solid ${sub.icon}" style="font-size: 1.75rem; color: ${sub.color};"></i>
            </div>
            <h4 style="margin-bottom: 8px; color: var(--gray-50);">${sub.name}</h4>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); color: var(--primary); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Continua →</div>
        </div>
    `).join('');
    
    getEl('homeFromStep1Btn').classList.add('hidden');
    getEl('backToMacroBtn').classList.remove('hidden');
};

window.selectSub = (subId) => {
    state.selectedSub = subId;
    const trades = database.TRADES_DATABASE.filter(t => t.subId === subId);
    
    getEl('step1-title').textContent = "Intervento Specifico";
    getEl('step1-subtitle').textContent = "Qual è il lavoro da svolgere?";
    
    const container = getEl('macro-grid');
    container.innerHTML = trades.map((trade, idx) => `
        <div class="trade-card trade-card-trade animate-fade-in-up" onclick="selectTrade('${trade.id}')" style="animation-delay: ${idx * 0.1}s;">
            <div class="card-icon-wrapper" style="background: linear-gradient(135deg, #3b82f620, #1e40af20); border: 2px solid #3b82f640; border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; height: 60px;">
                <i class="fa-solid ${trade.icon || 'fa-screwdriver-wrench'}" style="font-size: 1.75rem; color: #3b82f6;"></i>
            </div>
            <h4 style="margin-bottom: 8px; color: var(--gray-50);">${trade.name}</h4>
            <p style="color: var(--gray-400); font-size: 0.85rem; line-height: 1.4; margin-bottom: 12px;">${trade.unit}</p>
            <div class="card-footer-action">Seleziona →</div>
        </div>
    `).join('');
    
    getEl('backToMacroBtn').classList.add('hidden');
    getEl('backToSubBtn').classList.remove('hidden');
};


window.selectTrade = (tradeId) => {
    state.selectedTrade = tradeId;
    const trade = database.TRADES_DATABASE.find(t => t.id === tradeId);
    
    getEl('trade-unit-label').textContent = trade.unit;
    getEl('quantityInput').placeholder = `Es: 10 ${trade.unit}`;
    
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
    const price = parseFloat(getEl('receivedPriceInputStep3')?.value) || parseFloat(getEl('receivedPriceInput')?.value);
    
    if (!region || isNaN(qty) || (!state.isQuickMode && isNaN(price))) {
        uiFeedback.showFeedback("Completa tutti i campi obbligatori.", "error");
        return;
    }
    
    const runBtn = getEl('runAnalysisBtn');
    uiFeedback.setButtonLoading(runBtn, true);
    
    setTimeout(async () => {
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
    
    if (quotes.length === 0) {
        list.innerHTML = "<p style='color: var(--gray-500); padding: 20px; text-align: center;'>Nessun preventivo salvato.</p>";
        return;
    }

    list.innerHTML = quotes.map(q => `
        <div class="card" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; padding: 16px;">
            <div>
                <div style="font-weight: 700; color: var(--gray-50);">#${q.numero} - ${q.cliente}</div>
                <div style="font-size: 0.85rem; color: var(--gray-400);">${q.data} • €${q.totale.toFixed(2)}</div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary btn-sm btn-pdf" data-id="${q.id}" title="Scarica PDF"><i class="fa-solid fa-file-pdf"></i></button>
                <button class="btn btn-secondary btn-sm btn-dup" data-id="${q.id}" title="Duplica"><i class="fa-solid fa-copy"></i></button>
                <button class="btn btn-secondary btn-sm btn-del" data-id="${q.id}" style="color: var(--danger);" title="Elimina"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    // Event Listeners
    list.querySelectorAll('.btn-pdf').forEach(btn => {
        btn.onclick = async () => {
            const data = await state.quoteManager.getPDFData(btn.dataset.id);
            generateProfessionalPDF(data);
        };
    });

    list.querySelectorAll('.btn-dup').forEach(btn => {
        btn.onclick = async () => {
            uiFeedback.showFeedback("Duplicazione in corso...", "info");
            await state.quoteManager.duplicateQuote(btn.dataset.id);
            uiFeedback.showFeedback("Preventivo duplicato!", "success");
            loadSavedQuotes();
        };
    });

    list.querySelectorAll('.btn-del').forEach(btn => {
        btn.onclick = () => {
            uiFeedback.showDeleteConfirmation(
                "Sei sicuro di voler eliminare questo preventivo? L'azione è irreversibile.",
                async () => {
                    await state.quoteManager.deleteQuote(btn.dataset.id);
                    uiFeedback.showFeedback("Eliminato con successo", "success");
                    loadSavedQuotes();
                }
            );
        };
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    renderMacroCategories();
    
    getEl('startAnalysisBtn')?.addEventListener('click', () => startWizardFlow(false));
    getEl('startQuickBtn')?.addEventListener('click', () => startWizardFlow(true));
    getEl('runAnalysisBtn')?.addEventListener('click', runAnalysis);
    getEl('resetAppBtn')?.addEventListener('click', resetApp);
    
    // Navigazione
    getEl('homeFromStep1Btn')?.addEventListener('click', goHome);
    getEl('backToMacroBtn')?.addEventListener('click', () => {
        renderMacroCategories();
        getEl('backToMacroBtn').classList.add('hidden');
        getEl('homeFromStep1Btn').classList.remove('hidden');
    });
    getEl('backToSubBtn')?.addEventListener('click', () => {
        window.selectMacro(state.selectedMacro);
        getEl('backToSubBtn').classList.add('hidden');
    });
});

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
