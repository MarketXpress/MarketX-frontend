import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  storagePathFromUrl,
  getListingImages,
  reorderListingImages,
  deleteListingImage,
  setListingCoverImage,
  addListingImages,
  MAX_IMAGES,
} from "@/lib/listings";

describe("Listing Photograph Management Data Layer", () => {
  describe("storagePathFromUrl", () => {
    it("extracts storage object path from a Supabase public URL", () => {
      const url =
        "https://xyz.supabase.co/storage/v1/object/public/product-images/seller-123/product-456/0-abc.jpg";
      expect(storagePathFromUrl(url)).toBe("seller-123/product-456/0-abc.jpg");
    });

    it("returns null if the public bucket marker is missing", () => {
      const url = "https://external-cdn.com/images/item.png";
      expect(storagePathFromUrl(url)).toBeNull();
    });
  });

  describe("getListingImages", () => {
    it("queries product_images ordered by position ascending", async () => {
      const mockImages = [
        { id: "img-1", url: "https://example.com/1.jpg", position: 0 },
        { id: "img-2", url: "https://example.com/2.jpg", position: 1 },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockImages, error: null }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await getListingImages(mockSupabase, "prod-123");
      expect(mockSupabase.from).toHaveBeenCalledWith("product_images");
      expect(result).toEqual(mockImages);
    });
  });

  describe("reorderListingImages", () => {
    it("uses a two-phase update to avoid unique(product_id, position) collisions", async () => {
      const updateCalls: { update: Record<string, unknown>; eqCalls: { field: string; val: unknown }[] }[] = [];

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn((payload: Record<string, unknown>) => {
            const call = { update: payload, eqCalls: [] as { field: string; val: unknown }[] };
            updateCalls.push(call);
            const eqFn = vi.fn((field: string, val: unknown) => {
              call.eqCalls.push({ field, val });
              return Promise.resolve({ error: null });
            });
            return { eq: eqFn };
          }),
        }),
      } as unknown as SupabaseClient;

      const ordered = [
        { id: "img-b", url: "https://example.com/b.jpg" },
        { id: "img-a", url: "https://example.com/a.jpg" },
      ];

      await reorderListingImages(mockSupabase, "prod-123", ordered);

      // Phase 1 (temp negative) + Phase 2 (target 0..N-1) = 4 update calls
      expect(updateCalls.length).toBe(4);
      expect(updateCalls[0].update).toEqual({ position: -1000 });
      expect(updateCalls[1].update).toEqual({ position: -1001 });
      expect(updateCalls[2].update).toEqual({ position: 0 });
      expect(updateCalls[3].update).toEqual({ position: 1 });
    });
  });

  describe("deleteListingImage", () => {
    it("removes object from storage, deletes database row, and reorders remaining images", async () => {
      const removeStorageMock = vi.fn().mockResolvedValue({ error: null });
      const deleteDbMock = vi.fn().mockResolvedValue({ error: null });

      const mockImagesAfterDelete = [
        { id: "img-2", url: "https://example.com/2.jpg", position: 1 },
      ];

      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: removeStorageMock,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === "product_images") {
            return {
              delete: vi.fn().mockReturnValue({
                eq: deleteDbMock,
              }),
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: mockImagesAfterDelete, error: null }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const target = {
        id: "img-1",
        url: "https://xyz.supabase.co/storage/v1/object/public/product-images/seller/prod/0.jpg",
      };

      await deleteListingImage(mockSupabase, "prod", target);

      expect(removeStorageMock).toHaveBeenCalledWith(["seller/prod/0.jpg"]);
      expect(deleteDbMock).toHaveBeenCalledWith("id", "img-1");
    });
  });

  describe("setListingCoverImage", () => {
    it("moves the target image to index 0 and reorders", async () => {
      const currentImages = [
        { id: "img-1", url: "https://example.com/1.jpg", position: 0 },
        { id: "img-2", url: "https://example.com/2.jpg", position: 1 },
      ];

      const updateCalls: Record<string, unknown>[] = [];
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: currentImages, error: null }),
            }),
          }),
          update: vi.fn((payload: Record<string, unknown>) => {
            updateCalls.push(payload);
            return {
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }),
        }),
      } as unknown as SupabaseClient;

      await setListingCoverImage(mockSupabase, "prod-1", { id: "img-2", url: "https://example.com/2.jpg" });

      // img-2 became cover (pos 0), img-1 became pos 1
      expect(updateCalls.some((c) => c.position === 0)).toBe(true);
    });
  });

  describe("addListingImages", () => {
    it("throws an error when adding files exceeds MAX_IMAGES", async () => {
      const currentImages = new Array(5).fill(null).map((_, i) => ({
        id: `img-${i}`,
        url: `https://example.com/${i}.jpg`,
        position: i,
      }));

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: currentImages, error: null }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const newFiles = [new File(["dummy1"], "1.jpg"), new File(["dummy2"], "2.jpg")];

      await expect(
        addListingImages(mockSupabase, "seller-1", "prod-1", newFiles),
      ).rejects.toThrow(`Cannot exceed ${MAX_IMAGES} photographs per listing.`);
    });
  });
});
