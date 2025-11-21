import { CreateUserForm } from "@/components/forms/create-user-form";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { UserRole } from "@prisma/client";

const ROLE_ORDER: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.OWNER,
  UserRole.MANAGER,
  UserRole.TENANT,
];

const roleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.OWNER]: "Owner",
  [UserRole.MANAGER]: "Manager",
  [UserRole.TENANT]: "Tenant",
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

type UserSummary = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
};

export default async function SuperAdminUsersPage() {
  await requireRole(UserRole.SUPER_ADMIN); // Garantiza que sólo super-admin acceden al listado real.

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const roleTotals = users.reduce<Record<UserRole, number>>(
    (acc, user) => {
      acc[user.role] += 1;
      return acc;
    },
    {
      [UserRole.SUPER_ADMIN]: 0,
      [UserRole.OWNER]: 0,
      [UserRole.MANAGER]: 0,
      [UserRole.TENANT]: 0,
    }
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Control de accesos
          </p>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">
                Usuarios y roles
              </h1>
              <p className="text-sm text-slate-600">
                Crea cuentas reales con contraseña y asigna permisos según su función.
              </p>
            </div>
            <p className="text-sm text-slate-500">
              Total de usuarios: <span className="font-semibold text-slate-900">{users.length}</span>
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROLE_ORDER.map((role) => (
              <div
                key={role}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {roleLabels[role]}
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {roleTotals[role] ?? 0}
                </p>
                <p className="text-xs text-slate-500">Usuarios registrados</p>
              </div>
            ))}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Usuarios creados recientemente
                </h2>
                <p className="text-sm text-slate-600">
                  Revisa quién tiene acceso y desde cuándo.
                </p>
              </div>
            </div>
            <UsersTable users={users} />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">
                Crear nuevo usuario
              </h2>
              <p className="text-sm text-slate-600">
                Esta acción está limitada a super-admin para evitar altas no autorizadas.
              </p>
            </div>
            <div className="mt-6">
              <CreateUserForm />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function UsersTable({ users }: { users: UserSummary[] }) {
  if (!users.length) {
    return (
      <p className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
        Aún no hay usuarios cargados en la base. Usa el formulario para crear el primero.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3 text-right">Creado</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-slate-100">
              <td className="px-4 py-4">
                <p className="font-medium text-slate-900">
                  {user.name ?? "Sin nombre"}
                </p>
                <p className="text-xs text-slate-500">ID: {user.id}</p>
              </td>
              <td className="px-4 py-4 text-slate-600">{user.email}</td>
              <td className="px-4 py-4">
                <Badge variant="secondary">{roleLabels[user.role]}</Badge>
              </td>
              <td className="px-4 py-4 text-right text-slate-600">
                {dateFormatter.format(user.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
