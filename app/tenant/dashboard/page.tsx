import { RoleDashboardView } from "@/components/dashboard/dashboard-view";
import { ROLE_DASHBOARD_CONTENT } from "@/lib/dashboard-content";
import { requireRole } from "@/lib/session";
import { UserRole } from "@prisma/client";

export default async function TenantDashboardPage() {
  const session = await requireRole(UserRole.TENANT);

  return (
    <RoleDashboardView
      user={{
        name: session.user.name,
        email: session.user.email ?? "sin-correo@rent-shield.local",
        role: session.user.role,
      }}
      content={ROLE_DASHBOARD_CONTENT[UserRole.TENANT]}
    />
  );
}
