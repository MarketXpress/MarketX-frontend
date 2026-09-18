import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductById, getProducts } from "@/lib/products";
import ProductDetailView from "./ProductDetailView";

/**
 * Product detail.
 *
 * A server component so the listing is fetched during the render rather than
 * after it: the page arrives with its content, and a product that does not
 * exist 404s before anything is sent instead of flashing an empty layout.
 * The interactive parts — gallery, wishlist toggle — live in
 * `ProductDetailView`, which is a client component.
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const product = await getProductById(supabase, id);
  if (!product) notFound();

  // Related listings share a category. Fetched here so the client component
  // receives them as data rather than querying a second time.
  const related = (await getProducts(supabase))
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const images = product.images ?? [];

  return (
    <ProductDetailView
      product={product}
      images={images}
      hasImages={images.length > 0}
      related={related}
    />
  );
}
