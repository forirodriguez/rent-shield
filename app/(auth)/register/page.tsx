import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { RegisterForm } from "@/components/auth/register-form"
import { RoleGuidelinesCard } from "@/components/auth/role-guidelines-card"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  return (
    <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <AuthCard
        title="Crear una cuenta"
        description="Completa los datos para habilitar tu acceso."
        footer={
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>¿Ya tienes cuenta?</span>
            <Button asChild variant="link" className="px-0 text-primary">
              <Link href="/login">Inicia sesión</Link>
            </Button>
          </div>
        }
      >
        <RegisterForm />
      </AuthCard>

      <RoleGuidelinesCard />
    </section>
  )
}
