import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createListing,
  deleteListing,
  getCategories,
  getListingForEdit,
  getPayoutAddress,
  getSellerActiveListings,
  getSellerListings,
  getSellerProfile,
  isValidStellarAddress,
  setListingStatus,
  setPayoutAddress,
  STELLAR_ADDRESS_PATTERN,
  updateListing,
} from "./listings";

describe("listings data layer", () => {
  describe("isValidStellarAddress & STELLAR_ADDRESS_PATTERN", () => {
    it("accepts a valid 56-character Stellar G... address", () => {
      const validKey = "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF";
      expect(isValidStellarAddress(validKey)).toBe(true);
      expect(STELLAR_ADDRESS_PATTERN.test(validKey)).toBe(true);
    });

    it("rejects an address with only 55 characters", () => {
      const shortKey = "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IH";
      expect(isValidStellarAddress(shortKey)).toBe(false);
    });

    it("rejects an address with 57 characters", () => {
      const longKey = "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHFA";
      expect(isValidStellarAddress(longKey)).toBe(false);
    });

    it("rejects lowercase addresses", () => {
      const lowerKey = "gc5u46is25kyfknhdxehr3ktqb3dvibm4nw5bh4mvue2g77stcjp4ihf";
      expect(isValidStellarAddress(lowerKey)).toBe(false);
    });

    it("rejects non-base32 digits (0, 1, 8, 9)", () => {
      // Base32 in Stellar only permits A-Z and 2-7
      const withZero = "G05U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF";
      const withOne = "G15U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF";
      const withEight = "G85U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF";
      const withNine = "G95U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF";

      expect(isValidStellarAddress(withZero)).toBe(false);
      expect(isValidStellarAddress(withOne)).toBe(false);
      expect(isValidStellarAddress(withEight)).toBe(false);
      expect(isValidStellarAddress(withNine)).toBe(false);
    });

    it("rejects addresses not starting with G (like secret keys S... or contract IDs C...)", () => {
      const sKey = "SC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF";
      const cKey = "CC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF";
      expect(isValidStellarAddress(sKey)).toBe(false);
      expect(isValidStellarAddress(cKey)).toBe(false);
    });
  });

  describe("mapSellerListing via getSellerListings", () => {
    it("sorts product_images by position and picks position 0 as the cover image when out of order", async () => {
      const mockRows = [
        {
          id: "listing-1",
          name: "Listing 1",
          description: "Desc",
          usd_price: "100.50",
          original_usd_price: "150.00",
          discount_percent: 33,
          status: "active" as const,
          category_id: "cat-1",
          rating: "4.5",
          review_count: 5,
          created_at: "2026-09-01T00:00:00Z",
          categories: { name: "Services" },
          product_images: [
            { url: "https://example.com/pos2.jpg", position: 2 },
            { url: "https://example.com/pos0.jpg", position: 0 },
            { url: "https://example.com/pos1.jpg", position: 1 },
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

      const listings = await getSellerListings(mockSupabase, "seller-1");
      expect(listings).toHaveLength(1);
      expect(listings[0].imageUrl).toBe("https://example.com/pos0.jpg");
      expect(listings[0].imageCount).toBe(3);
      expect(listings[0].usdPrice).toBe(100.5);
      expect(listings[0].originalUsdPrice).toBe(150.0);
    });

    it("handles null original_usd_price and empty images", async () => {
      const mockRows = [
        {
          id: "listing-2",
          name: "Listing 2",
          description: null,
          usd_price: 50,
          original_usd_price: null,
          discount_percent: null,
          status: "draft" as const,
          category_id: null,
          rating: null,
          review_count: null,
          created_at: "2026-09-01T00:00:00Z",
          categories: null,
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

      const listings = await getSellerListings(mockSupabase, "seller-1");
      expect(listings[0].originalUsdPrice).toBeNull();
      expect(listings[0].imageUrl).toBeNull();
      expect(listings[0].imageCount).toBe(0);
      expect(listings[0].categoryName).toBeNull();
    });
  });

  describe("getCategories", () => {
    it("returns categories in order", async () => {
      const categories = [{ id: "1", name: "Tech", slug: "tech" }];
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: categories, error: null }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await getCategories(mockSupabase);
      expect(result).toEqual(categories);
    });
  });

  describe("createListing", () => {
    it("inserts listing as draft and calculates xlm_price via usdToXlm", async () => {
      let insertedPayload: Record<string, unknown> = {};
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockImplementation((payload) => {
            insertedPayload = payload;
            return {
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "new-listing-id" },
                  error: null,
                }),
              }),
            };
          }),
        }),
      } as unknown as SupabaseClient;

      const id = await createListing(mockSupabase, "seller-123", {
        name: "  My Test Product  ",
        description: "  Product Description  ",
        categoryId: "cat-1",
        usdPrice: 10,
        originalUsdPrice: 15,
      });

      expect(id).toBe("new-listing-id");
      expect(insertedPayload.seller_id).toBe("seller-123");
      expect(insertedPayload.name).toBe("My Test Product");
      expect(insertedPayload.description).toBe("Product Description");
      expect(insertedPayload.usd_price).toBe(10);
      expect(insertedPayload.original_usd_price).toBe(15);
      expect(insertedPayload.xlm_price).toBe(48.5);
      expect(insertedPayload.status).toBe("draft");
    });
  });

  describe("updateListing & setListingStatus", () => {
    it("updates listing fields and recalculates xlm_price", async () => {
      let updatedPayload: Record<string, unknown> = {};
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockImplementation((payload) => {
            updatedPayload = payload;
            return {
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }),
        }),
      } as unknown as SupabaseClient;

      await updateListing(mockSupabase, "listing-1", {
        name: "Updated",
        description: "Updated Desc",
        categoryId: "cat-2",
        usdPrice: 20,
      });

      expect(updatedPayload.name).toBe("Updated");
      expect(updatedPayload.xlm_price).toBe(97);
    });

    it("updates status", async () => {
      let updatedStatus: Record<string, unknown> = {};
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockImplementation((payload) => {
            updatedStatus = payload;
            return {
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }),
        }),
      } as unknown as SupabaseClient;

      await setListingStatus(mockSupabase, "listing-1", "active");
      expect(updatedStatus.status).toBe("active");
    });
  });

  describe("deleteListing", () => {
    it("removes images from storage bucket and deletes row", async () => {
      const mockRemove = vi.fn().mockResolvedValue({ error: null });
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "product_images") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [
                    {
                      url: "https://xyz.supabase.co/storage/v1/object/public/product-images/seller-1/prod-1/0-uuid.jpg",
                    },
                  ],
                }),
              }),
            };
          }
          if (table === "products") {
            return {
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            };
          }
          return {};
        }),
        storage: {
          from: vi.fn().mockReturnValue({
            remove: mockRemove,
          }),
        },
      } as unknown as SupabaseClient;

      await deleteListing(mockSupabase, "prod-1");
      expect(mockRemove).toHaveBeenCalledWith(["seller-1/prod-1/0-uuid.jpg"]);
    });
  });

  describe("getSellerProfile", () => {
    it("returns null when profile not found", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const profile = await getSellerProfile(mockSupabase, "nonexistent");
      expect(profile).toBeNull();
    });

    it("returns formatted seller profile", async () => {
      const row = {
        id: "s1",
        display_name: "TopSeller",
        avatar_url: "https://avatar.com/1.png",
        bio: "Top rated seller",
        stellar_address: "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF",
        seller_rating: "4.95",
        seller_sales: 50,
        created_at: "2026-01-01T00:00:00Z",
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const profile = await getSellerProfile(mockSupabase, "s1");
      expect(profile?.displayName).toBe("TopSeller");
      expect(profile?.stellarAddress).toBe(
        "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF"
      );
      expect(profile?.sellerRating).toBe(4.95);
      expect(profile?.memberSince).toBe("2026-01-01T00:00:00Z");
    });
  });

  describe("setPayoutAddress & getPayoutAddress", () => {
    it("sets payout address uppercased and trimmed", async () => {
      let updatePayload: Record<string, unknown> = {};
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockImplementation((payload) => {
            updatePayload = payload;
            return {
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }),
        }),
      } as unknown as SupabaseClient;

      await setPayoutAddress(
        mockSupabase,
        "u1",
        "  gc5u46is25kyfknhdxehr3ktqb3dvibm4nw5bh4mvue2g77stcjp4ihf  "
      );
      expect(updatePayload.stellar_address).toBe(
        "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF"
      );
    });

    it("gets payout address", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { stellar_address: "GC5U..." },
                error: null,
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const addr = await getPayoutAddress(mockSupabase, "u1");
      expect(addr).toBe("GC5U...");
    });
  });
});
