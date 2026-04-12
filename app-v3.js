/**
 * Preventivi-Smart Pro v10.2 — Core Engine
 * Fix Definitivo Interattività e Protezione Business Model
 */

import database from './engine/database.js';
import { analyzeQuote } from './engine/ai-analyzer.js';
import { renderAdvancedCharts } from './engine/charts-advanced.js';

// ===== STATE MANAGEMENT =====
let currentStep = 1;
let selectedTrade = null;
let selectedSub = null;
let selectedMacro = null;
let isQuickMode = false;
let currentUser = JSON.parse(localStorage.getItem('ps_user')) || null;

// ===== DOM ELEMENTS =====
const heroSection = document.getElementById('hero-section');
const appRoot = document.getElementById('app-root');
const tradesGrid = document.getElementById('tradesGrid');
const regionSelect = document.getElementById('regionSelect');
const quantityInput = document.getElementById('quantityInput');
const receivedPriceInput = document.getElementById('receivedPriceInput');
const dynamicQuestions = document.getElementById('dynamicQuestions');
const loginModal = document.getElementById('loginModal');
const userNav = document.getElementById('userNav');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    initRegions();
    updateUserUI();
    setupEventListeners();
    
    // Esponiamo le funzioni necessarie al window per gli onclick inline
    window.selectMacro = selectMacro;
    window.selectSub = selectSub;
    window.selectTrade = selectTrade;
    window.goBackSelection = goBackSelection;
    window.startWizard = startWizard;
    window.runAnalysis = runAnalysis;
});

function initRegions() {
    const regions = [
        "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
        "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
        "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
        "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
    ];
    if (regionSelect) {
        regionSelect.innerHTML = '<option value="" disabled selected>Seleziona Regione</option>' +
            regions.map(r => `<option value="${r}">${r}</option>`).join('');
    }
}

function updateUserUI() {
    if (!userNav) return;
    if (currentUser) {
        userNav.innerHTML = `
            <div class="user-profile-nav" style="display: flex; align-items: center; gap: 12px;">
                <span class="user-name" style="font-weight: 600; font-size: 0.875rem;">${currentUser.name || currentUser.email.split('@')[0]}</span>
                <button class="btn btn-login-trigger" id="logoutBtn">Esci</button>
            </div>
        `;
        document.getElementById('logoutBtn')?.addEventListener('click', logout);
    } else {
        userNav.innerHTML = `<button class="btn btn-login-trigger" id="loginTriggerBtn">Accedi</button>`;
        document.getElementById('loginTriggerBtn')?.addEventListener('click', () => loginModal.classList.remove('hidden'));
    }
}

function setupEventListeners() {
    // Hero Actions
    document.getElementById('startAnalysisBtn')?.addEventListener('click', (e) => {
        console.log("Start Analysis Clicked");
        startWizard(false);
    });
    document.getElementById('startQuickBtn')?.addEventListener('click', (e) => {
        console.log("Start Quick Clicked");
        startWizard(true);
    });

    // Wizard Navigation
    document.getElementById('nextStepBtn')?.addEventListener('click', () => {
        if (validateStep2()) goToStep(3);
    });
    document.getElementById('prevStepBtn')?.addEventListener('click', () => goToStep(1));
    document.getElementById('prevStep3Btn')?.addEventListener('click', () => goToStep(2));
    document.getElementById('runAnalysisBtn')?.addEventListener('click', runAnalysis);

    // Login Modal
    document.getElementById('closeLoginBtn')?.addEventListener('click', () => loginModal.classList.add('hidden'));
    document.getElementById('googleLoginBtn')?.addEventListener('click', loginWithGoogle);
    document.getElementById('emailLoginForm')?.addEventListener('submit', loginWithEmail);

    // Input Validation Feedback
    regionSelect?.addEventListener('change', () => updateFeedback('region', !!regionSelect.value));
    quantityInput?.addEventListener('input', () => updateFeedback('quantity', quantityInput.value > 0));
    receivedPriceInput?.addEventListener('input', () => updateFeedback('price', receivedPriceInput.value > 0));
}

function validateStep2() {
    const region = regionSelect.value;
    const qty = parseFloat(quantityInput.value);
    if (!region) {
        showToast("Seleziona la tua regione", "error");
        return false;
    }
    if (isNaN(qty) || qty <= 0) {
        showToast("Inserisci una quantità valida", "error");
        return false;
    }
    return true;
}

