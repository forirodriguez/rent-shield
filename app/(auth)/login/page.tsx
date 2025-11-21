import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { DemoCredentialsCard } from "@/components/auth/demo-credentials-card"
import { LoginForm } from "@/components/auth/login-form"
import { Button } from "@/components/ui/button"

type SearchParams = Record<string, string | string[] | undefined>

type LoginPageProps = {
  searchParams?: Promise<SearchParams>
}

const DEFAULT_CALLBACK_URL = "/dashboard"

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = (await searchParams) ?? {}
  const callbackUrl = getCallbackUrl(resolvedParams)

  return (
    <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <AuthCard
        title="Bienvenido de nuevo"
        description="Ingresa tus credenciales o selecciona Google para continuar."
        footer={
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>¿Aún no tienes cuenta?</span>
            <Button asChild variant="link" className="px-0 text-primary">
              <Link href="/register">Crea una cuenta</Link>
            </Button>
          </div>
        }
      >
        <LoginForm callbackUrl={callbackUrl} />
      </AuthCard>

      <DemoCredentialsCard callbackUrl={callbackUrl} />
    </section>
  );
}

function getCallbackUrl(searchParams: SearchParams) {
  const rawValue = searchParams.callbackUrl

  if (!rawValue) {
    return DEFAULT_CALLBACK_URL
  }

  if (Array.isArray(rawValue)) {
    return rawValue[0] ?? DEFAULT_CALLBACK_URL
  }

  return rawValue
}
