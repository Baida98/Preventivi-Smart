export type Verdict = 'Sospetto' | 'Ottimo' | 'Equo' | 'Alto' | 'Troppo Alto';
export type VerdictKey = Verdict; // alias richiesto

export interface VerdictResult {
  verdict: Verdict;
  recommendation: string;
  confidence: number;
  color: string;
}

export function calculateVerdict(
  askedPrice: number,
  marketMin: number,
  marketMax: number,
  region?: string
): VerdictResult {
  if (askedPrice <= 0 || marketMin <= 0) {
    return {
      verdict: 'Sospetto',
      recommendation: 'Dati non validi. Verifica i valori inseriti.',
      confidence: 1,
      color: 'red'
    };
  }

  const mid = (marketMin + marketMax) / 2;
  if (askedPrice < marketMin * 0.78) {
    return {
      verdict: 'Sospetto',
      recommendation: 'Prezzo anomalmente basso. Verifica materiali e ore dichiarate.',
      confidence: 0.95,
      color: 'orange'
    };
  }
  if (askedPrice <= marketMin) {
    return {
      verdict: 'Ottimo',
      recommendation: 'Ottimo affare! Prezzo sotto la media di mercato.',
      confidence: 0.92,
      color: 'green'
    };
  }
  if (askedPrice <= marketMax * 0.95) {
    return {
      verdict: 'Equo',
      recommendation: 'Nella media di mercato regionale.',
      confidence: 0.88,
      color: 'emerald'
    };
  }
  if (askedPrice <= marketMax * 1.15) {
    return {
      verdict: 'Alto',
      recommendation: 'Leggermente sopra la media. Valuta la qualità.',
      confidence: 0.85,
      color: 'amber'
    };
  }
  return {
    verdict: 'Troppo Alto',
    recommendation: 'Chiedi dettaglio delle singole voci di costo.',
    confidence: 0.93,
    color: 'red'
  };
}

// ⭐ ESPORTA LA FUNZIONE judge (usata nei test e Wizard)
export const judge = calculateVerdict;

export function validateVerdictInput(data: any): string[] {
  const errors: string[] = [];
  if (!data.askedPrice) errors.push("Prezzo richiesto mancante");
  if (!data.marketMin || !data.marketMax) errors.push("Range di mercato mancante");
  return errors;
}


export const judge = calculateVerdict;
export type VerdictKey = Verdict;
