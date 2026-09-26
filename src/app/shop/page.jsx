import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
export const metadata = {
  title: "Shop All Products",
  description:
    "Browse our full collection — sarees, three-piece sets, salwar kameez, kurtis, party wear, and accessories. Premium women's fashion delivered across Bangladesh.",
};

export default async function ShopPage({ searchParams }) {
  const sp = await searchParams;
  const categorySlug = sp?.category;
  const filter = sp?.filter;
  const q = (sp?.q || "").trim();

  let rows = await db.select().from(products).where(eq(products.status, "active"));
  const allCats = await db.select().from(categories);

  let activeCatName = null;
  if (categorySlug) {
    const cat = allCats.find((c) => c.slug === categorySlug);
    activeCatName = cat?.name;
    rows = cat ? rows.filter((p) => p.categoryId === cat.id) : [];
  }
  if (filter === "new") rows = rows.filter((p) => p.isNew === 1);
  if (filter === "best-selling") rows = rows.filter((p) => p.isFeatured === 1);
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.name?.toLowerCase().includes(needle) ||
        p.description?.toLowerCase().includes(needle)
    );
  }

  const mainCats = allCats.filter((c) => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main className="max-w-[1280px] mx-auto px-5 md:px-8 py-6">
      <h1 className="font-serif text-2xl md:text-3xl mb-1">
        {q
          ? `Search results for "${q}"`
          : activeCatName || (filter === "new" ? "New Arrival" : filter === "best-selling" ? "Best Sellers" : "Shop All")}
      </h1>
      <p className="text-sm text-muted mb-5">{rows.length} products</p>

      <div className="flex gap-6">
        {/* Category sidebar - desktop only */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="font-sans text-xs font-bold uppercase tracking-wide mb-3 text-muted">Categories</div>
          <div className="space-y-1">
            <Link href="/shop" className={`block text-sm py-1.5 ${!categorySlug ? "text-pink-deep font-bold" : ""}`}>All Products</Link>
            {mainCats.map((c) => (
              <Link key={c.id} href={`/shop?category=${c.slug}`} className={`block text-sm py-1.5 ${categorySlug === c.slug ? "text-pink-deep font-bold" : ""}`}>
                {c.name}
              </Link>
            ))}
          </div>
        </aside>

        <div className="flex-1">
          {rows.length === 0 ? (
            <p className="text-sm text-muted py-12 text-center">
              {q ? `No products matched "${q}".` : "No products found in this category yet."}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {rows.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
