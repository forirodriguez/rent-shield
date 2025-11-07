import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticación - RentShield",
  description: "Inicia sesión o crea una cuenta",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">RS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">RentShield</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {children}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
          <p>© 2024 RentShield. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
