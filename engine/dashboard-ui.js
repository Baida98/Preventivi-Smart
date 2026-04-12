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
  document.getElementById("statTotal").textContent = stats.total;
  document.getElementById("statSavings").textContent = `€${stats.savings.toLocaleString("it-IT")}`;
  document.getElementById("statScore").textContent = `${stats.avgScore}%`;

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

  window.trendChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: trend.map(t => new Date(t.date).toLocaleDateString("it-IT", { day: '2-digit', month: 'short' })),
      datasets: [
        {
          label: "Il Tuo Preventivo",
          data: trend.map(t => t.price),
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14, 165, 233, 0.1)",
          fill: true,
          tension: 0.4
        },
        {
          label: "Media Mercato",
          data: trend.map(t => t.market),
          borderColor: "#94a3b8",
          borderDash: [5, 5],
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      },
      scales: {
        y: { beginAtZero: false }
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
    <div class="history-table-header">
      <span>Data</span>
      <span>Lavoro</span>
      <span>Prezzo</span>
      <span>Verdetto</span>
    </div>
    ${history.map(item => `
      <div class="history-item" onclick="openAnalysisDetail('${item.id}')">
        <span class="history-date">${new Date(item.createdAt).toLocaleDateString()}</span>
        <span class="history-trade">${item.tradeName}</span>
        <span class="history-price">€${item.receivedPrice.toLocaleString()}</span>
        <span class="history-verdict" style="color: ${item.analysis?.verdict?.color || '#000'}">
          ${item.analysis?.verdict?.label || 'Analizzato'}
        </span>
      </div>
    `).join("")}
  `;
}

export default {
  renderDashboard
};
