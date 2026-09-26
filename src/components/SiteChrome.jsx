"use client";
import { usePathname } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function SiteChrome({ session, categories = [], children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader session={session} categories={categories} />
      <div className="pb-20 md:pb-0">{children}</div>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
