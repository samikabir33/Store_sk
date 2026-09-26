import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import LogoutButton from "@/components/LogoutButton";

const NAV = [
  { label: "My Profile", href: "/account/profile", icon: IconUser },
  { label: "My Orders", href: "/account", icon: IconBag },
  { label: "Wishlist", href: "/account/wishlist", icon: IconHeart },
  { label: "Addresses", href: "/account/addresses", icon: IconPin },
  { label: "Payments", icon: IconCard, soon: true },
  { label: "Security", icon: IconLock, soon: true },
  { label: "Coupons", icon: IconTag, soon: true },
  { label: "Settings", icon: IconGear, soon: true },
];

export default async function AccountLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const dbUser = session.role === "owner" ? null : await db.select().from(users).where(eq(users.id, session.id)).get();
  const avatarUrl = dbUser?.avatarUrl || "";
  const initial = (session.name || "A").trim().charAt(0).toUpperCase();

  return (
    <main className="max-w-[1000px] mx-auto px-5 md:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar */}
        <aside className="md:w-[220px] shrink-0">
          <div className="card p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-deep text-white flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={session.name} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-ink truncate">{session.name}</div>
                <div className="text-[11px] text-muted truncate">{session.email}</div>
              </div>
            </div>
          </div>

          <nav className="card p-2">
            {NAV.map((item) =>
              item.soon ? (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted/70 cursor-not-allowed"
                  title="Coming soon"
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </span>
                  <span className="text-[9px] uppercase tracking-wide bg-beige text-muted px-1.5 py-0.5 rounded-full shrink-0">Soon</span>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-ink hover:bg-pink-lighter transition-colors"
                >
                  <item.icon className="w-4 h-4 shrink-0 text-muted" />
                  {item.label}
                </Link>
              )
            )}
            <div className="flex items-center gap-2.5 px-3 py-2.5 border-t border-line mt-1 pt-3">
              <IconLogout className="w-4 h-4 shrink-0 text-muted" />
              <LogoutButton />
            </div>
          </nav>
        </aside>

        {/* Page content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </main>
  );
}

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  );
}
function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function IconHeart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20.3s-7-4.4-9.3-8.7C1.2 8.6 3 5.5 6.2 5.2c1.9-.2 3.5.8 5.8 3 2.3-2.2 3.9-3.2 5.8-3 3.2.3 5 3.4 3.5 6.4C19 15.9 12 20.3 12 20.3Z" />
    </svg>
  );
}
function IconPin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}
function IconCard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 10h19" />
    </svg>
  );
}
function IconLock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}
function IconTag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.5 12.5 12 21l-9-9L11.5 3.5H20.5V12.5Z" />
      <circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconGear(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.8 7.8 0 0 0 0-3l1.9-1.2-2-3.4-2.2.7a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.6a7.7 7.7 0 0 0-2.6 1.5l-2.2-.7-2 3.4L4.6 10.5a7.8 7.8 0 0 0 0 3L2.7 14.7l2 3.4 2.2-.7c.75.65 1.63 1.16 2.6 1.5l.5 2.6h4l.5-2.6a7.7 7.7 0 0 0 2.6-1.5l2.2.7 2-3.4-1.9-1.2Z" />
    </svg>
  );
}
function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
