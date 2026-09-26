"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function StockSearchInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function search(query) {
    setLoading(true);
    const r = await fetch(`/api/admin/stock?q=${encodeURIComponent(query)}`).then((r) => r.json());
    setItems(r.products || []);
    setLoading(false);
  }

  useEffect(() => { search(initialQ); }, []);

  return (
    <div>
      <h1 className="font-serif text-2xl mb-1">Stock / Inventory Search</h1>
      <p className="text-sm text-muted mb-5">Search by product name or SKU to check current stock levels.</p>

      <input
        className="input max-w-md mb-5"
        placeholder="Search product name or SKU..."
        value={q}
        onChange={(e) => { setQ(e.target.value); search(e.target.value); }}
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-pink-lighter text-xs">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">SKU</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Stock Available</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-4 text-center text-muted text-xs">Searching...</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted text-xs">No products found.</td></tr>}
            {items.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-xs text-muted">{p.sku || "—"}</td>
                <td className="p-3">৳ {p.price.toLocaleString("en-BD")}</td>
                <td className="p-3">
                  <span className={`font-bold ${p.stock === 0 ? "text-pink-deep" : p.stock <= 5 ? "text-gold" : "text-green-700"}`}>
                    {p.stock} units
                  </span>
                </td>
                <td className="p-3">
                  {p.stock === 0 ? (
                    <span className="text-[10px] bg-pink-lighter text-pink-deep px-2 py-0.5 rounded-full">Out of Stock</span>
                  ) : p.stock <= 5 ? (
                    <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full">Low Stock</span>
                  ) : (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">In Stock</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminStockPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted">Loading...</div>}>
      <StockSearchInner />
    </Suspense>
  );
}
