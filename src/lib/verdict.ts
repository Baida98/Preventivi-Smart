import type { MarketAnalysis } from "./pricing";

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
    glow: "shadow-[0_0_60_px_-10px_rgba(251,191,36,0.45)]",
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
 * Garanzie legali specifiche per categoria di lavoro
 */
const LEGAL_WARRANTIES: Record<string, string[]> = {
  edilizia: [
    "Garanzia Decennale (Art. 1669 C.C.): Copre gravi difetti costruttivi o rovina dell'opera per 10 anni.",
    "Garanzia Biennale (Art. 1667 C.C.): Copre difetti minori o non conformità per 2 anni dalla consegna.",
    "Obbligo DURC: Verifica che l'impresa sia in regola con i contributi INPS/INAIL."
  ],
  impianti: [
    "Certificazione di Conformità (DM 37/08): Obbligatoria per legge per impianti elettrici, idraulici e gas.",
    "Garanzia Prodotto: Minimo 2 anni sui componenti (caldaie, condizionatori, inverter).",
    "Responsabilità Civile: Assicurati che l'installatore abbia una polizza RC per danni a terzi."
  ],
  imbiancatura: [
    "Garanzia Biennale (Art. 1667 C.C.): Copre vizi e difetti di esecuzione per 2 anni.",
    "Scheda Tecnica: Hai diritto a conoscere marca e tipo di pittura usata per future manutenzioni.",
    "Pulizia e Ripristino: Il preventivo deve specificare la protezione di mobili e pavimenti."
  ],
  carpenteria: [
    "Certificazione Energetica: Per gli infissi, necessaria per le detrazioni fiscali (Ecobonus).",
    "Garanzia 10 anni su installazione: Molti produttori offrono estensioni sulla posa in opera.",
    "Marcatura CE: Obbligatoria per tutti i serramenti e porte esterne."
  ],
  finiture: [
    "Garanzia Biennale (Art. 1667 C.C.): Copre difetti di posa o materiali per 24 mesi.",
    "Certificazione Materiali: Verifica la classe di resistenza o tossicità (es. formaldeide nel parquet)."
  ],
  pavimenti: [
    "Garanzia Biennale (Art. 1667 C.C.): Copre difetti di posa o materiali per 24 mesi.",
    "Certificazione Materiali: Verifica la classe di resistenza o tossicità (es. formaldeide nel parquet)."
  ]
};

export function judge(price: number, m: MarketAnalysis, categoryId: string = "edilizia"): Verdict {
  const minThreshold = m.marketMin * 0.8;
  const maxThreshold = m.marketMax * 1.15;
  
  let v: VerdictKey;
  let baseConfidence = m.confidence;

  if (price < minThreshold) {
    v = "sospetto";
    baseConfidence *= 0.85;
  } else if (price < m.marketMin) {
    v = "ottimo";
  } else if (price <= m.marketMax) {
    v = "equo";
  } else if (price <= maxThreshold) {
    v = "alto";
  } else {
    v = "troppo-alto";
    baseConfidence *= 0.85;
  }

  const isOutlier = price < m.marketMin * 0.5 || price > m.marketMax * 2;
  const outlierWarning = isOutlier
    ? "⚠️ ATTENZIONE: Questo prezzo è un outlier estremo. Verifica i dati inseriti."
    : undefined;

  const diffPct = (price - m.marketMid) / m.marketMid;

  // Garanzie legali specifiche
  const warranties = LEGAL_WARRANTIES[categoryId] || LEGAL_WARRANTIES.edilizia;

  const recommendations: Record<VerdictKey, string[]> = {
    ottimo: [
      "Il prezzo è sotto la media. Verifica che il preventivo sia dettagliato voce per voce.",
      ...warranties.slice(0, 2),
      "Richiedi il documento DURC e la certificazione del professionista."
    ],
    equo: [
      "Il prezzo è in linea con il mercato: puoi procedere con tranquillità.",
      ...warranties.slice(0, 2),
      "Inserisci nel contratto penali per ritardo e modalità di pagamento a SAL."
    ],
    alto: [
      "Il prezzo è sopra la media: c'è margine di trattativa del 10–15%.",
      ...warranties.slice(0, 2),
      "Chiedi al professionista di dettagliare ogni singola voce per individuare gli scostamenti."
    ],
    "troppo-alto": [
      "Prezzo significativamente sopra il mercato: non firmare senza confronti.",
      ...warranties.slice(0, 2),
      "Chiedi la giustificazione voce per voce dello scostamento."
    ],
    sospetto: [
      "Prezzo anomalmente basso: verifica qualità materiali e conformità normative.",
      ...warranties,
      "Pretendi sempre fattura, garanzia e certificazione di conformità."
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
