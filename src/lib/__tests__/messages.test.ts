import { describe, it, expect } from "vitest";
import {
  containsHandoverCode,
  containsContactInfo,
  HANDOVER_CODE_ERROR,
} from "../messages";

describe("In-app Messaging Security & Validation", () => {
  describe("Handover Code Protection", () => {
    it("blocks standard 6-digit codes", () => {
      expect(containsHandoverCode("123456")).toBe(true);
      expect(containsHandoverCode("My code is 482910")).toBe(true);
      expect(containsHandoverCode("Here: 000123")).toBe(true);
    });

    it("blocks 6-digit codes with spaces", () => {
      expect(containsHandoverCode("1 2 3 4 5 6")).toBe(true);
      expect(containsHandoverCode("code: 9 8 7 6 5 4")).toBe(true);
    });

    it("blocks 6-digit codes with dashes or dots", () => {
      expect(containsHandoverCode("12-34-56")).toBe(true);
      expect(containsHandoverCode("1-2-3-4-5-6")).toBe(true);
      expect(containsHandoverCode("123.456")).toBe(true);
      expect(containsHandoverCode("1.2.3.4.5.6")).toBe(true);
    });

    it("allows non-6-digit numbers", () => {
      expect(containsHandoverCode("The price is $150")).toBe(false);
      expect(containsHandoverCode("Call me at 12345")).toBe(false);
      expect(containsHandoverCode("Order 12345678")).toBe(false);
      expect(containsHandoverCode("Is this still available for $20?")).toBe(false);
    });
  });

  describe("Off-platform Contact Info Detection", () => {
    it("detects email addresses", () => {
      expect(containsContactInfo("Email me at buyer@example.com")).toBe(true);
      expect(containsContactInfo("reach me at seller.direct@domain.org")).toBe(true);
    });

    it("detects phone numbers", () => {
      expect(containsContactInfo("Call me on +1-555-123-4567")).toBe(true);
      expect(containsContactInfo("Number: 555-432-1098")).toBe(true);
      expect(containsContactInfo("(555) 123-4567")).toBe(true);
    });

    it("detects chat handles and URLs", () => {
      expect(containsContactInfo("Message me on t.me/seller123")).toBe(true);
      expect(containsContactInfo("WhatsApp me at wa.me/15551234567")).toBe(true);
      expect(containsContactInfo("Ping me @telegramhandle")).toBe(true);
    });

    it("allows normal discussion of product details and meeting locations", () => {
      expect(containsContactInfo("Can we meet at the Central Station coffee shop at 4 PM?")).toBe(false);
      expect(containsContactInfo("Does this jacket have any stains or tears?")).toBe(false);
      expect(containsContactInfo("I can ship it via DHL tomorrow morning.")).toBe(false);
    });
  });
});
