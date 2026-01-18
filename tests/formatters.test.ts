import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatMonth,
  formatDate,
  abbreviateNumber,
  formatCurrencyShort,
} from "../src/server/services/formatters";

describe("Formatters", () => {
  describe("formatCurrency", () => {
    it("should format small amounts correctly", () => {
      expect(formatCurrency(1000)).toBe("Rp 1.000");
    });

    it("should format medium amounts correctly", () => {
      expect(formatCurrency(1500000)).toBe("Rp 1.500.000");
    });

    it("should format large amounts correctly", () => {
      expect(formatCurrency(1000000000)).toBe("Rp 1.000.000.000");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toBe("Rp 0");
    });

    it("should handle amounts without thousands", () => {
      expect(formatCurrency(500)).toBe("Rp 500");
    });
  });

  describe("formatNumber", () => {
    it("should format numbers with thousand separators", () => {
      expect(formatNumber(10000)).toBe("10.000");
    });

    it("should handle small numbers", () => {
      expect(formatNumber(500)).toBe("500");
    });

    it("should handle large numbers", () => {
      expect(formatNumber(1000000)).toBe("1.000.000");
    });
  });

  describe("formatPercentage", () => {
    it("should format percentage with default decimals", () => {
      expect(formatPercentage(25.5)).toBe("25.5%");
    });

    it("should format percentage with custom decimals", () => {
      expect(formatPercentage(25.567, 2)).toBe("25.57%");
    });

    it("should handle zero", () => {
      expect(formatPercentage(0)).toBe("0.0%");
    });

    it("should handle 100%", () => {
      expect(formatPercentage(100)).toBe("100.0%");
    });
  });

  describe("formatMonth", () => {
    it("should format January correctly", () => {
      expect(formatMonth("2024-01")).toBe("January 2024");
    });

    it("should format December correctly", () => {
      expect(formatMonth("2024-12")).toBe("December 2024");
    });

    it("should handle different years", () => {
      expect(formatMonth("2023-06")).toBe("June 2023");
    });
  });

  describe("formatDate", () => {
    it("should format date correctly", () => {
      expect(formatDate("2024-01-15")).toBe("15 January 2024");
    });

    it("should handle single digit day", () => {
      expect(formatDate("2024-01-05")).toBe("5 January 2024");
    });

    it("should handle end of month", () => {
      expect(formatDate("2024-12-31")).toBe("31 December 2024");
    });
  });

  describe("abbreviateNumber", () => {
    it("should not abbreviate small numbers", () => {
      expect(abbreviateNumber(500)).toBe("500");
    });

    it("should abbreviate thousands with Rb (Ribu)", () => {
      expect(abbreviateNumber(1500)).toBe("1,5 Rb");
    });

    it("should abbreviate millions with Jt (Juta)", () => {
      expect(abbreviateNumber(1500000)).toBe("1,5 Jt");
    });

    it("should abbreviate billions with M (Miliar)", () => {
      expect(abbreviateNumber(1500000000)).toBe("1,5 M");
    });

    it("should remove trailing ,0", () => {
      expect(abbreviateNumber(1000000)).toBe("1 Jt");
    });
  });

  describe("formatCurrencyShort", () => {
    it("should combine Rp prefix with abbreviated number", () => {
      expect(formatCurrencyShort(1500000)).toBe("Rp 1,5 Jt");
    });

    it("should handle small amounts", () => {
      expect(formatCurrencyShort(500)).toBe("Rp 500");
    });

    it("should handle large amounts", () => {
      expect(formatCurrencyShort(1000000000)).toBe("Rp 1 M");
    });
  });
});
