import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getFlashSaleProducts,
  getProductById,
  getProducts,
  getProductsByIds,
  searchProducts,
} from "./products";

describe("products data layer", () => {
  describe("mapProduct mappings & toNumber handling via getProducts", () => {
    it("handles numeric fields as strings (from PostgREST) and maps properly", async () => {
      const mockRows = [
        {
          id: "prod-1",
          name: "Item 1",
          description: "Description 1",
          usd_price: "49.99",
          original_usd_price: "99.99",
          xlm_price: "242.4515",
          discount_percent: 50,
          badge: "flash" as const,
          rating: "4.8",
          review_count: 12,
          seller_id: "seller-1",
          categories: { name: "Digital Art" },
          profiles: {
            display_name: "Alice",
            seller_rating: "4.9",
            seller_sales: 100,
          },
          product_images: [
            { url: "https://example.com/2.jpg", position: 1 },
            { url: "https://example.com/1.jpg", position: 0 },
          ],
        },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const products = await getProducts(mockSupabase);
      expect(products).toHaveLength(1);
      const product = products[0];

      expect(product.id).toBe("prod-1");
      expect(product.name).toBe("Item 1");
      expect(product.usdPrice).toBe(49.99);
      expect(product.originalUsdPrice).toBe(99.99);
      expect(product.xlmPrice).toBe(242.4515);
      expect(product.discountPercent).toBe(50);
      expect(product.rating).toBe(4.8);
      expect(product.reviewCount).toBe(12);
      expect(product.category).toBe("Digital Art");
      expect(product.seller).toBe("Alice");
      expect(product.sellerId).toBe("seller-1");
      expect(product.sellerRating).toBe(4.9);
      expect(product.sellerSales).toBe(100);
      expect(product.badge).toBe("flash");
      // Images must be sorted by position
      expect(product.images).toEqual([
        "https://example.com/1.jpg",
        "https://example.com/2.jpg",
      ]);
    });

    it("when original_usd_price is null, reports current usdPrice (no discount rather than 'was $0')", async () => {
      const mockRows = [
        {
          id: "prod-2",
          name: "Item No Discount",
          description: null,
          usd_price: "25.00",
          original_usd_price: null,
          xlm_price: "121.25",
          discount_percent: null,
          badge: null,
          rating: null,
          review_count: null,
          seller_id: "seller-2",
          categories: null,
          profiles: null,
          product_images: null,
        },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const products = await getProducts(mockSupabase);
      expect(products[0].originalUsdPrice).toBe(25.0);
      expect(products[0].discountPercent).toBe(0);
      expect(products[0].category).toBe("Uncategorized");
      expect(products[0].seller).toBe("Unknown seller");
      expect(products[0].images).toEqual([]);
      expect(products[0].sellerRating).toBe(0);
      expect(products[0].sellerSales).toBe(0);
    });

    it("toNumber falls back on malformed or non-finite string numbers", async () => {
      const mockRows = [
        {
          id: "prod-3",
          name: "Malformed",
          description: null,
          usd_price: "not-a-number",
          original_usd_price: "also-bad",
          xlm_price: "invalid",
          discount_percent: null,
          badge: null,
          rating: "bad-rating",
          review_count: null,
          seller_id: "seller-3",
          categories: null,
          profiles: {
            display_name: null,
            seller_rating: "nan",
            seller_sales: null,
          },
          product_images: null,
        },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const products = await getProducts(mockSupabase);
      expect(products[0].usdPrice).toBe(0);
      expect(products[0].originalUsdPrice).toBe(0);
      expect(products[0].xlmPrice).toBe(0);
      expect(products[0].rating).toBe(0);
      expect(products[0].sellerRating).toBe(0);
    });

    it("throws error when Supabase query fails", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: new Error("DB error"),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      await expect(getProducts(mockSupabase)).rejects.toThrow("DB error");
    });
  });

  describe("getProductById", () => {
    it("returns product when found", async () => {
      const row = {
        id: "prod-1",
        name: "Single Item",
        description: "Desc",
        usd_price: 30,
        original_usd_price: 30,
        xlm_price: 145.5,
        discount_percent: 0,
        badge: null,
        rating: 5,
        review_count: 1,
        seller_id: "seller-1",
        categories: { name: "Tools" },
        profiles: {
          display_name: "Bob",
          seller_rating: 5,
          seller_sales: 10,
        },
        product_images: [],
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await getProductById(mockSupabase, "prod-1");
      expect(result?.id).toBe("prod-1");
      expect(result?.name).toBe("Single Item");
    });

    it("returns null when product does not exist", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await getProductById(mockSupabase, "non-existent");
      expect(result).toBeNull();
    });
  });

  describe("getFlashSaleProducts", () => {
    it("fetches flash sale products with limit", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const results = await getFlashSaleProducts(mockSupabase, 3);
      expect(results).toEqual([]);
    });
  });

  describe("searchProducts", () => {
    it("cleans special punctuation that could corrupt PostgREST or-clauses", async () => {
      let orClause = "";
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              or: vi.fn().mockImplementation((filter: string) => {
                orClause = filter;
                return {
                  order: vi.fn().mockResolvedValue({ data: [], error: null }),
                };
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      await searchProducts(mockSupabase, "art, modern (blue)");
      // commas and parentheses replaced with spaces and trimmed
      expect(orClause).toContain("art  modern  blue");
    });
  });

  describe("getProductsByIds", () => {
    it("returns empty array for empty id list without querying Supabase", async () => {
      const mockSupabase = {
        from: vi.fn(),
      } as unknown as SupabaseClient;

      const result = await getProductsByIds(mockSupabase, []);
      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("preserves the requested id order regardless of DB row order", async () => {
      const rows = [
        {
          id: "id-b",
          name: "Item B",
          usd_price: 20,
          original_usd_price: null,
          xlm_price: 97,
          discount_percent: 0,
          badge: null,
          rating: 4,
          review_count: 2,
          seller_id: "s1",
          categories: null,
          profiles: null,
          product_images: [],
        },
        {
          id: "id-a",
          name: "Item A",
          usd_price: 10,
          original_usd_price: null,
          xlm_price: 48.5,
          discount_percent: 0,
          badge: null,
          rating: 5,
          review_count: 1,
          seller_id: "s1",
          categories: null,
          profiles: null,
          product_images: [],
        },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: rows, error: null }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await getProductsByIds(mockSupabase, ["id-a", "id-b"]);
      expect(result.map((p) => p.id)).toEqual(["id-a", "id-b"]);
    });
  });
});
