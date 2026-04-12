/**
 * Preventivi-Smart Pro v11.0 — Complete Professional Edition
 * Database Completo + Domande Dinamiche Ultra-Specifiche + Calcoli Avanzati
 */

import database from './engine/database.js';

// ===== STATE MANAGEMENT =====
let currentStep = 1;
let selectedTrade = null;
let selectedSub = null;
let selectedMacro = null;
let isQuickMode = false;
let currentUser = JSON.parse(localStorage.getItem('ps_user')) || null;
let questionAnswers = {};

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
    initRegions();
    updateUserUI();
    setupEventListeners();
    
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
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('ps_user');
            location.reload();
        });
    } else {
        userNav.innerHTML = `<button class="btn btn-login-trigger" id="loginTriggerBtn">Accedi</button>`;
        document.getElementById('loginTriggerBtn')?.addEventListener('click', () => loginModal.classList.remove('hidden'));
    }
}

function setupEventListeners() {
    document.getElementById('startAnalysisBtn')?.addEventListener('click', () => startWizard(false));
    document.getElementById('startQuickBtn')?.addEventListener('click', () => startWizard(true));
    document.getElementById('nextStepBtn')?.addEventListener('click', () => {
        console.log('nextStepBtn clicked');
        if (validateStep2()) {
            console.log('Validation passed, going to step 3');
            goToStep(3);
        } else {
            console.log('Validation failed');
        }
    });
    document.getElementById('prevStepBtn')?.addEventListener('click', () => goToStep(1));
    document.getElementById('prevStep3Btn')?.addEventListener('click', () => goToStep(2));
    document.getElementById('runAnalysisBtn')?.addEventListener('click', runAnalysis);
    document.getElementById('closeLoginBtn')?.addEventListener('click', () => loginModal.classList.add('hidden'));
}

function validateStep2() {
    const region = regionSelect.value;
    const qty = parseFloat(quantityInput.value);
    console.log('validateStep2 called - region:', region, 'qty:', qty, 'isQuickMode:', isQuickMode);
    if (!region) { showToast("Seleziona la tua regione", "error"); return false; }
    if (isNaN(qty) || qty <= 0) { showToast("Inserisci una quantità valida", "error"); return false; }
    if (!isQuickMode) {
        const price = parseFloat(receivedPriceInput.value);
        console.log('Checking price:', price);
        if (isNaN(price) || price <= 0) { showToast("Inserisci un prezzo valido", "error"); return false; }
    }
    console.log('validateStep2 passed');
    return true;
}

// ===== WIZARD LOGIC =====
function startWizard(quick) {
    isQuickMode = quick;
    questionAnswers = {};
    
    if (heroSection) heroSection.classList.add('hidden');
    if (appRoot) {
        appRoot.style.display = 'block';
        appRoot.classList.remove('hidden');
    }
    
    currentStep = 1;
    selectedMacro = null;
    selectedSub = null;
    selectedTrade = null;
    
    const step3Label = document.getElementById('step3Label');
    if (step3Label) step3Label.textContent = isQuickMode ? "Stima" : "Verifica Prezzo";
    
    const receivedPriceGroup = document.getElementById('receivedPriceGroup');
    if (receivedPriceGroup) {
        receivedPriceGroup.style.display = isQuickMode ? 'none' : 'block';
    }
    
    renderMacroCategories();
    goToStep(1);
}

