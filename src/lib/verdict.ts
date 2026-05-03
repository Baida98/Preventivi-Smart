import type { MarketAnalysis } from "./pricing";
import { applyModelTuning } from "./model-tuner";

export type VerdictKey = "ottimo" | "equo" | "alto" | "troppo-alto" | "sospetto";

export type Verdict = {
  key: VerdictKey;
  label: string;
  short: string;
  description: string;
  /** tailwind class for the verdict color (text + bg accents) */
  color: {
    text: string;
    border: string;
    bg: string;
    chartHsl: string;
    glow: string;
  };
  recommendations: string[];
  confidence: number;
  outlierWarning?: string;
};

const COLORS: Record<VerdictKey, Verdict["color"]> = {
  ottimo: {
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    chartHsl: "168 76% 48%",
    glow: "shadow-[0_0_60px_-10px_rgba(16,185,129,0.45)]",
  },
  equo: {
    text: "text-sky-300",
    border: "border-sky-500/40",
    bg: "bg-sky-500/10",
    chartHsl: "200 95% 60%",
    glow: "shadow-[0_0_60px_-10px_rgba(56,189,248,0.45)]",
  },
  alto: {
    text: "text-amber-300",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    chartHsl: "38 92% 60%",
    glow: "shadow-[0_0_60px_-10px_rgba(251,191,36,0.45)]",
  },
  "troppo-alto": {
    text: "text-rose-300",
    border: "border-rose-500/40",
    bg: "bg-rose-500/10",
    chartHsl: "0 75% 60%",
    glow: "shadow-[0_0_60px_-10px_rgba(244,63,94,0.45)]",
  },
  sospetto: {
    text: "text-violet-300",
    border: "border-violet-500/40",
    bg: "bg-violet-500/10",
    chartHsl: "270 70% 65%",
    glow: "shadow-[0_0_60px_-10px_rgba(167,139,250,0.45)]",
  },
};

/**
 * Mix bilanciato di consigli legali (max 2) e pratici/tecnici (2-3) per categoria
 */
const SMART_ADVICE: Record<string, string[]> = {
  edilizia: [
    "Tutela Legale: Garanzia Decennale (Art. 1669 C.C.) obbligatoria per gravi difetti costruttivi.",
    "Controllo DURC: Verifica sempre la regolarità contributiva dell'impresa prima di versare acconti.",
    "Consiglio Tecnico: In caso di demolizioni, specifica nel contratto che lo smaltimento deve avvenire in discarica autorizzata con relativo FIR (Formulario Identificazione Rifiuti).",
    "Pratica di Cantiere: Fai foto a ogni impianto (tubi, cavi) prima di chiudere le tracce o posare il massetto, ti serviranno per future manutenzioni."
  ],
  clima: [
    "Obbligo F-Gas: L'installatore deve avere il patentino F-Gas, altrimenti la garanzia del produttore decade e rischi sanzioni.",
    "Dichiarazione di Conformità: Senza questo documento l'impianto non è a norma e non puoi accedere alle detrazioni.",
    "Consiglio Tecnico: Assicurati che l'unità esterna sia montata su supporti antivibranti di qualità per evitare rumori molesti ai vicini.",
    "Efficienza: Richiedi il lavaggio delle tubazioni se stai sostituendo un vecchio condizionatore, per evitare che residui d'olio danneggino il nuovo compressore."
  ],
  infissi: [
    "Tutela Legale: Verifica che i valori di trasmittanza termica (Uw) siano certificati per accedere all'Ecobonus.",
    "Marcatura CE: Obbligatoria. Se manca, l'infisso non può essere venduto né installato legalmente.",
    "Consiglio Tecnico: La posa in opera incide per il 50% sull'isolamento. Pretendi l'uso di nastri autoespandenti invece della sola schiuma poliuretanica.",
    "Manutenzione: Chiedi al fornitore il kit di pulizia specifico per il materiale scelto (PVC, Legno o Alluminio) per mantenere le guarnizioni elastiche nel tempo."
  ],
  fotovoltaico: [
    "Garanzia Rendimento: Verifica che sia garantito almeno l'80% della potenza dopo 25 anni.",
    "Connessione Rete: Il preventivo deve includere la gestione della pratica GSE/E-Distribuzione per l'immissione in rete.",
    "Consiglio Tecnico: Se il tetto è parzialmente ombreggiato (camini, alberi), valuta l'uso di ottimizzatori di potenza per ogni singolo pannello.",
    "Monitoraggio: Pretendi un sistema di monitoraggio via App incluso, per controllare in tempo reale se l'impianto sta producendo quanto promesso."
  ],
  idraulica: [
    "Certificazione DM 37/08: Obbligatoria per ogni modifica all'impianto. È l'unico documento che certifica la sicurezza della tua casa.",
    "Responsabilità Civile: Verifica che l'idraulico abbia una polizza RC per danni da allagamento accidentale durante i lavori.",
    "Consiglio Tecnico: Richiedi sempre l'installazione di un filtro defangatore magnetico sotto la caldaia per proteggerla dai residui metallici dei termosifoni.",
    "Pressione: Chiedi di testare la tenuta dell'impianto con una prova a pressione prima di coprire le tubazioni con le piastrelle."
  ],
  imbiancatura: [
    "Tutela Legale: La garanzia per vizi e difetti (Art. 1667 C.C.) dura 2 anni dalla consegna del lavoro.",
    "Trasparenza: Il preventivo deve indicare chiaramente marca e linea della pittura (es. lavabile, traspirante, smalto).",
    "Consiglio Tecnico: Una buona pittura richiede muri preparati bene. Verifica se è inclusa la stuccatura e la carteggiatura dei buchi.",
    "Pratica: Specifica che la protezione di mobili, infissi e pavimenti con teli e nastro carta è a carico dell'imbianchino."
  ],
  elettrico: [
    "Sicurezza: Il 'Salvavita' (interruttore differenziale) deve essere testato e certificato a norma DM 37/08.",
    "Messa a Terra: È vitale. Assicurati che il professionista misuri l'efficienza del dispersore di terra.",
    "Consiglio Tecnico: Fai installare tubi corrugati di diametro maggiore (almeno 25-32mm) per permettere futuri passaggi di cavi domotici o fibra ottica.",
    "Flessibilità: Prevedi almeno una presa Schuko in cucina e in bagno per gli elettrodomestici moderni, evita l'uso di adattatori pericolosi."
  ]
};

