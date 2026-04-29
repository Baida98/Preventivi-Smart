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
  const diffPct = (price - m.marketMid) / m.marketMid;
  let v: VerdictKey;
  if (price < m.marketMin * 0.85) v = "sospetto";
  else if (price <= m.marketMin) v = "ottimo";
  else if (price <= m.marketMax) v = "equo";
  else if (price <= m.marketMax * 1.2) v = "alto";
  else v = "troppo-alto";

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
  };
}
