import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TAB_ROUTE_MAP: Record<string, string> = {
  overview: "/superadmin",
  tenants: "/superadmin/tenants",
  plans: "/superadmin/plans",
  invoices: "/superadmin/invoices",
  users: "/superadmin/users",
  audit: "/superadmin/audit-logs",
  "audit-logs": "/superadmin/audit-logs",
  health: "/superadmin/diagnostics",
  diagnostics: "/superadmin/diagnostics",
  themes: "/superadmin/themes",
};

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Root route redirect to /superadmin
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/superadmin";
    return NextResponse.redirect(url, 307);
  }

  // 2. Legacy /superadmin?tab=... query compatibility
  if (pathname === "/superadmin" && searchParams.has("tab")) {
    const tabParam = (searchParams.get("tab") || "").trim().toLowerCase();
    const destinationPath = TAB_ROUTE_MAP[tabParam];

    if (destinationPath) {
      const url = request.nextUrl.clone();
      url.pathname = destinationPath;
      url.searchParams.delete("tab");

      // If destination is /superadmin and tab was overview, avoid redirecting to itself if no params changed
      if (destinationPath === "/superadmin" && !url.search) {
        return NextResponse.redirect(url, 307);
      }

      return NextResponse.redirect(url, 307);
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/",
    "/superadmin",
    "/superadmin/:path*",
  ],
};

