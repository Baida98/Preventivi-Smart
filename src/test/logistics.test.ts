import { describe, it, expect } from 'vitest';
import { computeMarket, CATEGORIES } from '../lib/pricing';
import { MARKET_INDICATORS } from '../lib/market-config';

describe('Logica Logistica e Scadenza', () => {
  it('applica correttamente il moltiplicatore centro storico e piano alto', () => {
    const job = CATEGORIES[0].jobs[0]; // Muratura
    const regionId = 'lombardia';
    const quantity = 10;
    const fieldValues = { complessita: 'semplice', smaltimento: 'no' };
    
    // Centro storico (1.25) * Piano alto (1.15) = 1.4375
    const logisticsData = { 
      zoneId: 'centro-storico', 
      propertyTypeId: 'appartamento-piano-alto' 
    };

    const result = computeMarket(job, regionId, quantity, fieldValues, logisticsData);
    
    const baseExpected = 45 * MARKET_INDICATORS.cumulativeInflationFactor * 10 * 1.25;
    const expectedWithLogistics = baseExpected * 1.25 * 1.15;
    
    expect(result.expected).toBeCloseTo(expectedWithLogistics, 1);
    expect(result.logisticsImpact).toBeGreaterThan(0);
  });

  it('genera una data di scadenza valida e una classe di volatilità', () => {
    const job = CATEGORIES[0].jobs[0];
    const result = computeMarket(job, 'lazio', 1, {});
    
    expect(result.expiryDate).toBeInstanceOf(Date);
    expect(result.expiryDate.getTime()).toBeGreaterThan(Date.now());
    expect(['low', 'medium', 'high', 'critical']).toContain(result.volatilityClass);
  });
});
