import Link from "next/link";

function firstImage(images) {
  try {
    const arr = JSON.parse(images || "[]");
    return arr[0] || null;
  } catch {
    return null;
  }
}

export default function LowStockCard({ products }) {
  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg">Low Stock Alert</h3>
        <Link href="/admin/stock" className="text-xs font-semibold text-pink-deep hover:underline">
          View all →
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        {products.length === 0 && <p className="text-xs text-muted py-2">All products are well stocked. 🎉</p>}
        {products.map((p) => {
          const img = firstImage(p.images);
          const out = p.stock === 0;
          return (
            <div key={p.id} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
              <div className="w-10 h-10 rounded-lg bg-pink-lighter overflow-hidden shrink-0 flex items-center justify-center text-pink-deep text-[10px] font-bold">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  p.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{p.name}</div>
                <div className="text-[11px] text-muted">{out ? "Out of stock" : `Only ${p.stock} left`}</div>
              </div>
              <span
                className={
                  "text-[10px] px-2 py-1 rounded-full font-semibold shrink-0 " +
                  (out ? "bg-pink-lighter text-pink-deep" : "bg-gold/20 text-gold")
                }
              >
                {out ? "Out of Stock" : "Low Stock"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
