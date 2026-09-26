import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProfileForm from "@/components/account/ProfileForm";

export default async function AccountProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "owner") {
    return (
      <div>
        <h1 className="font-serif text-2xl mb-1">My Profile</h1>
        <p className="text-sm text-muted">
          Owner details are managed from the admin panel's{" "}
          <a href="/admin/profile" className="text-pink-deep underline">My Profile</a> page.
        </p>
      </div>
    );
  }

  const dbUser = await db.select().from(users).where(eq(users.id, session.id)).get();

  return (
    <div>
      <h1 className="font-serif text-2xl mb-1">My Profile</h1>
      <p className="text-sm text-muted mb-6">Manage your personal information.</p>
      <ProfileForm
        initial={{
          name: dbUser?.name || session.name || "",
          email: dbUser?.email || session.email || "",
          phone: dbUser?.phone || "",
          avatarUrl: dbUser?.avatarUrl || "",
          dateOfBirth: dbUser?.dateOfBirth || "",
          gender: dbUser?.gender || "",
        }}
      />
    </div>
  );
}
