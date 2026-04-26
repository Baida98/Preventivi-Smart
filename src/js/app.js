/*
 * Preventivi-Smart Pro v29.0 — displayResults() REFACTOR
 * 4 blocchi logici: Summary | Prezzi (grafico) | Breakdown | Rischi + Consigli
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
import { renderPriceComparisonChart } from './chart-renderer.js';
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

// ===== GLOBAL HANDLERS (for HTML onclick) =====
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

    if (!state.isQuickMode && price <= 0) {
        uiFeedback.showFeedback('Inserisci un prezzo valido per l\'analisi', 'error');
        return;
    }

    const runBtn = getEl('runAnalysisBtn');
    if (runBtn) uiFeedback.setButtonLoading(runBtn, true);
    
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

// ===== HELPERS INTERNI displayResults =====

/**
 * Restituisce colori semantici in base alla severity del motore
 */
function _severityStyle(severity) {
    const map = {
        critical: { card: 'danger',   badge: 'badge-danger',   icon: 'fa-circle-xmark',      color: 'var(--danger)'  },
        high:     { card: 'warning',  badge: 'badge-warning',  icon: 'fa-triangle-exclamation', color: 'var(--warning)' },
        medium:   { card: 'warning',  badge: 'badge-warning',  icon: 'fa-exclamation-circle', color: 'var(--warning)' },
        low:      { card: 'success',  badge: 'badge-success',  icon: 'fa-check-circle',       color: 'var(--success)' },
        info:     { card: 'info',     badge: 'badge-primary',  icon: 'fa-circle-info',        color: 'var(--info)'    }
    };
    return map[severity] || map.info;
}

/**
 * Restituisce la classe CSS del result-card in base alla classificazione di congruità
 */
function _verdictCardClass(classification, isQuickMode) {
    if (isQuickMode) return 'info';
    const map = {
        SOSPETTO_BASSO:  'danger',
        MOLTO_BASSO:     'warning',
        SOTTO_MERCATO:   'success',
        NELLA_MEDIA:     'info',
        SOPRA_MERCATO:   'warning',
        MOLTO_ALTO:      'warning',
        SOSPETTO_ALTO:   'danger'
    };
    return map[classification] || 'info';
}

/**
 * Testo leggibile del verdetto
 */
function _verdictText(classification, diffPercent, isQuickMode) {
    if (isQuickMode) return 'Stima di Mercato';
    const abs = Math.abs(diffPercent).toFixed(1);
    const map = {
        SOSPETTO_BASSO:  `Prezzo Sospettosamente Basso (${abs}% sotto mercato)`,
        MOLTO_BASSO:     `Prezzo Molto Basso (${abs}% sotto mercato)`,
        SOTTO_MERCATO:   `Prezzo Conveniente (${abs}% sotto mercato)`,
        NELLA_MEDIA:     `Prezzo Allineato al Mercato`,
        SOPRA_MERCATO:   `Prezzo Sopra Mercato (+${abs}%)`,
        MOLTO_ALTO:      `Prezzo Molto Alto (+${abs}%)`,
        SOSPETTO_ALTO:   `Prezzo Sospettosamente Alto (+${abs}%)`
    };
    return map[classification] || 'Analisi Completata';
}

/**
 * Icona emoji del verdetto
 */
function _verdictEmoji(classification, isQuickMode) {
    if (isQuickMode) return '📊';
    const map = {
        SOSPETTO_BASSO:  '🚨',
        MOLTO_BASSO:     '⚠️',
        SOTTO_MERCATO:   '✅',
        NELLA_MEDIA:     'ℹ️',
        SOPRA_MERCATO:   '⚠️',
        MOLTO_ALTO:      '🔴',
        SOSPETTO_ALTO:   '🚨'
    };
    return map[classification] || 'ℹ️';
}

/**
 * Score label testuale
 */