export function judge(price: number, m: MarketAnalysis, categoryId: string = "edilizia", segmento?: string): Verdict {
  // Applica il self-tuning del modello se disponibile
  let analysis = m;
  if (segmento) {
    const tuning = applyModelTuning(m, segmento);
    if (tuning.tuning_applied) {
      analysis = {
        ...m,
        marketMid: tuning.adjusted_price,
        marketMin: tuning.adjusted_min,
        marketMax: tuning.adjusted_max,
        confidence: tuning.adjusted_confidence,
      };
    }
  }

  const minThreshold = analysis.marketMin * 0.8;
  const maxThreshold = analysis.marketMax * 1.15;
  
  let v: VerdictKey;
  let baseConfidence = analysis.confidence;

  if (price < minThreshold) {
    v = "sospetto";
    baseConfidence *= 0.85;
  } else if (price < analysis.marketMin) {
    v = "ottimo";
  } else if (price <= analysis.marketMax) {
    v = "equo";
  } else if (price <= maxThreshold) {
    v = "alto";
  } else {
    v = "troppo-alto";
    baseConfidence *= 0.85;
  }

  const isOutlier = price < analysis.marketMin * 0.5 || price > analysis.marketMax * 2;
  const outlierWarning = isOutlier
    ? "⚠️ ATTENZIONE: Questo prezzo è un outlier estremo. Verifica i dati inseriti."
    : undefined;

  const diffPct = (price - analysis.marketMid) / analysis.marketMid;

  // Mix di consigli bilanciati
  const categoryAdvice = SMART_ADVICE[categoryId] || SMART_ADVICE.edilizia;

  const recommendations: Record<VerdictKey, string[]> = {
    ottimo: [
      "Il prezzo è molto competitivo. Verifica che non manchino voci importanti nel computo.",
      ...categoryAdvice
    ],
    equo: [
      "Il prezzo è corretto per il mercato attuale. Puoi procedere con fiducia.",
      ...categoryAdvice
    ],
    alto: [
      "Il prezzo è sopra la media regionale. C'è margine per una trattativa del 5-10%.",
      ...categoryAdvice
    ],
    "troppo-alto": [
      "Prezzo fuori mercato. Richiedi altri due preventivi prima di decidere.",
      ...categoryAdvice
    ],
    sospetto: [
      "Prezzo pericolosamente basso. C'è il rischio di materiali scadenti o lavoro 'al nero'.",
      ...categoryAdvice
    ],
  };

  const labels: Record<VerdictKey, { label: string; short: string; description: string }> = {
    ottimo: {
      label: "Ottimo",
      short: "Sotto la media di mercato",
      description: `Il preventivo è inferiore al minimo del mercato locale di circa ${Math.abs(Math.round(diffPct * 100))}%. Un'occasione, se la qualità è garantita.`,
    },
    equo: {
      label: "Equo",
      short: "In linea col mercato",
      description: `Il preventivo è in linea con i prezzi medi della regione (scostamento del ${Math.abs(Math.round(diffPct * 100))}%). Puoi procedere.`,
    },
    alto: {
      label: "Alto",
      short: "Sopra la media, trattabile",
      description: `Il preventivo è del ${Math.round(diffPct * 100)}% sopra la media. C'è margine di trattativa.`,
    },
    "troppo-alto": {
      label: "Troppo alto",
      short: "Significativamente sopra il mercato",
      description: `Il preventivo è del ${Math.round(diffPct * 100)}% sopra il mercato. Non firmare senza confronti.`,
    },
    sospetto: {
      label: "Sospetto",
      short: "Anomalmente basso",
      description: `Il preventivo è del ${Math.abs(Math.round(diffPct * 100))}% sotto la media: prezzo troppo basso può indicare lavoro non a norma.`,
    },
  };

  return {
    key: v,
    ...labels[v],
    color: COLORS[v],
    recommendations: recommendations[v],
    confidence: Math.max(0.5, Math.min(1, baseConfidence)),
    outlierWarning,
  };
}
