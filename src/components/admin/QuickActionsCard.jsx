import Link from "next/link";
import { IconBox, IconGrid, IconImage, IconTag } from "./icons";

const ACTIONS = [
  { label: "Add Product", href: "/admin/products", icon: <IconBox /> },
  { label: "Manage Categories", href: "/admin/categories", icon: <IconGrid /> },
  { label: "Manage Banners", href: "/admin/banners", icon: <IconImage /> },
  { label: "Create Coupon", href: "/admin/coupons", icon: <IconTag /> },
];

export default function QuickActionsCard() {
  return (
    <div className="card p-4 md:p-5">
      <h3 className="font-serif text-lg mb-3">Quick Actions</h3>
      <div className="flex flex-col gap-1">
        {ACTIONS.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg text-xs font-semibold text-ink hover:bg-pink-lighter transition-colors"
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-lighter text-pink-deep shrink-0">
              {a.icon}
            </span>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
