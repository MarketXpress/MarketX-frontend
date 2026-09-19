import * as z from "zod";
import { MAX_IMAGES } from "@/lib/listings";

/**
 * What a seller has to provide before a listing can go live.
 */
export const listingSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Give the item a name of at least 3 characters")
      .max(80, "Keep the name under 80 characters"),

    description: z
      .string()
      .trim()
      .min(30, "Describe the item in at least 30 characters — condition, age, what is included")
      .max(2000, "Keep the description under 2000 characters"),

    // A uuid from the `categories` table, not a hardcoded string.
    categoryId: z.string().uuid("Choose a category"),

    usdPrice: z
      .number({ message: "Enter a price" })
      .positive("Price must be more than zero")
      .max(1_000_000, "Contact us for listings above $1,000,000"),

    // Optional, and only meaningful when it is higher than the asking price —
    // the database generates `discount_percent` from the pair.
    originalUsdPrice: z
      .number()
      .positive("The original price must be more than zero")
      .max(1_000_000)
      .nullable()
      .optional(),

    images: z
      .array(z.instanceof(File))
      .min(1, "Add at least one photograph — listings without one do not sell")
      .max(MAX_IMAGES, `Up to ${MAX_IMAGES} photographs`),
  })
  .refine(
    (data) =>
      data.originalUsdPrice === null ||
      data.originalUsdPrice === undefined ||
      data.originalUsdPrice > data.usdPrice,
    {
      path: ["originalUsdPrice"],
      message: "The original price has to be higher than the asking price",
    },
  );

export type ListingFormData = z.infer<typeof listingSchema>;

/**
 * Validates text and price fields when editing an existing listing without requiring image re-selection.
 */
export const editListingSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Give the item a name of at least 3 characters")
      .max(80, "Keep the name under 80 characters"),

    description: z
      .string()
      .trim()
      .min(30, "Describe the item in at least 30 characters — condition, age, what is included")
      .max(2000, "Keep the description under 2000 characters"),

    categoryId: z.string().uuid("Choose a category"),

    usdPrice: z
      .number({ message: "Enter a price" })
      .positive("Price must be more than zero")
      .max(1_000_000, "Contact us for listings above $1,000,000"),

    originalUsdPrice: z
      .number()
      .positive("The original price must be more than zero")
      .max(1_000_000)
      .nullable()
      .optional(),
  })
  .refine(
    (data) =>
      data.originalUsdPrice === null ||
      data.originalUsdPrice === undefined ||
      data.originalUsdPrice > data.usdPrice,
    {
      path: ["originalUsdPrice"],
      message: "The original price has to be higher than the asking price",
    },
  );

export type EditListingFormData = z.infer<typeof editListingSchema>;
