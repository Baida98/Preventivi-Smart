/**
 * Chart Renderer per Preventivi-Smart Pro
 * Visualizzazione grafica dei risultati di analisi
 */

export function renderPriceComparisonChart(containerId, analysis) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let canvas = container.querySelector('canvas');
    if (!canvas) {
        container.innerHTML = '<canvas></canvas>';
        canvas = container.querySelector('canvas');
    }

    // Distruggi il grafico esistente se presente
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const canvasCtx = canvas.getContext('2d');

    // Dati per il grafico
    const min = analysis.marketAnalysis.marketMin;
    const mid = analysis.marketAnalysis.marketMid;
    const max = analysis.marketAnalysis.marketMax;
    const received = analysis.input.receivedPrice || 0;

    // Colore dinamico per il prezzo ricevuto
    let receivedColor = 'rgba(99, 102, 241, 0.8)'; // Indigo di default
    let receivedBorder = 'rgb(99, 102, 241)';

    if (received > 0) {
        if (received > max) {
            receivedColor = 'rgba(239, 68, 68, 0.8)'; // Rosso
            receivedBorder = 'rgb(239, 68, 68)';
        } else if (received < min) {
            receivedColor = 'rgba(34, 197, 94, 0.8)'; // Verde
            receivedBorder = 'rgb(34, 197, 94)';
        } else {
            receivedColor = 'rgba(245, 158, 11, 0.8)'; // Arancione (equo)
            receivedBorder = 'rgb(245, 158, 11)';
        }
    }

    const chart = new Chart(canvasCtx, {
        type: 'bar',
        data: {
            labels: ['Mercato Min', 'MERCATO MEDIO', 'Mercato Max', 'TUO PREZZO'],
            datasets: [{
                label: 'Prezzo (€)',
                data: [min, mid, max, received],
                backgroundColor: [
                    'rgba(255, 255, 255, 0.1)',  // Min
                    'rgba(255, 255, 255, 0.2)',  // Mid
                    'rgba(255, 255, 255, 0.1)',  // Max
                    receivedColor                 // Ricevuto (Evidenziato)
                ],
                borderColor: [
                    'rgba(255, 255, 255, 0.3)',
                    'rgba(255, 255, 255, 0.5)',
                    'rgba(255, 255, 255, 0.3)',
                    receivedBorder
                ],
                borderWidth: [1, 2, 1, 3],
                borderRadius: 8,
                hoverBackgroundColor: [
                    'rgba(255, 255, 255, 0.2)',
                    'rgba(255, 255, 255, 0.3)',
                    'rgba(255, 255, 255, 0.2)',
                    receivedColor
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold', family: 'Inter' },
                    bodyFont: { size: 13, family: 'Inter' },
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return ' € ' + context.parsed.y.toLocaleString('it-IT', { minimumFractionDigits: 2 });
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '€' + value.toLocaleString('it-IT');
                        },
                        font: { size: 11, weight: '500' },
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        font: { 
                            size: function(context) {
                                return context.tick.label === 'TUO PREZZO' ? 12 : 10;
                            }, 
                            weight: function(context) {
                                return context.tick.label === 'TUO PREZZO' ? '800' : '500';
                            }
                        },
                        color: function(context) {
                            return context.tick.label === 'TUO PREZZO' ? '#fff' : '#64748b';
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });

    return chart;
}

export function renderCongruityGauge(containerId, analysis) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let canvas = container.querySelector('canvas');
    if (!canvas) {
        container.innerHTML = '<canvas></canvas>';
        canvas = container.querySelector('canvas');
    }

    // Distruggi il grafico esistente se presente
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const canvasCtx = canvas.getContext('2d');

    const diffPercent = analysis.congruityAnalysis.diffPercent;
    const color = diffPercent < -10 ? 'rgb(34, 197, 94)' : diffPercent > 20 ? 'rgb(239, 68, 68)' : 'rgb(99, 102, 241)';

    const chart = new Chart(canvasCtx, {
        type: 'doughnut',
        data: {
            labels: ['Scostamento', 'Resto'],
            datasets: [{
                data: [Math.abs(diffPercent), Math.max(0, 100 - Math.abs(diffPercent))],
                backgroundColor: [color, 'rgba(255, 255, 255, 0.05)'],
                borderColor: ['transparent', 'transparent'],
                borderWidth: 0,
                circumference: 180,
                rotation: 270,
                cutout: '80%'
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

    let canvas = container.querySelector('canvas');
    if (!canvas) {
        container.innerHTML = '<canvas></canvas>';
        canvas = container.querySelector('canvas');
    }

    // Distruggi il grafico esistente se presente
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

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
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: 'rgb(99, 102, 241)',
                pointBorderWidth: 2
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
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    padding: 12,
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
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
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
