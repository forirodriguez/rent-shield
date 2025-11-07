import type { RoleDashboardContent } from "@/lib/dashboard-content";
import { LogoutButton } from "@/components/auth/logout-button";
import { UserRole } from "@prisma/client";

interface DashboardUser {
  name: string | null | undefined;
  email: string;
  role: UserRole;
}

interface RoleDashboardViewProps {
  user: DashboardUser;
  content: RoleDashboardContent;
}

// Server Component para mantener la sesión en el backend y reducir hidratación en dashboards.
export function RoleDashboardView({ user, content }: RoleDashboardViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Rol: {user.role.replace(/_/g, " ")}
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {content.title}
            </h1>
            <p className="text-sm text-slate-600">{content.description}</p>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div className="rounded-full bg-slate-100 px-4 py-2 text-left text-xs font-medium text-slate-600 sm:text-right">
              <p className="text-slate-900">
                {user.name ?? "Usuario sin nombre"}
              </p>
              <p>{user.email}</p>
            </div>
            <LogoutButton />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Resumen rápido
                </p>
                <p className="text-base text-slate-600">
                  Datos simulados que te permiten validar permisos sin depender
                  todavía de datos reales.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {content.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-600">{stat.helper}</p>
                    {stat.trend && (
                      <p
                        className={`mt-2 text-xs font-semibold ${
                          stat.trend.positive
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {stat.trend.label}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Último acceso
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {new Intl.DateTimeFormat("es-MX", {
                dateStyle: "full",
                timeStyle: "short",
              }).format(new Date())}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Usa esta tarjeta solo como referencia visual para probar la
              experiencia post-inicio de sesión.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-700">
              <p>• Sesión activa con estrategia JWT</p>
              <p>• Adaptador Prisma habilitado</p>
              <p>• UI protegida por role-based routing</p>
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm lg:col-span-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Enfoque sugerido
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {content.spotlight.title}
              </h2>
              <p className="text-sm text-slate-600">
                {content.spotlight.description}
              </p>
            </div>

            <ul className="space-y-3">
              {content.spotlight.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-700"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-slate-900" />
                  {bullet}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Próximos pasos
              </p>
              <p className="text-sm text-slate-600">
                Usa estos puntos como checklist manual durante QA.
              </p>
            </div>

            <ul className="mt-4 space-y-4">
              {content.nextSteps.map((step) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-600">{step.description}</p>
                  {step.badge && (
                    <span className="mt-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold text-rose-700">
                      {step.badge}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}
