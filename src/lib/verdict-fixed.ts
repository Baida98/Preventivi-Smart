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
  confidence: number; // 0-1, quanto sei sicuro del verdetto
  outlierWarning?: string; // Warning se è un outlier estremo
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
 * PROBLEMA 1 FIX: Soglie di verdetto ridefinite
 * 
 * Soglie corrette:
 * - SOSPETTO: < min - 20% (prezzo troppo basso per essere vero)
 * - OTTIMO: min - 20% a min (buona offerta, ma ancora entro norma)
 * - EQUO: min a max (prezzo di mercato)
 * - ALTO: max a max + 15% (sopra media, ma non eccessivo)
 * - TROPPO ALTO: > max + 15% (decisamente fuori mercato)
 */
export function judge(price: number, m: MarketAnalysis, regionConfidence: number = 0.85): Verdict {
  // Calcola le soglie
  const minThreshold = m.marketMin * 0.8; // 20% sotto minimo
  const maxThreshold = m.marketMax * 1.15; // 15% sopra massimo

  // Determina il verdetto
  let v: VerdictKey;
  let baseConfidence = regionConfidence;

  if (price < minThreshold) {
    v = "sospetto";
    baseConfidence *= 0.85; // Più conservativo per verdetti estremi
  } else if (price < m.marketMin) {
    v = "ottimo";
  } else if (price <= m.marketMax) {
    v = "equo";
    baseConfidence *= 1.0; // Massima confidenza per verdetti centrali
  } else if (price <= maxThreshold) {
    v = "alto";
  } else {
    v = "troppo-alto";
    baseConfidence *= 0.85; // Più conservativo per verdetti estremi
  }

  // Detecta outliers
  const isOutlier = price < m.marketMin * 0.5 || price > m.marketMax * 2;
  const outlierWarning = isOutlier
    ? "⚠️ ATTENZIONE: Questo prezzo è un outlier estremo. Verifica i dati inseriti."
    : undefined;

  // Genera descrizioni precise
  const description = generateDescription(price, m, v);

  // Raccomandazioni per verdetto
  const recommendations = getRecommendations(v);

  return {
    key: v,
    label: getLabel(v),
    short: getShortLabel(v),
    description,
    color: COLORS[v],
    recommendations,
    confidence: Math.max(0.5, Math.min(1, baseConfidence)),
    outlierWarning,
  };
}

/**
 * Genera descrizioni precise per ogni verdetto
 */
function generateDescription(price: number, m: MarketAnalysis, verdict: VerdictKey): string {
  switch (verdict) {
    case "sospetto": {
      const belowMin = ((m.marketMin - price) / m.marketMin) * 100;
      return `Prezzo ${belowMin.toFixed(0)}% sotto il minimo di mercato (${m.marketMin.toFixed(0)}€). Prezzo troppo basso può indicare lavoro non a norma.`;
    }
    case "ottimo": {
      const belowMin = ((m.marketMin - price) / m.marketMin) * 100;
      return `Prezzo ${belowMin.toFixed(0)}% sotto il minimo, buona offerta. Verifica però che la qualità sia garantita.`;
    }
    case "equo": {
      const fromMin = ((price - m.marketMin) / m.marketMin) * 100;
      const fromMax = ((m.marketMax - price) / (m.marketMax - m.marketMin)) * 100;
      return `Prezzo ${fromMin.toFixed(0)}% sopra il minimo, ${fromMax.toFixed(0)}% sotto il massimo. In linea con il mercato della tua regione.`;
    }
    case "alto": {
      const aboveMax = ((price - m.marketMax) / m.marketMax) * 100;
      return `Prezzo ${aboveMax.toFixed(0)}% sopra il massimo. Sopra la media, ma non eccessivo. C'è margine di trattativa.`;
    }
    case "troppo-alto": {
      const aboveMax = ((price - m.marketMax) / m.marketMax) * 100;
      return `Prezzo ${aboveMax.toFixed(0)}% sopra il massimo. Significativamente alto rispetto al mercato. Non firmare senza confronti.`;
    }
  }
}

/**
 * Ritorna il label completo del verdetto
 */
function getLabel(verdict: VerdictKey): string {
  const labels: Record<VerdictKey, string> = {
    ottimo: "Ottimo",
    equo: "Equo",
    alto: "Alto",
    "troppo-alto": "Troppo alto",
    sospetto: "Sospetto",
  };
  return labels[verdict];
}

/**
 * Ritorna il label breve del verdetto
 */
function getShortLabel(verdict: VerdictKey): string {
  const labels: Record<VerdictKey, string> = {
    ottimo: "Sotto la media di mercato",
    equo: "In linea col mercato",
    alto: "Sopra la media, trattabile",
    "troppo-alto": "Significativamente sopra il mercato",
    sospetto: "Anomalmente basso",
  };
  return labels[verdict];
}

/**
 * PROBLEMA 8 FIX: Raccomandazioni generiche per verdetto
 * (Le raccomandazioni per categoria verranno aggiunte in un secondo momento)
 */
function getRecommendations(verdict: VerdictKey): string[] {
  const recommendations: Record<VerdictKey, string[]> = {
    ottimo: [
      "Il prezzo è sotto la media di mercato. Verifica però che il preventivo sia dettagliato voce per voce.",
      "Chiedi conferma scritta su materiali, marche e tempi di consegna.",
      "Assicurati che l'IVA, il sopralluogo e lo smaltimento siano inclusi.",
      "Richiedi il documento DURC e la certificazione del professionista.",
    ],
    equo: [
      "Il prezzo è in linea con il mercato della tua regione: puoi procedere con tranquillità.",
      "Chiedi comunque almeno un secondo preventivo per confronto.",
      "Verifica garanzia sui lavori (minimo 2 anni per legge) e tempi.",
      "Inserisci nel contratto penali per ritardo e modalità di pagamento a stato avanzamento.",
    ],
    alto: [
      "Il prezzo è sopra la media: c'è margine di trattativa del 10–15%.",
      "Chiedi al professionista di dettagliare ogni singola voce per individuare gli scostamenti.",
      "Richiedi 2 preventivi alternativi per confronto diretto.",
      "Verifica se il prezzo è giustificato da materiali premium o tempistiche brevi.",
    ],
    "troppo-alto": [
      "Il prezzo è significativamente sopra il mercato: non firmare prima di altri preventivi.",
      "Richiedi obbligatoriamente 2–3 preventivi alternativi nella stessa regione.",
      "Chiedi al professionista la giustificazione voce per voce dello scostamento.",
      "Diffida di urgenze artificiali e sconti immediati condizionati alla firma in giornata.",
    ],
    sospetto: [
      "Il prezzo è anomalmente basso: spesso indica materiali scadenti o lavori non a norma.",
      "Verifica P.IVA, iscrizione CCIAA e abilitazioni del professionista.",
      "Chiedi capitolato dettagliato e marche dei materiali per iscritto.",
      "Diffida di pagamenti totalmente in nero o richieste di acconti elevati.",
      "Pretendi sempre fattura, garanzia e — per impianti — la certificazione di conformità.",
    ],
  };
  return recommendations[verdict];
}
