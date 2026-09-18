import ProductCard from "@/components/marketplace/ProductCard";
import { createClient } from "@/lib/supabase/server";
import { searchProducts } from "@/lib/products";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const resolvedParams = await searchParams;
  const rawQuery =
    typeof resolvedParams.q === "string"
      ? resolvedParams.q
      : Array.isArray(resolvedParams.q)
        ? resolvedParams.q[0]
        : "";
  const query = rawQuery.trim();

  // Filtering happens in the database rather than over a fetched array, so
  // search does not depend on having downloaded the whole catalogue first.
  const supabase = await createClient();
  const filteredProducts = await searchProducts(supabase, query);

  const heading = query
    ? `${filteredProducts.length} results for '${query}'`
    : "Showing all products";

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <section className="mb-6">
          <h1 className="text-2xl font-black text-ink">{heading}</h1>
          <p className="mt-1 text-sm text-ink-faint">
            {query
              ? "Browse products that match your search."
              : "Start typing in the search box to filter results."}
          </p>
        </section>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
            <div>
              <h2 className="text-lg font-semibold text-ink">No products found</h2>
              <p className="mt-1 text-sm text-ink-faint">
                Try another keyword or browse all products.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
