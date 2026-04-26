/**
 * Chart Renderer per Preventivi-Smart Pro
 * Visualizzazione grafica dei risultati di analisi
 */

/**
 * Renderizza il grafico di confronto prezzi
 * @param {string} containerId - ID del contenitore DOM
 * @param {Object} analysis - Oggetto analisi dal motore
 */
export function renderPriceComparisonChart(containerId, analysis) {
    // STEP 2: VALIDAZIONE DATI
    if (!analysis || !analysis.marketAnalysis) {
        console.error('[ChartRenderer] Dati analisi mancanti');
        return;
    }

    const { marketMin, marketMid, marketMax } = analysis.marketAnalysis;
    const userPrice = analysis.input ? analysis.input.receivedPrice : 0;

    // Se mancano i valori fondamentali, NON renderizzare
    if (marketMin === undefined || marketMid === undefined || marketMax === undefined) {
        console.error('[ChartRenderer] Dati di mercato incompleti (min/mid/max)', { marketMin, marketMid, marketMax });
        return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`[ChartRenderer] Container #${containerId} non trovato`);
        return;
    }

    // STEP 3: UI RULE - Assicura visibilità (rimuove classi hidden o stili statici limitanti)
    container.classList.remove('hidden');
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';

    let canvas = container.querySelector('canvas');
    if (!canvas) {
        container.innerHTML = '<canvas style="width:100%; height:100%;"></canvas>';
        canvas = container.querySelector('canvas');
    }

    // Distruggi il grafico esistente se presente
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const canvasCtx = canvas.getContext('2d');

    // Configurazione dati e colori
    const isQuickMode = !userPrice || userPrice <= 0;
    const labels = isQuickMode 
        ? ['Mercato Min', 'Mercato Medio', 'Mercato Max'] 
        : ['Mercato Min', 'Mercato Medio', 'Mercato Max', 'TUO PREZZO'];
    
    const dataValues = isQuickMode
        ? [marketMin, marketMid, marketMax]
        : [marketMin, marketMid, marketMax, userPrice];

    // Colore dinamico per il prezzo utente
    let userColor = 'rgba(99, 102, 241, 0.85)';
    let userBorder = 'rgb(99, 102, 241)';

    if (!isQuickMode) {
        if (userPrice > marketMax) {
            userColor = 'rgba(239, 68, 68, 0.85)'; // Rosso
            userBorder = 'rgb(239, 68, 68)';
        } else if (userPrice < marketMin) {
            userColor = 'rgba(34, 197, 94, 0.85)'; // Verde
            userBorder = 'rgb(34, 197, 94)';
        } else {
            userColor = 'rgba(245, 158, 11, 0.85)'; // Arancione (equo)
            userBorder = 'rgb(245, 158, 11)';
        }
    }

    const bgColors = isQuickMode
        ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']
        : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)', userColor];

    const borderColors = isQuickMode
        ? ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.3)']
        : ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.3)', userBorder];

    const chart = new Chart(canvasCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Prezzo (€)',
                data: dataValues,
                backgroundColor: bgColors,
                borderColor: borderColors,
                borderWidth: isQuickMode ? [1, 2, 1] : [1, 2, 1, 3],
                borderRadius: 8,
                hoverBackgroundColor: bgColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
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
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });

    return chart;
}

/**
 * Altri renderer (mantenuti per compatibilità se usati altrove)
 */
export function renderCongruityGauge(containerId, analysis) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const canvas = container.querySelector('canvas') || (container.innerHTML = '<canvas></canvas>', container.querySelector('canvas'));
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    const diffPercent = analysis.congruityAnalysis.diffPercent;
    const color = diffPercent < -10 ? 'rgb(34, 197, 94)' : diffPercent > 20 ? 'rgb(239, 68, 68)' : 'rgb(99, 102, 241)';

    return new Chart(canvas.getContext('2d'), {
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
            plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
    });
}

export function renderMarketTrendChart(containerId, analysis) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const canvas = container.querySelector('canvas') || (container.innerHTML = '<canvas></canvas>', container.querySelector('canvas'));
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    const basePrice = analysis.marketAnalysis.marketMid;
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'];
    const trend = months.map((_, i) => basePrice * (1 + (Math.random() - 0.5) * 0.1));

    return new Chart(canvas.getContext('2d'), {
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
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
            }
        }
    });
}

export default {
    renderPriceComparisonChart,
    renderCongruityGauge,
    renderMarketTrendChart
};
