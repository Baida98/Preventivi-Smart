/**
 * Professional PDF Generator v2.0 — Preventivi-Smart Pro
 * Output Editoriale di Qualità Enterprise
 */

import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';

export function generateProfessionalPDF(analysis, userInfo = {}) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // ===== HEADER PROFESSIONALE =====
    drawHeader(doc, pageWidth, margin, yPos);
    yPos += 45;

    // ===== SEZIONE TITOLO E DATA =====
    drawTitleSection(doc, analysis, margin, yPos, contentWidth);
    yPos += 35;

    // ===== SEZIONE RIEPILOGO INTERVENTO =====
    yPos = drawSummarySection(doc, analysis, margin, yPos, contentWidth, pageHeight);

    // ===== SEZIONE ANALISI PREZZI =====
    yPos = drawPriceAnalysisSection(doc, analysis, margin, yPos, contentWidth, pageHeight);

    // ===== SEZIONE CONGRUITÀ =====
    yPos = drawCongruitySection(doc, analysis, margin, yPos, contentWidth, pageHeight);

    // ===== SEZIONE RACCOMANDAZIONI =====
    yPos = drawRecommendationsSection(doc, analysis, margin, yPos, contentWidth, pageHeight);

    // ===== FOOTER =====
    drawFooter(doc, pageHeight, margin);

    // Salva il PDF
    doc.save(`Preventivo_${analysis.trade.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

function drawHeader(doc, pageWidth, margin, yPos) {
    // Background header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Logo e titolo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Preventivi-Smart Pro', margin, yPos + 15);

    // Tagline
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(212, 175, 55);
    doc.text('Protezione Economica Professionale', margin, yPos + 25);

    // Linea decorativa
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1.5);
    doc.line(margin, yPos + 32, pageWidth - margin, yPos + 32);
}

function drawTitleSection(doc, analysis, margin, yPos, contentWidth) {
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Analisi Preventivo', margin, yPos);

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, margin, yPos + 10);

    // Numero di riferimento
    const refNumber = `PS-${Date.now().toString().slice(-8)}`;
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(`Rif: ${refNumber}`, contentWidth - 40, yPos + 10);
}

function drawSummarySection(doc, analysis, margin, yPos, contentWidth, pageHeight) {
    // Titolo sezione
    drawSectionTitle(doc, 'Riepilogo Intervento', margin, yPos);
    yPos += 10;

    // Box riepilogo
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, yPos, contentWidth, 50, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, contentWidth, 50);

    // Contenuto box
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Tipo di Intervento: ${analysis.trade.name}`, margin + 5, yPos + 8);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Regione: ${analysis.input.region}`, margin + 5, yPos + 16);
    doc.text(`Quantità: ${analysis.input.quantity} ${analysis.trade.unit}`, margin + 5, yPos + 23);
    doc.text(`Data Analisi: ${new Date().toLocaleDateString('it-IT')}`, margin + 5, yPos + 30);

    // Colonna destra
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Score Affidabilità: ${analysis.reliabilityScore}/100`, margin + contentWidth / 2 + 5, yPos + 8);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Categoria: ${analysis.trade.category}`, margin + contentWidth / 2 + 5, yPos + 16);
    doc.text(`Descrizione: ${analysis.trade.description}`, margin + contentWidth / 2 + 5, yPos + 23);

    return yPos + 60;
}

function drawPriceAnalysisSection(doc, analysis, margin, yPos, contentWidth, pageHeight) {
    if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
    }

    drawSectionTitle(doc, 'Analisi Prezzi di Mercato', margin, yPos);
    yPos += 10;

    // Tabella prezzi
    const tableData = [
        ['Parametro', 'Importo (€)', 'Dettagli'],
        ['Prezzo Minimo', `€ ${analysis.marketAnalysis.marketMin.toFixed(2)}`, 'Fascia economica'],
        ['Prezzo Medio', `€ ${analysis.marketAnalysis.marketMid.toFixed(2)}`, 'Fascia standard'],
        ['Prezzo Massimo', `€ ${analysis.marketAnalysis.marketMax.toFixed(2)}`, 'Fascia premium'],
        ['Prezzo Ricevuto', `€ ${analysis.input.receivedPrice.toFixed(2)}`, 'Tuo preventivo']
    ];

    drawTable(doc, tableData, margin, yPos, contentWidth);
    yPos += 60;

    return yPos;
}

function drawCongruitySection(doc, analysis, margin, yPos, contentWidth, pageHeight) {
    if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
    }

    drawSectionTitle(doc, 'Analisi di Congruità', margin, yPos);
    yPos += 10;

    const diffPercent = analysis.congruityAnalysis.diffPercent;
    let verdict = '';
    let verdictColor = [30, 58, 138];

    if (diffPercent < -10) {
        verdict = '✓ PREZZO CONVENIENTE';
        verdictColor = [5, 150, 105];
    } else if (diffPercent > 20) {
        verdict = '⚠ PREZZO ALTO';
        verdictColor = [220, 38, 38];
    } else {
        verdict = 'ℹ PREZZO NELLA MEDIA';
        verdictColor = [8, 145, 178];
    }

    // Box verdetto
    doc.setFillColor(...verdictColor);
    doc.rect(margin, yPos, contentWidth, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(verdict, margin + 5, yPos + 13);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const diffText = diffPercent > 0 ? `+${diffPercent}%` : `${diffPercent}%`;
    doc.text(`Scostamento dal mercato: ${diffText}`, contentWidth - 50, yPos + 13);

    yPos += 30;

    // Dettagli analisi
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Dettagli Analisi:', margin, yPos);

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(107, 114, 128);
    yPos += 7;

    const analysisPoints = [
        `• Coefficiente Regionale: ${analysis.congruityAnalysis.regionalCoeff}x`,
        `• Moltiplicatore Qualità: ${analysis.congruityAnalysis.qualityMultiplier}x`,
        `• Moltiplicatore Risposte: ${analysis.congruityAnalysis.answerMultiplier}x`,
        `• Prezzo Stimato: €${analysis.marketAnalysis.marketMid.toFixed(2)}`
    ];

    analysisPoints.forEach(point => {
        doc.text(point, margin + 5, yPos);
        yPos += 6;
    });

    return yPos + 10;
}

function drawRecommendationsSection(doc, analysis, margin, yPos, contentWidth, pageHeight) {
    if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
    }

    drawSectionTitle(doc, 'Raccomandazioni Professionali', margin, yPos);
    yPos += 10;

    const recommendations = [
        '1. Verifica che il preventivo includa tutti i materiali e la manodopera necessari.',
        '2. Chiedi chiarimenti su eventuali voci non specificate o ambigue.',
        '3. Confronta sempre almeno 3 preventivi prima di decidere.',
        '4. Verifica le certificazioni e le assicurazioni del professionista.',
        '5. Richiedi un cronoprogramma dettagliato dei lavori.',
        '6. Accertati della garanzia post-intervento offerta.'
    ];

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(107, 114, 128);

    recommendations.forEach(rec => {
        const lines = doc.splitTextToSize(rec, contentWidth - 10);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 2;
    });

    return yPos + 10;
}

function drawSectionTitle(doc, title, margin, yPos) {
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(title, margin, yPos);

    // Linea sotto titolo
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(margin, yPos + 3, margin + 60, yPos + 3);
}

function drawTable(doc, data, margin, yPos, contentWidth) {
    const cellHeight = 8;
    const colWidths = [60, 50, contentWidth - 110];

    // Header
    doc.setFillColor(30, 58, 138);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');

    data[0].forEach((header, i) => {
        doc.rect(margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos, colWidths[i], cellHeight, 'F');
        doc.text(header, margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 2, yPos + 6);
    });

    yPos += cellHeight;

    // Rows
    doc.setTextColor(107, 114, 128);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);

    data.slice(1).forEach((row, idx) => {
        if (idx % 2 === 0) {
            doc.setFillColor(243, 244, 246);
            doc.rect(margin, yPos, contentWidth, cellHeight, 'F');
        }

        doc.setDrawColor(229, 231, 235);
        doc.rect(margin, yPos, contentWidth, cellHeight);

        row.forEach((cell, i) => {
            doc.text(cell, margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 2, yPos + 6);
        });

        yPos += cellHeight;
    });
}

function drawFooter(doc, pageHeight, margin) {
    const footerY = pageHeight - 15;

    // Linea separatrice
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, doc.internal.pageSize.getWidth() - margin, footerY - 5);

    // Testo footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(159, 168, 178);

    const footerText = 'Questo documento è stato generato automaticamente da Preventivi-Smart Pro. Per informazioni: www.preventivi-smart.it';
    doc.text(footerText, margin, footerY);

    // Numero pagina
    const pageCount = doc.internal.pages.length - 1;
    doc.text(`Pagina 1 di ${pageCount}`, doc.internal.pageSize.getWidth() - margin - 20, footerY);
}

export default { generateProfessionalPDF };
