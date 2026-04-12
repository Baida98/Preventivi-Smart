/**
 * Modulo per la generazione di preventivi in PDF
 * Utilizza jsPDF per creare documenti professionali
 */

export function generatePDF(quote) {
  // Carica jsPDF dinamicamente
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = () => {
    const { jsPDF } = window.jspdf;
    createPDF(jsPDF, quote);
  };
  document.head.appendChild(script);
}

function createPDF(jsPDF, quote) {
  const doc = new jsPDF();

  // Colori
  const primaryColor = [59, 130, 246];
  const darkColor = [15, 23, 42];
  const textColor = [50, 50, 50];
  const lightGray = [240, 240, 240];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('PREVENTIVO PROFESSIONALE', 15, 25);

  // Data e numero
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Data: ${quote.timestamp}`, 15, 50);
  doc.text(`ID: ${quote.id || 'N/A'}`, 15, 56);

  // Sezione principale
  let yPos = 70;

  // Titolo lavoro
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...darkColor);
  doc.text(`${quote.tradeName}`, 15, yPos);
  yPos += 10;

  // Dettagli
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Quantità: ${quote.quantity} ${quote.unit}`, 15, yPos);
  yPos += 7;
  doc.text(`Regione: ${quote.region}`, 15, yPos);
  yPos += 7;
  doc.text(`Qualità Materiali: ${quote.quality}`, 15, yPos);
  yPos += 12;

  // Tabella di breakdown
  doc.setFillColor(...primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.rect(15, yPos - 5, 180, 8, 'F');
  doc.text('Dettaglio Calcolo', 20, yPos);
  yPos += 10;

  doc.setTextColor(...textColor);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  const breakdownData = [
    ['Prezzo base', formatCurrency(quote.basePrice)],
    ['Coefficiente regionale', `${quote.regionalCoeff.toFixed(2)}x`],
    ['Qualità materiali', `${quote.qualityCoeff.toFixed(2)}x`],
    ['Specifiche lavoro', `${quote.answerMultiplier.toFixed(2)}x`]
  ];

  breakdownData.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...lightGray);
      doc.rect(15, yPos - 5, 180, 7, 'F');
    }
    doc.text(row[0], 20, yPos);
    doc.text(row[1], 170, yPos, { align: 'right' });
    yPos += 7;
  });

  yPos += 5;

  // Prezzi finali
  doc.setFillColor(...primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.rect(15, yPos - 5, 180, 8, 'F');
  doc.text('Stima Preventivo', 20, yPos);
  yPos += 12;

  doc.setTextColor(...textColor);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  const priceData = [
    ['Prezzo Minimo', formatCurrency(quote.minPrice)],
    ['Prezzo Stimato', formatCurrency(quote.midPrice)],
    ['Prezzo Massimo', formatCurrency(quote.maxPrice)]
  ];

  priceData.forEach((row, idx) => {
    if (idx === 1) {
      doc.setFillColor(251, 191, 36);
      doc.rect(15, yPos - 5, 180, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
    } else {
      if (idx % 2 === 0) {
        doc.setFillColor(...lightGray);
        doc.rect(15, yPos - 5, 180, 7, 'F');
      }
      doc.setTextColor(...textColor);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
    }
    doc.text(row[0], 20, yPos);
    doc.text(row[1], 170, yPos, { align: 'right' });
    yPos += idx === 1 ? 10 : 7;
  });

  yPos += 10;

  // Note finali
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Nota: Questo preventivo è una stima basata sui parametri forniti.', 15, yPos);
  yPos += 5;
  doc.text('Per un preventivo definitivo, contattare un professionista qualificato.', 15, yPos);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Preventivi-Smart Pro © 2025', 15, 285);
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, 170, 285, { align: 'right' });

  // Download
  doc.save(`Preventivo_${quote.tradeName}_${Date.now()}.pdf`);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}
