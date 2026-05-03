/**
 * Configurazione globale dei parametri di mercato e inflazione.
 * Questi dati dovrebbero essere aggiornati periodicamente in base ai dati ISTAT e CRESME.
 */

export const MARKET_INDICATORS = {
  // Ultimo aggiornamento: Maggio 2026
  lastUpdate: "2026-05-03",
  
  // Indici di inflazione annui (basati su dati ISTAT 2024-2026)
  inflation: {
    "2024": 0.010, // 1.0%
    "2025": 0.015, // 1.5%
    "2026": 0.026, // 2.6% (proiezione Banca d'Italia/OCSE)
  },

  // Indice cumulativo dal 2024 (base del software) ad oggi
  // Calcolato come: (1 + inf2024) * (1 + inf2025) * (1 + inf2026_pro_rata)
  cumulativeInflationFactor: 1.042, // ~4.2% totale di aumento costi stimato

  // Volatilità specifica per settore (moltiplicatore di rischio/incertezza)
  sectorVolatility: {
    edilizia: 1.12,      // Alta volatilità materiali
    imbiancatura: 1.05,  // Stabile, guidata da manodopera
    idraulica: 1.10,     // Volatilità componenti in rame/metallo
    elettrico: 1.08,     // Componentistica elettronica
    climatizzazione: 1.15, // Fortemente influenzata da normative e logistica
    serramenti: 1.20,    // Crisi materie prime (vetro/alluminio)
    pulizie: 1.02,       // Molto stabile
    pavimenti: 1.10,
  }
};

/**
 * Calcola il fattore di inflazione dinamico in base alla data corrente
 */
export function getDynamicInflationFactor(): number {
  const currentYear = new Date().getFullYear();
  if (currentYear <= 2024) return 1.0;
  
  // Logica semplificata per il calcolo cumulativo
  return MARKET_INDICATORS.cumulativeInflationFactor;
}
