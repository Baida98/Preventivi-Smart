const jobs = {

  imbianchitura: {
    base: 10,
    fields: `
      <input id="mq" placeholder="MQ">
      <select id="stato">
        <option value="buono">Buono</option>
        <option value="medio">Medio</option>
        <option value="alto">Rovinato</option>
      </select>
      <select id="pittura">
        <option value="base">Base</option>
        <option value="lavabile">Lavabile</option>
        <option value="premium">Antimuffa</option>
      </select>
      <select id="colori">
        <option value="no">Bianco</option>
        <option value="si">Colori</option>
      </select>
    `
  },

  piastrelle: {
    base: 70,
    fields: `
      <input id="mq" placeholder="MQ">
      <select id="rimozione">
        <option value="no">No rimozione</option>
        <option value="si">Rimozione vecchio</option>
      </select>
      <select id="schema">
        <option value="semplice">Semplice</option>
        <option value="complesso">Complesso</option>
      </select>
    `
  },

  elettrico: {
    base: 60,
    fields: `
      <input id="mq" placeholder="Numero punti">
      <select id="cert">
        <option value="no">No certificazione</option>
        <option value="si">Certificazione</option>
      </select>
      <select id="tracce">
        <option value="no">No tracce</option>
        <option value="si">Tracce muro</option>
      </select>
    `
  },

  bagno: {
    base: 2500,
    fields: `
      <input id="mq" placeholder="MQ bagno">
      <select id="impianti">
        <option value="no">No spostamenti</option>
        <option value="si">Spostamenti impianti</option>
      </select>
    `
  },

  idraulica: {
    base: 80,
    fields: `
      <input id="mq" placeholder="Elementi">
      <select id="urgenza">
        <option value="no">Normale</option>
        <option value="si">Urgente</option>
      </select>
    `
  },

  cartongesso: {
    base: 35,
    fields: `
      <input id="mq" placeholder="MQ">
      <select id="isolamento">
        <option value="no">No isolamento</option>
        <option value="si">Isolamento</option>
      </select>
    `
  },

  pulizie: {
    base: 15,
    fields: `
      <input id="mq" placeholder="MQ">
      <select id="sporco">
        <option value="basso">Basso</option>
        <option value="medio">Medio</option>
        <option value="alto">Molto sporco</option>
      </select>
    `
  },

  giardino: {
    base: 20,
    fields: `
      <input id="mq" placeholder="MQ">
      <select id="tipo">
        <option value="manutenzione">Manutenzione</option>
        <option value="creazione">Creazione</option>
      </select>
    `
  }
};
