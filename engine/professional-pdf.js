/**
 * Preventivi-Smart Pro v11.0 — Professional PDF Export
 * Documento di Consulenza Professionale pronto per la vendita
 */

export function generateProfessionalPDF(analysisResult, clientData = {}) {
  if (window.jspdf) {
    createProfessionalPDF(window.jspdf.jsPDF, analysisResult, clientData);
    return;
  }
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  script.onload = () => createProfessionalPDF(window.jspdf.jsPDF, analysisResult, clientData);
  document.head.appendChild(script);
}

function createProfessionalPDF(jsPDF, analysis, clientData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ---- COLORI BRAND ----
  const primary = [59, 130, 246];    // Blu
  const secondary = [139, 92, 246];  // Viola
  const danger = [220, 38, 38];      // Rosso
  const success = [34, 197, 94];     // Verde
  const warning = [245, 158, 11];    // Arancio
  const white = [255, 255, 255];
  const dark = [15, 23, 42];
  const gray = [100, 116, 139];
  const lightGray = [248, 250, 252];

  const fmt = (v) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(v);
  const dateStr = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  const reportId = `PS-PRO-${Date.now().toString().slice(-8)}`;

  let y = 10;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const pageWidth = doc.internal.pageSize.width - 2 * margin;

  // ============================================================
  // PAGINA 1 — COPERTINA PROFESSIONALE
  // ============================================================

  // Header gradient effect (simulate with rectangles)
  doc.setFillColor(...secondary);
  doc.rect(0, 0, 210, 60, "F");
  doc.setFillColor(...primary);
  doc.rect(0, 58, 210, 3, "F");

  // Logo e titolo
  doc.setTextColor(...white);
  doc.setFontSize(28);
  doc.setFont(undefined, "bold");
  doc.text("PREVENTIVI-SMART PRO", margin, 25);

  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.setTextColor(200, 200, 200);
  doc.text("Documento di Consulenza Professionale", margin, 35);
  doc.text("Analisi di Congruità di Mercato", margin, 42);

  // Metadati
  doc.setFontSize(9);
  doc.setTextColor(...white);
  doc.text(`Report ID: ${reportId}`, margin, 52);
  doc.text(`Data: ${dateStr}`, 210 - margin - 50, 52);

  y = 75;

  // ---- INTESTAZIONE CLIENTE ----
  if (clientData.name || clientData.email) {
    doc.setFillColor(...lightGray);
    doc.rect(margin, y - 5, pageWidth, 30, "F");
    doc.setDrawColor(...gray);
    doc.rect(margin, y - 5, pageWidth, 30, "S");

    doc.setTextColor(...dark);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("DATI CLIENTE", margin + 5, y + 2);

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...gray);
    if (clientData.name) doc.text(`Nome: ${clientData.name}`, margin + 5, y + 10);
    if (clientData.email) doc.text(`Email: ${clientData.email}`, margin + 5, y + 17);
    if (clientData.phone) doc.text(`Telefono: ${clientData.phone}`, margin + 5, y + 24);

    y += 40;
  }

  // ---- RIEPILOGO ANALISI ----
  doc.setFillColor(...primary);
  doc.rect(margin, y, pageWidth, 8, "F");
  doc.setTextColor(...white);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("RIEPILOGO ANALISI", margin + 5, y + 6);

  y += 12;

  const summaryData = [
    ["Mestiere", analysis.trade.name],
    ["Regione", analysis.input.region],
    ["Qualità", capitalizeFirst(analysis.input.quality)],
    ["Prezzo Ricevuto", fmt(analysis.input.receivedPrice)],
    ["Media Mercato", fmt(analysis.marketAnalysis.marketMid)],
    ["Differenza", `${analysis.congruityAnalysis.diffPercent > 0 ? "+" : ""}${analysis.congruityAnalysis.diffPercent}%`]
  ];

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(...dark);

  summaryData.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...lightGray);
      doc.rect(margin, y - 3, pageWidth, 6, "F");
    }
    doc.setTextColor(...gray);
    doc.text(row[0] + ":", margin + 5, y + 1);
    doc.setTextColor(...dark);
    doc.setFont(undefined, "bold");
    doc.text(row[1], margin + 60, y + 1);
    doc.setFont(undefined, "normal");
    y += 7;
  });

  // ---- RELIABILITY SCORE ----
  y += 5;
  const scoreColor = analysis.reliabilityScore >= 80 ? success : analysis.reliabilityScore >= 60 ? warning : danger;
  doc.setFillColor(...scoreColor);
  doc.rect(margin, y, pageWidth, 15, "F");
  doc.setTextColor(...white);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("SCORE DI AFFIDABILITÀ", margin + 5, y + 5);
  doc.setFontSize(20);
  doc.text(analysis.reliabilityScore.toString(), 210 - margin - 30, y + 10);

  y += 20;

  // ============================================================
  // PAGINA 2+ — ANALISI DETTAGLIATA
  // ============================================================

  if (y > pageHeight - 40) {
    doc.addPage();
    y = margin;
  }

  // ---- ANALISI DI CONGRUITÀ ----
  doc.setFillColor(...primary);
  doc.rect(margin, y, pageWidth, 8, "F");
  doc.setTextColor(...white);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("ANALISI DI CONGRUITÀ DI MERCATO", margin + 5, y + 6);

  y += 12;

  const congruityText = `
Il preventivo ricevuto è posizionato al ${analysis.congruityAnalysis.percentile}° percentile della distribuzione di mercato.
Prezzo ricevuto: ${fmt(analysis.input.receivedPrice)}
Media di mercato: ${fmt(analysis.marketAnalysis.marketMid)}
Range di mercato: ${fmt(analysis.marketAnalysis.marketMin)} - ${fmt(analysis.marketAnalysis.marketMax)}
Differenza: ${fmt(analysis.congruityAnalysis.diffAmount)} (${analysis.congruityAnalysis.diffPercent > 0 ? "+" : ""}${analysis.congruityAnalysis.diffPercent}%)
Classificazione: ${analysis.congruityAnalysis.classification}
  `;

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(...dark);
  const congruityLines = doc.splitTextToSize(congruityText.trim(), pageWidth - 10);
  doc.text(congruityLines, margin + 5, y);
  y += congruityLines.length * 5 + 5;

  // ---- BENCHMARK ORARIO ----
  if (y > pageHeight - 60) {
    doc.addPage();
    y = margin;
  }

  doc.setFillColor(...primary);
  doc.rect(margin, y, pageWidth, 8, "F");
  doc.setTextColor(...white);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("BENCHMARK ORARIO", margin + 5, y + 6);

  y += 12;

  const hourlyText = `
Ore totali stimate: ${analysis.timeline.totalHours.toFixed(1)} ore
Giorni lavorativi: ${analysis.timeline.workDays} giorni (~${Math.ceil(analysis.timeline.workDays * 1.4)} giorni calendario)
Costo orario ricevuto: €${analysis.hourlyBenchmark.receivedHourly}/ora
Costo orario mercato: €${analysis.hourlyBenchmark.marketHourly}/ora
Differenza oraria: €${analysis.hourlyBenchmark.hourlyDiff} (${analysis.hourlyBenchmark.hourlyDiffPercent > 0 ? "+" : ""}${analysis.hourlyBenchmark.hourlyDiffPercent}%)
Valutazione: ${analysis.hourlyBenchmark.assessment}
  `;

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(...dark);
  const hourlyLines = doc.splitTextToSize(hourlyText.trim(), pageWidth - 10);
  doc.text(hourlyLines, margin + 5, y);
  y += hourlyLines.length * 5 + 5;

  // ---- COMPOSIZIONE COSTI ----
  if (y > pageHeight - 60) {
    doc.addPage();
    y = margin;
  }

  doc.setFillColor(...primary);
  doc.rect(margin, y, pageWidth, 8, "F");
  doc.setTextColor(...white);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("COMPOSIZIONE COSTI", margin + 5, y + 6);

  y += 12;

  const breakdownText = `
Manodopera: ${fmt(analysis.breakdown.labor)} (${analysis.breakdown.laborPercentage}%)
Materiali: ${fmt(analysis.breakdown.materials)} (${analysis.breakdown.materialsPercentage}%)
Oneri e Gestione: ${fmt(analysis.breakdown.overhead)} (${analysis.breakdown.overheadPercentage}%)
Costo orario manodopera: €${analysis.breakdown.laborPerHour}/ora
  `;

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(...dark);
  const breakdownLines = doc.splitTextToSize(breakdownText.trim(), pageWidth - 10);
  doc.text(breakdownLines, margin + 5, y);
  y += breakdownLines.length * 5 + 10;

  // ---- VALUTAZIONE RISCHI ----
  if (y > pageHeight - 60) {
    doc.addPage();
    y = margin;
  }

  doc.setFillColor(...danger);
  doc.rect(margin, y, pageWidth, 8, "F");
  doc.setTextColor(...white);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("VALUTAZIONE RISCHI", margin + 5, y + 6);

  y += 12;

  if (analysis.riskAssessment.risks.length > 0) {
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...danger);
    doc.text("Rischi Critici:", margin + 5, y);
    y += 5;

    analysis.riskAssessment.risks.forEach((risk, idx) => {
      doc.setFont(undefined, "normal");
      doc.setTextColor(...dark);
      const riskText = `${idx + 1}. ${risk.title}: ${risk.description}`;
      const riskLines = doc.splitTextToSize(riskText, pageWidth - 15);
      doc.text(riskLines, margin + 10, y);
      y += riskLines.length * 4 + 2;
    });
  }

  if (analysis.riskAssessment.warnings.length > 0) {
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...warning);
    doc.text("Avvisi:", margin + 5, y);
    y += 5;

    analysis.riskAssessment.warnings.forEach((warning, idx) => {
      doc.setFont(undefined, "normal");
      doc.setTextColor(...dark);
      const warningText = `${idx + 1}. ${warning.title}: ${warning.description}`;
      const warningLines = doc.splitTextToSize(warningText, pageWidth - 15);
      doc.text(warningLines, margin + 10, y);
      y += warningLines.length * 4 + 2;
    });
  }

  // ---- CONSIGLI PROFESSIONALI ----
  if (y > pageHeight - 60) {
    doc.addPage();
    y = margin;
  }

  doc.setFillColor(...primary);
  doc.rect(margin, y, pageWidth, 8, "F");
  doc.setTextColor(...white);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("CONSIGLI PROFESSIONALI", margin + 5, y + 6);

  y += 12;

  analysis.professionalAdvice.forEach((advice, idx) => {
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...primary);
    doc.text(`${idx + 1}. ${advice.title}`, margin + 5, y);
    y += 5;

    doc.setFont(undefined, "normal");
    doc.setTextColor(...dark);
    const adviceLines = doc.splitTextToSize(advice.text, pageWidth - 15);
    doc.text(adviceLines, margin + 10, y);
    y += adviceLines.length * 4 + 3;

    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
    }
  });

  // ---- FOOTER ----
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("Questo documento è stato generato da Preventivi-Smart Pro v11.0", margin, pageHeight - 10);
  doc.text(`Report ID: ${reportId} | Data: ${dateStr}`, margin, pageHeight - 5);

  // Salva il PDF
  doc.save(`Preventivi-Smart-${reportId}.pdf`);
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default {
  generateProfessionalPDF
};
