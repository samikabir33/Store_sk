import { money } from "@/lib/utils";

function firstImage(images) {
  try {
    const arr = JSON.parse(images || "[]");
    return arr[0] || null;
  } catch {
    return null;
  }
}

export function computeTopSelling(orderItems, products, limit = 5) {
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  const totals = {};
  for (const item of orderItems) {
    if (!totals[item.productId]) {
      totals[item.productId] = { productId: item.productId, qty: 0, revenue: 0 };
    }
    totals[item.productId].qty += item.qty;
    totals[item.productId].revenue += item.price * item.qty;
  }
  return Object.values(totals)
    .map((t) => ({ ...t, product: productMap[t.productId] }))
    .filter((t) => t.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}

export default function TopSellingCard({ items }) {
  return (
    <div className="card p-4 md:p-5">
      <h3 className="font-serif text-lg mb-3">Top Selling Products</h3>
      <div className="flex flex-col gap-1">
        {items.length === 0 && <p className="text-xs text-muted py-2">No sales data yet.</p>}
        {items.map((t) => {
          const img = firstImage(t.product.images);
          return (
            <div key={t.productId} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
              <div className="w-9 h-9 rounded-lg bg-pink-lighter overflow-hidden shrink-0 flex items-center justify-center text-pink-deep text-[10px] font-bold">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={t.product.name} className="w-full h-full object-cover" />
                ) : (
                  t.product.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{t.product.name}</div>
                <div className="text-[11px] text-muted">{t.qty} sold</div>
              </div>
              <span className="text-xs font-semibold text-pink-deep shrink-0">{money(t.revenue)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
