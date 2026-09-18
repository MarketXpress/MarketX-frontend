import { describe, expect, it } from "vitest";
import { formatUsd, formatXlm, usdToXlm, XLM_PER_USD } from "./money";

describe("money", () => {
  describe("XLM_PER_USD", () => {
    it("is set to 4.85", () => {
      expect(XLM_PER_USD).toBe(4.85);
    });
  });

  describe("usdToXlm", () => {
    it("converts whole dollar amounts accurately", () => {
      expect(usdToXlm(1)).toBe(4.85);
      expect(usdToXlm(10)).toBe(48.5);
      expect(usdToXlm(100)).toBe(485);
    });

    it("handles zero dollars", () => {
      expect(usdToXlm(0)).toBe(0);
    });

    it("rounds to 7 decimal places without float precision drift on fractional values like 0.1", () => {
      expect(usdToXlm(0.1)).toBe(0.485);
      expect(usdToXlm(0.01)).toBe(0.0485);
      expect(usdToXlm(0.001)).toBe(0.00485);
    });

    it("accurately rounds values requiring max 7 decimal places", () => {
      const converted = usdToXlm(0.1234567);
      const decimalPlaces = converted.toString().split(".")[1]?.length ?? 0;
      expect(decimalPlaces).toBeLessThanOrEqual(7);
      expect(converted).toBe(Math.round(0.1234567 * 4.85 * 1e7) / 1e7);
    });

    it("handles large dollar figures safely", () => {
      expect(usdToXlm(1_000_000)).toBe(4_850_000);
    });
  });

  describe("formatUsd", () => {
    it("formats 0 dollars", () => {
      expect(formatUsd(0)).toBe("$0.00");
    });

    it("formats standard amounts with two decimal places", () => {
      expect(formatUsd(25)).toBe("$25.00");
      expect(formatUsd(19.99)).toBe("$19.99");
    });

    it("formats fractional cents by rounding to 2 digits", () => {
      expect(formatUsd(0.004)).toBe("$0.00");
      expect(formatUsd(0.006)).toBe("$0.01");
      expect(formatUsd(10.555)).toBe("$10.56");
    });

    it("formats large numbers with commas", () => {
      expect(formatUsd(1000)).toBe("$1,000.00");
      expect(formatUsd(1234567.89)).toBe("$1,234,567.89");
    });
  });

  describe("formatXlm", () => {
    it("formats 0 XLM", () => {
      expect(formatXlm(0)).toBe("0 XLM");
    });

    it("formats whole and fractional XLM", () => {
      expect(formatXlm(4.85)).toBe("4.85 XLM");
      expect(formatXlm(100)).toBe("100 XLM");
    });

    it("formats large numbers with commas and suffix", () => {
      expect(formatXlm(1000)).toBe("1,000 XLM");
      expect(formatXlm(1000000)).toBe("1,000,000 XLM");
    });

    it("rounds fractional parts to maximum 2 digits for display", () => {
      expect(formatXlm(4.854)).toBe("4.85 XLM");
      expect(formatXlm(4.856)).toBe("4.86 XLM");
    });
  });
});
