import { describe, it, expect } from "vitest";
import { judge } from "./verdict";
import type { MarketAnalysis } from "./pricing";

describe("Verdict - Problemi Critici Corretti", () => {
  const mockMarketAnalysis: MarketAnalysis = {
    expected: 1000,
    marketMin: 780,
    marketMid: 1000,
    marketMax: 1280,
    pricePerUnit: 100,
    manodopera: 550,
    materiali: 350,
    margine: 100,
    confidence: 0.9,
    inflationImpact: 0.05,
    logisticsImpact: 0.02,
    expiryDate: new Date("2024-12-31"),
    volatilityClass: "low",
  };

  describe("PROBLEMA 1: Soglie di verdetto senza gap", () => {
    it("covers all price ranges without gaps", () => {
      const testPrices = [0, 100, 500, 624, 625, 650, 780, 900, 1000, 1280, 1400, 1500, 9999];

      testPrices.forEach((price) => {
        const verdict = judge(price, mockMarketAnalysis);
        expect(verdict).toBeDefined();
        expect(["sospetto", "ottimo", "equo", "alto", "troppo-alto"]).toContain(
          verdict.key
        );
      });
    });
  });
});
