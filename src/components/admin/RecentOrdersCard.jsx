import Link from "next/link";
import { money } from "@/lib/utils";

const STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-600",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-gold/20 text-gold",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-pink-lighter text-pink-deep",
};

const PAYMENT_LABEL = { cod: "COD", bkash: "bKash", nagad: "Nagad" };

export default function RecentOrdersCard({ orders }) {
  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg">Recent Orders</h3>
        <Link href="/admin/orders" className="text-xs font-semibold text-pink-deep hover:underline">
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs min-w-[440px]">
          <thead>
            <tr className="text-muted text-left">
              <th className="font-semibold px-1 pb-2">Order ID</th>
              <th className="font-semibold px-1 pb-2">Customer</th>
              <th className="font-semibold px-1 pb-2">Amount</th>
              <th className="font-semibold px-1 pb-2">Payment</th>
              <th className="font-semibold px-1 pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-1 py-4 text-center text-muted">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="px-1 py-2.5 font-semibold whitespace-nowrap">#{o.orderNumber}</td>
                <td className="px-1 py-2.5 whitespace-nowrap">{o.customerName}</td>
                <td className="px-1 py-2.5 font-semibold text-pink-deep whitespace-nowrap">{money(o.total)}</td>
                <td className="px-1 py-2.5 whitespace-nowrap">{PAYMENT_LABEL[o.paymentMethod] || o.paymentMethod}</td>
                <td className="px-1 py-2.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}>
                    {o.status}
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