function _scoreLabel(score) {
    if (score >= 80) return { label: 'Affidabile',  color: 'var(--success)' };
    if (score >= 60) return { label: 'Accettabile', color: 'var(--warning)' };
    if (score >= 40) return { label: 'Dubbio',      color: '#f97316' };
    return                  { label: 'Rischioso',   color: 'var(--danger)'  };
}

// ===== BLOCCO 1 — SUMMARY =====
function _renderSummary(analysis) {
    const { congruityAnalysis, marketAnalysis, input, reliabilityScore, trade } = analysis;
    const isQuick = state.isQuickMode;

    const cardClass   = _verdictCardClass(congruityAnalysis.classification, isQuick);
    const verdictText = _verdictText(congruityAnalysis.classification, congruityAnalysis.diffPercent, isQuick);
    const emoji       = _verdictEmoji(congruityAnalysis.classification, isQuick);
    const scoreInfo   = _scoreLabel(reliabilityScore);

    // Barra comparativa prezzi (posizione del prezzo utente nel range min–max)
    const pct = isQuick ? 50 : Math.max(0, Math.min(100,
        ((input.receivedPrice - marketAnalysis.marketMin) /
         (marketAnalysis.marketMax - marketAnalysis.marketMin)) * 100
    ));

    const diffAmountStr = isQuick ? '—' :
        (congruityAnalysis.diffAmount > 0 ? `+€${congruityAnalysis.diffAmount.toLocaleString('it-IT')}` :
         congruityAnalysis.diffAmount < 0 ? `-€${Math.abs(congruityAnalysis.diffAmount).toLocaleString('it-IT')}` : '€0');

    return `
    <!-- ═══ BLOCCO 1: SUMMARY ═══ -->
    <div class="result-card ${cardClass}" style="padding: 20px;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
            <span style="font-size:1.75rem;">${emoji}</span>
            <div>
                <h2 style="margin:0; font-size:1.2rem; font-weight:800; color:var(--text);">${verdictText}</h2>
                <p style="margin:2px 0 0; font-size:0.8rem; color:var(--text-secondary);">
                    ${trade.name} &bull; ${input.region} &bull; ${input.quantity} unità
                </p>
            </div>
            <div style="margin-left:auto; text-align:center; min-width:70px;">
                <div style="font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--text-secondary); margin-bottom:2px;">Score</div>
                <div style="font-size:1.5rem; font-weight:900; color:${scoreInfo.color}; line-height:1;">${reliabilityScore}</div>
                <div style="font-size:0.7rem; font-weight:700; color:${scoreInfo.color};">${scoreInfo.label}</div>
            </div>
        </div>

        <!-- Griglia KPI -->
        <div class="results-grid" style="margin-top:0;">
            ${!isQuick ? `
            <div class="result-stat" style="padding:12px;">
                <div class="result-stat-label" style="font-size:0.65rem;">Prezzo Ricevuto</div>
                <div class="result-stat-value" style="font-size:1.2rem;">€${input.receivedPrice.toLocaleString('it-IT')}</div>
            </div>` : ''}
            <div class="result-stat" style="padding:12px;">
                <div class="result-stat-label" style="font-size:0.65rem;">Mercato Medio</div>
                <div class="result-stat-value" style="font-size:1.2rem;">€${marketAnalysis.marketMid.toLocaleString('it-IT')}</div>
            </div>
            <div class="result-stat" style="padding:12px;">
                <div class="result-stat-label" style="font-size:0.65rem;">Range Mercato</div>
                <div class="result-stat-value" style="font-size:1rem;">€${marketAnalysis.marketMin.toLocaleString('it-IT')} – €${marketAnalysis.marketMax.toLocaleString('it-IT')}</div>
            </div>
            ${!isQuick ? `
            <div class="result-stat" style="padding:12px;">
                <div class="result-stat-label" style="font-size:0.65rem;">Differenza</div>
                <div class="result-stat-value" style="font-size:1.2rem; color:${congruityAnalysis.diffAmount > 0 ? 'var(--danger)' : congruityAnalysis.diffAmount < 0 ? 'var(--success)' : 'var(--text)'};">${diffAmountStr}</div>
            </div>` : ''}
        </div>

        ${!isQuick ? `
        <!-- Barra comparativa posizione prezzo -->
        <div style="margin-top:20px;">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">
                <span>Min €${marketAnalysis.marketMin.toLocaleString('it-IT')}</span>
                <span style="font-weight:700; color:var(--text);">Tuo prezzo: €${input.receivedPrice.toLocaleString('it-IT')}</span>
                <span>Max €${marketAnalysis.marketMax.toLocaleString('it-IT')}</span>
            </div>
            <div style="position:relative; height:12px; background:linear-gradient(90deg,#00d95a,#ffb800,#ff4d4d); border-radius:999px; overflow:visible;">
                <div style="position:absolute; top:50%; left:${pct}%; transform:translate(-50%,-50%); width:18px; height:18px; background:#fff; border:3px solid #1f2937; border-radius:50%; box-shadow:0 2px 8px rgba(0,0,0,.3); z-index:2;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">
                <span>Conveniente</span>
                <span>Nella media</span>
                <span>Alto</span>
            </div>
        </div>

        <!-- Raccomandazione motore -->
        <div style="margin-top:16px; padding:12px 16px; background:var(--surface-2,var(--bg-secondary)); border-radius:10px; border-left:4px solid ${_severityStyle(congruityAnalysis.severity).color};">
            <p style="margin:0; font-size:0.875rem; font-weight:600; color:var(--text);">
                <i class="fa-solid fa-lightbulb" style="color:${_severityStyle(congruityAnalysis.severity).color}; margin-right:6px;"></i>
                ${congruityAnalysis.recommendation}
            </p>
        </div>` : `
        <div style="margin-top:16px; padding:12px 16px; background:var(--surface-2,var(--bg-secondary)); border-radius:10px; border-left:4px solid var(--info);">
            <p style="margin:0; font-size:0.875rem; font-weight:600; color:var(--text);">
                <i class="fa-solid fa-circle-info" style="color:var(--info); margin-right:6px;"></i>
                Stima basata sui prezzari regionali 2025. Inserisci un prezzo ricevuto per l'analisi completa.
            </p>
        </div>`}
    </div>`;
}

