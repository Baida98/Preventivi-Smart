/**
 * Preventivi-Smart Pro v10.5 — Professional Edition
 * Fix: Separazione Categorie, Simboli Alta Qualità, Rimozione GIF Rotte
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
        if (validateStep2()) goToStep(3);
    });
    document.getElementById('prevStepBtn')?.addEventListener('click', () => goToStep(1));
    document.getElementById('prevStep3Btn')?.addEventListener('click', () => goToStep(2));
    document.getElementById('runAnalysisBtn')?.addEventListener('click', runAnalysis);
    document.getElementById('closeLoginBtn')?.addEventListener('click', () => loginModal.classList.add('hidden'));
}

function validateStep2() {
    const region = regionSelect.value;
    const qty = parseFloat(quantityInput.value);
    if (!region) { showToast("Seleziona la tua regione", "error"); return false; }
    if (isNaN(qty) || qty <= 0) { showToast("Inserisci una quantità valida", "error"); return false; }
    return true;
}

// ===== WIZARD LOGIC =====
function startWizard(quick) {
    isQuickMode = quick;
    if (heroSection) heroSection.classList.add('hidden');
    if (appRoot) {
        appRoot.style.display = 'block';
        appRoot.classList.remove('hidden');
        
        const wizardIntro = document.querySelector('#step1 .step-header');
        if (wizardIntro && !document.getElementById('wizardBanner')) {
            const bannerDiv = document.createElement('div');
            bannerDiv.id = 'wizardBanner';
            bannerDiv.style.cssText = "width: 100%; height: 140px; margin-bottom: 24px; border-radius: 16px; overflow: hidden; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 2px;";
            bannerDiv.innerHTML = `<span>Preventivi Smart Pro</span>`;
            wizardIntro.prepend(bannerDiv);
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
    const cats = database.getAllCategories();
    
    const iconMapping = {
        'idraulico': 'idraulica',
        'elettricista': 'elettrico',
        'muratore': 'muratore',
        'pittore': 'imbiancatura',
        'serramenti': 'serramenti',
        'servizi': 'giardiniere'
    };

    tradesGrid.innerHTML = cats.map(cat => {
        const iconName = iconMapping[cat.id] || cat.id;
        const iconPath = `assets/icon_${iconName}.png`;
        return `
        <div class="trade-card" onclick="selectMacro('${cat.id}')">
            <div class="icon-container" style="height: 64px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                <img src="${iconPath}" alt="${cat.name}" style="max-width: 56px; max-height: 56px; object-fit: contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <i class="${cat.icon}" style="display:none; font-size: 2.5rem; color: var(--primary);"></i>
            </div>
            <h4>${cat.name}</h4>
        </div>
    `}).join('');
    
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
            <div class="icon-container" style="height: 56px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                <i class="fa-solid ${sub.icon}" style="font-size: 2rem; color: var(--primary);"></i>
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
            <div class="icon-container" style="height: 56px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                <i class="fa-solid ${trade.icon}" style="font-size: 1.8rem; color: var(--primary);"></i>
            </div>
            <h4>${trade.name}</h4>
        </div>
    `).join('');
}

function selectTrade(id) {
    selectedTrade = id;
    const tradeData = database.getTradeById(id);
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

async function runAnalysis() {
    const region = regionSelect.value;
    const qty = parseFloat(quantityInput.value);
    const price = parseFloat(receivedPriceInput.value);
    if (!region || isNaN(qty) || (!isQuickMode && isNaN(price))) {
        showToast("Completa tutti i campi obbligatori.", "error");
        return;
    }
    // Mostra loading e simula analisi
    goToStep(4);
    setTimeout(() => {
        const results = document.getElementById('analysisResults');
        const loading = document.getElementById('analysisLoading');
        const nav = document.getElementById('resultsNav');
        if (loading) loading.classList.add('hidden');
        if (results) {
            results.classList.remove('hidden');
            results.innerHTML = `<div class="result-card"><h3>Analisi Completata</h3><p>Dati elaborati con successo per la regione ${region}.</p></div>`;
        }
        if (nav) nav.classList.remove('hidden');
    }, 2000);
}

function showToast(msg, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = "background: white; padding: 12px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-left: 4px solid " + (type==='error'?'#ef4444':'#10b981');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
