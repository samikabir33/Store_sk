"use client";
import { useEffect, useState } from "react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/customers").then((r) => r.json()).then((r) => setCustomers(r.customers || []));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-2xl">Customers</h1>
          <p className="text-sm text-muted">{customers.length} total (registered + guest checkout)</p>
        </div>
        <a href="/api/admin/customers/export" className="btn-primary !py-2 !px-4 !text-xs">⬇ Export CSV</a>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-pink-lighter text-xs">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Orders</th>
              <th className="text-left p-3">Total Spent</th>
              <th className="text-left p-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="p-3">{c.name}</td>
                <td className="p-3 text-xs">{c.phone || "—"}</td>
                <td className="p-3 text-xs text-muted">{c.email || "—"}</td>
                <td className="p-3">{c.totalOrders}</td>
                <td className="p-3 font-bold text-pink-deep">৳ {c.totalSpent.toLocaleString("en-BD")}</td>
                <td className="p-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.guest ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
                    {c.guest ? "Guest" : "Registered"}
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
