import { ROLE_DASHBOARD_ROUTES } from "@/lib/dashboard-content";
import { requireAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/generated/prisma/client";

export default async function DashboardRedirectPage() {
  const session = await requireAuth();
  const role = session.user.role;

  const target = ROLE_DASHBOARD_ROUTES[role as UserRole];

  if (!target) {
    redirect("/login");
  }

  redirect(target);
}