// ===== BLOCCO 2 — PREZZI (con grafico obbligatorio) =====
function _renderPrezzi(analysis) {
    const { marketAnalysis, input, hourlyBenchmark } = analysis;
    const isQuick = state.isQuickMode;

    return `
    <!-- ═══ BLOCCO 2: PREZZI ═══ -->
    <div class="result-card" style="padding:20px;">
        <h3 style="margin:0 0 16px; font-size:1rem; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-chart-bar" style="color:var(--info);"></i>
            Confronto Prezzi di Mercato
        </h3>

        <!-- Grafico obbligatorio — container dedicato -->
        <div id="priceChartInline" style="position:relative; height:220px; margin-bottom:20px; display:block; visibility:visible;">
            <canvas id="priceChartCanvas"></canvas>
        </div>

        <!-- Tabella valori numerici -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:12px; margin-bottom:${!isQuick ? '20px' : '0'};">
            <div style="text-align:center; padding:12px; background:rgba(0,217,90,.08); border-radius:10px; border:1px solid rgba(0,217,90,.2);">
                <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--success); margin-bottom:4px;">Minimo</div>
                <div style="font-size:1rem; font-weight:800; color:var(--text);">€${marketAnalysis.marketMin.toLocaleString('it-IT')}</div>
            </div>
            <div style="text-align:center; padding:10px; background:rgba(0,117,255,.08); border-radius:10px; border:2px solid rgba(0,117,255,.3);">
                <div style="font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--info); margin-bottom:4px;">Medio</div>
                <div style="font-size:1rem; font-weight:800; color:var(--text);">€${marketAnalysis.marketMid.toLocaleString('it-IT')}</div>
            </div>
            <div style="text-align:center; padding:10px; background:rgba(255,77,77,.08); border-radius:10px; border:1px solid rgba(255,77,77,.2);">
                <div style="font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--danger); margin-bottom:4px;">Massimo</div>
                <div style="font-size:1rem; font-weight:800; color:var(--text);">€${marketAnalysis.marketMax.toLocaleString('it-IT')}</div>
            </div>
            ${!isQuick ? `
            <div style="text-align:center; padding:10px; background:rgba(99,102,241,.1); border-radius:10px; border:2px solid rgba(99,102,241,.4);">
                <div style="font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#6366f1; margin-bottom:4px;">Tuo Prezzo</div>
                <div style="font-size:1rem; font-weight:800; color:var(--text);">€${input.receivedPrice.toLocaleString('it-IT')}</div>
            </div>` : ''}
        </div>

        ${!isQuick ? `
        <!-- Benchmark orario -->
        <div style="padding:14px 16px; background:var(--surface-2,var(--bg-secondary)); border-radius:10px; display:flex; flex-wrap:wrap; gap:16px; align-items:center;">
            <div style="flex:1; min-width:100px;">
                <div style="font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--text-secondary); margin-bottom:2px;">€/ora Ricevuto</div>
                <div style="font-size:1.1rem; font-weight:800; color:var(--text);">€${hourlyBenchmark.receivedHourly}/h</div>
            </div>
            <div style="flex:1; min-width:100px;">
                <div style="font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--text-secondary); margin-bottom:2px;">€/ora Mercato</div>
                <div style="font-size:1.1rem; font-weight:800; color:var(--text);">€${hourlyBenchmark.marketHourly}/h</div>
            </div>
            <div style="flex:1; min-width:100px;">
                <div style="font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--text-secondary); margin-bottom:2px;">Ore Totali</div>
                <div style="font-size:1.1rem; font-weight:800; color:var(--text);">${hourlyBenchmark.totalHours}h</div>
            </div>
            <div style="flex:1; min-width:100px;">
                <div style="font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--text-secondary); margin-bottom:2px;">Giorni</div>
                <div style="font-size:1.1rem; font-weight:800; color:var(--text);">${hourlyBenchmark.workDays}gg</div>
            </div>
        </div>` : ''}
    </div>`;
}

