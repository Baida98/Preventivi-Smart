/**
 * Database professionale di mestieri, parametri e coefficienti regionali
 * Versione 4.0 Enterprise Edition
 */

// Coefficienti regionali basati su indici ISTAT 2025
export const REGIONAL_COEFFICIENTS = {
  "Lombardia": 1.25,
  "Trentino-Alto Adige": 1.22,
  "Valle d'Aosta": 1.18,
  "Lazio": 1.15,
  "Veneto": 1.12,
  "Emilia-Romagna": 1.10,
  "Piemonte": 1.08,
  "Liguria": 1.08,
  "Toscana": 1.05,
  "Friuli-Venezia Giulia": 1.02,
  "Marche": 0.98,
  "Umbria": 0.95,
  "Abruzzo": 0.92,
  "Campania": 0.90,
  "Sardegna": 0.88,
  "Puglia": 0.85,
  "Sicilia": 0.82,
  "Basilicata": 0.80,
  "Calabria": 0.78,
  "Molise": 0.75
};

// Qualità dei materiali
export const QUALITY_MULTIPLIERS = {
  "economica": 0.85,
  "standard": 1.0,
  "premium": 1.3,
  "lusso": 1.8
};

// Mestieri con parametri dettagliati e domande specialistiche
export const TRADES = {
  "imbiancatura": {
    id: "imbiancatura",
    name: "Imbiancatura",
    icon: "icon_imbiancatura.png",
    unit: "mq",
    basePrice: 12,
    color: "#3B82F6",
    description: "Tinteggiatura e pittura interni/esterni",
    costBreakdown: { manodopera: 0.65, materiali: 0.35 },
    questions: [
      {
        id: "stato_muri",
        label: "Stato dei muri",
        type: "select",
        options: [
          { value: "ottimo", label: "Ottimo (liscio, pronto)", multiplier: 0.9 },
          { value: "buono", label: "Buono (piccole imperfezioni)", multiplier: 1.0 },
          { value: "medio", label: "Medio (crepe, scrostature)", multiplier: 1.25 },
          { value: "rovinato", label: "Rovinato (molta preparazione)", multiplier: 1.50 }
        ]
      },
      {
        id: "tipo_pittura",
        label: "Tipo di pittura",
        type: "select",
        options: [
          { value: "acrilica", label: "Acrilica standard", multiplier: 1.0 },
          { value: "lavabile", label: "Lavabile (cucina/bagno)", multiplier: 1.15 },
          { value: "antimuffa", label: "Antimuffa/Silossanica", multiplier: 1.35 },
          { value: "premium", label: "Premium (marmorino/effetti)", multiplier: 1.60 }
        ]
      },
      {
        id: "numero_mani",
        label: "Numero di mani",
        type: "select",
        options: [
          { value: "una", label: "Una mano", multiplier: 0.8 },
          { value: "due", label: "Due mani", multiplier: 1.0 },
          { value: "tre", label: "Tre mani (copertura totale)", multiplier: 1.3 }
        ]
      },
      {
        id: "colori",
        label: "Colori speciali",
        type: "select",
        options: [
          { value: "bianco", label: "Bianco/Neutri", multiplier: 1.0 },
          { value: "colorato", label: "Colorato standard", multiplier: 1.15 },
          { value: "personalizzato", label: "Personalizzato (tinte custom)", multiplier: 1.40 }
        ]
      }
    ]
  },

  "piastrellista": {
    id: "piastrellista",
    name: "Piastrellista",
    icon: "icon_piastrellista.png",
    unit: "mq",
    basePrice: 35,
    color: "#8B5CF6",
    description: "Posa piastrelle e rivestimenti",
    costBreakdown: { manodopera: 0.60, materiali: 0.40 },
    questions: [
      {
        id: "rimozione_vecchio",
        label: "Rimozione piastrelle vecchie",
        type: "select",
        options: [
          { value: "no", label: "No, superficie nuova", multiplier: 1.0 },
          { value: "si_facile", label: "Si, facile (colla)", multiplier: 1.25 },
          { value: "si_difficile", label: "Si, difficile (malta)", multiplier: 1.60 }
        ]
      },
      {
        id: "formato_piastrelle",
        label: "Formato piastrelle",
        type: "select",
        options: [
          { value: "piccolo", label: "Piccolo (10x10-20x20)", multiplier: 1.0 },
          { value: "medio", label: "Medio (30x30-40x40)", multiplier: 1.15 },
          { value: "grande", label: "Grande (60x60+)", multiplier: 1.35 },
          { value: "mosaico", label: "Mosaico/Piccoli formati", multiplier: 1.50 }
        ]
      },
      {
        id: "schema_posa",
        label: "Schema di posa",
        type: "select",
        options: [
          { value: "semplice", label: "Semplice (dritta)", multiplier: 1.0 },
          { value: "diagonale", label: "Diagonale", multiplier: 1.15 },
          { value: "spina", label: "Spina di pesce", multiplier: 1.30 },
          { value: "complesso", label: "Complesso (mosaico/geometrico)", multiplier: 1.60 }
        ]
      },
      {
        id: "tipo_adesivo",
        label: "Tipo di adesivo",
        type: "select",
        options: [
          { value: "colla", label: "Colla standard", multiplier: 1.0 },
          { value: "colla_flessibile", label: "Colla flessibile", multiplier: 1.10 },
          { value: "malta", label: "Malta (posa tradizionale)", multiplier: 1.25 }
        ]
      }
    ]
  },

  "elettricista": {
    id: "elettricista",
    name: "Elettricista",
    icon: "icon_elettrico.png",
    unit: "punto",
    basePrice: 65,
    color: "#FBBF24",
    description: "Impianti elettrici e illuminazione",
    costBreakdown: { manodopera: 0.70, materiali: 0.30 },
    questions: [
      {
        id: "tipo_lavoro",
        label: "Tipo di lavoro",
        type: "select",
        options: [
          { value: "punto_luce", label: "Punto luce (lampadina)", multiplier: 1.0 },
          { value: "presa", label: "Presa elettrica", multiplier: 1.0 },
          { value: "interruttore", label: "Interruttore", multiplier: 0.9 },
          { value: "punto_complesso", label: "Punto complesso (mix)", multiplier: 1.3 }
        ]
      },
      {
        id: "certificazione",
        label: "Certificazione richiesta",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "si", label: "Si (SAI/Dichiarazione conformità)", multiplier: 1.25 }
        ]
      },
      {
        id: "tracce_muro",
        label: "Tipo di posa",
        type: "select",
        options: [
          { value: "canalette", label: "Canalette (superficie)", multiplier: 1.0 },
          { value: "scasso", label: "Scasso nel muro", multiplier: 1.35 },
          { value: "sottopavimento", label: "Sottopavimento", multiplier: 1.50 }
        ]
      },
      {
        id: "domotica",
        label: "Impianto domotico",
        type: "select",
        options: [
          { value: "no", label: "No, impianto tradizionale", multiplier: 1.0 },
          { value: "si_base", label: "Si, base (WiFi/Alexa)", multiplier: 1.40 },
          { value: "si_avanzato", label: "Si, avanzato (automazione completa)", multiplier: 2.00 }
        ]
      }
    ]
  },

  "idraulico": {
    id: "idraulico",
    name: "Idraulico",
    icon: "icon_idraulica.png",
    unit: "punto",
    basePrice: 180,
    color: "#06B6D4",
    description: "Impianti idrici e sanitari",
    costBreakdown: { manodopera: 0.55, materiali: 0.45 },
    questions: [
      {
        id: "tipo_punto",
        label: "Tipo di punto",
        type: "select",
        options: [
          { value: "rubinetto", label: "Rubinetto/Miscelatore", multiplier: 1.0 },
          { value: "scarico", label: "Scarico/Sifone", multiplier: 0.9 },
          { value: "punto_acqua", label: "Punto acqua completo", multiplier: 1.3 },
          { value: "caldaia", label: "Caldaia/Scaldabagno", multiplier: 2.5 }
        ]
      },
      {
        id: "urgenza",
        label: "Urgenza del lavoro",
        type: "select",
        options: [
          { value: "normale", label: "Normale", multiplier: 1.0 },
          { value: "urgente", label: "Urgente (stesso giorno)", multiplier: 1.40 },
          { value: "emergenza", label: "Emergenza (notturno/festivo)", multiplier: 2.00 }
        ]
      },
      {
        id: "materiale_tubature",
        label: "Materiale tubature",
        type: "select",
        options: [
          { value: "pvc", label: "PVC (scarichi)", multiplier: 0.9 },
          { value: "multistrato", label: "Multistrato", multiplier: 1.0 },
          { value: "rame", label: "Rame", multiplier: 1.25 },
          { value: "acciaio_inox", label: "Acciaio inox", multiplier: 1.40 }
        ]
      },
      {
        id: "incasso",
        label: "Tipo di posa",
        type: "select",
        options: [
          { value: "esterno", label: "Esterno (visibile)", multiplier: 1.0 },
          { value: "incasso", label: "Incasso (in muro)", multiplier: 1.25 },
          { value: "sottopavimento", label: "Sottopavimento", multiplier: 1.50 }
        ]
      }
    ]
  },

  "muratore": {
    id: "muratore",
    name: "Muratore",
    icon: "icon_muratore.png",
    unit: "mq",
    basePrice: 50,
    color: "#EF4444",
    description: "Muratura e strutture",
    costBreakdown: { manodopera: 0.50, materiali: 0.50 },
    questions: [
      {
        id: "tipo_lavoro",
        label: "Tipo di lavoro",
        type: "select",
        options: [
          { value: "demolizione", label: "Demolizione", multiplier: 1.25 },
          { value: "costruzione", label: "Costruzione", multiplier: 1.0 },
          { value: "intonaco", label: "Intonaco/Rasatura", multiplier: 0.85 },
          { value: "riparazione", label: "Riparazione/Rappezzatura", multiplier: 1.15 }
        ]
      },
      {
        id: "materiale",
        label: "Materiale",
        type: "select",
        options: [
          { value: "laterizio", label: "Laterizio (mattone)", multiplier: 1.0 },
          { value: "blocchi", label: "Blocchi calcestruzzo", multiplier: 1.15 },
          { value: "cemento_armato", label: "Cemento armato", multiplier: 1.60 },
          { value: "pietra", label: "Pietra naturale", multiplier: 1.80 }
        ]
      },
      {
        id: "complessita",
        label: "Complessità strutturale",
        type: "select",
        options: [
          { value: "semplice", label: "Semplice (muri dritti)", multiplier: 1.0 },
          { value: "media", label: "Media (angoli, aperture)", multiplier: 1.25 },
          { value: "complessa", label: "Complessa (archi, volte, curve)", multiplier: 1.70 }
        ]
      },
      {
        id: "altezza_lavoro",
        label: "Altezza di lavoro",
        type: "select",
        options: [
          { value: "terra", label: "A terra (0-2m)", multiplier: 1.0 },
          { value: "media", label: "Media (2-4m)", multiplier: 1.20 },
          { value: "alta", label: "Alta (4m+, con ponteggi)", multiplier: 1.60 }
        ]
      }
    ]
  },

  "cartongessista": {
    id: "cartongessista",
    name: "Cartongessista",
    icon: "icon_cartongesso.png",
    unit: "mq",
    basePrice: 40,
    color: "#10B981",
    description: "Pareti e controsoffitti in cartongesso",
    costBreakdown: { manodopera: 0.60, materiali: 0.40 },
    questions: [
      {
        id: "tipo_struttura",
        label: "Tipo di struttura",
        type: "select",
        options: [
          { value: "parete_singola", label: "Parete singola", multiplier: 1.0 },
          { value: "parete_doppia", label: "Parete doppia (fonoassorbente)", multiplier: 1.35 },
          { value: "controsoffitto", label: "Controsoffitto", multiplier: 1.25 },
          { value: "rivestimento", label: "Rivestimento (su muro)", multiplier: 0.90 }
        ]
      },
      {
        id: "isolamento",
        label: "Isolamento termico/acustico",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "lana_roccia", label: "Lana di roccia", multiplier: 1.25 },
          { value: "poliuretano", label: "Poliuretano espanso", multiplier: 1.35 },
          { value: "doppio_isolamento", label: "Doppio isolamento", multiplier: 1.70 }
        ]
      },
      {
        id: "finiture",
        label: "Finiture",
        type: "select",
        options: [
          { value: "semplice", label: "Semplice (giunti)", multiplier: 1.0 },
          { value: "rasata", label: "Rasata (pronta pittura)", multiplier: 1.20 },
          { value: "faretti", label: "Con faretti integrati", multiplier: 1.40 },
          { value: "complessa", label: "Complessa (curve, nicchie)", multiplier: 1.60 }
        ]
      },
      {
        id: "spessore",
        label: "Spessore parete",
        type: "select",
        options: [
          { value: "sottile", label: "Sottile (5cm)", multiplier: 0.90 },
          { value: "standard", label: "Standard (7-10cm)", multiplier: 1.0 },
          { value: "spessa", label: "Spessa (12-15cm)", multiplier: 1.20 }
        ]
      }
    ]
  },

  "serramentista": {
    id: "serramentista",
    name: "Serramentista",
    icon: "icon_serramenti.png",
    unit: "unità",
    basePrice: 600,
    color: "#8B4513",
    description: "Finestre, porte e infissi",
    costBreakdown: { manodopera: 0.25, materiali: 0.75 },
    questions: [
      {
        id: "tipo_serramento",
        label: "Tipo di serramento",
        type: "select",
        options: [
          { value: "finestra", label: "Finestra", multiplier: 1.0 },
          { value: "porta_finestra", label: "Porta-finestra", multiplier: 1.25 },
          { value: "porta_ingresso", label: "Porta d'ingresso", multiplier: 1.50 },
          { value: "porta_blindata", label: "Porta blindata", multiplier: 2.00 }
        ]
      },
      {
        id: "materiale_infissi",
        label: "Materiale infissi",
        type: "select",
        options: [
          { value: "pvc", label: "PVC", multiplier: 1.0 },
          { value: "alluminio", label: "Alluminio", multiplier: 1.30 },
          { value: "legno", label: "Legno", multiplier: 1.50 },
          { value: "legno_alluminio", label: "Legno-Alluminio", multiplier: 1.80 }
        ]
      },
      {
        id: "tipo_vetro",
        label: "Tipo di vetro",
        type: "select",
        options: [
          { value: "doppio", label: "Doppio standard", multiplier: 1.0 },
          { value: "triplo", label: "Triplo (isolamento)", multiplier: 1.25 },
          { value: "basso_emissivo", label: "Basso emissivo", multiplier: 1.40 },
          { value: "blindato", label: "Blindato/Antieffrazione", multiplier: 1.80 }
        ]
      },
      {
        id: "installazione",
        label: "Tipo di installazione",
        type: "select",
        options: [
          { value: "sostituzione", label: "Sostituzione", multiplier: 1.0 },
          { value: "nuova_apertura", label: "Nuova apertura", multiplier: 1.60 },
          { value: "restauro", label: "Restauro/Manutenzione", multiplier: 0.80 }
        ]
      }
    ]
  },

  "climatizzazione": {
    id: "climatizzazione",
    name: "Climatizzazione",
    icon: "icon_climatizzazione.png",
    unit: "unità",
    basePrice: 450,
    color: "#3B82F6",
    description: "Impianti di riscaldamento e raffreddamento",
    costBreakdown: { manodopera: 0.35, materiali: 0.65 },
    questions: [
      {
        id: "tipo_impianto",
        label: "Tipo di impianto",
        type: "select",
        options: [
          { value: "monosplit", label: "Monosplit (1 unità interna)", multiplier: 1.0 },
          { value: "dualsplit", label: "Dual split (2 unità)", multiplier: 1.80 },
          { value: "multisplit", label: "Multi split (3+ unità)", multiplier: 2.50 },
          { value: "canalizzato", label: "Canalizzato (distribuzione aria)", multiplier: 3.00 }
        ]
      },
      {
        id: "potenza_termica",
        label: "Potenza termica",
        type: "select",
        options: [
          { value: "piccola", label: "Piccola (3-5 kW)", multiplier: 1.0 },
          { value: "media", label: "Media (5-10 kW)", multiplier: 1.35 },
          { value: "grande", label: "Grande (10-15 kW)", multiplier: 1.70 },
          { value: "molto_grande", label: "Molto grande (15+ kW)", multiplier: 2.20 }
        ]
      },
      {
        id: "smart_control",
        label: "Controllo intelligente",
        type: "select",
        options: [
          { value: "no", label: "No, telecomando standard", multiplier: 1.0 },
          { value: "wifi", label: "WiFi (App mobile)", multiplier: 1.15 },
          { value: "smart_home", label: "Smart Home integrato", multiplier: 1.35 }
        ]
      },
      {
        id: "installazione_complessa",
        label: "Complessità installazione",
        type: "select",
        options: [
          { value: "semplice", label: "Semplice (parete esterna)", multiplier: 1.0 },
          { value: "media", label: "Media (canalizzazione)", multiplier: 1.30 },
          { value: "complessa", label: "Complessa (multi-stanza)", multiplier: 1.70 }
        ]
      }
    ]
  },

  "giardiniere": {
    id: "giardiniere",
    name: "Giardiniere",
    icon: "icon_giardiniere.png",
    unit: "mq",
    basePrice: 15,
    color: "#10B981",
    description: "Realizzazione e manutenzione giardini",
    costBreakdown: { manodopera: 0.70, materiali: 0.30 },
    questions: [
      {
        id: "tipo_prato",
        label: "Tipo di prato",
        type: "select",
        options: [
          { value: "semina", label: "Semina", multiplier: 1.0 },
          { value: "prato_pronto", label: "Prato pronto (rotoli)", multiplier: 1.50 },
          { value: "prato_sintetico", label: "Prato sintetico", multiplier: 2.00 }
        ]
      },
      {
        id: "preparazione_terreno",
        label: "Preparazione terreno",
        type: "select",
        options: [
          { value: "minima", label: "Minima (già preparato)", multiplier: 1.0 },
          { value: "media", label: "Media (livellamento)", multiplier: 1.25 },
          { value: "completa", label: "Completa (scavo, drenaggio)", multiplier: 1.70 }
        ]
      },
      {
        id: "irrigazione",
        label: "Sistema di irrigazione",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "goccia", label: "A goccia", multiplier: 1.40 },
          { value: "automatica", label: "Automatica con timer", multiplier: 1.80 }
        ]
      },
      {
        id: "elementi_aggiuntivi",
        label: "Elementi aggiuntivi",
        type: "select",
        options: [
          { value: "no", label: "No, solo prato", multiplier: 1.0 },
          { value: "piante", label: "Con piante/arbusti", multiplier: 1.40 },
          { value: "completo", label: "Completo (piante, percorsi, illuminazione)", multiplier: 2.20 }
        ]
      }
    ]
  },

  "pulizie": {
    id: "pulizie",
    name: "Pulizie Post-Cantiere",
    icon: "icon_pulizie.png",
    unit: "mq",
    basePrice: 8,
    color: "#F59E0B",
    description: "Pulizie professionali post-ristrutturazione",
    costBreakdown: { manodopera: 0.80, materiali: 0.20 },
    questions: [
      {
        id: "livello_sporco",
        label: "Livello di sporcizia",
        type: "select",
        options: [
          { value: "basso", label: "Basso (polvere leggera)", multiplier: 1.0 },
          { value: "medio", label: "Medio (polvere e detriti)", multiplier: 1.25 },
          { value: "alto", label: "Alto (molto sporco)", multiplier: 1.60 },
          { value: "estremo", label: "Estremo (cantiere pesante)", multiplier: 2.00 }
        ]
      },
      {
        id: "tipo_pulizia",
        label: "Tipo di pulizia",
        type: "select",
        options: [
          { value: "base", label: "Base (pavimenti, polvere)", multiplier: 1.0 },
          { value: "completa", label: "Completa (tutto + vetri)", multiplier: 1.35 },
          { value: "profonda", label: "Profonda (sgrassatura, disinfez.)", multiplier: 1.70 }
        ]
      },
      {
        id: "vetrate",
        label: "Pulizia vetrate",
        type: "select",
        options: [
          { value: "no", label: "No", multiplier: 1.0 },
          { value: "si", label: "Si (ampie)", multiplier: 1.30 }
        ]
      },
      {
        id: "smaltimento_rifiuti",
        label: "Smaltimento rifiuti",
        type: "select",
        options: [
          { value: "no", label: "No (già fatto)", multiplier: 1.0 },
          { value: "si", label: "Si (incluso)", multiplier: 1.40 }
        ]
      }
    ]
  }
};

