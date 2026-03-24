import * as z from "zod";

export const listingSchema = z.object({
  // Step 1: Asset Details
  name: z.string().min(3, "Name must be at least 3 characters").max(60, "Name must be at most 60 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be at most 500 characters"),
  category: z.enum(["Digital", "Physical", "Service"], { required_error: "Please select a category" }),
  
  // Step 2: Pricing & Escrow
  priceAmount: z.number({ invalid_type_error: "Price must be a number" }).min(1, "Price must be at least 1 XLM"),
  deliveryTimeframe: z.number({ invalid_type_error: "Required" }).min(1, "Must be at least 1 day").max(30, "Max 30 days"),
  disputePeriod: z.number({ invalid_type_error: "Required" }).min(1, "Must be at least 1 day").max(14, "Max 14 days"),

  // Step 3: Media
  media: z.array(z.any()).min(1, "At least one image is required to list an asset"),
});

export type ListingFormData = z.infer<typeof listingSchema>;
