export function generatePDF(quote) {

  const separator = "=".repeat(50);
  const divider = "-".repeat(50);
  
  const content = `
${separator}
PREVENTIVO SMART
${separator}

DATA: ${new Date().toLocaleString('it-IT')}

DETTAGLI LAVORO
${divider}
Tipo Lavoro:     ${quote.tipo}
Metri Quadri:    ${quote.mq} mq
Qualita:         ${quote.qualita}
Citta:           ${quote.citta}

STIMA PREZZO
${divider}
Prezzo Minimo:   EUR ${quote.min.toFixed(2)}
Prezzo Stimato:  EUR ${quote.mid.toFixed(2)}
Prezzo Massimo:  EUR ${quote.max.toFixed(2)}

INFORMAZIONI AI
${divider}
Affidabilita:    ${quote.aiConfidence}%

${separator}
Generato da Preventivi-Smart
${separator}
`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `preventivo_${quote.tipo}_${new Date().getTime()}.txt`;
  a.click();
  
  URL.revokeObjectURL(url);
}
