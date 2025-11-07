import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { UserRole } from "./generated/prisma/client";

type SessionUser = NonNullable<Session["user"]> & {
  id: string;
  role: UserRole;
};

export type AuthenticatedSession = Session & {
  user: SessionUser;
};

export async function getCurrentSession(): Promise<AuthenticatedSession | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return session as AuthenticatedSession;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user;
}

export async function requireAuth(): Promise<AuthenticatedSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(role: UserRole) {
  const session = await requireAuth();

  if (session.user.role !== role) {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireAnyRole(roles: UserRole[]) {
  const session = await requireAuth();

  if (!roles.includes(session.user.role)) {
    redirect("/unauthorized");
  }

  return session;
}
