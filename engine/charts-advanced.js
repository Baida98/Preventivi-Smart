/**
 * Modulo avanzato per visualizzazioni grafiche con Chart.js
 * Breakdown costi, analisi regionale, e comparazioni
 */

let quoteChartInstance = null;
let regionalChartInstance = null;

/**
 * Renderizza il grafico a torta del breakdown manodopera/materiali
 */
export function renderQuoteBreakdownChart(canvasId, quote) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Destroy previous chart
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
          'rgba(0, 114, 255, 0.85)',
          'rgba(255, 0, 128, 0.85)'
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
            font: { size: 14, weight: 'bold', family: "'Segoe UI', sans-serif" },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            color: '#111827'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 12,
          borderRadius: 8,
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `€ ${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Renderizza un grafico a barre per confronto prezzi
 */
export function renderPriceComparisonChart(canvasId, quote) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Minimo', 'Stimato', 'Massimo'],
      datasets: [{
        label: 'Prezzo (€)',
        data: [quote.minPrice, quote.midPrice, quote.maxPrice],
        backgroundColor: [
          'rgba(148, 163, 184, 0.6)',
          'rgba(0, 114, 255, 0.85)',
          'rgba(255, 0, 128, 0.7)'
        ],
        borderColor: [
          'rgba(148, 163, 184, 1)',
          'rgba(0, 114, 255, 1)',
          'rgba(255, 0, 128, 1)'
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
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 12,
          borderRadius: 8,
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          callbacks: {
            label: function(context) {
              return `€ ${context.parsed.x.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.03)',
            drawBorder: false
          },
          ticks: {
            color: '#94a3b8',
            font: { size: 10, weight: '600' },
            callback: function(value) {
              return '€' + value.toLocaleString();
            }
          }
        },
        y: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#1e293b',
            font: { size: 11, weight: '800' }
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      }
    }
  });
}

/**
 * Renderizza un grafico che mostra l'impatto dei coefficienti
 */
export function renderCoefficientImpactChart(canvasId, quote) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const basePrice = quote.basePrice * quote.quantity;
  const afterRegional = basePrice * quote.regionalCoeff;
  const afterQuality = afterRegional * quote.qualityCoeff;
  const finalPrice = afterQuality * quote.answerMultiplier;

  const ctx = canvas.getContext('2d');
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [
        'Prezzo Base',
        'Coeff. Regionale',
        'Qualità Materiali',
        'Specifiche Lavoro',
        'Prezzo Finale'
      ],
      datasets: [{
        label: 'Evoluzione Prezzo (€)',
        data: [basePrice, afterRegional, afterQuality, finalPrice, finalPrice],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { size: 12, weight: 'bold' },
            color: '#111827',
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 12,
          borderRadius: 8,
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          callbacks: {
            label: function(context) {
              return '€ ' + context.parsed.y.toFixed(2);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(229, 231, 235, 0.5)',
            drawBorder: false
          },
          ticks: {
            color: '#6B7280',
            font: { size: 11 },
            callback: function(value) {
              return '€ ' + value.toFixed(0);
            }
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#111827',
            font: { size: 11 }
          }
        }
      }
    }
  });
}

/**
 * Renderizza un grafico a radar per comparazione regioni
 */
export function renderRegionalComparisonChart(canvasId, regionalCoefficients) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const regions = Object.keys(regionalCoefficients).slice(0, 10); // Top 10
  const coeffs = regions.map(r => regionalCoefficients[r]);

  const ctx = canvas.getContext('2d');
  
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: regions,
      datasets: [{
        label: 'Coefficiente Regionale',
        data: coeffs,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { size: 12, weight: 'bold' },
            color: '#111827'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 12,
          borderRadius: 8,
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          callbacks: {
            label: function(context) {
              return context.parsed.r.toFixed(2) + 'x';
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 1.3,
          ticks: {
            color: '#6B7280',
            font: { size: 10 },
            callback: function(value) {
              return value.toFixed(2) + 'x';
            }
          },
          grid: {
            color: 'rgba(229, 231, 235, 0.5)'
          },
          pointLabels: {
            color: '#111827',
            font: { size: 11, weight: 'bold' }
          }
        }
      }
    }
  });
}

/**
 * Renderizza un grafico a torta per distribuzione costi per mestiere
 */
export function renderTradeDistributionChart(canvasId, trades) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = trades.map(t => t.name);
  const colors = trades.map(t => t.color);
  const data = trades.map(t => t.basePrice);

  const ctx = canvas.getContext('2d');
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: '#FFFFFF',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: { size: 11, weight: 'bold' },
            color: '#111827',
            padding: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 12,
          borderRadius: 8,
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          callbacks: {
            label: function(context) {
              return '€ ' + context.parsed.toFixed(2);
            }
          }
        }
      }
    }
  });
}

/**
 * Crea un summary card con statistiche
 */
export function createSummaryCard(data) {
  const card = document.createElement('div');
  card.className = 'summary-card';
  card.innerHTML = `
    <div class="summary-item">
      <span class="summary-label">Prezzo Medio</span>
      <span class="summary-value">€ ${data.average.toFixed(2)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Risparmio Potenziale</span>
      <span class="summary-value">€ ${data.savings.toFixed(2)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Margine di Variabilità</span>
      <span class="summary-value">${data.variance.toFixed(1)}%</span>
    </div>
  `;
  return card;
}

/**
 * Pulisce i grafici
 */
export function cleanupCharts() {
  if (quoteChartInstance) {
    quoteChartInstance.destroy();
    quoteChartInstance = null;
  }
  if (regionalChartInstance) {
    regionalChartInstance.destroy();
    regionalChartInstance = null;
  }
}
