import { db } from "@/db";
import { products, orders, orderItems, reviews } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProductViewer from "@/components/ProductViewer";
import ReviewSection from "@/components/ReviewSection";
import ProductCard from "@/components/ProductCard";
import { getSession } from "@/lib/auth";

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await db.select().from(products).where(eq(products.slug, slug)).get();
  if (!product) notFound();

  const images = JSON.parse(product.images || "[]");
  const sizes = JSON.parse(product.sizes || "[]");
  const colors = JSON.parse(product.colors || "[]");
  const colorImages = JSON.parse(product.colorImages || "{}");

  // Server-side check: has this logged-in user actually bought this product?
  const session = await getSession();
  let hasPurchased = false;
  let alreadyReviewed = false;

  if (session) {
    const myOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.userId, session.id), ne(orders.status, "cancelled")));

    for (const order of myOrders) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      if (items.some((i) => i.productId === product.id)) {
        hasPurchased = true;
        const existingReview = await db
          .select()
          .from(reviews)
          .where(and(eq(reviews.orderId, order.id), eq(reviews.productId, product.id)))
          .get();
        if (existingReview) {
          alreadyReviewed = true;
          break;
        }
      }
    }
  }

  // Related products: other active products in the same category.
  const relatedProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, product.categoryId), eq(products.status, "active"), ne(products.id, product.id)))
    .limit(4);

  return (
    <main className="max-w-[1280px] mx-auto px-5 md:px-8 py-6">
      <ProductViewer product={product} images={images} colorImages={colorImages} sizes={sizes} colors={colors}>
        <h1 className="font-serif text-2xl md:text-3xl mb-2">{product.name}</h1>

        {/* ডিসকাউন্ট সহ প্রাইস সেকশন */}
        <div className="flex items-center gap-2.5 flex-wrap mb-4">
          <span className="text-xl font-bold text-pink-deep">৳ {product.price.toLocaleString("en-BD")}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <>
              <span className="text-sm text-muted line-through">৳ {product.compareAtPrice.toLocaleString("en-BD")}</span>
              <span className="text-[11px] font-bold text-white bg-pink-deep px-2 py-0.5 rounded">
                {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% Off
              </span>
            </>
          )}
        </div>
      </ProductViewer>

      <ReviewSection
        productId={product.id}
        isLoggedIn={!!session}
        hasPurchased={hasPurchased}
        alreadyReviewed={alreadyReviewed}
      />

      {relatedProducts.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-xl mb-5">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
