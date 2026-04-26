/**
 * Preventivi-Smart Pro v18.0 — Specialized Advice Database
 * Consigli tecnici e domande trabocchetto 1-to-1 per ogni scenario di lavoro
 */

export const SPECIALIZED_ADVICE = {
  // ===== IDRAULICA: TUBO CHE PERDE =====
  idraulica_perdita: {
    title: "Analisi Perdita Tubo",
    description: "Perdita d'acqua da tubo o raccordo",
    icon: "fa-faucet-drip",
    color: "#3b82f6",
    
    advice: [
      {
        id: 1,
        title: "Verifica il tipo di tubo",
        description: "Chiedi se il tubo è in rame, plastica o acciaio. Il rame costa il 30-40% in più da riparare.",
        icon: "fa-pipe",
        severity: "high"
      },
      {
        id: 2,
        title: "Richiedi la sostituzione completa",
        description: "Se il tubo è vecchio (>15 anni), non far riparare solo la perdita. Sostituisci il tratto intero per evitare altre perdite.",
        icon: "fa-wrench",
        severity: "high"
      },
      {
        id: 3,
        title: "Chiedi la garanzia sulla riparazione",
        description: "Una riparazione professionale deve avere almeno 2 anni di garanzia. Se non la offre, è un segnale negativo.",
        icon: "fa-shield",
        severity: "medium"
      },
      {
        id: 4,
        title: "Verifica se c'è umidità nel muro",
        description: "Se la perdita è nel muro, chiedi se è stata causata da umidità strutturale. Potrebbe indicare un problema più grave.",
        icon: "fa-water",
        severity: "high"
      },
      {
        id: 5,
        title: "Richiedi il preventivo per il danno",
        description: "Se c'è danno all'intonaco o alle piastrelle, il costo della riparazione deve essere separato dal costo idraulico.",
        icon: "fa-file-invoice-dollar",
        severity: "medium"
      }
    ],
    
    questions: [
      {
        id: 1,
        question: "Quanti anni ha l'impianto idraulico?",
        purpose: "Determinare se è una riparazione isolata o sintomo di usura generale",
        redFlag: "Se > 25 anni, il rischio di altre perdite è molto alto"
      },
      {
        id: 2,
        question: "La perdita è costante o intermittente?",
        purpose: "Perdite intermittenti indicano problemi di pressione, costanti indicano usura",
        redFlag: "Se intermittente, potrebbe essere un problema di valvola (più economico)"
      },
      {
        id: 3,
        question: "Hai notato cali di pressione in altre zone della casa?",
        purpose: "Identificare se il problema è localizzato o sistemico",
        redFlag: "Se sì, il preventivo potrebbe essere sottodimensionato"
      }
    ],
    
    redFlags: [
      { flag: "Prezzo troppo basso (<€80)", severity: "high", reason: "Potrebbe essere una riparazione provvisoria" },
      { flag: "Nessuna menzione di smaltimento acqua", severity: "medium", reason: "Costo nascosto potenziale" },
      { flag: "Non include ispezione della pressione", severity: "medium", reason: "Diagnostica incompleta" }
    ]
  },

  // ===== IDRAULICA: SCARICO INTASATO =====
  idraulica_scarico: {
    title: "Analisi Scarico Intasato",
    description: "Lavandino, doccia o WC intasato",
    icon: "fa-toilet",
    color: "#3b82f6",
    
    advice: [
      {
        id: 1,
        title: "Richiedi il metodo di pulizia",
        description: "Chiedi se userà uno sturalavandini, una molla o un'idropulitrice. L'idropulitrice è la più efficace ma costa il 50% in più.",
        icon: "fa-spray-can",
        severity: "high"
      },
      {
        id: 2,
        title: "Verifica se è intasamento parziale o totale",
        description: "Un intasamento parziale costa meno. Se è totale, potrebbe indicare un problema di design dell'impianto.",
        icon: "fa-ban",
        severity: "medium"
      },
      {
        id: 3,
        title: "Chiedi se incluye ispezione con telecamera",
        description: "Un'ispezione video costa €50-100 ma rivela il vero problema. Senza, stai pagando al buio.",
        icon: "fa-video",
        severity: "high"
      },
      {
        id: 4,
        title: "Richiedi protezione dalle perdite",
        description: "Se lo scarico è intasato, potrebbe esserci acqua sporca. Chiedi se è incluso il contenimento e la pulizia.",
        icon: "fa-shield-water",
        severity: "medium"
      },
      {
        id: 5,
        title: "Chiedi la causa dell'intasamento",
        description: "Se è capelli, grasso o oggetti, la soluzione è diversa. Capelli = problema ricorrente, grasso = problema di manutenzione.",
        icon: "fa-magnifying-glass",
        severity: "high"
      }
    ],
    
    questions: [
      {
        id: 1,
        question: "È la prima volta che si intasa o è ricorrente?",
        purpose: "Ricorrente = problema strutturale, non solo pulizia",
        redFlag: "Se ricorrente, il preventivo dovrebbe includere una soluzione permanente"
      },
      {
        id: 2,
        question: "Quale scarico è intasato? (WC, lavandino, doccia)",
        purpose: "Ogni tipo ha cause diverse e soluzioni diverse",
        redFlag: "Se è il WC, il rischio di danno è più alto"
      },
      {
        id: 3,
        question: "Hai provato a risolvere da solo? Con cosa?",
        purpose: "Sapere se è stato usato un prodotto chimico che potrebbe danneggiare i tubi",
        redFlag: "Se sì, il costo della riparazione potrebbe aumentare"
      }
    ],
    
    redFlags: [
      { flag: "Prezzo fisso senza ispezione", severity: "high", reason: "Non sanno il vero problema" },
      { flag: "Offerta di 'pulizia preventiva' aggiuntiva", severity: "low", reason: "Potrebbe essere up-selling" },
      { flag: "Nessuna garanzia sulla riparazione", severity: "medium", reason: "Se si intasa di nuovo, dovrai ripagare" }
    ]
  },

  // ===== ELETTRICITÀ: CORTO CIRCUITO =====
  elettrico_corto: {
    title: "Analisi Corto Circuito",
    description: "Scintille, odore di bruciato, interruttore scattato",
    icon: "fa-bolt",
    color: "#f59e0b",
    
    advice: [
      {
        id: 1,
        title: "EMERGENZA: Non toccare nulla",
        description: "Un corto circuito è pericoloso. Chiedi se l'elettricista ha la certificazione CEI 64-8 e l'assicurazione responsabilità civile.",
        icon: "fa-exclamation-triangle",
        severity: "critical"
      },
      {
        id: 2,
        title: "Richiedi una diagnosi completa",
        description: "Il preventivo deve includere un'ispezione dell'impianto intero, non solo la riparazione del corto. Costo aggiuntivo: €50-100.",
        icon: "fa-stethoscope",
        severity: "high"
      },
      {
        id: 3,
        title: "Chiedi se è un problema di presa o di cablaggio",
        description: "Se è solo la presa, costa €30-50. Se è il cablaggio, costa €200+. La differenza è enorme.",
        icon: "fa-plug",
        severity: "high"
      },
      {
        id: 4,
        title: "Richiedi il certificato di conformità",
        description: "Dopo la riparazione, devi avere un certificato CEI 64-8. Se non lo offre, non è un professionista.",
        icon: "fa-certificate",
        severity: "high"
      },
      {
        id: 5,
        title: "Chiedi se è stato causato da sovraccarico",
        description: "Se hai collegato troppi apparecchi, il problema potrebbe ripetersi. Chiedi se è necessario un upgrade dell'impianto.",
        icon: "fa-plug-circle-bolt",
        severity: "medium"
      }
    ],
    
    questions: [
      {
        id: 1,
        question: "Quando è scattato l'interruttore? (Subito o dopo un po'?)",
        purpose: "Subito = corto circuito, dopo = sovraccarico",
        redFlag: "Se subito, è un'emergenza vera"
      },
      {
        id: 2,
        question: "Hai sentito odore di bruciato o visto scintille?",
        purpose: "Confermare il corto circuito e valutare il danno",
        redFlag: "Se sì, potrebbe esserci danno ai cavi"
      },
      {
        id: 3,
        question: "L'interruttore scatta di nuovo se lo riaccendi?",
        purpose: "Se scatta di nuovo, il problema non è risolto",
        redFlag: "Se sì, non riaccendere. Chiama subito un elettricista"
      }
    ],
    
    redFlags: [
      { flag: "Prezzo troppo basso (<€150)", severity: "critical", reason: "Un corto circuito non si ripara in 10 minuti" },
      { flag: "Nessuna menzione di certificazione", severity: "critical", reason: "Potrebbe non essere qualificato" },
      { flag: "Offerta di 'prova veloce' senza ispezione", severity: "high", reason: "Pericoloso e non professionale" }
    ]
  },

  // ===== MURATURA: CREPA NEL MURO =====
  muratura_crepa: {
    title: "Analisi Crepa nel Muro",
    description: "Crepa o spaccatura in muro",
    icon: "fa-square-full",
    color: "#8b5cf6",
    
    advice: [
      {
        id: 1,
        title: "Misura la crepa: spessore e lunghezza",
        description: "Una crepa sottile (<2mm) è cosmética. Una crepa larga (>5mm) indica un problema strutturale serio.",
        icon: "fa-ruler",
        severity: "high"
      },
      {
        id: 2,
        title: "Chiedi se è una crepa 'viva' o 'morta'",
        description: "Una crepa viva si allarga nel tempo (strutturale). Una morta è stabile (cosmética). La differenza di costo è 10x.",
        icon: "fa-heartbeat",
        severity: "critical"
      },
      {
        id: 3,
        title: "Richiedi un'ispezione strutturale",
        description: "Se la crepa è larga o verticale, potrebbe indicare un cedimento. Chiedi se è necessaria una perizia di un ingegnere.",
        icon: "fa-building",
        severity: "high"
      },
      {
        id: 4,
        title: "Chiedi il metodo di riparazione",
        description: "Stucco semplice = €50. Iniezione di resina = €200-500. Rinforzo strutturale = €1000+. Sono tre cose diverse.",
        icon: "fa-tools",
        severity: "high"
      },
      {
        id: 5,
        title: "Verifica se c'è umidità o infiltrazioni",
        description: "Se la crepa è bagnata, il problema non è solo la crepa. C'è un'infiltrazione d'acqua che deve essere risolta prima.",
        icon: "fa-water",
        severity: "high"
      }
    ],
    
    questions: [
      {
        id: 1,
        question: "La crepa è verticale, orizzontale o diagonale?",
        purpose: "Diagonale = cedimento, verticale = assestamento, orizzontale = pressione",
        redFlag: "Se diagonale, è un segnale di cedimento strutturale"
      },
      {
        id: 2,
        question: "La crepa è in una zona di carico (sopra una porta/finestra)?",
        purpose: "Crepe in zone di carico sono più critiche",
        redFlag: "Se sì, potrebbe essere un problema strutturale"
      },
      {
        id: 3,
        question: "Hai notato altre crepe nella casa?",
        purpose: "Crepe multiple indicano un problema sistemico",
        redFlag: "Se sì, il preventivo è sottodimensionato"
      }
    ],
    
    redFlags: [
      { flag: "Prezzo uguale per crepe di diverse dimensioni", severity: "high", reason: "Non ha fatto un'ispezione seria" },
      { flag: "Nessuna menzione di ispezione strutturale", severity: "high", reason: "Potrebbe perdere un problema grave" },
      { flag: "Offerta di solo stucco per crepe larghe", severity: "critical", reason: "Soluzione temporanea, non definitiva" }
    ]
  },

  // ===== FINITURE: IMBIANCATURA =====
  finiture_imbiancatura: {
    title: "Analisi Imbiancatura",
    description: "Pittura e imbiancatura pareti",
    icon: "fa-paint-roller",
    color: "#f59e0b",
    
    advice: [
      {
        id: 1,
        title: "Chiedi il numero di mani di pittura",
        description: "1 mano = economico ma trasparente. 2 mani = standard. 3 mani = premium. Ogni mano aggiuntiva costa €1-2/mq.",
        icon: "fa-layer-group",
        severity: "medium"
      },
      {
        id: 2,
        title: "Verifica se è inclusa la preparazione",
        description: "Preparazione (pulizia, rasatura, primer) è il 50% del lavoro. Se non è inclusa, il prezzo è incompleto.",
        icon: "fa-broom",
        severity: "high"
      },
      {
        id: 3,
        title: "Chiedi il marchio della pittura",
        description: "Pittura economica (€5/litro) vs premium (€20/litro). La differenza di durabilità è 5 anni.",
        icon: "fa-paint-brush",
        severity: "medium"
      },
      {
        id: 4,
        title: "Richiedi protezione dei mobili e pavimenti",
        description: "Se non è inclusa, chiedi se è responsabilità dell'imbianchino se macchia qualcosa.",
        icon: "fa-shield",
        severity: "low"
      },
      {
        id: 5,
        title: "Chiedi se è inclusa la pulizia finale",
        description: "La pulizia post-lavoro è spesso un costo nascosto. Deve essere inclusa nel preventivo.",
        icon: "fa-trash",
        severity: "low"
      }
    ],
    
    questions: [
      {
        id: 1,
        question: "Le pareti sono in buone condizioni o hanno crepe/buchi?",
        purpose: "Pareti danneggiate richiedono più preparazione",
        redFlag: "Se danneggiate, il costo potrebbe aumentare del 30-50%"
      },
      {
        id: 2,
        question: "Vuoi lo stesso colore o un colore nuovo?",
        purpose: "Colore nuovo richiede primer, colore uguale no",
        redFlag: "Se colore scuro su bianco, potrebbero servire 3-4 mani"
      },
      {
        id: 3,
        question: "Ci sono macchie di umidità o muffa?",
        purpose: "Se sì, deve essere trattato prima di dipingere",
        redFlag: "Se sì, il costo aumenta e la garanzia è ridotta"
      }
    ],
    
    redFlags: [
      { flag: "Prezzo uguale per preparazione inclusa/esclusa", severity: "high", reason: "Probabilmente non farà una buona preparazione" },
      { flag: "Nessuna menzione del marchio di pittura", severity: "medium", reason: "Potrebbe usare pittura economica" },
      { flag: "Garanzia <1 anno", severity: "low", reason: "Pittura di qualità ha garanzia 3-5 anni" }
    ]
  }
};

// ===== EXPORT FUNCTIONS =====
export function getAdviceByTradeId(tradeId) {
  return SPECIALIZED_ADVICE[tradeId] || null;
}

export function getAdviceList(tradeId) {
  const advice = SPECIALIZED_ADVICE[tradeId];
  return advice ? advice.advice : [];
}

export function getQuestions(tradeId) {
  const advice = SPECIALIZED_ADVICE[tradeId];
  return advice ? advice.questions : [];
}

export function getRedFlags(tradeId) {
  const advice = SPECIALIZED_ADVICE[tradeId];
  return advice ? advice.redFlags : [];
}

export default {
  SPECIALIZED_ADVICE,
  getAdviceByTradeId,
  getAdviceList,
  getQuestions,
  getRedFlags
};
