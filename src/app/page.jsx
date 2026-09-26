import Link from "next/link";
import { db } from "@/db";
import { products, banners, categories, reviews } from "@/db/schema";
import { eq, asc, inArray, desc } from "drizzle-orm";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import ShopByCategory from "@/components/ShopByCategory";
import PromoBanner from "@/components/PromoBanner";
import Testimonials from "@/components/Testimonials";
import NewsletterForm from "@/components/NewsletterForm";
import TrustBadges from "@/components/TrustBadges";

// Attaches { avgRating, reviewCount } to each product using a single reviews query.
async function withRatings(productList) {
  if (productList.length === 0) return productList;
  const ids = productList.map((p) => p.id);
  const rows = await db.select().from(reviews).where(inArray(reviews.productId, ids));

  const byProduct = {};
  for (const r of rows) {
    if (!byProduct[r.productId]) byProduct[r.productId] = [];
    byProduct[r.productId].push(r.rating);
  }

  return productList.map((p) => {
    const ratings = byProduct[p.id] || [];
    const reviewCount = ratings.length;
    const avgRating = reviewCount ? ratings.reduce((a, b) => a + b, 0) / reviewCount : 0;
    return { ...p, avgRating, reviewCount };
  });
}

export default async function HomePage() {
  const all = await db.select().from(products).where(eq(products.status, "active"));
  const newArrivalsRaw = all.filter((p) => p.isNew === 1).slice(0, 4);
  const bestSellersRaw = all.filter((p) => p.isFeatured === 1).slice(0, 4);

  const [newArrivals, bestSellers] = await Promise.all([
    withRatings(newArrivalsRaw),
    withRatings(bestSellersRaw),
  ]);

  const activeBanners = await db
    .select()
    .from(banners)
    .where(eq(banners.active, 1))
    .orderBy(asc(banners.sortOrder));

  const heroBanners = activeBanners.filter((b) => b.placement === "hero" || !b.placement);
  // Only one promo strip is shown — the first active one, by sort order.
  const promoBanner = activeBanners.find((b) => b.placement === "promo");

  // ---- Shop by Category: main categories with a representative thumbnail ----
  const allCats = await db.select().from(categories);
  const mainCats = allCats
    .filter((c) => !c.parentId)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const catsWithThumb = mainCats.map((c) => {
    let thumbnail = c.imageUrl || null;
    if (!thumbnail) {
      const childIds = [c.id, ...allCats.filter((s) => s.parentId === c.id).map((s) => s.id)];
      const match = all.find((p) => childIds.includes(p.categoryId));
      if (match) {
        try {
          thumbnail = JSON.parse(match.images || "[]")[0] || null;
        } catch {
          thumbnail = null;
        }
      }
    }
    return { id: c.id, name: c.name, slug: c.slug, thumbnail };
  });

  // ---- Testimonials: most recent, highest-rated real reviews ----
  const recentReviews = await db
    .select()
    .from(reviews)
    .orderBy(desc(reviews.createdAt))
    .limit(20);
  const testimonialItems = recentReviews
    .filter((r) => r.rating >= 4)
    .slice(0, 3)
    .map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, customerName: r.customerName }));

  return (
    <main>
      {/* Hero - all active hero-placement banners slide together at the top */}
      <HeroSlider slides={heroBanners} />

      {/* Trust badges */}
      <TrustBadges />

      {/* Shop by Category */}
      <ShopByCategory cats={catsWithThumb} />

      {/* New Arrivals */}
      <section className="px-5 md:px-8 pb-6 max-w-[1280px] mx-auto">
        <div className="flex justify-between items-center mb-3.5">
          <h2 className="font-sans text-base md:text-xl font-extrabold tracking-wide">NEW ARRIVALS</h2>
          <Link href="/shop?filter=new" className="font-sans text-xs text-rose-deep font-bold">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Promo banner - admin-controlled via Admin → Banners → Promo Section, falls back to defaults if none set */}
      <PromoBanner
        {...(promoBanner
          ? {
              image: promoBanner.imageUrl,
              eyebrow: promoBanner.eyebrow,
              title: promoBanner.title,
              subtitle: promoBanner.subtitle,
              href: promoBanner.linkUrl,
              cta: promoBanner.buttonText,
            }
          : {})}
      />

      {/* Best Sellers */}
      <section className="px-5 md:px-8 pb-6 max-w-[1280px] mx-auto">
        <div className="flex justify-between items-center mb-3.5">
          <h2 className="font-sans text-base md:text-xl font-extrabold tracking-wide">BEST SELLERS</h2>
          <Link href="/shop?filter=best-selling" className="font-sans text-xs text-rose-deep font-bold">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials items={testimonialItems} />

      {/* Newsletter */}
      <NewsletterForm />
    </main>
  );
}
