/**
 * Preventivi-Smart Pro — PDF Professionale v10.0
 * Include: dati cliente, analisi AI, confronto mercato, timeline, breakdown orario, consigli killer
 */

export function generatePDF(quote, analysisResult = null) {
  if (window.jspdf) {
    createPDF(window.jspdf.jsPDF, quote, analysisResult);
    return;
  }
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  script.onload = () => createPDF(window.jspdf.jsPDF, quote, analysisResult);
  document.head.appendChild(script);
}

function createPDF(jsPDF, quote, analysis) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ---- Palette ----
  const navy    = [15, 23, 42];
  const navyL   = [30, 41, 59];
  const amber   = [217, 119, 6];
  const amberL  = [251, 191, 36];
  const white   = [255, 255, 255];
  const gray    = [100, 116, 139];
  const bgGray  = [248, 250, 252];
  const border  = [226, 232, 240];
  const green   = [5, 150, 105];
  const red     = [220, 38, 38];
  const blue    = [14, 165, 233];

  const fmt = (v) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(v);
  const dateStr = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  const refId = "PS-" + Date.now().toString().slice(-8);
  const qualityLabels = { economica: "Economico", standard: "Standard", premium: "Premium", lusso: "Luxury" };

  // ============================================================
  // PAGINA 1 — COPERTINA + RIEPILOGO
  // ============================================================

  // Header navy
  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 50, "F");
  doc.setFillColor(...amber);
  doc.rect(0, 48, 210, 3, "F");

  // Logo testo
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont(undefined, "bold");
  doc.text("PREVENTIVI-SMART PRO", 15, 20);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Analisi Professionale del Preventivo · Prezzari 2025/2026", 15, 30);

  // Metadati header
  doc.setFontSize(9);
  doc.setTextColor(...white);
  doc.text(`Data: ${dateStr}`, 15, 42);
  doc.text(`Rif: ${refId}`, 105, 42);
  doc.text("Confidenziale", 170, 42);

  // ---- TITOLO LAVORO ----
  let y = 62;
  doc.setFillColor(...bgGray);
  doc.roundedRect(15, y - 6, 180, 26, 3, 3, "F");
  doc.setDrawColor(...border);
  doc.roundedRect(15, y - 6, 180, 26, 3, 3, "S");

  doc.setTextColor(...navy);
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(quote.tradeName, 22, y + 4);

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(...gray);
  doc.text(`${quote.quantity} ${quote.unit}  ·  ${quote.region}  ·  Qualità ${qualityLabels[quote.quality] || quote.quality}`, 22, y + 12);

  if (quote.clientName) {
    doc.setTextColor(...navy);
    doc.setFont(undefined, "bold");
    doc.text(`Cliente: ${quote.clientName}`, 22, y + 18);
  }

  // ---- VERDETTO AI (se disponibile) ----
  y = 100;
  if (analysis) {
    const v = analysis.verdict;
    let verdictRgb = navy;
    if (v.id === "nella_media" || v.id === "basso") verdictRgb = green;
    else if (v.id === "truffa_basso" || v.id === "truffa_alto" || v.id === "molto_alto") verdictRgb = red;
    else if (v.id === "alto" || v.id === "molto_basso") verdictRgb = amber;
    else verdictRgb = blue;

    doc.setFillColor(...verdictRgb);
    doc.roundedRect(15, y, 180, 22, 4, 4, "F");
    doc.setTextColor(...white);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text("VERDETTO ANALISI AI", 105, y + 7, { align: "center" });
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text(v.label, 105, y + 16, { align: "center" });
    y += 30;
  }

  // ---- PREZZI CONFRONTO ----
  // Prezzo ricevuto
  doc.setFillColor(...navy);
  doc.roundedRect(15, y, 85, 32, 3, 3, "F");
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text("PREVENTIVO RICEVUTO", 57, y + 8, { align: "center" });
  doc.setTextColor(...amberL);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text(fmt(quote.receivedPrice || quote.midPrice), 57, y + 22, { align: "center" });

  // Prezzo mercato
  doc.setFillColor(...navyL);
  doc.roundedRect(110, y, 85, 32, 3, 3, "F");
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text("MEDIA DI MERCATO", 152, y + 8, { align: "center" });
  doc.setTextColor(...white);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text(fmt(quote.midPrice), 152, y + 22, { align: "center" });
  y += 40;

  // Range mercato
  doc.setFillColor(...bgGray);
  doc.roundedRect(15, y, 180, 16, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.setTextColor(...gray);
  doc.text("FASCIA MERCATO:", 20, y + 10);
  doc.setTextColor(...navy);
  doc.setFont(undefined, "bold");
  doc.text(`Min ${fmt(quote.minPrice)}  —  Media ${fmt(quote.midPrice)}  —  Max ${fmt(quote.maxPrice)}`, 105, y + 10, { align: "center" });

  if (analysis) {
    const diffSign = analysis.diffAmount >= 0 ? "+" : "";
    const diffColor = analysis.diffAmount > 0 ? red : green;
    doc.setTextColor(...diffColor);
    doc.text(`${diffSign}${fmt(analysis.diffAmount)} (${diffSign}${analysis.diffPercent}%)`, 190, y + 10, { align: "right" });
  }
  y += 24;

  // ---- ANALISI AI CONSIGLI ----
  if (analysis && analysis.advice && analysis.advice.length) {
    doc.setFillColor(...navy);
    doc.roundedRect(15, y, 180, 9, 2, 2, "F");
    doc.setTextColor(...white);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("ANALISI E CONSIGLI AI", 20, y + 6);
    y += 13;

    analysis.advice.forEach((tip, idx) => {
      const lines = doc.splitTextToSize(`${idx + 1}. ${tip}`, 172);
      if (idx % 2 === 0) {
        doc.setFillColor(...bgGray);
        doc.rect(15, y - 4, 180, lines.length * 5 + 4, "F");
      }
      doc.setTextColor(...navy);
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(lines, 20, y);
      y += lines.length * 5 + 3;
    });
    y += 4;
  }

  // ---- RED FLAGS ----
  if (analysis && analysis.redFlags && analysis.redFlags.length) {
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFillColor(254, 242, 242);
    doc.roundedRect(15, y, 180, 9, 2, 2, "F");
    doc.setDrawColor(...red);
    doc.roundedRect(15, y, 180, 9, 2, 2, "S");
    doc.setTextColor(...red);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("SEGNALI DI ATTENZIONE", 20, y + 6);
    y += 13;

    analysis.redFlags.forEach((flag) => {
      const sev = flag.severity === "high" ? red : flag.severity === "medium" ? amber : gray;
      doc.setFillColor(...sev);
      doc.circle(20, y - 1, 1.5, "F");
      doc.setTextColor(...navy);
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(flag.text, 25, y);
      y += 7;
    });
    y += 4;
  }

  // ---- DOMANDE DA FARE ----
  if (analysis && analysis.questions && analysis.questions.length) {
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFillColor(...navy);
    doc.roundedRect(15, y, 180, 9, 2, 2, "F");
    doc.setTextColor(...white);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("DOMANDE DA FARE ALL'ARTIGIANO", 20, y + 6);
    y += 13;

    analysis.questions.forEach((q, idx) => {
      const lines = doc.splitTextToSize(`${idx + 1}. ${q}`, 172);
      if (idx % 2 === 0) {
        doc.setFillColor(...bgGray);
        doc.rect(15, y - 4, 180, lines.length * 5 + 4, "F");
      }
      doc.setTextColor(...navy);
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(lines, 20, y);
      y += lines.length * 5 + 3;
    });
    y += 4;
  }

  // ---- BREAKDOWN COSTI ----
  if (y > 220) { doc.addPage(); y = 20; }

  doc.setFillColor(...navy);
  doc.roundedRect(15, y, 180, 9, 2, 2, "F");
  doc.setTextColor(...white);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("ANALISI DEI COSTI DI MERCATO", 20, y + 6);
  y += 13;

  const oneri = Math.round(quote.midPrice * 0.05);
  const breakRows = [
    ["Manodopera Specializzata", fmt(quote.manodopera || Math.round(quote.midPrice * 0.55))],
    ["Materiali e Forniture",    fmt(quote.materiali || Math.round(quote.midPrice * 0.40))],
    ["Oneri di Sicurezza (PSC)", fmt(oneri)],
  ];

  breakRows.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...bgGray);
      doc.rect(15, y - 5, 180, 8, "F");
    }
    doc.setTextColor(...navy);
    doc.setFontSize(9.5);
    doc.setFont(undefined, "normal");
    doc.text(row[0], 20, y);
    doc.text(row[1], 190, y, { align: "right" });
    y += 9;
  });

  doc.setFillColor(...amberL);
  doc.rect(15, y - 5, 180, 9, "F");
  doc.setTextColor(...navy);
  doc.setFont(undefined, "bold");
  doc.setFontSize(11);
  doc.text("TOTALE STIMATO MERCATO", 20, y + 1);
  doc.text(fmt(quote.midPrice), 190, y + 1, { align: "right" });
  y += 16;

  // ---- COEFFICIENTI ----
  if (y > 230) { doc.addPage(); y = 20; }

  doc.setFillColor(...navy);
  doc.roundedRect(15, y, 180, 9, 2, 2, "F");
  doc.setTextColor(...white);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("COEFFICIENTI APPLICATI", 20, y + 6);
  y += 13;

  const coeffRows = [
    ["Prezzo Base Unitario",    `€ ${(quote.basePrice || 0).toFixed(2)} / ${quote.unit}`],
    ["Coefficiente Regionale",  `${(quote.regionalCoeff || 1).toFixed(2)}x (${quote.region})`],
    ["Qualità Materiali",       `${(quote.qualityCoeff || 1).toFixed(2)}x (${qualityLabels[quote.quality] || quote.quality})`],
    ["Specifiche Lavoro",       `${(quote.answerMultiplier || 1).toFixed(2)}x`],
  ];

  coeffRows.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...bgGray);
      doc.rect(15, y - 5, 180, 8, "F");
    }
    doc.setTextColor(...navy);
    doc.setFontSize(9.5);
    doc.setFont(undefined, "normal");
    doc.text(row[0], 20, y);
    doc.setTextColor(...gray);
    doc.text(row[1], 190, y, { align: "right" });
    y += 9;
  });

  y += 6;

  // ---- SCORE AFFIDABILITÀ ----
  if (analysis) {
    if (y > 240) { doc.addPage(); y = 20; }
    const score = analysis.reliabilityScore;
    // reliabilityScore è su scala 0-100
    const scoreColor = score >= 80 ? green : score >= 50 ? amber : red;

    doc.setFillColor(...bgGray);
    doc.roundedRect(15, y, 180, 20, 3, 3, "F");
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text("SCORE AFFIDABILITÀ PREVENTIVO", 20, y + 7);
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(20, y + 10, 120, 5, 2, 2, "F");
    doc.setFillColor(...scoreColor);
    const barW = Math.round((score / 100) * 120);
    doc.roundedRect(20, y + 10, barW, 5, 2, 2, "F");
    doc.setTextColor(...navy);
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text(`${score}/100`, 155, y + 15);
    y += 28;
  }

  // ---- NOTA LEGALE ----
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(15, y, 180, 18, 3, 3, "F");
  doc.setDrawColor(...amber);
  doc.roundedRect(15, y, 180, 18, 3, 3, "S");
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(8.5);
  doc.setFont(undefined, "bold");
  doc.text("Nota Importante", 20, y + 6);
  doc.setFont(undefined, "normal");
  doc.text("Questa analisi è basata su prezzari 2025/2026 e dati di mercato aggregati. Non sostituisce", 20, y + 12);
  doc.text("una perizia professionale. Per lavori importanti, richiedere sempre più preventivi comparativi.", 20, y + 17);

  // ---- FOOTER ----
  doc.setFillColor(...navy);
  doc.rect(0, 282, 210, 15, "F");
  doc.setFillColor(...amber);
  doc.rect(0, 282, 210, 2, "F");
  doc.setTextColor(...white);
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text("Preventivi-Smart Pro © 2025 · preventivi-smart.it", 15, 291);
  doc.text(`Rif: ${refId} · Generato il ${new Date().toLocaleString("it-IT")}`, 195, 291, { align: "right" });

  doc.save(`Analisi_${quote.tradeName.replace(/\s+/g, "_")}_${refId}.pdf`);
}
