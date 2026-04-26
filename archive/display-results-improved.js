// Funzione displayResults migliorata per app-v3.js

function displayResults(analysis) {
    const results = getEl('analysisResults');
    const loading = getEl('analysisLoading');
    const nav = getEl('resultsNav');
    
    if (loading) loading.classList.add('hidden');
    if (results) {
        results.classList.remove('hidden');
        let verdict = '';
        let verdictClass = '';
        
        const diff = analysis.congruityAnalysis.diffPercent;
        if (state.isQuickMode) {
            verdict = `📊 Stima di Mercato`;
            verdictClass = 'info';
        } else {
            if (diff < -10) { 
                verdict = `✅ Prezzo Conveniente (${diff}%)`; 
                verdictClass = 'success'; 
            }
            else if (diff < 10) { 
                verdict = `ℹ️ Prezzo Equo (${diff}%)`; 
                verdictClass = 'info'; 
            }
            else { 
                verdict = `⚠️ Prezzo Alto (${diff}%)`; 
                verdictClass = 'warning'; 
            }
        }
        
        // Calcola risparmio/sovrapprezzo
        const receivedPrice = analysis.input.receivedPrice || 0;
        const marketMid = analysis.marketAnalysis.marketMid;
        const savings = marketMid - receivedPrice;
        const savingsPercent = marketMid > 0 ? ((savings / marketMid) * 100).toFixed(1) : 0;
        
        let savingsText = '';
        if (!state.isQuickMode && receivedPrice > 0) {
            savingsText = savings > 0 ? 
                `💰 <strong>Risparmi:</strong> €${Math.abs(savings).toFixed(2)} (${savingsPercent}%)` :
                `⚠️ <strong>Sovrapprezzo:</strong> €${Math.abs(savings).toFixed(2)} (${Math.abs(savingsPercent)}%)`;
        }
        
        // Costruisci il contenuto dei risultati
        results.innerHTML = `
            <div class="result-card ${verdictClass}">
                <div class="result-card-header">
                    <div class="result-card-icon">
                        ${verdictClass === 'success' ? '<i class="fa-solid fa-check"></i>' : verdictClass === 'warning' ? '<i class="fa-solid fa-exclamation"></i>' : '<i class="fa-solid fa-info"></i>'}
                    </div>
                    <div>
                        <div class="result-card-label">Verdetto Analisi</div>
                        <div class="result-card-title">${verdict}</div>
                    </div>
                </div>
                <div class="result-card-description">
                    <p><strong>Mestiere:</strong> ${analysis.trade.name}</p>
                    <p><strong>Quantità:</strong> ${analysis.input.quantity} ${analysis.trade.category || 'unità'}</p>
                    <p><strong>Regione:</strong> ${analysis.input.region}</p>
                    ${!state.isQuickMode ? `<p><strong>Prezzo Ricevuto:</strong> €${receivedPrice.toFixed(2)}</p>` : ''}
                    <p style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
                        <strong>Range Mercato:</strong> €${analysis.marketAnalysis.marketMin.toFixed(2)} - €${analysis.marketAnalysis.marketMax.toFixed(2)}
                    </p>
                    <p><strong>Prezzo Medio Mercato:</strong> €${marketMid.toFixed(2)}</p>
                    ${savingsText ? `<p style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">${savingsText}</p>` : ''}
                </div>
            </div>
        `;
        
        if (nav) nav.classList.remove('hidden');
        
        // Render chart
        setTimeout(() => {
            const chartsDiv = getEl('analysisCharts');
            if (chartsDiv) {
                chartsDiv.classList.remove('hidden');
                chartRenderer.renderPriceChart(analysis);
            }
        }, 100);
    }
}
