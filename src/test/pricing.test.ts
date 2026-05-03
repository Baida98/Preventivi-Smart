import { describe, it, expect } from 'vitest';
import { computeMarket, CATEGORIES } from '../lib/pricing';
import { getDynamicInflationFactor } from '../lib/market-config';

describe('Logica di Pricing', () => {
  const inflation = getDynamicInflationFactor(); // ~1.042

  it('calcola correttamente il prezzo base per la muratura in Lombardia con inflazione', () => {
    const job = CATEGORIES[0].jobs[0]; // Muratura generica, base 45
    const regionId = 'lombardia'; // Moltiplicatore 1.25
    const quantity = 10;
    const fieldValues = { complessita: 'semplice', smaltimento: 'no' };

    const result = computeMarket(job, regionId, quantity, fieldValues);

    // 45 (base) * 1.042 (inflazione) * 1.0 (semplice) * 1.0 (no smaltimento) * 10 (qty) * 1.25 (lombardia) = 586.125
    const expected = 45 * inflation * 1.0 * 1.0 * 10 * 1.25;
    expect(result.expected).toBeCloseTo(expected);
    expect(result.marketMin).toBeLessThan(result.expected);
    expect(result.marketMax).toBeGreaterThan(result.expected);
    expect(result.inflationImpact).toBeGreaterThan(0);
  });

  it('applica correttamente i moltiplicatori dei campi extra e inflazione', () => {
    const job = CATEGORIES[0].jobs[0]; // Muratura generica, base 45
    const regionId = 'marche'; // Moltiplicatore 0.98
    const quantity = 1;
    const fieldValues = { complessita: 'media', smaltimento: 'si' };

    const result = computeMarket(job, regionId, quantity, fieldValues);

    // 45 * 1.042 (inflazione) * 1.18 (media) * 1.15 (smaltimento) * 1 * 0.98 (marche) = 62.326...
    const expected = 45 * inflation * 1.18 * 1.15 * 1 * 0.98;
    expect(result.expected).toBeCloseTo(expected, 1);
  });
});
