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
 * Mix bilanciato di consigli: 1 Legale Essenziale + 2 Pratici/Tecnici specifici
 */
const SMART_ADVICE: Record<string, string[]> = {
  edilizia: [
    "Legale: La Garanzia Decennale (Art. 1669 C.C.) è obbligatoria per gravi difetti. Verifica sempre il DURC prima di pagare.",
    "Tecnico: Specifica che lo smaltimento macerie deve avere il FIR (Formulario Rifiuti) per evitare sanzioni ambientali.",
    "Pratico: Fai foto a tutti gli impianti (tubi/cavi) prima di coprirli, saranno vitali per future manutenzioni."
  ],
  clima: [
    "Legale: L'installatore deve avere il patentino F-Gas e rilasciare la Dichiarazione di Conformità (DM 37/08).",
    "Tecnico: Assicurati che siano inclusi i supporti antivibranti per l'unità esterna per evitare rumori molesti.",
    "Pratico: Se sostituisci un vecchio clima, pretendi il lavaggio delle tubazioni per non danneggiare il nuovo compressore."
  ],
  infissi: [
    "Legale: Verifica che i valori di trasmittanza (Uw) siano certificati CE per poter accedere alle detrazioni fiscali.",
    "Tecnico: La posa incide per il 50%. Pretendi nastri autoespandenti invece della sola schiuma poliuretanica.",
    "Pratico: Chiedi il kit di manutenzione specifico per il materiale (PVC/Legno) per mantenere le guarnizioni elastiche."
  ],
  fotovoltaico: [
    "Legale: Il preventivo deve includere la gestione della pratica GSE/E-Distribuzione per l'immissione in rete.",
    "Tecnico: In caso di zone d'ombra (camini/alberi), valuta gli ottimizzatori di potenza per ogni singolo pannello.",
    "Pratico: Pretendi un sistema di monitoraggio via App incluso per verificare che la produzione reale sia quella promessa."
  ],
  idraulica: [
    "Legale: Obbligatoria la Certificazione DM 37/08. Verifica che l'idraulico abbia una polizza RC per danni da allagamento.",
    "Tecnico: Installa sempre un filtro defangatore magnetico sotto la caldaia per proteggerla dai fanghi dei termosifoni.",
    "Pratico: Testa la tenuta dell'impianto con una prova a pressione prima di posare piastrelle o coprire le tubazioni."
  ],
  imbiancatura: [
    "Legale: La garanzia per vizi (Art. 1667 C.C.) dura 2 anni. Il preventivo deve indicare marca e linea della pittura.",
    "Tecnico: Una buona pittura richiede preparazione. Verifica se è inclusa rasatura o stuccatura dei fori esistenti.",
    "Pratico: Specifica che la protezione di mobili e pavimenti con teli e nastro carta è interamente a carico della ditta."
  ],
  elettrico: [
    "Legale: Il 'Salvavita' deve essere testato e certificato a norma. Senza Di.Co. l'impianto non è legalmente utilizzabile.",
    "Tecnico: Usa tubi corrugati maggiorati (almeno 25mm) per permettere futuri passaggi di cavi domotici o fibra.",
    "Pratico: Prevedi almeno una presa Schuko in cucina e bagno per gli elettrodomestici, evita gli adattatori pericolosi."
  ]
};

export function judge(price: number, m: MarketAnalysis, categoryId: string = "edilizia", segmento?: string): Verdict {
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

  // SOGLIE SIMMETRICHE FIX #1
  const minThreshold = analysis.marketMin * 0.85; // 15% sotto il minimo
  const maxThreshold = analysis.marketMax * 1.15; // 15% sopra il massimo
  
  let v: VerdictKey;
  let baseConfidence = analysis.confidence;

  if (price < minThreshold) {
    v = "sospetto";
    baseConfidence *= 0.80; // Penalità maggiore per incertezza estrema
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
    ? "⚠️ ATTENZIONE: Questo prezzo è anomalo. Verifica i dati inseriti."
    : undefined;

  const diffPct = (price - analysis.marketMid) / analysis.marketMid;
  const categoryAdvice = SMART_ADVICE[categoryId] || SMART_ADVICE.edilizia;

  const recommendations: Record<VerdictKey, string[]> = {
    ottimo: ["Prezzo competitivo. Verifica la qualità dei materiali.", ...categoryAdvice],
    equo: ["Prezzo corretto e in linea con il mercato attuale.", ...categoryAdvice],
    alto: ["Prezzo sopra la media. Valuta una trattativa del 5-10%.", ...categoryAdvice],
    "troppo-alto": ["Prezzo fuori mercato. Richiedi altri preventivi di confronto.", ...categoryAdvice],
    sospetto: ["Prezzo anomalmente basso. Rischio materiali scadenti o lavoro non a norma.", ...categoryAdvice],
  };

  const labels: Record<VerdictKey, { label: string; short: string; description: string }> = {
    ottimo: {
      label: "Vantaggioso",
      short: "Sotto la media di mercato",
      description: `Il riferimento indica un'offerta economica, circa il ${Math.abs(Math.round(diffPct * 100))}% sotto il benchmark medio.`,
    },
    equo: {
      label: "In Linea",
      short: "Conforme ai benchmark",
      description: `Il valore è pienamente coerente con i prezzi medi regionali (scostamento ${Math.abs(Math.round(diffPct * 100))}%).`,
    },
    alto: {
      label: "Premium",
      short: "Sopra la media regionale",
      description: `Il valore si attesta circa il ${Math.round(diffPct * 100)}% sopra la media: potrebbe includere servizi o materiali superiori.`,
    },
    "troppo-alto": {
      label: "Fuori Range",
      short: "Superiore ai massimi di mercato",
      description: `Il valore supera del ${Math.round(diffPct * 100)}% i benchmark standard: utile approfondire le specifiche tecniche.`,
    },
    sospetto: {
      label: "Da Verificare",
      short: "Anomalmente basso",
      description: `Il valore è del ${Math.abs(Math.round(diffPct * 100))}% sotto la media: consigliata una verifica attenta di ciò che è incluso.`,
    },
  };

  return {
    key: v,
    ...labels[v],
    color: COLORS[v],
    recommendations: recommendations[v].slice(0, 4), // Max 1 verdetto + 3 consigli
    confidence: Math.max(0.5, Math.min(1, baseConfidence)),
    outlierWarning,
  };
}
