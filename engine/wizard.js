export const wizard = [
  {
    key:"tipo",
    label:"Che lavoro devi fare?",
    type:"select",
    options:["imbiancatura","piastrelle","bagno","elettrico","idraulica"]
  },
  {
    key:"qta",
    label:"Dimensione lavoro (mq o unità)",
    type:"number"
  },
  {
    key:"stato",
    label:"Condizione iniziale",
    type:"select",
    options:["buono","medio","scarso"]
  },
  {
    key:"difficolta",
    label:"Difficoltà lavoro",
    type:"select",
    options:["bassa","media","alta"]
  },
  {
    key:"extra",
    label:"Ci sono complicazioni?",
    type:"boolean"
  }
];
