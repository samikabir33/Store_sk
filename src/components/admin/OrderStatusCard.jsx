const STATUS_META = [
  { key: "pending", label: "Pending", cls: "bg-gray-100 text-gray-600" },
  { key: "confirmed", label: "Confirmed", cls: "bg-blue-100 text-blue-700" },
  { key: "shipped", label: "Shipped", cls: "bg-gold/20 text-gold" },
  { key: "delivered", label: "Delivered", cls: "bg-green-100 text-green-700" },
  { key: "cancelled", label: "Cancelled", cls: "bg-pink-lighter text-pink-deep" },
];

export default function OrderStatusCard({ orders }) {
  const total = orders.length || 1;
  const counts = Object.fromEntries(STATUS_META.map((s) => [s.key, 0]));
  for (const o of orders) {
    if (counts[o.status] !== undefined) counts[o.status] += 1;
  }

  return (
    <div className="card p-4 md:p-5">
      <h3 className="font-serif text-lg mb-3">Order Status</h3>
      <div className="flex flex-col gap-3">
        {STATUS_META.map((s) => {
          const count = counts[s.key];
          const pct = Math.round((count / total) * 100);
          return (
            <div key={s.key}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.cls}`}>{s.label}</span>
                <span className="text-xs font-semibold text-muted">{count}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-pink-lighter overflow-hidden">
                <div className="h-full bg-pink-deep rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