// ===== BLOCCO 3 — BREAKDOWN COSTI =====
function _renderBreakdown(analysis) {
    const { breakdown, timeline, marketAnalysis } = analysis;
    const total = marketAnalysis.marketMid;

    // Barre percentuali
    const barStyle = (pct, color) =>
        `style="height:8px; width:${pct}%; background:${color}; border-radius:999px; transition:width .6s ease;"`;

    return `
    <!-- ═══ BLOCCO 3: BREAKDOWN COSTI ═══ -->
    <div class="result-card" style="padding:20px;">
        <h3 style="margin:0 0 16px; font-size:1rem; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-chart-pie" style="color:#8b5cf6;"></i>
            Composizione del Costo (su €${total.toLocaleString('it-IT')} medio mercato)
        </h3>

        <!-- Voce: Manodopera -->
        <div style="margin-bottom:18px;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
                <span style="font-size:0.9rem; font-weight:700; color:var(--text);">
                    <i class="fa-solid fa-person-digging" style="color:#6366f1; margin-right:6px;"></i>Manodopera
                </span>
                <span style="font-size:0.9rem; font-weight:800; color:var(--text);">
                    €${breakdown.labor.toLocaleString('it-IT')}
                    <span style="font-size:0.7rem; font-weight:600; color:var(--text-secondary); margin-left:4px;">${breakdown.laborPercentage}%</span>
                </span>
            </div>
            <div style="background:var(--surface-2,#f1f4f7); border-radius:999px; height:6px; overflow:hidden;">
                <div ${barStyle(breakdown.laborPercentage, '#6366f1')}></div>
            </div>
            <p style="margin:4px 0 0; font-size:0.7rem; color:var(--text-secondary);">
                Costo orario stimato: €${breakdown.laborPerHour}/h &bull; ${timeline.totalHours}h totali
            </p>
        </div>

        <!-- Voce: Materiali -->
        <div style="margin-bottom:18px;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
                <span style="font-size:0.9rem; font-weight:700; color:var(--text);">
                    <i class="fa-solid fa-box" style="color:#f59e0b; margin-right:6px;"></i>Materiali
                </span>
                <span style="font-size:0.9rem; font-weight:800; color:var(--text);">
                    €${breakdown.materials.toLocaleString('it-IT')}
                    <span style="font-size:0.7rem; font-weight:600; color:var(--text-secondary); margin-left:4px;">${breakdown.materialsPercentage}%</span>
                </span>
            </div>
            <div style="background:var(--surface-2,#f1f4f7); border-radius:999px; height:6px; overflow:hidden;">
                <div ${barStyle(breakdown.materialsPercentage, '#f59e0b')}></div>
            </div>
        </div>

        <!-- Voce: Oneri & Gestione (margine implicito) -->
        <div style="margin-bottom:18px;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
                <span style="font-size:0.9rem; font-weight:700; color:var(--text);">
                    <i class="fa-solid fa-briefcase" style="color:#10b981; margin-right:6px;"></i>Oneri & Margine Implicito
                </span>
                <span style="font-size:0.9rem; font-weight:800; color:var(--text);">
                    €${breakdown.overhead.toLocaleString('it-IT')}
                    <span style="font-size:0.7rem; font-weight:600; color:var(--text-secondary); margin-left:4px;">${breakdown.overheadPercentage}%</span>
                </span>
            </div>
            <div style="background:var(--surface-2,#f1f4f7); border-radius:999px; height:6px; overflow:hidden;">
                <div ${barStyle(breakdown.overheadPercentage, '#10b981')}></div>
            </div>
            <p style="margin:4px 0 0; font-size:0.7rem; color:var(--text-secondary);">
                Include spese generali, assicurazione, utile d'impresa
            </p>
        </div>

        <!-- Totale recap -->
        <div style="margin-top:16px; padding:12px 14px; background:var(--surface-2,var(--bg-secondary)); border-radius:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div>
                <div style="font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--text-secondary);">Totale Mercato Medio</div>
                <div style="font-size:1.2rem; font-weight:900; color:var(--text);">€${total.toLocaleString('it-IT')}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--text-secondary);">Durata Stimata</div>
                <div style="font-size:0.95rem; font-weight:800; color:var(--text);">${timeline.workDays} gg lav. (~${timeline.calendarDays} cal.)</div>
            </div>
        </div>
    </div>`;
}

