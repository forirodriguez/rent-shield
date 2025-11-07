import { ROLE_DASHBOARD_ROUTES } from "@/lib/dashboard-content";
import { requireAuth } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  const session = await requireAuth();
  const target = ROLE_DASHBOARD_ROUTES[session.user.role];

  if (!target) {
    redirect("/login");
  }

  redirect(target);
}
