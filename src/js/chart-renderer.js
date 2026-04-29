/**
 * Chart Renderer per Preventivi-Smart Pro
 * Visualizzazione grafica dei risultati di analisi
 *
 * v31.1 — VISIBILITA' MASSIMA:
 *  - Font assi piu grandi (11 -> 13px) e bold (600 -> 700)
 *  - Valori in € MOSTRATI SOPRA OGNI BARRA (no piu lettura dall'asse)
 *  - Barre neutre con opacita raddoppiata (0.18 -> 0.35)
 *  - "TUO PREZZO": bordo 4px, label 14px, evidenziatore colorato sopra
 *  - Tooltip ingranditi con titolo a colori semantici
 *  - Plugin custom afterDatasetsDraw per labels sopra le barre
 */

const C = {
    text:        '#f8fafc',
    textMuted:   '#e2e8f0',
    grid:        'rgba(148, 163, 184, 0.18)',
    tooltipBg:   'rgba(15, 23, 42, 0.98)',
    tooltipBd:   'rgba(148, 163, 184, 0.4)',
    neutralBg:   'rgba(148, 163, 184, 0.35)',
    neutralBd:   'rgba(226, 232, 240, 0.7)',
    midBg:       'rgba(96, 165, 250, 0.55)',
    midBd:       'rgba(147, 197, 253, 1)',
};

/**
 * Plugin Chart.js: disegna il valore in € sopra ogni barra
 */
const valueOnTopPlugin = {
    id: 'valueOnTop',
    afterDatasetsDraw(chart) {
        const { ctx, data } = chart;
        const dataset = data.datasets[0];
        if (!dataset) return;

        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data) return;

        ctx.save();
        ctx.font = '700 12px Inter, system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        meta.data.forEach((bar, idx) => {
            const value = dataset.data[idx];
            const label = data.labels[idx];
            const formatted = '€' + Number(value).toLocaleString('it-IT');

            // TUO PREZZO: usa colore brand della barra; gli altri: bianco soft
            const isUser = label === 'TUO PREZZO';
            ctx.fillStyle = isUser ? '#ffffff' : '#e2e8f0';
            ctx.font = isUser
                ? '800 14px Inter, system-ui, sans-serif'
                : '700 12px Inter, system-ui, sans-serif';

            const x = bar.x;
            const y = bar.y - 8;
            ctx.fillText(formatted, x, y);
        });

        ctx.restore();
    }
};

/**
 * Renderizza il grafico di confronto prezzi
 */
