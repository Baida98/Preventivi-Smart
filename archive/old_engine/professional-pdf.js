/**
 * Professional PDF Generator Final v3.0 — Preventivi-Smart Pro
 * REGOLA 5: PDF DEVE ESSERE SEMPRE UTILIZZABILE
 * Contiene sempre: titolo, numero, data, cliente, totale ben visibile
 */

import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';

export function generateProfessionalPDF(quoteData) {
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
    yPos += 40;

    // ===== NUMERO E DATA (SEMPRE VISIBILI) =====
    drawQuoteInfo(doc, quoteData, margin, yPos, contentWidth);
    yPos += 25;

    // ===== CLIENTE =====
    drawClientSection(doc, quoteData, margin, yPos, contentWidth);
    yPos += 30;

    // ===== SERVIZI =====
    yPos = drawServicesSection(doc, quoteData, margin, yPos, contentWidth, pageHeight);

    // ===== TOTALE (GRANDE E VISIBILE) =====
    yPos = drawTotalSection(doc, quoteData, margin, yPos, contentWidth, pageHeight);

    // ===== NOTE (SE PRESENTI) =====
    if (quoteData.note) {
        yPos = drawNotesSection(doc, quoteData, margin, yPos, contentWidth, pageHeight);
    }

    // ===== FOOTER =====
    drawFooter(doc, pageHeight, margin);

    // Salva il PDF
    const filename = `Preventivo_${quoteData.numero}_${quoteData.data}.pdf`;
    doc.save(filename);
}

function drawHeader(doc, pageWidth, margin, yPos) {
    // Background header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Logo e titolo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('PREVENTIVO', margin, yPos + 12);

    // Tagline
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Preventivi-Smart Pro | Protezione Economica Professionale', margin, yPos + 20);
}

function drawQuoteInfo(doc, quoteData, margin, yPos, contentWidth) {
    // Box numero e data
    doc.setFillColor(51, 65, 85);
    doc.rect(margin, yPos, contentWidth, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`NUMERO: #${quoteData.numero}`, margin + 5, yPos + 13);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const dateStr = new Date(quoteData.data).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    doc.text(`DATA: ${dateStr}`, contentWidth - 50, yPos + 13);
}

function drawClientSection(doc, quoteData, margin, yPos, contentWidth) {
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('CLIENTE', margin, yPos);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(quoteData.cliente, margin, yPos + 8);
}

function drawServicesSection(doc, quoteData, margin, yPos, contentWidth, pageHeight) {
    if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
    }

    doc.setTextColor(30, 58, 138);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('SERVIZI', margin, yPos);
    yPos += 10;

    // Tabella servizi
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    const servizi = Array.isArray(quoteData.servizi) ? quoteData.servizi : [quoteData.servizi];
    
    servizi.forEach((servizio, idx) => {
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
        }

        // Numero servizio
        doc.setTextColor(59, 130, 246);
        doc.setFont(undefined, 'bold');
        doc.text(`${idx + 1}.`, margin, yPos);

        // Descrizione servizio
        doc.setTextColor(148, 163, 184);
        doc.setFont(undefined, 'normal');
        
        const serviceText = typeof servizio === 'string' ? servizio : JSON.stringify(servizio);
        const lines = doc.splitTextToSize(serviceText, contentWidth - 30);
        
        doc.text(lines, margin + 8, yPos);
        yPos += lines.length * 5 + 5;
    });

    return yPos + 10;
}

function drawTotalSection(doc, quoteData, margin, yPos, contentWidth, pageHeight) {
    if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
    }

    // Box totale grande e visibile
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos, contentWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('TOTALE', margin + 5, yPos + 10);

    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(`€ ${quoteData.totale.toFixed(2)}`, margin + 5, yPos + 28);

    return yPos + 40;
}

function drawNotesSection(doc, quoteData, margin, yPos, contentWidth, pageHeight) {
    if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
    }

    doc.setTextColor(30, 58, 138);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('NOTE', margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(148, 163, 184);
    
    const noteLines = doc.splitTextToSize(quoteData.note, contentWidth - 10);
    doc.text(noteLines, margin + 5, yPos);
    
    return yPos + noteLines.length * 5 + 10;
}

function drawFooter(doc, pageHeight, margin) {
    const footerY = pageHeight - 12;

    // Linea separatrice
    doc.setDrawColor(71, 85, 107);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, doc.internal.pageSize.getWidth() - margin, footerY - 5);

    // Testo footer
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(107, 114, 128);

    const footerText = 'Generato da Preventivi-Smart Pro | www.preventivi-smart.it';
    doc.text(footerText, margin, footerY);

    // Numero pagina
    const pageCount = doc.internal.pages.length - 1;
    doc.text(`Pagina 1 di ${pageCount}`, doc.internal.pageSize.getWidth() - margin - 20, footerY);
}

export default { generateProfessionalPDF };
