import { describe, it, expect } from "vitest";
import { XLM_PER_USD, usdToXlm, formatUsd, formatXlm } from "../money";

describe("src/lib/money.ts", () => {
  describe("usdToXlm", () => {
    it("converts USD to XLM at the fixed display rate of 4.85", () => {
      expect(XLM_PER_USD).toBe(4.85);
      expect(usdToXlm(1)).toBe(4.85);
      expect(usdToXlm(2)).toBe(9.7);
      expect(usdToXlm(100)).toBe(485);
    });

    it("handles zero gracefully", () => {
      expect(usdToXlm(0)).toBe(0);
    });

    it("rounds to 7 decimal places and avoids floating-point drift on values like 0.1", () => {
      // 0.1 * 4.85 in IEEE 754 float is 0.48500000000000004
      const xlm = usdToXlm(0.1);
      expect(xlm).toBe(0.485);
      expect(xlm.toString()).toBe("0.485");
    });

    it("accurately handles fractional cents and small amounts", () => {
      // 0.01 * 4.85 = 0.0485
      expect(usdToXlm(0.01)).toBe(0.0485);
      // 0.001 * 4.85 = 0.00485
      expect(usdToXlm(0.001)).toBe(0.00485);
      // 0.0000001 (1 stroop USD) * 4.85 = 0.0000005
      expect(usdToXlm(0.0000001)).toBe(0.0000005);
    });

    it("handles large amounts without truncation", () => {
      expect(usdToXlm(1_000_000)).toBe(4_850_000);
    });
  });

  describe("formatUsd", () => {
    it("formats zero as $0.00", () => {
      expect(formatUsd(0)).toBe("$0.00");
    });

    it("formats whole and decimal dollar amounts", () => {
      expect(formatUsd(19.99)).toBe("$19.99");
      expect(formatUsd(25)).toBe("$25.00");
    });

    it("formats large values with comma thousand separators", () => {
      expect(formatUsd(1234567.89)).toBe("$1,234,567.89");
    });

    it("formats fractional cents by rounding to 2 decimal places", () => {
      expect(formatUsd(0.004)).toBe("$0.00");
      expect(formatUsd(0.006)).toBe("$0.01");
      expect(formatUsd(10.556)).toBe("$10.56");
    });
  });

  describe("formatXlm", () => {
    it("formats zero as 0 XLM", () => {
      expect(formatXlm(0)).toBe("0 XLM");
    });

    it("formats numbers with standard decimal representation and XLM suffix", () => {
      expect(formatXlm(4.85)).toBe("4.85 XLM");
      expect(formatXlm(100)).toBe("100 XLM");
    });

    it("formats large amounts with thousands separators", () => {
      expect(formatXlm(1000)).toBe("1,000 XLM");
      expect(formatXlm(1234567.89)).toBe("1,234,567.89 XLM");
    });

    it("limits fractional display to at most 2 fraction digits", () => {
      expect(formatXlm(0.485)).toBe("0.49 XLM");
      expect(formatXlm(12.3456)).toBe("12.35 XLM");
    });
  });
});
