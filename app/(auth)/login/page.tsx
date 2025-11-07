import { LoginForm } from "@/components/auth/login-form";
/* import Link from "next/link"; */
import { Suspense } from "react";

function LoginContent() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido de nuevo
          </h1>
          <p className="text-gray-600">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
        </div>

        {/* Info Box - Credenciales de prueba */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            🔑 Credenciales de prueba
          </h3>
          <div className="space-y-1 text-xs text-blue-800">
            <p>
              <strong>Super Admin:</strong> superadmin@test.com
            </p>
            <p>
              <strong>Owner:</strong> owner@test.com
            </p>
            <p>
              <strong>Manager:</strong> manager@test.com
            </p>
            <p>
              <strong>Tenant:</strong> tenant@test.com
            </p>
            <p className="mt-2 text-blue-600">
              <strong>Password:</strong> password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
