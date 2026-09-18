import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getWishlist,
  isWishlisted,
  toggleWishlist,
  syncWishlistWithUser,
  initWishlist,
  _resetWishlistState,
} from "../wishlistStore";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("wishlistStore", () => {
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    _resetWishlistState();
    mockLocalStorage = {};

    vi.stubGlobal("localStorage", {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key];
      },
      clear: () => {
        mockLocalStorage = {};
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Anonymous / Guest Mode (localStorage)", () => {
    it("starts empty when localStorage is empty", () => {
      expect(getWishlist()).toEqual([]);
      expect(isWishlisted("prod-1")).toBe(false);
    });

    it("reads existing items from localStorage", () => {
      mockLocalStorage["marketx_wishlist"] = JSON.stringify(["prod-1", "prod-2"]);
      expect(getWishlist()).toEqual(["prod-1", "prod-2"]);
      expect(isWishlisted("prod-1")).toBe(true);
      expect(isWishlisted("prod-3")).toBe(false);
    });

    it("toggles item addition and persists to localStorage", () => {
      const added = toggleWishlist("prod-1");
      expect(added).toBe(true);
      expect(getWishlist()).toContain("prod-1");
      expect(JSON.parse(mockLocalStorage["marketx_wishlist"])).toContain("prod-1");

      const removed = toggleWishlist("prod-1");
      expect(removed).toBe(false);
      expect(getWishlist()).not.toContain("prod-1");
      expect(JSON.parse(mockLocalStorage["marketx_wishlist"])).not.toContain("prod-1");
    });
  });

  describe("Authenticated / Database Mode", () => {
    it("merges local items into database on sign-in and clears localStorage", async () => {
      mockLocalStorage["marketx_wishlist"] = JSON.stringify(["prod-local-1", "prod-local-2"]);

      const upsertMock = vi.fn().mockResolvedValue({ error: null });
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              { product_id: "prod-local-1" },
              { product_id: "prod-local-2" },
              { product_id: "prod-remote-existing" },
            ],
            error: null,
          }),
        }),
      });

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "wishlist_items") {
            return {
              upsert: upsertMock,
              select: selectMock,
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const result = await syncWishlistWithUser(mockSupabase, { id: "user-123" });

      expect(upsertMock).toHaveBeenCalledWith(
        [
          { user_id: "user-123", product_id: "prod-local-1" },
          { user_id: "user-123", product_id: "prod-local-2" },
        ],
        { onConflict: "user_id,product_id", ignoreDuplicates: true },
      );

      // Local storage should be cleared after successful merge
      expect(mockLocalStorage["marketx_wishlist"]).toBeUndefined();
      expect(result).toEqual(["prod-local-1", "prod-local-2", "prod-remote-existing"]);
      expect(getWishlist()).toEqual(["prod-local-1", "prod-local-2", "prod-remote-existing"]);
    });

    it("optimistically adds an item and writes to database", async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null });
      const mockSupabase = {
        from: vi.fn(() => ({
          upsert: upsertMock,
        })),
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: "user-123" } } },
          }),
        },
      } as unknown as SupabaseClient;

      const added = toggleWishlist("prod-new", mockSupabase, "user-123");
      expect(added).toBe(true);
      expect(isWishlisted("prod-new")).toBe(true);

      // Wait a tick for async database call
      await new Promise((r) => setTimeout(r, 10));

      expect(upsertMock).toHaveBeenCalledWith(
        { user_id: "user-123", product_id: "prod-new" },
        { onConflict: "user_id,product_id", ignoreDuplicates: true },
      );
    });

    it("optimistically removes an item and deletes from database", async () => {
      const deleteEqMock2 = vi.fn().mockResolvedValue({ error: null });
      const deleteEqMock1 = vi.fn().mockReturnValue({ eq: deleteEqMock2 });
      const deleteMock = vi.fn().mockReturnValue({ eq: deleteEqMock1 });
      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      const mockSupabase = {
        from: vi.fn(() => ({
          delete: deleteMock,
          upsert: upsertMock,
        })),
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: "user-123" } } },
          }),
        },
      } as unknown as SupabaseClient;

      // Seed store
      toggleWishlist("prod-1", mockSupabase, "user-123");
      expect(isWishlisted("prod-1")).toBe(true);

      const removed = toggleWishlist("prod-1", mockSupabase, "user-123");
      expect(removed).toBe(false);
      expect(isWishlisted("prod-1")).toBe(false);

      await new Promise((r) => setTimeout(r, 10));

      expect(deleteMock).toHaveBeenCalled();
      expect(deleteEqMock1).toHaveBeenCalledWith("user_id", "user-123");
      expect(deleteEqMock2).toHaveBeenCalledWith("product_id", "prod-1");
    });

    it("rolls back optimistic update when database write fails", async () => {
      const failingUpsert = vi.fn().mockResolvedValue({ error: new Error("DB Connection Error") });
      const mockSupabase = {
        from: vi.fn(() => ({
          upsert: failingUpsert,
        })),
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: "user-123" } } },
          }),
        },
      } as unknown as SupabaseClient;

      const added = toggleWishlist("prod-fail", mockSupabase, "user-123");
      expect(added).toBe(true);
      expect(isWishlisted("prod-fail")).toBe(true);

      // Wait for async rejection and rollback
      await new Promise((r) => setTimeout(r, 20));

      // Should be rolled back
      expect(isWishlisted("prod-fail")).toBe(false);
    });
  });
});
