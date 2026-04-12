export function generatePDF(quote) {

  const content = `
Preventivo

Tipo: ${quote.tipo}
MQ: ${quote.mq}
Qualità: ${quote.qualita}
Città: ${quote.citta}

Min: €${quote.min}
Prezzo: €${quote.mid}
Max: €${quote.max}

AI Confidence: ${quote.aiConfidence}%
`;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "preventivo.txt";
  a.click();
}