// ===== WIZARD LOGIC =====
function startWizard(quick) {
    isQuickMode = quick;
    
    // BUSINESS PROTECTION
    if (isQuickMode && !currentUser) {
        const quickCount = parseInt(localStorage.getItem('ps_quick_count') || '0');
        if (quickCount >= 1) {
            showToast("Hai esaurito le stime rapide gratuite. Accedi per continuare.", "info");
            loginModal.classList.remove('hidden');
            return;
        }
    }

    if (heroSection) heroSection.classList.add('hidden');
    if (appRoot) {
        appRoot.style.display = 'block';
        appRoot.classList.remove('hidden');
        
        // Aggiungiamo una GIF di benvenuto nel wizard
        const wizardIntro = document.querySelector('#step1 .step-header');
        if (wizardIntro && !document.getElementById('wizardGif')) {
            const gifDiv = document.createElement('div');
            gifDiv.id = 'wizardGif';
            gifDiv.style.cssText = "width: 100%; height: 120px; margin-bottom: 16px; border-radius: 12px; overflow: hidden;";
            gifDiv.innerHTML = `<iframe src="https://giphy.com/embed/3o7TKMGpxS5S2fW3K0" width="100%" height="100%" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>`;
            wizardIntro.prepend(gifDiv);
        }
    }
    
    currentStep = 1;
    selectedMacro = null;
    selectedSub = null;
    selectedTrade = null;
    
    const step3Label = document.getElementById('step3Label');
    if (step3Label) step3Label.textContent = isQuickMode ? "Stima" : "Prezzo";
    
    renderMacroCategories();
    goToStep(1);
}

