import { describe, it, expect } from 'vitest';
import { computeMarket, CATEGORIES } from '../lib/pricing';

describe('Logica di Pricing', () => {
  it('calcola correttamente il prezzo base per la muratura in Lombardia', () => {
    const job = CATEGORIES[0].jobs[0]; // Muratura generica, base 45
    const regionId = 'lombardia'; // Moltiplicatore 1.18
    const quantity = 10;
    const fieldValues = { complessita: 'semplice', smaltimento: 'no' };

    const result = computeMarket(job, regionId, quantity, fieldValues);

    // 45 (base) * 1 (extras) * 10 (qty) * 1.18 (regMul) = 531
    expect(result.expected).toBeCloseTo(531);
    expect(result.marketMin).toBeLessThan(result.expected);
    expect(result.marketMax).toBeGreaterThan(result.expected);
  });

  it('applica correttamente i moltiplicatori dei campi extra', () => {
    const job = CATEGORIES[0].jobs[0]; // Muratura generica, base 45
    const regionId = 'marche'; // Moltiplicatore 1.0
    const quantity = 1;
    // Complessità media (+0.18) + Smaltimento (+0.15) = 1.33
    const fieldValues = { complessita: 'media', smaltimento: 'si' };

    const result = computeMarket(job, regionId, quantity, fieldValues);

    // 45 * 1.33 * 1 * 1.0 = 59.85
    expect(result.expected).toBeCloseTo(59.85);
  });
});
