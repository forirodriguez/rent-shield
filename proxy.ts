import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { UserRole } from "./lib/generated/prisma/client";

const publicRoutes = ["/", "/login", "/register"];

const roleRoutes: Record<string, UserRole> = {
  "/super-admin": UserRole.SUPER_ADMIN,
  "/owner": UserRole.OWNER,
  "/manager": UserRole.MANAGER,
  "/tenant": UserRole.TENANT,
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  if (publicRoutes.includes(nextUrl.pathname)) {
    if (
      isLoggedIn &&
      (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")
    ) {
      const dashboardRoute = getDashboardRouteForRole(userRole!);
      return NextResponse.redirect(new URL(dashboardRoute, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  for (const [route, requiredRole] of Object.entries(roleRoutes)) {
    if (nextUrl.pathname.startsWith(route)) {
      if (userRole !== requiredRole) {
        const dashboardRoute = getDashboardRouteForRole(userRole!);
        return NextResponse.redirect(new URL(dashboardRoute, nextUrl));
      }
    }
  }

  return NextResponse.next();
});

function getDashboardRouteForRole(role: UserRole): string {
  const routes: Record<UserRole, string> = {
    SUPER_ADMIN: "/super-admin/dashboard",
    OWNER: "/owner/dashboard",
    MANAGER: "/manager/dashboard",
    TENANT: "/tenant/dashboard",
  };
  return routes[role] || "/tenant/dashboard";
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
