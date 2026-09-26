import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import AddressesManager from "@/components/account/AddressesManager";

export default async function AddressesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const rows =
    session.role === "owner"
      ? []
      : await db.select().from(addresses).where(eq(addresses.userId, session.id)).orderBy(desc(addresses.isDefault));

  return (
    <div>
      <h1 className="font-serif text-2xl mb-1">Addresses</h1>
      <p className="text-sm text-muted mb-6">Save addresses here so checkout fills in automatically.</p>
      <AddressesManager initial={rows} />
    </div>
  );
}
