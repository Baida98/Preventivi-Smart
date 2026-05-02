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

    it("classifies prices at exact thresholds correctly", () => {
      // minThreshold = 780 * 0.8 = 624
      expect(judge(623, mockMarketAnalysis).key).toBe("sospetto");
      expect(judge(624, mockMarketAnalysis).key).not.toBe("sospetto"); // 624 è il limite, non sospetto
      expect(judge(625, mockMarketAnalysis).key).not.toBe("sospetto");

      // Tra 624 e 780 dovrebbe essere ottimo
      expect(judge(700, mockMarketAnalysis).key).toBe("ottimo");
      expect(judge(780, mockMarketAnalysis).key).toBe("equo"); // Esattamente al minimo

      // Tra 780 e 1280 dovrebbe essere equo
      expect(judge(1000, mockMarketAnalysis).key).toBe("equo");
      expect(judge(1280, mockMarketAnalysis).key).toBe("equo"); // Esattamente al massimo

      // maxThreshold = 1280 * 1.15 = 1472
      expect(judge(1281, mockMarketAnalysis).key).toBe("alto");
      expect(judge(1472, mockMarketAnalysis).key).toBe("alto");
      expect(judge(1473, mockMarketAnalysis).key).toBe("troppo-alto");
    });

    it("has no gaps between verdicts", () => {
      // Verifica che non ci siano prezzi senza verdetto
      for (let price = 0; price <= 2000; price += 10) {
        const verdict = judge(price, mockMarketAnalysis);
        expect(verdict.key).toBeDefined();
      }
    });
  });

  describe("PROBLEMA 7: Descrizioni precise", () => {
    it("generates accurate descriptions for sospetto", () => {
      const verdict = judge(500, mockMarketAnalysis);
      expect(verdict.key).toBe("sospetto");
      expect(verdict.description).toContain("sotto la media");
    });

    it("generates accurate descriptions for ottimo", () => {
      const verdict = judge(750, mockMarketAnalysis);
      expect(verdict.key).toBe("ottimo");
      expect(verdict.description).toContain("inferiore al minimo");
    });

    it("generates accurate descriptions for equo", () => {
      const verdict = judge(1000, mockMarketAnalysis);
      expect(verdict.key).toBe("equo");
      expect(verdict.description).toContain("in linea");
    });

    it("generates accurate descriptions for alto", () => {
      const verdict = judge(1350, mockMarketAnalysis);
      expect(verdict.key).toBe("alto");
      expect(verdict.description).toContain("sopra la media");
    });

    it("generates accurate descriptions for troppo-alto", () => {
      const verdict = judge(2000, mockMarketAnalysis);
      expect(verdict.key).toBe("troppo-alto");
      expect(verdict.description).toContain("sopra il mercato");
    });
  });

  describe("PROBLEMA 9: Outlier detection", () => {
    it("detects extreme low outliers", () => {
      const verdict = judge(100, mockMarketAnalysis); // < min * 0.5
      expect(verdict.outlierWarning).toBeDefined();
      expect(verdict.outlierWarning).toContain("outlier");
    });

    it("detects extreme high outliers", () => {
      const verdict = judge(2600, mockMarketAnalysis); // > max * 2
      expect(verdict.outlierWarning).toBeDefined();
      expect(verdict.outlierWarning).toContain("outlier");
    });

    it("does not flag normal prices as outliers", () => {
      const verdict = judge(1000, mockMarketAnalysis);
      expect(verdict.outlierWarning).toBeUndefined();
    });
  });

  describe("PROBLEMA 10: Confidence score", () => {
    it("returns confidence score between 0 and 1", () => {
      const prices = [100, 500, 750, 1000, 1500, 2000];
      prices.forEach((price) => {
        const verdict = judge(price, mockMarketAnalysis);
        expect(verdict.confidence).toBeGreaterThanOrEqual(0.5);
        expect(verdict.confidence).toBeLessThanOrEqual(1);
      });
    });

    it("has lower confidence for extreme verdicts", () => {
      const sospettoConfidence = judge(100, mockMarketAnalysis).confidence;
      const equoConfidence = judge(1000, mockMarketAnalysis).confidence;
      expect(sospettoConfidence).toBeLessThan(equoConfidence);
    });

    it("returns a confidence score based on region data", () => {
      const verdict = judge(1000, mockMarketAnalysis);
      expect(verdict.confidence).toBeGreaterThanOrEqual(0.5);
      expect(verdict.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe("Recommendations", () => {
    it("provides appropriate recommendations for each verdict", () => {
      const verdicts = ["sospetto", "ottimo", "equo", "alto", "troppo-alto"] as const;

      verdicts.forEach((verdictKey) => {
        const verdict = judge(
          verdictKey === "sospetto" ? 100 : verdictKey === "ottimo" ? 750 : verdictKey === "equo" ? 1000 : verdictKey === "alto" ? 1350 : 2000,
          mockMarketAnalysis
        );
        expect(verdict.recommendations).toBeDefined();
        expect(Array.isArray(verdict.recommendations)).toBe(true);
        expect(verdict.recommendations.length).toBeGreaterThan(0);
      });
    });
  });
});
