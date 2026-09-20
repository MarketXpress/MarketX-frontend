import { describe, it, expect, vi } from "vitest";
import {
  toNumber,
  mapSellerListing,
  isValidStellarAddress,
  storagePathFromUrl,
  getCategories,
  createListing,
  updateListing,
  setListingStatus,
  deleteListing,
  getSellerListings,
  getListingForEdit,
  getSellerProfile,
  getSellerActiveListings,
  setPayoutAddress,
  getPayoutAddress,
  type SellerListingRow,
} from "../listings";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("src/lib/listings.ts", () => {
  describe("toNumber", () => {
    it("returns number unchanged if already a number", () => {
      expect(toNumber(42.5)).toBe(42.5);
      expect(toNumber(0)).toBe(0);
      expect(toNumber(-10)).toBe(-10);
    });

    it("parses numeric strings sent from PostgREST", () => {
      expect(toNumber("19.99")).toBe(19.99);
      expect(toNumber("0.0000000")).toBe(0);
      expect(toNumber("1000")).toBe(1000);
    });

    it("returns fallback value for null or undefined", () => {
      expect(toNumber(null)).toBe(0);
      expect(toNumber(undefined)).toBe(0);
      expect(toNumber(null, 55)).toBe(55);
      expect(toNumber(undefined, 99)).toBe(99);
    });

    it("returns fallback value rather than NaN on malformed or non-numeric strings", () => {
      expect(toNumber("invalid")).toBe(0);
      expect(toNumber("abc", 10)).toBe(10);
      expect(toNumber("", 4.5)).toBe(4.5);
      expect(toNumber("   ", 7)).toBe(7);
      expect(toNumber(NaN, 12)).toBe(12);
      expect(toNumber(Infinity, 0)).toBe(0);
      expect(toNumber(-Infinity, 0)).toBe(0);
    });
  });

  describe("mapSellerListing", () => {
    const baseRow: SellerListingRow = {
      id: "prod-1",
      name: "Vintage Camera",
      description: "Working 35mm film camera",
      usd_price: "120.50",
      original_usd_price: "150.00",
      discount_percent: 20,
      status: "active",
      category_id: "cat-electronics",
      rating: "4.8",
      review_count: 14,
      created_at: "2026-03-01T12:00:00Z",
      categories: { name: "Electronics" },
      product_images: [
        { url: "https://example.com/img2.jpg", position: 1 },
        { url: "https://example.com/cover.jpg", position: 0 },
        { url: "https://example.com/img3.jpg", position: 2 },
      ],
    };

    it("maps all fields correctly and sorts images by position ascending", () => {
      const listing = mapSellerListing(baseRow);
      expect(listing.id).toBe("prod-1");
      expect(listing.name).toBe("Vintage Camera");
      expect(listing.description).toBe("Working 35mm film camera");
      expect(listing.usdPrice).toBe(120.5);
      expect(listing.originalUsdPrice).toBe(150);
      expect(listing.discountPercent).toBe(20);
      expect(listing.status).toBe("active");
      expect(listing.categoryId).toBe("cat-electronics");
      expect(listing.categoryName).toBe("Electronics");
      // Must pick position 0 as cover image even if arrived out-of-order
      expect(listing.imageUrl).toBe("https://example.com/cover.jpg");
      expect(listing.imageCount).toBe(3);
      expect(listing.rating).toBe(4.8);
      expect(listing.reviewCount).toBe(14);
      expect(listing.createdAt).toBe("2026-03-01T12:00:00Z");
    });

    it("handles null original_usd_price without falling back to 0", () => {
      const rowWithoutOriginalPrice: SellerListingRow = {
        ...baseRow,
        original_usd_price: null,
        discount_percent: null,
      };
      const listing = mapSellerListing(rowWithoutOriginalPrice);
      expect(listing.originalUsdPrice).toBeNull();
      expect(listing.discountPercent).toBe(0);
    });

    it("handles empty or null product_images", () => {
      const rowNoImages: SellerListingRow = {
        ...baseRow,
        product_images: null,
      };
      const listing = mapSellerListing(rowNoImages);
      expect(listing.imageUrl).toBeNull();
      expect(listing.imageCount).toBe(0);
    });

    it("handles null category relation and null reviews/ratings", () => {
      const rowMinimal: SellerListingRow = {
        ...baseRow,
        categories: null,
        rating: null,
        review_count: null,
      };
      const listing = mapSellerListing(rowMinimal);
      expect(listing.categoryName).toBeNull();
      expect(listing.rating).toBe(0);
      expect(listing.reviewCount).toBe(0);
    });
  });

  describe("isValidStellarAddress", () => {
    it("accepts a valid 56-character Stellar public address starting with G", () => {
      const validAddress = "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF";
      expect(isValidStellarAddress(validAddress)).toBe(true);
      expect(isValidStellarAddress(`  ${validAddress}  `)).toBe(true);
      expect(isValidStellarAddress(validAddress.toLowerCase())).toBe(true);
    });

    it("rejects addresses with invalid length (55 or 57 characters)", () => {
      const validAddress = "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF";
      expect(isValidStellarAddress(validAddress.slice(0, 55))).toBe(false);
      expect(isValidStellarAddress(`${validAddress}A`)).toBe(false);
      expect(isValidStellarAddress("")).toBe(false);
    });

    it("rejects non-G prefixes such as secret keys (S) or muxed addresses (M)", () => {
      const secretKey = "SC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF";
      expect(isValidStellarAddress(secretKey)).toBe(false);
      const muxedKey = "MC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF";
      expect(isValidStellarAddress(muxedKey)).toBe(false);
    });

    it("rejects characters outside RFC4648 Base32 alphabet (0, 1, 8, 9, special chars)", () => {
      // Base32 only contains A-Z and digits 2-7
      const withZero = "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IH0";
      expect(isValidStellarAddress(withZero)).toBe(false);

      const withOne = "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IH1";
      expect(isValidStellarAddress(withOne)).toBe(false);

      const withEight = "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IH8";
      expect(isValidStellarAddress(withEight)).toBe(false);

      const withNine = "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IH9";
      expect(isValidStellarAddress(withNine)).toBe(false);

      const withSymbol = "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IH!";
      expect(isValidStellarAddress(withSymbol)).toBe(false);
    });
  });

  describe("storagePathFromUrl", () => {
    it("extracts path from public storage bucket URL", () => {
      const url =
        "https://abc.supabase.co/storage/v1/object/public/product-images/seller-123/listing-456/0-test.jpg";
      expect(storagePathFromUrl(url)).toBe("seller-123/listing-456/0-test.jpg");
    });

    it("returns null for non-matching URLs", () => {
      expect(storagePathFromUrl("https://example.com/other-bucket/file.jpg")).toBeNull();
      expect(storagePathFromUrl("https://abc.supabase.co/storage/v1/object/authenticated/product-images/file.jpg")).toBeNull();
      expect(storagePathFromUrl("")).toBeNull();
    });
  });

  describe("Supabase query functions (mocked client)", () => {
    it("getCategories queries categories ordered by position", async () => {
      const mockCategories = [
        { id: "1", name: "Art", slug: "art" },
        { id: "2", name: "Books", slug: "books" },
      ];
      const order = vi.fn().mockResolvedValue({ data: mockCategories, error: null });
      const select = vi.fn().mockReturnValue({ order });
      const from = vi.fn().mockReturnValue({ select });
      const supabase = { from } as unknown as SupabaseClient;

      const categories = await getCategories(supabase);
      expect(from).toHaveBeenCalledWith("categories");
      expect(select).toHaveBeenCalledWith("id, name, slug");
      expect(order).toHaveBeenCalledWith("position");
      expect(categories).toEqual(mockCategories);
    });

    it("createListing inserts listing with status draft and computed xlm_price", async () => {
      const single = vi.fn().mockResolvedValue({ data: { id: "new-prod-id" }, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      const from = vi.fn().mockReturnValue({ insert });
      const supabase = { from } as unknown as SupabaseClient;

      const listingId = await createListing(supabase, "seller-1", {
        name: "  Handmade Mug  ",
        description: " Ceramic mug ",
        categoryId: "cat-home",
        usdPrice: 20,
        originalUsdPrice: 25,
      });

      expect(from).toHaveBeenCalledWith("products");
      expect(insert).toHaveBeenCalledWith({
        seller_id: "seller-1",
        category_id: "cat-home",
        name: "Handmade Mug",
        description: "Ceramic mug",
        usd_price: 20,
        original_usd_price: 25,
        xlm_price: 97, // 20 * 4.85
        status: "draft",
      });
      expect(listingId).toBe("new-prod-id");
    });

    it("updateListing updates product fields by id", async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ update });
      const supabase = { from } as unknown as SupabaseClient;

      await updateListing(supabase, "prod-1", {
        name: "Updated Name",
        description: "Updated Desc",
        categoryId: "cat-2",
        usdPrice: 30,
      });

      expect(from).toHaveBeenCalledWith("products");
      expect(update).toHaveBeenCalledWith({
        category_id: "cat-2",
        name: "Updated Name",
        description: "Updated Desc",
        usd_price: 30,
        original_usd_price: null,
        xlm_price: 145.5, // 30 * 4.85
      });
      expect(eq).toHaveBeenCalledWith("id", "prod-1");
    });

    it("setListingStatus updates the status column", async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ update });
      const supabase = { from } as unknown as SupabaseClient;

      await setListingStatus(supabase, "prod-1", "active");
      expect(from).toHaveBeenCalledWith("products");
      expect(update).toHaveBeenCalledWith({ status: "active" });
      expect(eq).toHaveBeenCalledWith("id", "prod-1");
    });

    it("deleteListing cleans up storage files and deletes the product row", async () => {
      const imageRows = [
        { url: "https://x.supabase.co/storage/v1/object/public/product-images/seller/p1/img1.jpg" },
      ];
      const eqImages = vi.fn().mockResolvedValue({ data: imageRows, error: null });
      const selectImages = vi.fn().mockReturnValue({ eq: eqImages });

      const eqDelete = vi.fn().mockResolvedValue({ error: null });
      const deleteRow = vi.fn().mockReturnValue({ eq: eqDelete });

      const removeStorage = vi.fn().mockResolvedValue({ data: [], error: null });
      const storageFrom = vi.fn().mockReturnValue({ remove: removeStorage });

      const from = vi.fn((table: string) => {
        if (table === "product_images") return { select: selectImages };
        if (table === "products") return { delete: deleteRow };
        throw new Error(`Unexpected table ${table}`);
      });

      const supabase = {
        from,
        storage: { from: storageFrom },
      } as unknown as SupabaseClient;

      await deleteListing(supabase, "p1");

      expect(storageFrom).toHaveBeenCalledWith("product-images");
      expect(removeStorage).toHaveBeenCalledWith(["seller/p1/img1.jpg"]);
      expect(deleteRow).toHaveBeenCalled();
      expect(eqDelete).toHaveBeenCalledWith("id", "p1");
    });

    it("getSellerListings returns listings for seller ordered by created_at desc", async () => {
      const mockRows = [
        {
          id: "prod-1",
          name: "Item 1",
          description: "Desc",
          usd_price: "15",
          original_usd_price: null,
          discount_percent: 0,
          status: "active",
          category_id: "cat-1",
          rating: 4.5,
          review_count: 5,
          created_at: "2026-03-01T00:00:00Z",
          categories: { name: "Category 1" },
          product_images: [{ url: "https://example.com/pic.jpg", position: 0 }],
        },
      ];
      const order = vi.fn().mockResolvedValue({ data: mockRows, error: null });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });
      const supabase = { from } as unknown as SupabaseClient;

      const listings = await getSellerListings(supabase, "seller-1");
      expect(from).toHaveBeenCalledWith("products");
      expect(eq).toHaveBeenCalledWith("seller_id", "seller-1");
      expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(listings.length).toBe(1);
      expect(listings[0].name).toBe("Item 1");
      expect(listings[0].imageUrl).toBe("https://example.com/pic.jpg");
    });

    it("getListingForEdit returns mapped listing or null", async () => {
      const mockRow = {
        id: "prod-1",
        name: "Item 1",
        description: "Desc",
        usd_price: "15",
        original_usd_price: null,
        discount_percent: 0,
        status: "active",
        category_id: "cat-1",
        rating: 4.5,
        review_count: 5,
        created_at: "2026-03-01T00:00:00Z",
        categories: { name: "Category 1" },
        product_images: [],
      };
      const maybeSingle = vi.fn().mockResolvedValue({ data: mockRow, error: null });
      const eq = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });
      const supabase = { from } as unknown as SupabaseClient;

      const listing = await getListingForEdit(supabase, "prod-1");
      expect(from).toHaveBeenCalledWith("products");
      expect(eq).toHaveBeenCalledWith("id", "prod-1");
      expect(listing?.id).toBe("prod-1");

      maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      const notFound = await getListingForEdit(supabase, "missing");
      expect(notFound).toBeNull();
    });

    it("getSellerActiveListings returns only active listings for storefront", async () => {
      const mockRows = [
        {
          id: "prod-1",
          name: "Active Item",
          description: "Desc",
          usd_price: "25",
          original_usd_price: null,
          discount_percent: 0,
          status: "active",
          category_id: "cat-1",
          rating: 5,
          review_count: 10,
          created_at: "2026-03-01T00:00:00Z",
          categories: null,
          product_images: [],
        },
      ];
      const order = vi.fn().mockResolvedValue({ data: mockRows, error: null });
      const eqStatus = vi.fn().mockReturnValue({ order });
      const eqSeller = vi.fn().mockReturnValue({ eq: eqStatus });
      const select = vi.fn().mockReturnValue({ eq: eqSeller });
      const from = vi.fn().mockReturnValue({ select });
      const supabase = { from } as unknown as SupabaseClient;

      const listings = await getSellerActiveListings(supabase, "seller-1");
      expect(from).toHaveBeenCalledWith("products");
      expect(eqSeller).toHaveBeenCalledWith("seller_id", "seller-1");
      expect(eqStatus).toHaveBeenCalledWith("status", "active");
      expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(listings.length).toBe(1);
      expect(listings[0].name).toBe("Active Item");
    });

    it("getSellerProfile returns profile or null when not found", async () => {
      const mockProfileData = {
        id: "seller-1",
        display_name: "Artisan Co",
        avatar_url: "https://example.com/avatar.jpg",
        bio: "Handmade goods",
        stellar_address: "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF",
        seller_rating: "4.9",
        seller_sales: 42,
        created_at: "2026-01-01T00:00:00Z",
      };

      const maybeSingle = vi.fn().mockResolvedValue({ data: mockProfileData, error: null });
      const eq = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });
      const supabase = { from } as unknown as SupabaseClient;

      const profile = await getSellerProfile(supabase, "seller-1");
      expect(profile).toEqual({
        id: "seller-1",
        displayName: "Artisan Co",
        avatarUrl: "https://example.com/avatar.jpg",
        bio: "Handmade goods",
        stellarAddress: "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF",
        sellerRating: 4.9,
        sellerSales: 42,
        memberSince: "2026-01-01T00:00:00Z",
      });

      maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      const nullProfile = await getSellerProfile(supabase, "nonexistent");
      expect(nullProfile).toBeNull();
    });

    it("setPayoutAddress updates stellar_address uppercase and trimmed", async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ update });
      const supabase = { from } as unknown as SupabaseClient;

      await setPayoutAddress(supabase, "user-1", "  gc5u46is25kyfknhdxehr3ktqb3dvibm4nw5bh4mvue2g77stcjp4ihf  ");
      expect(from).toHaveBeenCalledWith("profiles");
      expect(update).toHaveBeenCalledWith({
        stellar_address: "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF",
      });
      expect(eq).toHaveBeenCalledWith("id", "user-1");
    });

    it("getPayoutAddress returns stellar_address or null", async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: { stellar_address: "GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF" },
        error: null,
      });
      const eq = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });
      const supabase = { from } as unknown as SupabaseClient;

      const addr = await getPayoutAddress(supabase, "user-1");
      expect(addr).toBe("GC5U46IS25KYFKNHDXEHR3KTQB3DVIBM4NW5BH4MVUE2G77STCJP4IHF");
    });
  });
});
