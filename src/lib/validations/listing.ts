import * as z from "zod";
import { MAX_IMAGES } from "@/lib/listings";

/**
 * What a seller has to provide before a listing can go live.
 *
 * This replaces a schema written against a marketplace that no longer exists:
 * it offered three fixed categories (Digital / Physical / Service) that are not
 * in the `categories` table, priced in XLM, and collected escrow timings per
 * listing. Escrow terms belong to an order, not to a listing — a listing is
 * bought many times — and the architecture prices in dollars with XLM shown as
 * a conversion.
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
      // The database has the same constraint. Catching it here means the
      // seller is told which field is wrong instead of receiving a constraint
      // violation after the upload has already run.
      path: ["originalUsdPrice"],
      message: "The original price has to be higher than the asking price",
    },
  );

export type ListingFormData = z.infer<typeof listingSchema>;
