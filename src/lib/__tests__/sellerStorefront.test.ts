import { describe, it, expect, vi } from "vitest";
import { getSellerStorefrontData } from "../listings";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Seller Storefront queries", () => {
  it("calculates active category breakdown and returns paginated, sorted listings", async () => {
    const mockActiveRows = [
      { category_id: "cat-1", categories: { id: "cat-1", name: "Electronics" } },
      { category_id: "cat-1", categories: { id: "cat-1", name: "Electronics" } },
      { category_id: "cat-2", categories: { id: "cat-2", name: "Books" } },
    ];

    const mockListingRows = [
      {
        id: "p1",
        name: "Laptop",
        description: "Great condition",
        usd_price: "999.00",
        original_usd_price: "1200.00",
        discount_percent: 17,
        status: "active",
        category_id: "cat-1",
        rating: "4.8",
        review_count: 10,
        created_at: "2026-09-01T00:00:00Z",
        categories: { name: "Electronics" },
        product_images: [{ url: "https://example.com/p1.jpg", position: 0 }],
      },
      {
        id: "p2",
        name: "Novel",
        description: "Sci-Fi classic",
        usd_price: "15.00",
        original_usd_price: null,
        discount_percent: 0,
        status: "active",
        category_id: "cat-2",
        rating: "5.0",
        review_count: 2,
        created_at: "2026-09-02T00:00:00Z",
        categories: { name: "Books" },
        product_images: [],
      },
    ];

    const rangeMock = vi.fn().mockResolvedValue({
      data: mockListingRows,
      count: 2,
      error: null,
    });

    const builder: Record<string, unknown> = {};
    builder.eq = vi.fn().mockReturnValue(builder);
    builder.or = vi.fn().mockReturnValue(builder);
    builder.order = vi.fn().mockReturnValue(builder);
    builder.range = rangeMock;

    let selectCount = 0;
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "products") {
          return {
            select: vi.fn(() => {
              selectCount++;
              if (selectCount === 1) {
                // Category aggregation query
                return {
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                      data: mockActiveRows,
                      error: null,
                    }),
                  }),
                };
              }
              // Storefront listings query
              return builder;
            }),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    const result = await getSellerStorefrontData(mockSupabase, {
      sellerId: "seller-123",
      sortBy: "newest",
      page: 1,
      pageSize: 12,
    });

    expect(result.totalActive).toBe(3);
    expect(result.totalMatching).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.categories).toEqual([
      { id: "cat-2", name: "Books", count: 1 },
      { id: "cat-1", name: "Electronics", count: 2 },
    ]);
    expect(result.listings).toHaveLength(2);
    expect(result.listings[0].name).toBe("Laptop");
    expect(result.listings[0].usdPrice).toBe(999);
    expect(result.listings[0].categoryName).toBe("Electronics");
    expect(result.listings[1].name).toBe("Novel");
    expect(result.listings[1].usdPrice).toBe(15);
  });
});
