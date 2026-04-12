export function exportPDF(data) {

  const win = window.open("");

  win.document.write(`
    <h1>Preventivo</h1>
    <p>Tipo: ${data.tipo}</p>
    <p>MQ: ${data.mq}</p>
    <p>Prezzo: €${data.mid}</p>
  `);

  win.print();
}
