import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import type { RoleDashboardContent } from "@/lib/dashboard-content";
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

type RoleAccent = {
  gradient: string;
  border: string;
  chip: string;
};

// En lugar de duplicar headers por vista, asignamos acentos por rol y mantenemos un único shell server-side.
const ROLE_ACCENTS: Record<UserRole, RoleAccent> = {
  [UserRole.SUPER_ADMIN]: {
    gradient: "from-slate-950 via-slate-900 to-blue-950",
    border: "border-white/15",
    chip: "bg-white/15 text-blue-100 border border-white/30",
  },
  [UserRole.OWNER]: {
    gradient: "from-slate-950 via-indigo-900 to-purple-900",
    border: "border-indigo-400/30",
    chip: "bg-purple-400/20 text-fuchsia-100 border border-white/30",
  },
  [UserRole.MANAGER]: {
    gradient: "from-slate-950 via-emerald-900 to-slate-900",
    border: "border-emerald-400/30",
    chip: "bg-emerald-400/20 text-emerald-50 border border-white/30",
  },
  [UserRole.TENANT]: {
    gradient: "from-slate-950 via-cyan-900 to-blue-900",
    border: "border-cyan-400/30",
    chip: "bg-cyan-400/20 text-cyan-50 border border-white/30",
  },
};

function formatRole(role: UserRole) {
  return role
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

// Server Component para mantener datos sensibles en el backend y reducir hidratación.
export function RoleDashboardView({ user, content }: RoleDashboardViewProps) {
  const accent = ROLE_ACCENTS[user.role];
  const friendlyRole = formatRole(user.role);
  const formattedDate = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <header
          className={`relative overflow-hidden rounded-4xl border ${accent.border} bg-gradient-to-br ${accent.gradient} p-8`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)] opacity-60 blur-[120px]" />
          <div className="relative flex flex-wrap gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {content.hero.kicker}
              </p>
              <h1 className="text-4xl font-semibold text-white">
                {content.title}
              </h1>
              <p className="text-lg text-white/90">{content.hero.highlight}</p>
              <p className="text-sm text-white/70">{content.hero.helper}</p>
            </div>

            <div className="ml-auto flex w-full max-w-xs flex-col gap-4 rounded-3xl bg-white/10 p-4 text-white/80 sm:w-auto sm:text-right">
              <div
                className={`self-start rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${accent.chip}`}
              >
                {friendlyRole}
              </div>
              <div className="space-y-1 text-left text-sm sm:text-right">
                <p className="text-base font-semibold text-white">
                  {user.name ?? "Usuario sin nombre"}
                </p>
                <p>{user.email}</p>
              </div>
              <LogoutButton className="self-start border-white/30 text-white hover:bg-white/20 sm:self-end" />
            </div>
          </div>

          <div className="relative mt-6 rounded-3xl bg-white/10 p-4 text-sm text-white/80">
            {content.description}
          </div>
        </header>

        <nav className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-2 lg:grid-cols-4">
          {content.navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-2xl border border-white/5 bg-white/[0.04] p-4 transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                {item.badge && (
                  <span className="rounded-full border border-white/20 px-3 py-0.5 text-[11px] font-semibold text-white/80">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-white/70">{item.description}</p>
            </Link>
          ))}
        </nav>

        <section className="grid gap-4 md:grid-cols-3">
          {content.quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-white/30 hover:bg-white/10"
            >
              <p className="text-sm font-semibold text-white">{action.title}</p>
              <p className="mt-2 text-xs text-white/70">{action.helper}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white">
                {action.cta}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 6.75L21 10.5l-3.75 3.75M21 10.5H3"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    Indicadores clave
                  </p>
                  <p className="text-sm text-white/70">
                    Snapshot generado con datos sintéticos.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {content.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/5 bg-white/5 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-white/60">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-white/70">{stat.helper}</p>
                    {stat.trend && (
                      <p
                        className={`mt-3 text-xs font-semibold ${
                          stat.trend.positive
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }`}
                      >
                        {stat.trend.label}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                {content.spotlight.title}
              </p>
              <p className="mt-2 text-base text-white/80">
                {content.spotlight.description}
              </p>
              <ul className="mt-6 space-y-3">
                {content.spotlight.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-white/80"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="space-y-6">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Próximos pasos
              </p>
              <p className="text-sm text-white/70">
                Usa esta lista como checklist manual durante QA.
              </p>
              <ul className="mt-5 space-y-4">
                {content.nextSteps.map((step) => (
                  <li
                    key={step.title}
                    className="rounded-2xl border border-white/5 bg-white/5 p-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {step.title}
                    </p>
                    <p className="text-xs text-white/70">{step.description}</p>
                    {step.badge && (
                      <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
                        {step.badge}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Último acceso
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {formattedDate}
              </p>
              <p className="mt-2 text-sm text-white/70">
                Datos de referencia para validar la experiencia post login.
              </p>
              <div className="mt-4 space-y-2 text-sm text-white/75">
                <p>• Sesión activa con JWT strategy</p>
                <p>• Adaptador Prisma habilitado</p>
                <p>• Enrutamiento protegido por rol</p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
