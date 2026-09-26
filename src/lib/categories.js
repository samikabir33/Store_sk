import { db } from "@/db";
import { categories, products } from "@/db/schema";

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function makeUniqueSlug(allRows, base, excludeId = null) {
  const root = slugify(base) || "category";
  let slug = root;
  let i = 2;
  while (allRows.some((c) => c.slug === slug && c.id !== excludeId)) {
    slug = `${root}-${i}`;
    i += 1;
  }
  return slug;
}

const bySort = (a, b) =>
  (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);

export async function getCategoryTree({ withCounts = false } = {}) {
  const rows = await db.select().from(categories);
  const prodRows = withCounts ? await db.select().from(products) : [];
  const countOf = (catId) => prodRows.filter((p) => p.categoryId === catId).length;

  return rows
    .filter((c) => !c.parentId)
    .sort(bySort)
    .map((c) => ({
      ...c,
      ...(withCounts ? { productCount: countOf(c.id) } : {}),
      subCategories: rows
        .filter((s) => s.parentId === c.id)
        .sort(bySort)
        .map((s) => ({ ...s, ...(withCounts ? { productCount: countOf(s.id) } : {}) })),
    }));
}
