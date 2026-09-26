import Link from "next/link";

function formatExpiry(ts) {
  if (!ts) return "No expiry";
  return new Date(ts).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function CouponsCard({ coupons }) {
  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg">Coupons</h3>
        <Link href="/admin/coupons" className="text-xs font-semibold text-pink-deep hover:underline">
          Manage →
        </Link>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs min-w-[440px]">
          <thead>
            <tr className="text-muted text-left">
              <th className="font-semibold px-1 pb-2">Code</th>
              <th className="font-semibold px-1 pb-2">Type</th>
              <th className="font-semibold px-1 pb-2">Value</th>
              <th className="font-semibold px-1 pb-2">Expires</th>
              <th className="font-semibold px-1 pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-1 py-4 text-center text-muted">
                  No coupons yet.
                </td>
              </tr>
            )}
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-1 py-2.5 font-semibold whitespace-nowrap">{c.code}</td>
                <td className="px-1 py-2.5 capitalize whitespace-nowrap">{c.type}</td>
                <td className="px-1 py-2.5 whitespace-nowrap">
                  {c.type === "percent" ? `${c.value}%` : `৳ ${c.value}`}
                </td>
                <td className="px-1 py-2.5 whitespace-nowrap text-muted">{formatExpiry(c.expiresAt)}</td>
                <td className="px-1 py-2.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
