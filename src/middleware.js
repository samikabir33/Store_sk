import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { hasAccess, resolveKeyForPath } from "@/lib/permissions";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fahmidas-fashion-dev-secret-change-in-production"
);
const COOKIE_NAME = "ff_session";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

async function getSessionFromRequest(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // Login page must stay public.
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);

  if (!session || !["admin", "owner"].includes(session.role)) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Upload endpoint is shared by Products and Banners — allow either.
  if (pathname.startsWith("/api/admin/upload")) {
    if (hasAccess(session, "products") || hasAccess(session, "banners")) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "You don't have permission to upload files." }, { status: 403 });
  }

  const key = resolveKeyForPath(pathname);
  if (key && !hasAccess(session, key)) {
    if (isApi) {
      return NextResponse.json({ error: "You don't have permission to access this." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}