/**
 * Ottiene la lista di tutti i mestieri disponibili
 */
export function getAllTrades() {
  return Object.values(TRADES);
}

/**
 * Ottiene un mestiere specifico per ID
 */
export function getTradeById(id) {
  return TRADES[id];
}

/**
 * Calcola il moltiplicatore totale basato sulle risposte
 */
export function calculateMultiplier(tradeId, answers) {
  const trade = TRADES[tradeId];
  if (!trade) return 1;

  let multiplier = 1;
  
  trade.questions.forEach(question => {
    const answer = answers[question.id];
    if (answer) {
      const option = question.options.find(opt => opt.value === answer);
      if (option && option.multiplier) {
        multiplier *= option.multiplier;
      }
    }
  });

  return multiplier;
}

/**
 * Calcola il prezzo finale con tutti i fattori
 */
export function calculateFinalPrice(tradeId, quantity, region, quality, answers) {
  const trade = TRADES[tradeId];
  if (!trade) return 0;

  const regionalCoeff = REGIONAL_COEFFICIENTS[region] || 1.0;
  const qualityCoeff = QUALITY_MULTIPLIERS[quality] || 1.0;
  const answerMultiplier = calculateMultiplier(tradeId, answers);

  const basePrice = trade.basePrice;
  const finalPrice = basePrice * quantity * regionalCoeff * qualityCoeff * answerMultiplier;

  return Math.round(finalPrice * 100) / 100;
}

/**
 * Calcola il breakdown dei costi (manodopera vs materiali)
 */
export function calculateCostBreakdown(tradeId, finalPrice) {
  const trade = TRADES[tradeId];
  if (!trade || !trade.costBreakdown) {
    return {
      manodopera: finalPrice * 0.6,
      materiali: finalPrice * 0.4
    };
  }

  return {
    manodopera: Math.round(finalPrice * trade.costBreakdown.manodopera * 100) / 100,
    materiali: Math.round(finalPrice * trade.costBreakdown.materiali * 100) / 100
  };
}
