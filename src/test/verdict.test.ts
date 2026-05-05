import { describe, it, expect } from 'vitest';
import { judge } from '@/lib/verdict';
import { MarketAnalysis } from '@/lib/pricing';

describe('judge', () => {
  const mockAnalysis: MarketAnalysis = {
    expected: 1000,
    marketMin: 850,
    marketMid: 1000,
    marketMax: 1150,
    confidence: 0.9,
    manodopera: 450,
    materiali: 350,
    margine: 200,
    volatilityClass: 'medium',
    inflationImpact: 0,
    logisticsImpact: 0,
    expiryDate: new Date().toISOString()
  };

  it('identifica un prezzo OTTIMO', () => {
    const result = judge(800, mockAnalysis, 'edilizia');
    expect(result.key).toBe('ottimo');
  });

  it('identifica un prezzo EQUO', () => {
    const result = judge(1000, mockAnalysis, 'edilizia');
    expect(result.key).toBe('equo');
  });

  it('identifica un prezzo ALTO', () => {
    const result = judge(1200, mockAnalysis, 'edilizia');
    expect(result.key).toBe('alto');
  });

  it('identifica un prezzo TROPPO ALTO', () => {
    const result = judge(1500, mockAnalysis, 'edilizia');
    expect(result.key).toBe('troppo-alto');
  });

  it('identifica un prezzo SOSPETTO', () => {
    const result = judge(500, mockAnalysis, 'edilizia');
    expect(result.key).toBe('sospetto');
  });
});