// ===== BLOCCO 4 — RISCHI + CONSIGLI =====
function _renderRischiConsigli(analysis) {
    const { riskAssessment, professionalAdvice, congruityAnalysis } = analysis;
    const { risks, warnings, recommendations } = riskAssessment;

    // Garantiamo minimo 3 voci tra rischi + avvisi
    const allRisks = [...risks, ...warnings];

    // Se il motore non ha prodotto abbastanza rischi contestuali, aggiungiamo quelli di default
    const defaultRisks = [
        {
            title: 'Contratto Scritto Obbligatorio',
            description: 'Per importi superiori a €500 è sempre obbligatorio un contratto scritto che specifichi materiali, tempistiche e modalità di pagamento.',
            action: 'Richiedi il contratto prima di versare qualsiasi anticipo',
            severity: 'high'
        },
        {
            title: 'Verifica Iscrizione Camera di Commercio',
            description: 'L\'artigiano deve essere iscritto alla Camera di Commercio e in regola con i contributi. Richiedere visura camerale.',
            action: 'Controlla la visura su impresainungiorno.gov.it',
            severity: 'medium'
        },
        {
            title: 'Assicurazione RC Professionale',
            description: 'In caso di danni durante i lavori, l\'artigiano deve avere una polizza RC professionale attiva.',
            action: 'Richiedi copia della polizza assicurativa',
            severity: 'medium'
        },
        {
            title: 'Pagamento a Stato Avanzamento Lavori',
            description: 'Non pagare mai il 100% in anticipo. La prassi corretta è 30% all\'inizio, 40% a metà lavori, 30% al collaudo finale.',
            action: 'Inserisci le scadenze di pagamento nel contratto',
            severity: 'medium'
        },
        {
            title: 'Smaltimento Materiali di Scarto',
            description: 'Verificare che il preventivo includa lo smaltimento dei materiali di risulta. Se non indicato, è un costo nascosto potenziale.',
            action: 'Chiedi esplicitamente chi gestisce lo smaltimento',
            severity: 'low'
        }
    ];

    // Riempiamo fino a 3 rischi minimi, massimo 5
    const risksToShow = allRisks.slice(0, 5);
    while (risksToShow.length < 3) {
        const next = defaultRisks.find(d => !risksToShow.some(r => r.title === d.title));
        if (!next) break;
        risksToShow.push(next);
    }

    // Consigli: sempre 2–3 azioni pratiche
    const adviceToShow = professionalAdvice.slice(0, 3);

    const _riskIcon = (severity) => {
        const icons = { critical: '🚨', high: '⚠️', medium: '⚡', low: '💡' };
        return icons[severity] || '⚡';
    };

    const _riskBorder = (severity) => {
        const colors = { critical: 'var(--danger)', high: 'var(--warning)', medium: '#f59e0b', low: 'var(--success)' };
        return colors[severity] || '#f59e0b';
    };

    const risksHTML = risksToShow.map(r => `
        <div style="padding:12px; background:var(--surface-2,var(--bg-secondary)); border-radius:10px; border-left:4px solid ${_riskBorder(r.severity)}; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="font-size:1rem;">${_riskIcon(r.severity)}</span>
                <span style="font-size:0.85rem; font-weight:700; color:var(--text);">${r.title}</span>
            </div>
            <p style="margin:0 0 6px; font-size:0.75rem; color:var(--text-secondary); line-height:1.4;">${r.description}</p>
            ${r.action ? `<div style="display:inline-flex; align-items:center; gap:6px; font-size:0.7rem; font-weight:700; color:${_riskBorder(r.severity)};">
                <i class="fa-solid fa-arrow-right"></i> ${r.action}
            </div>` : ''}
        </div>
    `).join('');

    const adviceHTML = adviceToShow.map(a => `
        <div style="padding:12px; background:rgba(0,117,255,.05); border-radius:10px; border:1px solid rgba(0,117,255,.15); margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <i class="fa-solid ${a.icon}" style="color:var(--info); font-size:0.9rem;"></i>
                <span style="font-size:0.85rem; font-weight:700; color:var(--text);">${a.title}</span>
            </div>
            <p style="margin:0; font-size:0.75rem; color:var(--text-secondary); line-height:1.4;">${a.text}</p>
        </div>
    `).join('');

    // Raccomandazioni dal motore (contratto, verifiche)
    const recsHTML = recommendations.slice(0, 3).map(rec => `
        <div style="display:flex; align-items:flex-start; gap:8px; padding:8px 0; border-bottom:1px solid var(--border);">
            <span style="color:var(--success); font-size:0.85rem; margin-top:2px;">✅</span>
            <div>
                <div style="font-size:0.8rem; font-weight:700; color:var(--text);">${rec.title}</div>
                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:1px;">${rec.description}</div>
            </div>
        </div>
    `).join('');

    return `
    <!-- ═══ BLOCCO 4: RISCHI + CONSIGLI ═══ -->
    <div class="result-card" style="padding:20px;">
        <h3 style="margin:0 0 16px; font-size:1rem; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-shield-halved" style="color:var(--danger);"></i>
            Rischi Identificati
        </h3>
        ${risksHTML}

        <h3 style="margin:20px 0 12px; font-size:1rem; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-lightbulb" style="color:var(--warning);"></i>
            Consigli Pratici
        </h3>
        ${adviceHTML}

        ${recommendations.length > 0 ? `
        <h3 style="margin:20px 0 10px; font-size:0.95rem; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-list-check" style="color:var(--success);"></i>
            Checklist Prima di Firmare
        </h3>
        <div style="padding:0 4px;">
            ${recsHTML}
        </div>` : ''}
    </div>`;
}

