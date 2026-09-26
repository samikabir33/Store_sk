import Link from "next/link";
import { IconGrid } from "./icons";

export function computeCategoryCounts(categories, products) {
  return categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      count: products.filter((p) => p.categoryId === c.id).length,
    }))
    .sort((a, b) => b.count - a.count);
}

export default function CategoriesCard({ categories }) {
  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg">Categories</h3>
        <Link href="/admin/categories" className="text-xs font-semibold text-pink-deep hover:underline">
          Manage →
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        {categories.length === 0 && <p className="text-xs text-muted py-2">No categories yet.</p>}
        {categories.slice(0, 6).map((c) => (
          <div key={c.id} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
            <span className="w-8 h-8 rounded-lg bg-pink-lighter text-pink-deep flex items-center justify-center shrink-0">
              <IconGrid />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{c.name}</div>
            </div>
            <span className="text-[11px] text-muted font-semibold shrink-0">{c.count} products</span>
          </div>
        ))}
      </div>
    </div>
  );
}
