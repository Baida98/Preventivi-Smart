/**
 * Modulo avanzato per visualizzazioni grafiche con Chart.js
 * Breakdown costi, analisi regionale, e comparazioni
 * Stile: Ultra Modern 2026
 */

let quoteChartInstance = null;
let comparisonChartInstance = null;

/**
 * Renderizza il grafico a torta del breakdown manodopera/materiali
 */
export function renderQuoteBreakdownChart(canvasId, quote) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (quoteChartInstance) {
    quoteChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  
  quoteChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Manodopera', 'Materiali'],
      datasets: [{
        data: [
          quote.breakdown.manodopera,
          quote.breakdown.materiali
        ],
        backgroundColor: [
          'rgba(14, 165, 233, 0.85)',
          'rgba(244, 63, 94, 0.85)'
        ],
        borderColor: [
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 1)'
        ],
        borderWidth: 4,
        borderRadius: 12,
        hoverOffset: 15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 12, weight: '800', family: "'Inter', sans-serif" },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            color: '#1e293b'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 12,
          borderRadius: 12,
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return ` €${Math.round(value).toLocaleString()} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}

/**
 * Renderizza un grafico a barre per confronto prezzi
 */
export function renderPriceComparisonChart(canvasId, quote) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (comparisonChartInstance) {
    comparisonChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  
  comparisonChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Minimo', 'Stimato', 'Massimo'],
      datasets: [{
        label: 'Prezzo (€)',
        data: [quote.minPrice, quote.midPrice, quote.maxPrice],
        backgroundColor: [
          'rgba(148, 163, 184, 0.6)',
          'rgba(14, 165, 233, 0.85)',
          'rgba(244, 63, 94, 0.7)'
        ],
        borderColor: [
          'rgba(148, 163, 184, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(244, 63, 94, 1)'
        ],
        borderWidth: 2,
        borderRadius: 12,
        barThickness: 32
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 12,
          borderRadius: 12,
          callbacks: {
            label: function(context) {
              return ` €${Math.round(context.parsed.x).toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.03)', drawBorder: false },
          ticks: {
            color: '#94a3b8',
            font: { size: 10, weight: '600' },
            callback: function(value) { return '€' + value.toLocaleString(); }
          }
        },
        y: {
          grid: { display: false, drawBorder: false },
          ticks: { color: '#1e293b', font: { size: 11, weight: '800' } }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      }
    }
  });
}

export function cleanupCharts() {
  if (quoteChartInstance) {
    quoteChartInstance.destroy();
    quoteChartInstance = null;
  }
  if (comparisonChartInstance) {
    comparisonChartInstance.destroy();
    comparisonChartInstance = null;
  }
}

/**
 * Funzione principale per renderizzare tutti i grafici avanzati
 */
export function renderAdvancedCharts(data) {
  // Breakdown Chart
  renderQuoteBreakdownChart('breakdownChart', data);
  
  // Comparison Chart (adattamento dati)
  const comparisonData = {
    minPrice: data.marketData.min,
    midPrice: data.marketData.mid,
    maxPrice: data.marketData.max
  };
  renderPriceComparisonChart('benchmarkChart', comparisonData);
}
