import { describe, it, expect } from 'vitest';
import { judge } from '../lib/verdict';
import { MarketAnalysis } from '../lib/pricing';

describe('Logica di Verdetto', () => {
  const mockMarket: MarketAnalysis = {
    expected: 1000,
    marketMin: 780,
    marketMid: 1000,
    marketMax: 1280,
    pricePerUnit: 100,
    manodopera: 550,
    materiali: 350,
    margine: 100,
  };

  it('restituisce "equo" per un prezzo vicino alla media', () => {
    const result = judge(1050, mockMarket);
    expect(result.key).toBe('equo');
    expect(result.label).toBe('Equo');
  });

  it('restituisce "ottimo" per un prezzo vicino al minimo', () => {
    const result = judge(750, mockMarket);
    expect(result.key).toBe('ottimo');
  });

  it('restituisce "alto" per un prezzo sopra il massimo', () => {
    const result = judge(1400, mockMarket);
    expect(result.key).toBe('alto');
  });

  it('restituisce "troppo-alto" per un prezzo eccessivo', () => {
    const result = judge(2000, mockMarket);
    expect(result.key).toBe('troppo-alto');
  });

  it('restituisce "sospetto" per un prezzo troppo basso', () => {
    const result = judge(500, mockMarket);
    expect(result.key).toBe('sospetto');
  });
});