function renderMacroCategories() {
    if (!tradesGrid) return;
    const cats = database.getAllCategories();
    
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
    if (!tradesGrid) return;
    const subs = database.getSubCategories(macroId);
    
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
    if (!tradesGrid) return;
    const trades = database.getTradesByCategory(subId);
    
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
    const tradeData = database.getTradeById(id);
    
    const unitLabel = document.getElementById('unitLabel');
    if (unitLabel) unitLabel.textContent = tradeData.unit;
    
    const tradeNameDisplay = document.getElementById('tradeNameDisplay');
    if (tradeNameDisplay) tradeNameDisplay.textContent = tradeData.name;
    
    const basePriceDisplay = document.getElementById('basePriceDisplay');
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

async function runAnalysis() {
    const region = regionSelect.value;
    const qty = parseFloat(quantityInput.value);
    const price = parseFloat(receivedPriceInput.value);
    
    if (!region || isNaN(qty) || (!isQuickMode && isNaN(price))) {
        showToast("Completa tutti i campi obbligatori.", "error");
        return;
    }
    
    const tradeData = database.getTradeById(selectedTrade);
    const coefficient = database.REGIONAL_COEFFICIENTS[region] || 1.0;
    
    // Calcolo del moltiplicatore totale dalle domande
    let totalMultiplier = 1.0;
    Object.values(questionAnswers).forEach(mult => {
        totalMultiplier *= mult;
    });
    
    // Calcolo del prezzo stimato
    const estimatedPrice = tradeData.basePrice * qty * coefficient * totalMultiplier;
    
    // Analisi del prezzo ricevuto
    let analysis = {
        estimatedPrice: estimatedPrice,
        receivedPrice: isQuickMode ? null : price,
        difference: isQuickMode ? null : price - estimatedPrice,
        percentageDiff: isQuickMode ? null : ((price - estimatedPrice) / estimatedPrice * 100),
        tradeName: tradeData.name,
        region: region,
        quantity: qty,
        unit: tradeData.unit,
        coefficient: coefficient,
        multiplier: totalMultiplier
    };
    
    goToStep(4);
    displayResults(analysis);
}

function displayResults(analysis) {
    const results = document.getElementById('analysisResults');
    const loading = document.getElementById('analysisLoading');
    const nav = document.getElementById('resultsNav');
    
    if (loading) loading.classList.add('hidden');
    
    if (results) {
        results.classList.remove('hidden');
        
        let verdict = '';
        let verdictClass = '';
        
        if (isQuickMode) {
            verdict = `Prezzo di Mercato Stimato`;
            verdictClass = 'info';
        } else {
            const diff = analysis.percentageDiff;
            if (diff < -10) {
                verdict = `✅ Prezzo CONVENIENTE (-${Math.abs(diff).toFixed(1)}%)`;
                verdictClass = 'success';
            } else if (diff > 20) {
                verdict = `⚠️ Prezzo ALTO (+${diff.toFixed(1)}%)`;
                verdictClass = 'warning';
            } else {
                verdict = `ℹ️ Prezzo NELLA MEDIA (${diff > 0 ? '+' : ''}${diff.toFixed(1)}%)`;
                verdictClass = 'info';
            }
        }
        
        results.innerHTML = `
            <div class="result-card result-${verdictClass}" style="background: white; padding: 24px; border-radius: 16px; border-left: 4px solid ${verdictClass === 'success' ? '#10b981' : verdictClass === 'warning' ? '#f59e0b' : '#3b82f6'}; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: var(--gray-900);">${verdict}</h3>
                <p style="color: var(--gray-600); margin-bottom: 16px;">${analysis.tradeName} - ${analysis.region}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div style="padding: 12px; background: var(--gray-50); border-radius: 8px;">
                        <p style="font-size: 0.85rem; color: var(--gray-500); margin: 0 0 4px 0;">Prezzo Stimato</p>
                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 0;">€${analysis.estimatedPrice.toFixed(2)}</p>
                    </div>
                    ${!isQuickMode ? `<div style="padding: 12px; background: var(--gray-50); border-radius: 8px;">
                        <p style="font-size: 0.85rem; color: var(--gray-500); margin: 0 0 4px 0;">Prezzo Ricevuto</p>
                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: 0;">€${analysis.receivedPrice.toFixed(2)}</p>
                    </div>` : ''}
                </div>
                
                <div style="background: var(--gray-50); padding: 12px; border-radius: 8px; font-size: 0.85rem; color: var(--gray-700);">
                    <p style="margin: 4px 0;"><strong>Quantità:</strong> ${analysis.quantity} ${analysis.unit}</p>
                    <p style="margin: 4px 0;"><strong>Coefficiente Regionale:</strong> ${analysis.coefficient.toFixed(2)}x</p>
                    <p style="margin: 4px 0;"><strong>Moltiplicatore Domande:</strong> ${analysis.multiplier.toFixed(2)}x</p>
                </div>
            </div>
        `;
    }
    
    if (nav) nav.classList.remove('hidden');
}

function showToast(msg, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = "background: white; padding: 12px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-left: 4px solid " + (type==='error'?'#ef4444':'#10b981') + "; margin-bottom: 12px;";
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
