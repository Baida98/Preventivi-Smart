import { describe, it, expect } from 'vitest';
import { computeMarket, CATEGORIES } from '@/lib/pricing';

describe('computeMarket', () => {
  it('calcola correttamente il prezzo base', () => {
    const job = CATEGORIES[0].jobs[0]; // Muratura generica
    const result = computeMarket(job, 10, {}, 'lombardia');
    
    expect(result.expected).toBeGreaterThan(0);
    expect(result.marketMin).toBeLessThan(result.marketMid);
    expect(result.marketMid).toBeLessThan(result.marketMax);
  });

  it('applica correttamente il moltiplicatore regionale', () => {
    const job = CATEGORIES[0].jobs[0];
    const risultato1 = computeMarket(job, 10, {}, 'lombardia'); // index 1.12
    const risultato2 = computeMarket(job, 10, {}, 'molise');    // index 0.90
    
    expect(risultato1.expected).toBeGreaterThan(risultato2.expected);
  });

  it('applica correttamente i moltiplicatori dei campi extra', () => {
    const job = CATEGORIES[0].jobs[0];
    const resultSemplice = computeMarket(job, 10, { complessita: 'semplice' }, 'lombardia');
    const resultComplessa = computeMarket(job, 10, { complessita: 'complessa' }, 'lombardia');
    
    expect(resultComplessa.expected).toBeGreaterThan(resultSemplice.expected);
  });

  it('gestisce correttamente la quantità', () => {
    const job = CATEGORIES[0].jobs[0];
    const result10 = computeMarket(job, 10, {}, 'lombardia');
    const result20 = computeMarket(job, 20, {}, 'lombardia');
    
    expect(result20.expected).toBe(result10.expected * 2);
  });

  it('calcola correttamente i valori di min/mid/max basati sulla volatilità', () => {
    const job = CATEGORIES[0].jobs[0]; // Edilizia -> high volatility (0.25 spread)
    const result = computeMarket(job, 10, {}, 'lombardia');
    
    // Edilizia ha volatilità 1.15 -> getSectorVolatilityClass('edilizia') torna 'high'
    // calculateMarketAnalysis usa spread 0.25 per 'high'
    const expectedSpread = 0.25;
    expect(result.marketMin).toBeCloseTo(result.marketMid * (1 - expectedSpread));
    expect(result.marketMax).toBeCloseTo(result.marketMid * (1 + expectedSpread));
  });
});
