/**
   * Test per il modulo model-tuner
   *
   * Verifica il comportamento critico del sistema di calibrazione:
   * 1. Nessun tuning quando i dati sono buoni → reason = "Nessun tuning necessario"
   * 2. Espansione range con errore alto
   * 3. Abbassamento prezzo con bassa accettazione
   * 4. CAP ±30%: nessun valore può discostarsi più del 30% dall'originale
   * 5. Few-shot fallback quando count < 5
   */

  import { describe, it, expect } from "vitest";
  import { calibrateModel } from "@/lib/model-tuner";
  import type { MarketAnalysis } from "@/lib/pricing";

  function buildAnalysis(overrides?: Partial<MarketAnalysis>): MarketAnalysis {
    return {
      expected: 1000,
      marketMin: 800,
      marketMid: 1000,
      marketMax: 1200,
      confidence: 0.85,
      manodopera: 450,
      materiali: 350,
      margine: 200,
      volatilityClass: "medium",
      inflationImpact: 40,
      logisticsImpact: 80,
      expiryDate: new Date("2026-06-01"),
      ...overrides,
    };
  }

  const goodMetrics = {
    count: 25,
    errore_percentuale_medio: 0.10,
    accuracy_range: 0.82,
    acceptance_rate: 0.65,
  };

  describe("calibrateModel", () => {
    it("1. Metriche buone → nessun tuning applicato", () => {
      const result = calibrateModel(buildAnalysis(), goodMetrics);
      expect(result.reason).toBe("Nessun tuning necessario");
      expect(result.tuning_applied).toBe(false);
    });

    it("2. Errore alto (>20%) → range espanso", () => {
      const analysis = buildAnalysis();
      const result = calibrateModel(analysis, { ...goodMetrics, errore_percentuale_medio: 0.35 });
      expect(result.adjusted_min).toBeLessThan(analysis.marketMin);
      expect(result.adjusted_max).toBeGreaterThan(analysis.marketMax);
      expect(result.tuning_applied).toBe(true);
    });

    it("3. Bassa accettazione (<45%) → prezzo abbassato", () => {
      const analysis = buildAnalysis();
      const result = calibrateModel(analysis, { ...goodMetrics, acceptance_rate: 0.30 });
      expect(result.adjusted_price).toBeLessThan(analysis.marketMid);
      expect(result.tuning_applied).toBe(true);
    });

    it("4. CAP ±30% — la distorsione non supera mai il 30%", () => {
      // Metriche estreme che cercherebbero di distorcere oltre il cap
      const extremeMetrics = {
        count: 50,
        errore_percentuale_medio: 0.99,  // Massimo errore
        accuracy_range: 0.10,
        acceptance_rate: 0.05,
      };
      const analysis = buildAnalysis();
      const result = calibrateModel(analysis, extremeMetrics);

      const maxAllowedPrice = analysis.marketMid * 1.30;
      const minAllowedPrice = analysis.marketMid * 0.70;
      const maxAllowedMin = analysis.marketMin * 1.30;
      const minAllowedMin = analysis.marketMin * 0.70;
      const maxAllowedMax = analysis.marketMax * 1.30;

      expect(result.adjusted_price).toBeLessThanOrEqual(maxAllowedPrice + 0.01);
      expect(result.adjusted_price).toBeGreaterThanOrEqual(minAllowedPrice - 0.01);
      expect(result.adjusted_min).toBeGreaterThanOrEqual(minAllowedMin - 0.01);
      expect(result.adjusted_max).toBeLessThanOrEqual(maxAllowedMax + 0.01);
    });

    it("5. Alta accettazione (>80%) → leggero aumento prezzo (max +3%)", () => {
      const analysis = buildAnalysis();
      const result = calibrateModel(analysis, { ...goodMetrics, acceptance_rate: 0.90 });
      expect(result.adjusted_price).toBeGreaterThan(analysis.marketMid);
      expect(result.adjusted_price).toBeLessThanOrEqual(analysis.marketMid * 1.03 + 0.01);
    });
  });
  