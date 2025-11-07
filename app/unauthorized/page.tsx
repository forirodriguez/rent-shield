import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
          Acceso restringido
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          No tienes permisos para ver esta vista
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Si crees que se trata de un error, contacta a un administrador o
          vuelve al inicio de sesión para cambiar de cuenta.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Ir a mi dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
