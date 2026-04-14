/**
 * Chart Renderer per Preventivi-Smart Pro
 * Visualizzazione grafica dei risultati di analisi
 */

export function renderPriceComparisonChart(containerId, analysis) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const ctx = container.querySelector('canvas');
    if (!ctx) {
        container.innerHTML = '<canvas></canvas>';
    }

    const canvas = container.querySelector('canvas');
    const canvasCtx = canvas.getContext('2d');

    // Dati per il grafico
    const min = analysis.marketAnalysis.marketMin;
    const mid = analysis.marketAnalysis.marketMid;
    const max = analysis.marketAnalysis.marketMax;
    const received = analysis.input.receivedPrice;

    const chart = new Chart(canvasCtx, {
        type: 'bar',
        data: {
            labels: ['Prezzo Minimo', 'Prezzo Ricevuto', 'Prezzo Medio', 'Prezzo Massimo'],
            datasets: [{
                label: 'Prezzo (€)',
                data: [min, received, mid, max],
                backgroundColor: [
                    'rgba(5, 150, 105, 0.7)',  // Verde (minimo)
                    received > max ? 'rgba(220, 38, 38, 0.7)' : received < min ? 'rgba(5, 150, 105, 0.7)' : 'rgba(8, 145, 178, 0.7)',  // Rosso/Verde/Ciano
                    'rgba(30, 58, 138, 0.7)',  // Blu (medio)
                    'rgba(212, 175, 55, 0.7)'  // Gold (massimo)
                ],
                borderColor: [
                    'rgb(5, 150, 105)',
                    received > max ? 'rgb(220, 38, 38)' : received < min ? 'rgb(5, 150, 105)' : 'rgb(8, 145, 178)',
                    'rgb(30, 58, 138)',
                    'rgb(212, 175, 55)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    borderColor: 'rgba(212, 175, 55, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 8,
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
                    ticks: {
                        callback: function(value) {
                            return '€' + value.toFixed(0);
                        },
                        font: { size: 12, weight: '600' },
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(71, 85, 107, 0.3)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        font: { size: 12, weight: '600' },
                        color: '#94a3b8'
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });

    return chart;
}

export function renderCongruityGauge(containerId, analysis) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const ctx = container.querySelector('canvas');
    if (!ctx) {
        container.innerHTML = '<canvas></canvas>';
    }

    const canvas = container.querySelector('canvas');
    const canvasCtx = canvas.getContext('2d');

    const diffPercent = analysis.congruityAnalysis.diffPercent;
    const color = diffPercent < -10 ? 'rgb(5, 150, 105)' : diffPercent > 20 ? 'rgb(220, 38, 38)' : 'rgb(8, 145, 178)';

    const chart = new Chart(canvasCtx, {
        type: 'doughnut',
        data: {
            labels: ['Scostamento', 'Resto'],
            datasets: [{
                data: [Math.abs(diffPercent), 100 - Math.abs(diffPercent)],
                backgroundColor: [color, 'rgba(229, 231, 235, 0.5)'],
                borderColor: ['#fff', '#fff'],
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });

    return chart;
}

export function renderMarketTrendChart(containerId, analysis) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const ctx = container.querySelector('canvas');
    if (!ctx) {
        container.innerHTML = '<canvas></canvas>';
    }

    const canvas = container.querySelector('canvas');
    const canvasCtx = canvas.getContext('2d');

    // Simulazione di trend di mercato
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'];
    const basePrice = analysis.marketAnalysis.marketMid;
    const trend = months.map((_, i) => basePrice * (1 + (Math.random() - 0.5) * 0.1));

    const chart = new Chart(canvasCtx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Trend Prezzo di Mercato',
                data: trend,
                borderColor: 'rgb(30, 58, 138)',
                backgroundColor: 'rgba(30, 58, 138, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: 'rgb(212, 175, 55)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12, weight: '600' },
                        color: 'rgba(107, 114, 128, 0.8)',
                        padding: 16
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    borderColor: 'rgba(212, 175, 55, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return '€ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '€' + value.toFixed(0);
                        },
                        font: { size: 12, weight: '600' },
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(71, 85, 107, 0.3)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        font: { size: 12, weight: '600' },
                        color: '#94a3b8'
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });

    return chart;
}

export default {
    renderPriceComparisonChart,
    renderCongruityGauge,
    renderMarketTrendChart
};
