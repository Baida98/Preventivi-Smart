import { describe, it, expect } from "vitest";
import {
  formatQuoteNumber,
  extractYearFromNumber,
  extractSequenceFromNumber,
  isValidQuoteNumber,
} from "./quote-numbering";

describe("Quote Numbering", () => {
  describe("formatQuoteNumber", () => {
    it("should format quote number correctly", () => {
      expect(formatQuoteNumber(2026, 1)).toBe("2026-0001");
      expect(formatQuoteNumber(2026, 100)).toBe("2026-0100");
      expect(formatQuoteNumber(2026, 9999)).toBe("2026-9999");
    });

    it("should pad sequence with zeros", () => {
      expect(formatQuoteNumber(2025, 5)).toBe("2025-0005");
      expect(formatQuoteNumber(2025, 42)).toBe("2025-0042");
    });
  });

  describe("extractYearFromNumber", () => {
    it("should extract year correctly", () => {
      expect(extractYearFromNumber("2026-0001")).toBe(2026);
      expect(extractYearFromNumber("2025-9999")).toBe(2025);
    });

    it("should throw on invalid format", () => {
      expect(() => extractYearFromNumber("2026")).toThrow();
      expect(() => extractYearFromNumber("2026-0001-extra")).toThrow();
    });
  });

  describe("extractSequenceFromNumber", () => {
    it("should extract sequence correctly", () => {
      expect(extractSequenceFromNumber("2026-0001")).toBe(1);
      expect(extractSequenceFromNumber("2026-0100")).toBe(100);
      expect(extractSequenceFromNumber("2026-9999")).toBe(9999);
    });

    it("should throw on invalid format", () => {
      expect(() => extractSequenceFromNumber("2026")).toThrow();
      expect(() => extractSequenceFromNumber("2026-0001-extra")).toThrow();
    });
  });

  describe("isValidQuoteNumber", () => {
    it("should validate correct quote numbers", () => {
      expect(isValidQuoteNumber("2026-0001")).toBe(true);
      expect(isValidQuoteNumber("2025-9999")).toBe(true);
      expect(isValidQuoteNumber("2020-0001")).toBe(true);
      expect(isValidQuoteNumber("2100-0001")).toBe(true);
    });

    it("should reject invalid formats", () => {
      expect(isValidQuoteNumber("2026")).toBe(false);
      expect(isValidQuoteNumber("2026-001")).toBe(false);
      expect(isValidQuoteNumber("2026-00001")).toBe(false);
      expect(isValidQuoteNumber("abc-0001")).toBe(false);
      expect(isValidQuoteNumber("2026-abcd")).toBe(false);
    });

    it("should reject invalid years", () => {
      expect(isValidQuoteNumber("2019-0001")).toBe(false);
      expect(isValidQuoteNumber("2101-0001")).toBe(false);
    });

    it("should reject invalid sequences", () => {
      expect(isValidQuoteNumber("2026-0000")).toBe(false);
      expect(isValidQuoteNumber("2026-10000")).toBe(false);
    });
  });
});
