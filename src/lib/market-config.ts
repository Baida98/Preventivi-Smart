/**
 * Configurazione globale dei parametri di mercato, inflazione e logistica.
 * Dati aggiornati al Maggio 2026 basati su indici ISTAT, PricePedia e Prezzari Regionali.
 */

export const MARKET_INDICATORS = {
  lastUpdate: "2026-05-03",
  
  // Indici di inflazione annui
  inflation: {
    "2024": 0.010,
    "2025": 0.015,
    "2026": 0.026, // Proiezione corrente
  },

  cumulativeInflationFactor: 1.042,

  // Volatilità specifica per settore (aggiornata 2026)
  sectorVolatility: {
    edilizia: 1.15,      // Rialzo dovuto a commodity (acciaio/cemento)
    imbiancatura: 1.06,
    idraulica: 1.12,     // Rame e componentistica in rialzo
    elettrico: 1.10,
    climatizzazione: 1.18,
    serramenti: 1.25,    // Alluminio e vetro in forte tensione
    pulizie: 1.03,
    pavimenti: 1.12,
  },

  // Driver Logistici (Micro-Localizzazione)
  logistics: {
    zones: {
      "centro-storico": { label: "Centro Storico / ZTL", multiplier: 1.25, note: "Difficoltà accesso, orari ridotti, permessi" },
      "urbana": { label: "Area Urbana Standard", multiplier: 1.00, note: "Accesso normale" },
      "periferia": { label: "Periferia / Extraurbana", multiplier: 0.95, note: "Facilità parcheggio e scarico" },
      "remota": { label: "Area Remota / Montagna", multiplier: 1.15, note: "Costi trasporto e trasferta" }
    },
    propertyType: {
      "appartamento-piano-alto": { label: "Appartamento Piano Alto (no ascensore)", multiplier: 1.15 },
      "appartamento-standard": { label: "Appartamento Standard", multiplier: 1.00 },
      "villa-indipendente": { label: "Villa / Casa Indipendente", multiplier: 0.90 }, // Più spazio di manovra
      "negozio-ufficio": { label: "Locale Commerciale", multiplier: 1.10 }
    }
  },

  // Validità del preventivo (giorni) in base alla volatilità
  quoteValidityDays: {
    low: 60,
    medium: 30,
    high: 15,
    critical: 7
  }
};

export function getDynamicInflationFactor(): number {
  return MARKET_INDICATORS.cumulativeInflationFactor;
}

/**
 * Determina la classe di volatilità di un settore
 */
export function getSectorVolatilityClass(categoryId: string): 'low' | 'medium' | 'high' | 'critical' {
  const v = MARKET_INDICATORS.sectorVolatility[categoryId as keyof typeof MARKET_INDICATORS.sectorVolatility] || 1.05;
  if (v > 1.20) return 'critical';
  if (v > 1.12) return 'high';
  if (v > 1.07) return 'medium';
  return 'low';
}

/**
 * Calcola la data di scadenza suggerita per il preventivo
 */
export function getQuoteExpiryDate(categoryId: string): Date {
  const vClass = getSectorVolatilityClass(categoryId);
  const days = MARKET_INDICATORS.quoteValidityDays[vClass];
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}
