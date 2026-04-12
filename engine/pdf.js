export function generatePDF(quote) {

  const content = `
Preventivo

Tipo: ${quote.tipo}
MQ: ${quote.mq}
Qualità: ${quote.qualita}
Città: ${quote.citta}

Min: €${quote.min.toFixed(2)}
Prezzo: €${quote.mid.toFixed(2)}
Max: €${quote.max.toFixed(2)}

AI Confidence: ${quote.aiConfidence}%
Data: ${new Date().toLocaleString('it-IT')}
`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "preventivo.txt";
  a.click();
  
  URL.revokeObjectURL(url);
}
