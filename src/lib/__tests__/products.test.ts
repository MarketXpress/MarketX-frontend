import { describe, it, expect, vi } from "vitest";
import {
  toNumber,
  mapProduct,
  getProducts,
  getProductById,
  getFlashSaleProducts,
  searchProducts,
  getProductsByIds,
  type ProductRow,
} from "../products";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("src/lib/products.ts", () => {
  describe("toNumber", () => {
    it("converts strings and numbers reliably and falls back on NaN", () => {
      expect(toNumber(10.5)).toBe(10.5);
      expect(toNumber("10.5")).toBe(10.5);
      expect(toNumber("0")).toBe(0);
      expect(toNumber(null)).toBe(0);
      expect(toNumber(undefined)).toBe(0);
      expect(toNumber("not-a-number", 15)).toBe(15);
      expect(toNumber("", 99)).toBe(99);
      expect(toNumber(" ", 42)).toBe(42);
    });
  });

  describe("mapProduct", () => {
    const fullRow: ProductRow = {
      id: "prod-100",
      name: "Handcrafted Leather Wallet",
      description: "Full grain leather",
      usd_price: "45.00",
      original_usd_price: "60.00",
      xlm_price: "218.25",
      discount_percent: 25,
      badge: "flash",
      rating: "4.9",
      review_count: 88,
      seller_id: "seller-99",
      categories: { name: "Accessories" },
      profiles: {
        display_name: "Leathercraft Studio",
        seller_rating: "4.95",
        seller_sales: 320,
      },
      product_images: [
        { url: "https://example.com/wallet-2.jpg", position: 2 },
        { url: "https://example.com/wallet-0.jpg", position: 0 },
        { url: "https://example.com/wallet-1.jpg", position: 1 },
      ],
    };

    it("maps all fields correctly and sorts images by position ascending", () => {
      const product = mapProduct(fullRow);
      expect(product.id).toBe("prod-100");
      expect(product.name).toBe("Handcrafted Leather Wallet");
      expect(product.usdPrice).toBe(45);
      expect(product.originalUsdPrice).toBe(60);
      expect(product.xlmPrice).toBe(218.25);
      expect(product.discountPercent).toBe(25);
      expect(product.badge).toBe("flash");
      expect(product.rating).toBe(4.9);
      expect(product.reviewCount).toBe(88);
      expect(product.category).toBe("Accessories");
      expect(product.seller).toBe("Leathercraft Studio");
      expect(product.sellerId).toBe("seller-99");
      expect(product.description).toBe("Full grain leather");
      expect(product.sellerRating).toBe(4.95);
      expect(product.sellerSales).toBe(320);
      expect(product.images).toEqual([
        "https://example.com/wallet-0.jpg",
        "https://example.com/wallet-1.jpg",
        "https://example.com/wallet-2.jpg",
      ]);
    });

    it("when original_usd_price is null, reports current usdPrice rather than 0", () => {
      const rowNoDiscount: ProductRow = {
        ...fullRow,
        usd_price: "50.00",
        original_usd_price: null,
      };
      const product = mapProduct(rowNoDiscount);
      // Ensures the UI does not render 'was $0' and instead treats it as regular price
      expect(product.usdPrice).toBe(50);
      expect(product.originalUsdPrice).toBe(50);
    });

    it("handles null relations and optional fields with fallbacks", () => {
      const minimalRow: ProductRow = {
        id: "prod-200",
        name: "Simple Item",
        description: null,
        usd_price: "10.00",
        original_usd_price: null,
        xlm_price: "48.50",
        discount_percent: null,
        badge: null,
        rating: null,
        review_count: null,
        seller_id: "seller-1",
        categories: null,
        profiles: null,
        product_images: null,
      };
      const product = mapProduct(minimalRow);
      expect(product.category).toBe("Uncategorized");
      expect(product.seller).toBe("Unknown seller");
      expect(product.sellerRating).toBe(0);
      expect(product.sellerSales).toBe(0);
      expect(product.badge).toBeUndefined();
      expect(product.description).toBeUndefined();
      expect(product.images).toEqual([]);
      expect(product.discountPercent).toBe(0);
      expect(product.rating).toBe(0);
      expect(product.reviewCount).toBe(0);
    });
  });

  describe("Supabase query functions (mocked client)", () => {
    it("getProducts selects active products ordered by created_at desc", async () => {
      const mockRows = [
        {
          id: "p1",
          name: "Item 1",
          usd_price: "10",
          original_usd_price: null,
          xlm_price: "48.5",
          discount_percent: 0,
          badge: null,
          rating: 5,
          review_count: 1,
          seller_id: "s1",
          categories: { name: "Books" },
          profiles: { display_name: "Seller 1", seller_rating: 5, seller_sales: 10 },
          product_images: [],
        },
      ];
      const order = vi.fn().mockResolvedValue({ data: mockRows, error: null });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });
      const supabase = { from } as unknown as SupabaseClient;

      const products = await getProducts(supabase);
      expect(from).toHaveBeenCalledWith("products");
      expect(eq).toHaveBeenCalledWith("status", "active");
      expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(products.length).toBe(1);
      expect(products[0].id).toBe("p1");
    });

    it("getProductById retrieves a single active product by id", async () => {
      const mockRow = {
        id: "p1",
        name: "Item 1",
        usd_price: "10",
        original_usd_price: null,
        xlm_price: "48.5",
        discount_percent: 0,
        badge: null,
        rating: 5,
        review_count: 1,
        seller_id: "s1",
        categories: { name: "Books" },
        profiles: { display_name: "Seller 1", seller_rating: 5, seller_sales: 10 },
        product_images: [],
      };
      const maybeSingle = vi.fn().mockResolvedValue({ data: mockRow, error: null });
      const eqStatus = vi.fn().mockReturnValue({ maybeSingle });
      const eqId = vi.fn().mockReturnValue({ eq: eqStatus });
      const select = vi.fn().mockReturnValue({ eq: eqId });
      const from = vi.fn().mockReturnValue({ select });
      const supabase = { from } as unknown as SupabaseClient;

      const product = await getProductById(supabase, "p1");
      expect(from).toHaveBeenCalledWith("products");
      expect(eqId).toHaveBeenCalledWith("id", "p1");
      expect(eqStatus).toHaveBeenCalledWith("status", "active");
      expect(product?.id).toBe("p1");

      maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      const missing = await getProductById(supabase, "missing");
      expect(missing).toBeNull();
    });

    it("getFlashSaleProducts retrieves flash sale active products with limit", async () => {
      const mockRows: ProductRow[] = [];
      const limitFn = vi.fn().mockResolvedValue({ data: mockRows, error: null });
      const order = vi.fn().mockReturnValue({ limit: limitFn });
      const eqBadge = vi.fn().mockReturnValue({ order });
      const eqStatus = vi.fn().mockReturnValue({ eq: eqBadge });
      const select = vi.fn().mockReturnValue({ eq: eqStatus });
      const from = vi.fn().mockReturnValue({ select });
      const supabase = { from } as unknown as SupabaseClient;

      await getFlashSaleProducts(supabase, 3);
      expect(from).toHaveBeenCalledWith("products");
      expect(eqStatus).toHaveBeenCalledWith("status", "active");
      expect(eqBadge).toHaveBeenCalledWith("badge", "flash");
      expect(order).toHaveBeenCalledWith("discount_percent", { ascending: false });
      expect(limitFn).toHaveBeenCalledWith(3);
    });

    it("searchProducts cleans special characters and uses or filter", async () => {
      const mockRows: ProductRow[] = [];
      const order = vi.fn().mockResolvedValue({ data: mockRows, error: null });
      const or = vi.fn().mockReturnValue({ order });
      const eq = vi.fn().mockReturnValue({ or });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });
      const supabase = { from } as unknown as SupabaseClient;

      await searchProducts(supabase, "leather, (wallet)");
      expect(from).toHaveBeenCalledWith("products");
      expect(eq).toHaveBeenCalledWith("status", "active");
      // Special characters like , and () should be sanitized to avoid PostgREST parsing corruption
      expect(or).toHaveBeenCalledWith("name.ilike.%leather   wallet%,description.ilike.%leather   wallet%");
    });

    it("getProductsByIds preserves requested ID order and handles empty array", async () => {
      const mockRows = [
        {
          id: "p2",
          name: "Item 2",
          usd_price: "20",
          original_usd_price: null,
          xlm_price: "97",
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
          id: "p1",
          name: "Item 1",
          usd_price: "10",
          original_usd_price: null,
          xlm_price: "48.5",
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

      const eq = vi.fn().mockResolvedValue({ data: mockRows, error: null });
      const inFn = vi.fn().mockReturnValue({ eq });
      const select = vi.fn().mockReturnValue({ in: inFn });
      const from = vi.fn().mockReturnValue({ select });
      const supabase = { from } as unknown as SupabaseClient;

      // Empty list should return immediately without query
      const emptyResult = await getProductsByIds(supabase, []);
      expect(emptyResult).toEqual([]);
      expect(from).not.toHaveBeenCalled();

      // Querying with order ['p1', 'p2'] should sort output to ['p1', 'p2'] even if DB returns ['p2', 'p1']
      const orderedResult = await getProductsByIds(supabase, ["p1", "p2"]);
      expect(orderedResult.map((p) => p.id)).toEqual(["p1", "p2"]);
    });
  });
});
