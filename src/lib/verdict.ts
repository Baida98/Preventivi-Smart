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

export function judge(price: number, m: MarketAnalysis): Verdict {
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
    ? "⚠️ NOTA: Il prezzo indicato si discosta molto dalle medie statistiche. Verifica i dati."
    : undefined;

  const diffPct = (price - m.marketMid) / m.marketMid;

  const recommendations: Record<VerdictKey, string[]> = {
    ottimo: [
      "Il prezzo è molto competitivo rispetto alla media. Verifica che il capitolato sia completo.",
      "Chiedi conferma sui materiali proposti e sulle tempistiche di esecuzione.",
      "Assicurati che oneri accessori e smaltimento siano inclusi nell'offerta.",
      "Richiedi la documentazione tecnica e le certificazioni necessarie.",
    ],
    equo: [
      "Il prezzo è perfettamente in linea con i valori medi di mercato della tua regione.",
      "Puoi procedere con fiducia, valutando la professionalità e le referenze del fornitore.",
      "Verifica le condizioni di garanzia sui lavori e le modalità di pagamento.",
      "Definisci chiaramente i tempi di inizio e fine lavori nel contratto.",
    ],
    alto: [
      "Il prezzo è superiore alla media statistica: valuta se giustificato da materiali premium.",
      "Chiedi al professionista di illustrare i punti di forza della sua offerta specifica.",
      "Puoi richiedere un secondo preventivo per avere un termine di paragone aggiuntivo.",
      "Verifica se sono inclusi servizi extra o garanzie estese che giustificano il valore.",
    ],
    "troppo-alto": [
      "Il prezzo si posiziona nella fascia alta del mercato: approfondisci le motivazioni.",
      "Ti consigliamo di richiedere altri preventivi per confrontare diverse soluzioni tecniche.",
      "Analizza con il professionista le voci di costo per individuare eventuali ottimizzazioni.",
      "Valuta se l'urgenza o la complessità del lavoro giustificano lo scostamento.",
    ],
    sospetto: [
      "Il prezzo è sensibilmente basso: verifica con attenzione la qualità di materiali e manodopera.",
      "Assicurati che il professionista operi nel pieno rispetto delle norme di sicurezza e previdenziali.",
      "Chiedi un elenco dettagliato dei materiali e delle marche che verranno utilizzate.",
      "Diffida di offerte eccessivamente ribassate che potrebbero nascondere costi imprevisti.",
      "Richiedi sempre fattura e certificazioni di conformità per gli impianti realizzati.",
    ],
  };

  const labels: Record<VerdictKey, { label: string; short: string; description: string }> = {
    ottimo: {
      label: "Competitivo",
      short: "Sotto la media di mercato",
      description: `Il preventivo è inferiore alla media locale di circa il ${Math.abs(Math.round(diffPct * 100))}%. Un'ottima proposta economica.`,
    },
    equo: {
      label: "In Linea",
      short: "Prezzo medio di mercato",
      description: `Il preventivo rispecchia i prezzi medi della regione (scostamento del ${Math.abs(Math.round(diffPct * 100))}%). Valore equilibrato.`,
    },
    alto: {
      label: "Fascia Alta",
      short: "Sopra la media statistica",
      description: `Il preventivo è del ${Math.round(diffPct * 100)}% sopra la media. Valuta se i servizi inclusi giustificano il costo.`,
    },
    "troppo-alto": {
      label: "Fuori Fascia",
      short: "Significativamente sopra la media",
      description: `Il preventivo è del ${Math.round(diffPct * 100)}% sopra il mercato. Consigliato un confronto tecnico.`,
    },
    sospetto: {
      label: "Da Verificare",
      short: "Anomalmente basso",
      description: `Il preventivo è del ${Math.abs(Math.round(diffPct * 100))}% sotto la media: verifica con cura capitolato e certificazioni.`,
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
