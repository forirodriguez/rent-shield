"use client";

import { useState } from "react";
import { registerUser } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { UserRole } from "@/lib/generated/prisma/client";

type RoleOption = {
  value: UserRole;
  label: string;
  description: string;
  icon: string;
  color: string;
  activeColor: string;
};

// Evitamos importar el runtime de Prisma en el cliente usando literales tipadas.
const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "TENANT",
    label: "Tenant",
    description: "Inquilino con acceso básico",
    icon: "👤",
    color: "bg-teal-50 border-teal-200 hover:border-teal-400",
    activeColor: "border-teal-500 bg-teal-100",
  },
  {
    value: "MANAGER",
    label: "Manager",
    description: "Gestor de propiedades",
    icon: "👔",
    color: "bg-indigo-50 border-indigo-200 hover:border-indigo-400",
    activeColor: "border-indigo-500 bg-indigo-100",
  },
  {
    value: "OWNER",
    label: "Owner",
    description: "Propietario con acceso extendido",
    icon: "🏢",
    color: "bg-orange-50 border-orange-200 hover-border-orange-400",
    activeColor: "border-orange-500 bg-orange-100",
  },
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Acceso completo al sistema",
    icon: "⚡",
    color: "bg-purple-50 border-purple-200 hover-border-purple-400",
    activeColor: "border-purple-500 bg-purple-100",
  },
] satisfies RoleOption[];

const DEFAULT_ROLE: UserRole = "TENANT";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(DEFAULT_ROLE);

  const validatePasswords = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPasswordError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!validatePasswords(password, confirmPassword)) {
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser({
        name,
        email,
        password,
        role: selectedRole, // Pasar el rol seleccionado
      });

      if (result.success) {
        router.push("/login?registered=true");
      } else {
        setError(result.error || "Error al registrar usuario");
      }
    } catch (error) {
      setError("Ocurrió un error inesperado. Intenta nuevamente.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Crear nueva cuenta
          </h1>
          <p className="text-gray-600">
            Completa el formulario para registrarte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecciona tu rol
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`
                    p-4 border-2 rounded-lg text-left transition-all
                    ${
                      selectedRole === role.value
                        ? role.activeColor
                        : role.color
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{role.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {role.label}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {role.description}
                      </p>
                    </div>
                    {selectedRole === role.value && (
                      <svg
                        className="w-5 h-5 text-green-600 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Campos del formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Mensajes de error */}
          {passwordError && (
            <div className="p-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md">
              {passwordError}
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:ring-offset-2 transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creando cuenta...
              </span>
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center text-sm text-gray-600 pt-4 border-t">
          <span>¿Ya tienes cuenta? </span>
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Inicia sesión
          </Link>
        </div>

        {/* Dev Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Nota de desarrollo:</strong> Este selector de roles está
            habilitado para pruebas. En producción, los roles deberían ser
            asignados por un administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
