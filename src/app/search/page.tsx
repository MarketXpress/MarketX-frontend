import ProductCard from "@/components/marketplace/ProductCard";
import { mockProducts } from "@/lib/mockData";

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
  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const filteredProducts = searchTerms.length
    ? mockProducts.filter((product) => {
        const searchableText = [
          product.name,
          product.category,
          product.seller,
          product.description ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return searchTerms.every((term) => searchableText.includes(term));
      })
    : mockProducts;

  const heading = query
    ? `${filteredProducts.length} results for '${query}'`
    : "Showing all products";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <section className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">{heading}</h1>
          <p className="mt-1 text-sm text-gray-500">
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
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">No products found</h2>
              <p className="mt-1 text-sm text-gray-500">
                Try another keyword or browse all products.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
