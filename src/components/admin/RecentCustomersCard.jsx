import { money } from "@/lib/utils";

export default function RecentCustomersCard({ customers }) {
  return (
    <div className="card p-4 md:p-5">
      <h3 className="font-serif text-lg mb-3">Recent Customers</h3>
      <div className="flex flex-col gap-1">
        {customers.length === 0 && <p className="text-xs text-muted py-2">No customers yet.</p>}
        {customers.map((c) => (
          <div key={c.id} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
            <div className="w-9 h-9 rounded-full bg-pink-lighter overflow-hidden shrink-0 flex items-center justify-center text-pink-deep text-xs font-bold">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{c.name}</div>
              <div className="text-[11px] text-muted">{c.totalOrders} order{c.totalOrders === 1 ? "" : "s"}</div>
            </div>
            <span className="text-xs font-semibold text-pink-deep shrink-0">{money(c.totalSpent)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
