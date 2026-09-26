import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

// Force this route to run at request time instead of build time.
// Without this, Next.js/Railway tries to query the database while the
// image is still being built (before the DB file/tables exist), which
// throws SQLITE_ERROR and fails the deployment.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = "https://fahmidasfashion.store";

  const staticRoutes = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  let productRoutes = [];
  let categoryRoutes = [];

  try {
    const allProducts = await db.select().from(products).where(eq(products.status, "active"));
    productRoutes = allProducts.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const allCategories = await db.select().from(categories);
    categoryRoutes = allCategories.map((c) => ({
      url: `${baseUrl}/shop?category=${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (e) {
    console.error("sitemap: failed to load dynamic routes", e);
  }

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
