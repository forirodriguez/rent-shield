import { ROLE_DASHBOARD_ROUTES } from "@/lib/dashboard-content";
import { requireAuth } from "@/lib/session";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  const session = await requireAuth();
  const role = session.user.role;

  const target = ROLE_DASHBOARD_ROUTES[role as UserRole];

  if (!target) {
    redirect("/login");
  }

  redirect(target);
}