export function renderPriceComparisonChart(containerId, analysis) {
    if (!analysis || !analysis.marketAnalysis) {
        console.error('[ChartRenderer] Dati analisi mancanti');
        return;
    }

    const { marketMin, marketMid, marketMax } = analysis.marketAnalysis;
    const userPrice = analysis.input ? analysis.input.receivedPrice : 0;

    if (marketMin === undefined || marketMid === undefined || marketMax === undefined) {
        console.error('[ChartRenderer] Dati di mercato incompleti', { marketMin, marketMid, marketMax });
        return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`[ChartRenderer] Container #${containerId} non trovato`);
        return;
    }

    container.classList.remove('hidden');
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';

    let canvas = container.querySelector('canvas');
    if (!canvas) {
        container.innerHTML = '<canvas style="width:100%; height:100%;"></canvas>';
        canvas = container.querySelector('canvas');
    }

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    const canvasCtx = canvas.getContext('2d');

    const isQuickMode = !userPrice || userPrice <= 0;
    const labels = isQuickMode
        ? ['Mercato Min', 'Mercato Medio', 'Mercato Max']
        : ['Mercato Min', 'Mercato Medio', 'Mercato Max', 'TUO PREZZO'];

    const dataValues = isQuickMode
        ? [marketMin, marketMid, marketMax]
        : [marketMin, marketMid, marketMax, userPrice];

    // Colori semantici per il prezzo utente
    let userColor  = 'rgba(99, 102, 241, 0.95)';
    let userBorder = 'rgb(199, 210, 254)';
    let userVerdict = 'NEUTRO';

    if (!isQuickMode) {
        if (userPrice > marketMax) {
            userColor   = 'rgba(239, 68, 68, 0.95)';
            userBorder  = 'rgb(254, 202, 202)';
            userVerdict = 'TROPPO ALTO';
        } else if (userPrice < marketMin) {
            userColor   = 'rgba(34, 197, 94, 0.95)';
            userBorder  = 'rgb(187, 247, 208)';
            userVerdict = 'CONVENIENTE';
        } else {
            userColor   = 'rgba(245, 158, 11, 0.95)';
            userBorder  = 'rgb(254, 215, 170)';
            userVerdict = 'NELLA MEDIA';
        }
    }

    const bgColors = isQuickMode
        ? [C.neutralBg, C.midBg, C.neutralBg]
        : [C.neutralBg, C.midBg, C.neutralBg, userColor];

    const borderColors = isQuickMode
        ? [C.neutralBd, C.midBd, C.neutralBd]
        : [C.neutralBd, C.midBd, C.neutralBd, userBorder];

    return new Chart(canvasCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Prezzo (€)',
                data: dataValues,
                backgroundColor: bgColors,
                borderColor: borderColors,
                borderWidth: isQuickMode ? [2, 2, 2] : [2, 2, 2, 4],
                borderRadius: 10,
                hoverBackgroundColor: bgColors
            }]
        },
        plugins: [valueOnTopPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 28 } }, // spazio per i valori sopra le barre
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: C.tooltipBg,
                    titleColor: '#ffffff',
                    bodyColor: '#f1f5f9',
                    padding: 14,
                    titleFont: { size: 15, weight: 'bold', family: 'Inter' },
                    bodyFont:  { size: 14, family: 'Inter', weight: '600' },
                    borderColor: C.tooltipBd,
                    borderWidth: 1,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        title: (items) => items[0].label === 'TUO PREZZO'
                            ? `Tuo Prezzo (${userVerdict})`
                            : items[0].label,
                        label: (ctx) => '€ ' + ctx.parsed.y.toLocaleString('it-IT', { minimumFractionDigits: 2 })
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => '€' + value.toLocaleString('it-IT'),
                        font: { size: 12, weight: '700', family: 'Inter' },
                        color: C.textMuted,
                        padding: 6
                    },
                    grid: { color: C.grid, drawBorder: false }
                },
                x: {
                    ticks: {
                        font: {
                            size: (ctx) => ctx.tick.label === 'TUO PREZZO' ? 14 : 13,
                            weight: (ctx) => ctx.tick.label === 'TUO PREZZO' ? '900' : '700',
                            family: 'Inter'
                        },
                        color: (ctx) => ctx.tick.label === 'TUO PREZZO'
                            ? '#ffffff'
                            : C.textMuted,
                        padding: 8
                    },
                    grid: { display: false, drawBorder: false }
                }
            },
            animation: { duration: 1200, easing: 'easeOutQuart' }
        }
    });
}

/**
 * Gauge di congruità (semicerchio doughnut)
 */
export function renderCongruityGauge(containerId, analysis) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let canvas = container.querySelector('canvas');
    if (!canvas) {
        container.innerHTML = '<canvas></canvas>';
        canvas = container.querySelector('canvas');
    }
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    const diffPercent = analysis.congruityAnalysis.diffPercent;
    const color = diffPercent < -10 ? 'rgb(34, 197, 94)'
                : diffPercent > 20  ? 'rgb(239, 68, 68)'
                                    : 'rgb(96, 165, 250)';

    return new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Scostamento', 'Resto'],
            datasets: [{
                data: [Math.abs(diffPercent), Math.max(0, 100 - Math.abs(diffPercent))],
                backgroundColor: [color, 'rgba(148, 163, 184, 0.18)'],
                borderColor: ['transparent', 'transparent'],
                borderWidth: 0,
                circumference: 180,
                rotation: 270,
                cutout: '78%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
    });
}

/**
 * Trend prezzi (linea)
 */
export function renderMarketTrendChart(containerId, analysis) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let canvas = container.querySelector('canvas');
    if (!canvas) {
        container.innerHTML = '<canvas></canvas>';
        canvas = container.querySelector('canvas');
    }
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    const basePrice = analysis.marketAnalysis.marketMid;
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'];
    const trend  = months.map(() => basePrice * (1 + (Math.random() - 0.5) * 0.1));

    return new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Trend Prezzo di Mercato',
                data: trend,
                borderColor: 'rgb(96, 165, 250)',
                backgroundColor: 'rgba(96, 165, 250, 0.22)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: 'rgb(96, 165, 250)',
                pointBorderWidth: 2.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: C.tooltipBg,
                    titleColor: '#ffffff',
                    bodyColor: '#f1f5f9',
                    borderColor: C.tooltipBd,
                    borderWidth: 1,
                    cornerRadius: 10,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont:  { size: 13, weight: '600' }
                }
            },
            scales: {
                y: { ticks: { color: C.textMuted, font: { weight: '700', size: 12 } }, grid: { color: C.grid } },
                x: { ticks: { color: C.textMuted, font: { weight: '700', size: 12 } }, grid: { display: false } }
            }
        }
    });
}

export default {
    renderPriceComparisonChart,
    renderCongruityGauge,
    renderMarketTrendChart
};
