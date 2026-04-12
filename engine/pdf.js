/**
 * Modulo PDF Preventivi-Smart Pro v6.0
 * Genera preventivi professionali con jsPDF
 */

export function generatePDF(quote) {
  // Carica jsPDF dinamicamente se non già presente
  if (window.jspdf) {
    createPDF(window.jspdf.jsPDF, quote);
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = () => createPDF(window.jspdf.jsPDF, quote);
  document.head.appendChild(script);
}

function createPDF(jsPDF, quote) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // ---- Palette ----
  const navy   = [15, 23, 42];
  const amber  = [217, 119, 6];
  const amberL = [251, 191, 36];
  const white  = [255, 255, 255];
  const gray   = [100, 116, 139];
  const bgGray = [248, 250, 252];
  const border = [226, 232, 240];

  const fmt = (v) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v);
  const dateStr = new Date(quote.timestamp).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  const qualityLabels = { economica: 'Economico', standard: 'Standard', premium: 'Premium', lusso: 'Luxury' };

  // ---- HEADER ----
  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 45, 'F');

  // Accent strip
  doc.setFillColor(...amber);
  doc.rect(0, 42, 210, 3, 'F');

  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text('PREVENTIVI-SMART PRO', 15, 18);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Preventivo Professionale · Prezzari 2025/2026', 15, 27);

  doc.setFontSize(9);
  doc.setTextColor(...white);
  doc.text(`Data: ${dateStr}`, 15, 37);
  doc.text(`Rif: PS-${Date.now().toString().slice(-6)}`, 130, 37);

  // ---- TITOLO LAVORO ----
  let y = 58;
  doc.setFillColor(...bgGray);
  doc.roundedRect(15, y - 6, 180, 22, 3, 3, 'F');
  doc.setDrawColor(...border);
  doc.roundedRect(15, y - 6, 180, 22, 3, 3, 'S');

  doc.setTextColor(...navy);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(quote.tradeName, 22, y + 4);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...gray);
  doc.text(`${quote.quantity} ${quote.unit}  ·  ${quote.region}  ·  Qualità ${qualityLabels[quote.quality] || quote.quality}`, 22, y + 11);

  // ---- PREZZO PRINCIPALE ----
  y = 92;
  doc.setFillColor(...amber);
  doc.roundedRect(15, y, 180, 28, 4, 4, 'F');

  doc.setTextColor(...white);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('STIMA TOTALE INVESTIMENTO', 105, y + 8, { align: 'center' });

  doc.setFontSize(26);
  doc.setFont(undefined, 'bold');
  doc.text(fmt(quote.midPrice), 105, y + 20, { align: 'center' });

  // Range min/max
  y = 126;
  doc.setFillColor(...bgGray);
  doc.roundedRect(15, y, 86, 18, 3, 3, 'F');
  doc.roundedRect(109, y, 86, 18, 3, 3, 'F');

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...gray);
  doc.text('MINIMO', 58, y + 6, { align: 'center' });
  doc.text('MASSIMO', 152, y + 6, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...navy);
  doc.text(fmt(quote.minPrice), 58, y + 14, { align: 'center' });
  doc.text(fmt(quote.maxPrice), 152, y + 14, { align: 'center' });

  // ---- BREAKDOWN COSTI ----
  y = 154;
  doc.setFillColor(...navy);
  doc.roundedRect(15, y, 180, 9, 2, 2, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('ANALISI DEI COSTI', 20, y + 6);
  y += 14;

  const breakdownRows = [
    ['Manodopera Specializzata', fmt(quote.manodopera)],
    ['Materiali e Forniture', fmt(quote.materiali)],
    ['Oneri di Sicurezza (PSC)', fmt(Math.round(quote.midPrice * 0.05))],
  ];

  breakdownRows.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...bgGray);
      doc.rect(15, y - 5, 180, 8, 'F');
    }
    doc.setTextColor(...navy);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(row[0], 20, y);
    doc.text(row[1], 190, y, { align: 'right' });
    y += 9;
  });

  // Totale
  doc.setFillColor(...amberL);
  doc.rect(15, y - 5, 180, 9, 'F');
  doc.setTextColor(...navy);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text('TOTALE STIMATO', 20, y + 1);
  doc.text(fmt(quote.midPrice), 190, y + 1, { align: 'right' });
  y += 16;

  // ---- COEFFICIENTI ----
  doc.setFillColor(...navy);
  doc.roundedRect(15, y, 180, 9, 2, 2, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('COEFFICIENTI APPLICATI', 20, y + 6);
  y += 14;

  const coeffRows = [
    ['Prezzo Base Unitario', `€ ${quote.basePrice.toFixed(2)} / ${quote.unit}`],
    ['Coefficiente Regionale', `${quote.regionalCoeff.toFixed(2)}x (${quote.region})`],
    ['Qualità Materiali', `${quote.qualityCoeff.toFixed(2)}x (${qualityLabels[quote.quality] || quote.quality})`],
    ['Specifiche Lavoro', `${quote.answerMultiplier.toFixed(2)}x`],
  ];

  coeffRows.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...bgGray);
      doc.rect(15, y - 5, 180, 8, 'F');
    }
    doc.setTextColor(...navy);
    doc.setFontSize(9.5);
    doc.setFont(undefined, 'normal');
    doc.text(row[0], 20, y);
    doc.setTextColor(...gray);
    doc.text(row[1], 190, y, { align: 'right' });
    doc.setTextColor(...navy);
    y += 9;
  });

  y += 6;

  // ---- NOTE ----
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(15, y, 180, 18, 3, 3, 'F');
  doc.setDrawColor(...amber);
  doc.roundedRect(15, y, 180, 18, 3, 3, 'S');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(8.5);
  doc.setFont(undefined, 'bold');
  doc.text('Nota Importante', 20, y + 6);
  doc.setFont(undefined, 'normal');
  doc.text('Questa è una stima indicativa basata sui parametri inseriti e sui prezzari 2025/2026.', 20, y + 12);
  doc.text('Per un preventivo vincolante richiedere sopralluogo a un professionista qualificato.', 20, y + 17);

  // ---- FOOTER ----
  doc.setFillColor(...navy);
  doc.rect(0, 282, 210, 15, 'F');
  doc.setFillColor(...amber);
  doc.rect(0, 282, 210, 2, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('Preventivi-Smart Pro © 2025 · preventivi-smart.it', 15, 291);
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, 195, 291, { align: 'right' });

  doc.save(`Preventivo_${quote.tradeName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}