// ===== displayResults() — FUNZIONE PRINCIPALE RISTRUTTURATA =====
function displayResults(analysis) {
    const results = getEl('analysisResults');
    const loading = getEl('analysisLoading');
    const nav     = getEl('resultsNav');
    const chartsSection = getEl('analysisCharts'); // sezione chart legacy (la nascondiamo)

    if (loading) loading.classList.add('hidden');
    // Nascondi il blocco chart legacy (ora il grafico è inline nel blocco 2)
    if (chartsSection) chartsSection.classList.add('hidden');

    if (!results) {
        console.error('[displayResults] Contenitore #analysisResults non trovato');
        return;
    }

    // ── Costruzione HTML dei 4 blocchi ──
    results.innerHTML =
        _renderSummary(analysis) +
        _renderPrezzi(analysis) +
        _renderBreakdown(analysis) +
        _renderRischiConsigli(analysis);

    results.classList.remove('hidden');

    // ── BLOCCO 2: Rendering grafico obbligatorio ──
    // STEP 1 — SEMPRE chiamato centralizzando la logica in chart-renderer.js
    requestAnimationFrame(() => {
        renderPriceComparisonChart('priceChartInline', analysis);
    });

    if (nav) nav.classList.remove('hidden');
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
    const heroSection = getEl('hero-section');
    const appRoot = getEl('app-root');
    
    getEl('startAnalysisBtn')?.addEventListener('click', () => {
        state.isQuickMode = false;
        if (heroSection) heroSection.style.display = 'none';
        if (appRoot) appRoot.style.display = 'block';
        getEl('receivedPriceGroup').style.display = 'block';
        renderMacroCategories();
        goToStep(1);
    });

    getEl('startQuickBtn')?.addEventListener('click', () => {
        state.isQuickMode = true;
        if (heroSection) heroSection.style.display = 'none';
        if (appRoot) appRoot.style.display = 'block';
        getEl('receivedPriceGroup').style.display = 'none';
        renderMacroCategories();
        goToStep(1);
    });

    getEl('backSelectionBtn')?.addEventListener('click', renderMacroCategories);
    getEl('homeFromStep1Btn')?.addEventListener('click', () => {
        if (heroSection) heroSection.style.display = 'block';
        if (appRoot) appRoot.style.display = 'none';
    });

    getEl('prevStepBtn')?.addEventListener('click', () => goToStep(state.currentStep - 1));
    getEl('nextStepBtn')?.addEventListener('click', () => {
        if (state.isQuickMode) {
            runAnalysis();
        } else {
            goToStep(state.currentStep + 1);
        }
    });
    getEl('prevStep3Btn')?.addEventListener('click', () => goToStep(state.currentStep - 1));
    getEl('runAnalysisBtn')?.addEventListener('click', runAnalysis);

    getEl('resetAppBtn')?.addEventListener('click', () => {
        if (heroSection) heroSection.style.display = 'block';
        if (appRoot) appRoot.style.display = 'none';
        state = {
            ...state,
            currentStep: 1,
            selectedTrade: null,
            selectedSub: null,
            selectedMacro: null,
            isQuickMode: false,
            questionAnswers: {},
            lastAnalysis: null
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

    const regionSelect = getEl('regionSelect');
    if (regionSelect) {
        Object.keys(database.REGIONAL_COEFFICIENTS).forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });
    }
});

export { renderMacroCategories };