function renderMacroCategories() {
    if (!tradesGrid) return;
    const cats = database.getAllCategories ? database.getAllCategories() : Object.entries(database.categories).map(([id, c]) => ({id, ...c}));
    
    tradesGrid.innerHTML = cats.map(cat => `
        <div class="trade-card" onclick="selectMacro('${cat.id}')">
            <i class="${cat.icon}"></i>
            <h4>${cat.name || cat.label}</h4>
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
    if (!tradesGrid) return;
    const subs = database.getSubCategories ? database.getSubCategories(macroId) : Object.entries(database.categories[macroId].subs).map(([id, s]) => ({id, ...s}));
    
    tradesGrid.innerHTML = subs.map(sub => `
        <div class="trade-card" onclick="selectSub('${sub.id}')">
            <i class="${sub.icon}"></i>
            <h4>${sub.name || sub.label}</h4>
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
    if (!tradesGrid) return;
    const trades = database.getTradesByCategory ? database.getTradesByCategory(subId) : Object.entries(database.categories[macroId].subs[subId].trades).map(([id, t]) => ({id, ...t}));
    
    tradesGrid.innerHTML = trades.map(trade => `
        <div class="trade-card" onclick="selectTrade('${trade.id}')">
            <i class="${trade.icon}"></i>
            <h4>${trade.name || trade.label}</h4>
        </div>
    `).join('');
}

function selectTrade(id) {
    selectedTrade = id;
    const tradeData = database.getTradeById ? database.getTradeById(id) : database.getTrade(selectedMacro, selectedSub, id);
    
    const unitLabel = document.getElementById('unitLabel');
    if (unitLabel) unitLabel.textContent = tradeData.unit;
    
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
    if (!dynamicQuestions) return;
    dynamicQuestions.innerHTML = questions.map((q, idx) => `
        <div class="form-group">
            <label class="form-label">${q.label}</label>
            <select class="form-select dynamic-q" data-idx="${idx}">
                ${q.options.map(opt => `<option value="${opt.multiplier}">${opt.text}</option>`).join('')}
            </select>
        </div>
    `).join('');
}

function goToStep(step) {
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    const targetStep = document.getElementById(`step${step}`);
    if (targetStep) targetStep.classList.remove('hidden');
    
    document.querySelectorAll('.step-item').forEach((el, idx) => {
        el.classList.remove('active', 'completed');
        if (idx + 1 === step) el.classList.add('active');
        if (idx + 1 < step) el.classList.add('completed');
    });
    
    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateFeedback(id, isValid) {
    const icon = document.getElementById(`feedback-${id}`);
    if (!icon) return;
    const iconClass = id === 'region' ? 'fa-location-dot' : id === 'quantity' ? 'fa-ruler-combined' : 'fa-euro-sign';
    icon.innerHTML = isValid ? 
        '<i class="fa-solid fa-circle-check" style="color: var(--success);"></i>' : 
        `<i class="fa-solid ${iconClass}" style="color: var(--gray-200);"></i>`;
}

// ===== ANALYSIS ENGINE =====
async function runAnalysis() {
    const region = regionSelect.value;
    const qty = parseFloat(quantityInput.value);
    const price = parseFloat(receivedPriceInput.value);

    if (!region || isNaN(qty) || (!isQuickMode && isNaN(price))) {
        showToast("Per favore, completa tutti i campi obbligatori.", "error");
        return;
    }

    if (isQuickMode && !currentUser) {
        const quickCount = parseInt(localStorage.getItem('ps_quick_count') || '0');
        localStorage.setItem('ps_quick_count', (quickCount + 1).toString());
    }

    goToStep(4);
    const loading = document.getElementById('analysisLoading');
    const results = document.getElementById('analysisResults');
    const nav = document.getElementById('resultsNav');

    loading.classList.remove('hidden');
    results.classList.add('hidden');
    nav.classList.add('hidden');

    await new Promise(r => setTimeout(r, 1500));

    const tradeData = database.getTradeById ? database.getTradeById(selectedTrade) : database.getTrade(selectedMacro, selectedSub, selectedTrade);
    const regionalCoeff = database.REGIONAL_COEFFICIENTS[region] || 1.0;
    
    let multiplier = 1.0;
    document.querySelectorAll('.dynamic-q').forEach(select => {
        multiplier *= parseFloat(select.value);
    });

    const baseMarketPrice = tradeData.basePrice * qty * multiplier * regionalCoeff;

    const analysis = analyzeQuote({
        receivedPrice: isQuickMode ? 0 : price,
        marketMin: baseMarketPrice * 0.85,
        marketMid: baseMarketPrice,
        marketMax: baseMarketPrice * 1.25,
        tradeId: selectedTrade,
        region: region,
        mode: isQuickMode ? 'quick' : 'full'
    });

    renderResults(analysis);
    
    loading.classList.add('hidden');
    results.classList.remove('hidden');
    nav.classList.remove('hidden');
}

function renderResults(data) {
    const container = document.getElementById('analysisResults');
    if (!container) return;
    const v = data.verdict;

    const giphyId = v.severity === 'success' ? '3o7abKhOpu0NPGuh3y' : v.severity === 'warning' ? '3o7TKVUn7XYMhxuQs8' : '3o7TKSjRzylqK8/+uA';
    
    container.innerHTML = `
        <div class="result-card animate-scale-in">
            <div style="width: 100%; height: 150px; margin-bottom: 20px; border-radius: 12px; overflow: hidden;">
                <iframe src="https://giphy.com/embed/${giphyId}" width="100%" height="100%" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
            </div>
            <div class="verdict-badge verdict-${v.severity}">
                ${v.label}
            </div>
            <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 16px;">
                ${isQuickMode ? '€' + Math.round(data.marketData.mid).toLocaleString() : 'Analisi Completata'}
            </h2>
            <p style="color: var(--gray-500); margin-bottom: 32px;">${v.psychology}</p>
            
            <div class="charts-grid">
                <div class="chart-wrapper">
                    <h4 class="chart-title">Breakdown Costi</h4>
                    <canvas id="breakdownChart"></canvas>
                </div>
                <div class="chart-wrapper">
                    <h4 class="chart-title">Benchmark Mercato</h4>
                    <canvas id="benchmarkChart"></canvas>
                </div>
            </div>

            <div class="advice-section" style="margin-top: 32px; text-align: left;">
                <h4 style="font-weight: 700; margin-bottom: 16px;">Consigli dell'AI:</h4>
                <ul style="list-style: none; padding: 0;">
                    ${data.advice.map(a => `
                        <li style="margin-bottom: 12px; display: flex; gap: 12px; align-items: flex-start;">
                            <i class="fa-solid fa-circle-check" style="color: var(--success); margin-top: 4px;"></i>
                            <span style="font-size: 0.9rem; color: var(--gray-800);">${a}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            ${isQuickMode && !currentUser ? `
                <div class="upsell-box" style="margin-top: 32px; padding: 24px; background: #f0f9ff; border-radius: 16px; border: 1px solid #bae6fd;">
                    <h4 style="color: #0369a1; margin-bottom: 8px;">Vuoi un'analisi dettagliata?</h4>
                    <p style="font-size: 0.875rem; color: #0c4a6e; margin-bottom: 16px;">Accedi per confrontare il tuo preventivo reale con i prezzi di mercato e scaricare il report PDF.</p>
                    <button class="btn btn-primary btn-sm" onclick="document.getElementById('loginModal').classList.remove('hidden')">Accedi Ora</button>
                </div>
            ` : ''}
        </div>
    `;

    renderAdvancedCharts(data);
}

// ===== AUTH ACTIONS =====
function loginWithGoogle() {
    showToast("Connessione a Google in corso...", "info");
    setTimeout(() => {
        currentUser = { email: "utente@gmail.com", name: "Mario Rossi", provider: "google" };
        localStorage.setItem('ps_user', JSON.stringify(currentUser));
        updateUserUI();
        loginModal.classList.add('hidden');
        showToast("Accesso effettuato con successo!", "success");
    }, 1000);
}

function loginWithEmail(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    showToast("Verifica credenziali...", "info");
    setTimeout(() => {
        currentUser = { email: email, name: email.split('@')[0], provider: "email" };
        localStorage.setItem('ps_user', JSON.stringify(currentUser));
        updateUserUI();
        loginModal.classList.add('hidden');
        showToast("Accesso effettuato!", "success");
    }, 1000);
}

function logout() {
    localStorage.removeItem('ps_user');
    currentUser = null;
    updateUserUI();
    showToast("Sessione chiusa.", "info");
}

function showToast(msg, type = "info") {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = "background: white; padding: 12px 24px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); margin-bottom: 10px; display: flex; align-items: center; gap: 10px; border-left: 4px solid " + (type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0ea5e9');
    toast.innerHTML = `
        <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" style="color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0ea5e9'}"></i>
        <span style="font-weight: 600; font-size: 0.875rem;">${msg}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
