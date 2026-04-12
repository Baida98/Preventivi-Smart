/**
 * Preventivi-Smart Pro v12.0 — Dashboard UI (Trust & Stats)
 * Gestione della visualizzazione dello storico e del sistema di fiducia (Leva 3).
 */

import { computeStats, analyzeTrend } from "./ai-analyzer.js";

// ===== RENDER DASHBOARD =====
export function renderDashboard(history) {
  const container = document.getElementById("dashboard");
  if (!container) return;

  const stats = computeStats(history);
  const trend = analyzeTrend(history);

  // 1. Update Stats Cards (Leva 5: Feedback immediato)
  const statsContainer = document.getElementById("dashStats");
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat-card" style="background: var(--white); border: 1px solid var(--gray-100); border-radius: 20px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); text-align: center;">
        <div style="width: 44px; height: 44px; background: var(--sapphire-light); color: var(--sapphire); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 1.2rem;">
            <i class="fa-solid fa-clipboard-check"></i>
        </div>
        <span style="display: block; font-size: 0.8rem; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Totale Analisi</span>
        <span id="statTotal" style="font-size: 1.8rem; font-weight: 800; color: var(--gray-800);">${stats.total}</span>
      </div>
      <div class="stat-card" style="background: var(--white); border: 1px solid var(--gray-100); border-radius: 20px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); text-align: center;">
        <div style="width: 44px; height: 44px; background: var(--emerald-light); color: var(--emerald); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 1.2rem;">
            <i class="fa-solid fa-piggy-bank"></i>
        </div>
        <span style="display: block; font-size: 0.8rem; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Risparmio Potenziale</span>
        <span id="statSavings" style="font-size: 1.8rem; font-weight: 800; color: var(--emerald); font-variant-numeric: tabular-nums;">€${stats.savings.toLocaleString("it-IT")}</span>
      </div>
      <div class="stat-card" style="background: var(--white); border: 1px solid var(--gray-100); border-radius: 20px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); text-align: center;">
        <div style="width: 44px; height: 44px; background: var(--amber-light); color: var(--amber); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 1.2rem;">
            <i class="fa-solid fa-star"></i>
        </div>
        <span style="display: block; font-size: 0.8rem; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Score Medio</span>
        <span id="statScore" style="font-size: 1.8rem; font-weight: 800; color: var(--gray-800);">${stats.avgScore}%</span>
      </div>
    `;
  }

  // 2. Render Trend Chart (Leva 3: Apprendimento percepibile)
  renderTrendChart(trend);

  // 3. Render History List (Leva 1: Sicurezza)
  renderHistoryList(history);
}

// ===== RENDER TREND CHART =====
function renderTrendChart(trend) {
  const ctx = document.getElementById("trendChart");
  if (!ctx) return;

  // Distruggi istanza precedente se esiste
  if (window.trendChartInstance) {
    window.trendChartInstance.destroy();
  }

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(14, 165, 233, 0.2)');
  gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

  window.trendChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: trend.map(t => new Date(t.date).toLocaleDateString("it-IT", { day: '2-digit', month: 'short' })),
      datasets: [
        {
          label: "Il Tuo Preventivo",
          data: trend.map(t => t.price),
          borderColor: "#0ea5e9",
          borderWidth: 3,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#0ea5e9",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4
        },
        {
          label: "Media Mercato",
          data: trend.map(t => t.market),
          borderColor: "#94a3b8",
          borderWidth: 2,
          borderDash: [6, 6],
          pointRadius: 0,
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
            position: "top",
            align: "end",
            labels: {
                usePointStyle: true,
                boxWidth: 8,
                font: { family: "'Inter', sans-serif", size: 12, weight: '500' }
            }
        },
        tooltip: {
            backgroundColor: '#1e293b',
            padding: 12,
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            cornerRadius: 8,
            displayColors: false
        }
      },
      scales: {
        y: { 
            beginAtZero: false,
            grid: { color: 'rgba(0,0,0,0.03)' },
            ticks: { font: { size: 11 } }
        },
        x: { 
            grid: { display: false },
            ticks: { font: { size: 11 } }
        }
      }
    }
  });
}

// ===== RENDER HISTORY LIST =====
function renderHistoryList(history) {
  const container = document.getElementById("historyList");
  if (!container) return;

  if (history.length === 0) {
    container.innerHTML = `
      <div class="empty-history">
        <i class="fas fa-folder-open"></i>
        <p>Nessun preventivo analizzato. Inizia ora per proteggere i tuoi risparmi.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="history-list-wrapper" style="display: flex; flex-direction: column; gap: 12px;">
    ${history.map(item => `
      <div class="history-item-card" onclick="openAnalysisDetail('${item.id}')" style="background: var(--white); border: 1px solid var(--gray-100); border-radius: 16px; padding: 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
        <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; background: var(--gray-50); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--sapphire); font-size: 1.2rem;">
                <i class="fa-solid fa-file-invoice"></i>
            </div>
            <div>
                <h4 style="font-weight: 700; color: var(--gray-800); margin-bottom: 4px;">${item.tradeName}</h4>
                <span style="font-size: 0.8rem; color: var(--gray-400);"><i class="fa-solid fa-calendar-day"></i> ${new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        <div style="text-align: right;">
            <div style="font-weight: 800; color: var(--gray-800); font-size: 1.1rem;">€${item.receivedPrice.toLocaleString()}</div>
            <div class="verdict-tag" style="font-size: 0.75rem; font-weight: 700; color: ${item.analysis?.verdict?.color || '#0ea5e9'}; background: ${item.analysis?.verdict?.color || '#0ea5e9'}15; padding: 4px 10px; border-radius: 20px; margin-top: 4px; display: inline-block;">
                ${item.analysis?.verdict?.label || 'Analizzato'}
            </div>
        </div>
      </div>
    `).join("")}
    </div>
  `;
}

export default {
  renderDashboard
};
