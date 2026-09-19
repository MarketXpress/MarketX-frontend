import { describe, it, expect } from "vitest";
import { editListingSchema } from "../validations/listing";

describe("editListingSchema", () => {
  const validData = {
    name: "Valid Listing Name",
    description: "This is a detailed description of the listing exceeding thirty characters easily.",
    categoryId: "123e4567-e89b-12d3-a456-426614174000",
    usdPrice: 150.0,
    originalUsdPrice: 200.0,
  };

  it("accepts valid input with originalUsdPrice > usdPrice", () => {
    const result = editListingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("accepts valid input with originalUsdPrice as null or undefined", () => {
    const result1 = editListingSchema.safeParse({ ...validData, originalUsdPrice: null });
    expect(result1.success).toBe(true);

    const result2 = editListingSchema.safeParse({
      name: validData.name,
      description: validData.description,
      categoryId: validData.categoryId,
      usdPrice: validData.usdPrice,
    });
    expect(result2.success).toBe(true);
  });

  it("rejects originalUsdPrice lower than or equal to usdPrice", () => {
    const result = editListingSchema.safeParse({
      ...validData,
      usdPrice: 200.0,
      originalUsdPrice: 150.0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("higher than the asking price");
    }
  });

  it("rejects short name or short description", () => {
    const resultName = editListingSchema.safeParse({ ...validData, name: "ab" });
    expect(resultName.success).toBe(false);

    const resultDesc = editListingSchema.safeParse({ ...validData, description: "too short" });
    expect(resultDesc.success).toBe(false);
  });

  it("rejects non-uuid categoryId", () => {
    const result = editListingSchema.safeParse({ ...validData, categoryId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});
