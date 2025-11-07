import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

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

  // 1. Manejo de Rutas Públicas y Redirección de Logueados
  if (publicRoutes.includes(nextUrl.pathname)) {
    if (
      isLoggedIn &&
      (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")
    ) {
      // Usamos el rol con el operador de encadenamiento opcional (?)
      const userRole = req.auth?.user?.role;
      // Si está logueado pero no tiene rol (un estado anómalo), lo mandamos a logout/login
      if (!userRole) {
        return NextResponse.redirect(new URL("/api/auth/signout", nextUrl));
      }
      const dashboardRoute = getDashboardRouteForRole(userRole);
      return NextResponse.redirect(new URL(dashboardRoute, nextUrl));
    }
    return NextResponse.next();
  }

  /*   if (publicRoutes.includes(nextUrl.pathname)) {
    if (
      isLoggedIn &&
      (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")
    ) {
      const dashboardRoute = getDashboardRouteForRole(userRole!);
      return NextResponse.redirect(new URL(dashboardRoute, nextUrl));
    }
    return NextResponse.next();
  } */

  // 2. Verificación de Autenticación
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 3. **VERIFICACIÓN ESTRICTA DE ROL (Nueva Verificación)**
  const userRole = req.auth?.user?.role;
  if (!userRole) {
    // Si está autenticado (tiene una sesión), pero no tiene un rol válido.
    // Esto es un estado anómalo que debe ser resuelto.
    // Lo mejor es forzar el logout o redirigir a una página de error estricta.
    console.warn(`Usuario autenticado sin rol. Forzando logout.`);
    // Redirección a la ruta de NextAuth para cerrar la sesión
    return NextResponse.redirect(new URL("/api/auth/signout", nextUrl));
  }

  for (const [route, requiredRole] of Object.entries(roleRoutes)) {
    if (nextUrl.pathname.startsWith(route)) {
      if (userRole !== requiredRole) {
        // Redirige al usuario a su propio dashboard
        const dashboardRoute = getDashboardRouteForRole(userRole);
        return NextResponse.redirect(new URL(dashboardRoute, nextUrl));
      }
      // El rol es correcto para la ruta, permite el acceso.
      return NextResponse.next();
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
