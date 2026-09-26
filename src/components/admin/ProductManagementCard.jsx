import Link from "next/link";
import { money } from "@/lib/utils";
import { IconEdit, IconEye, IconTrash } from "./icons";

function firstImage(images) {
  try {
    const arr = JSON.parse(images || "[]");
    return arr[0] || null;
  } catch {
    return null;
  }
}

function statusOf(p) {
  if (p.stock === 0) return { label: "Out of Stock", cls: "bg-pink-lighter text-pink-deep" };
  if (p.stock <= 5) return { label: "Low Stock", cls: "bg-gold/20 text-gold" };
  if (p.status === "hidden") return { label: "Hidden", cls: "bg-gray-100 text-gray-500" };
  return { label: "Active", cls: "bg-green-100 text-green-700" };
}

export default function ProductManagementCard({ products, categoryMap }) {
  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg">Product Management</h3>
        <Link href="/admin/products" className="text-xs font-semibold text-pink-deep hover:underline">
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs min-w-[520px]">
          <thead>
            <tr className="text-muted text-left">
              <th className="font-semibold px-1 pb-2">Image</th>
              <th className="font-semibold px-1 pb-2">Product Name</th>
              <th className="font-semibold px-1 pb-2">Category</th>
              <th className="font-semibold px-1 pb-2">Price</th>
              <th className="font-semibold px-1 pb-2">Stock</th>
              <th className="font-semibold px-1 pb-2">Status</th>
              <th className="font-semibold px-1 pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-1 py-4 text-center text-muted">
                  No products yet.
                </td>
              </tr>
            )}
            {products.map((p) => {
              const img = firstImage(p.images);
              const st = statusOf(p);
              return (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-1 py-2.5">
                    <div className="w-9 h-9 rounded-lg bg-pink-lighter overflow-hidden flex items-center justify-center text-[10px] font-bold text-pink-deep">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        p.name.charAt(0)
                      )}
                    </div>
                  </td>
                  <td className="px-1 py-2.5 font-semibold whitespace-nowrap max-w-[160px] truncate">{p.name}</td>
                  <td className="px-1 py-2.5 whitespace-nowrap text-muted">{categoryMap[p.categoryId] || "—"}</td>
                  <td className="px-1 py-2.5 whitespace-nowrap font-semibold">{money(p.price)}</td>
                  <td className="px-1 py-2.5 whitespace-nowrap">{p.stock}</td>
                  <td className="px-1 py-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-1 py-2.5">
                    <div className="flex items-center gap-2 text-muted">
                      <Link href="/admin/products" title="Edit in Products" className="hover:text-pink-deep">
                        <IconEdit />
                      </Link>
                      <Link href="/admin/products" title="View in Products" className="hover:text-pink-deep">
                        <IconEye />
                      </Link>
                      <Link href="/admin/products" title="Manage in Products" className="hover:text-pink-deep">
                        <IconTrash />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
