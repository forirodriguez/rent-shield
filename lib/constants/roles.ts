export const APP_ROLES = [
  "SUPER_ADMIN",
  "OWNER",
  "MANAGER",
  "TENANT",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const DEFAULT_APP_ROLE: AppRole = "TENANT";

export const ROLE_NAVIGATION_MAP: Record<AppRole, string> = {
  SUPER_ADMIN: "/super-admin/dashboard",
  OWNER: "/owner/dashboard",
  MANAGER: "/manager/dashboard",
  TENANT: "/tenant/dashboard",
} as const;

export function getRoleNavigationPath(role: AppRole) {
  return ROLE_NAVIGATION_MAP[role];
}
