"use client"

import { useState, type ComponentProps } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FieldError, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const loginSchema = z.object({
  email: z
    .string({ required_error: "El email es obligatorio" })
    .email("Ingresa un email válido"),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
})

type LoginValues = z.infer<typeof loginSchema>

type LoginFormProps = {
  callbackUrl: string
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  })

  const handleCredentialsSubmit = async (values: LoginValues) => {
    setFormError(null)

    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    })

    if (result?.error) {
      setFormError(
        "Credenciales inválidas. Verifica tu email y contraseña."
      )
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    try {
      setFormError(null)
      setIsGoogleLoading(true)
      await signIn("google", { callbackUrl })
    } catch (error) {
      setFormError("No se pudo iniciar sesión con Google.")
      console.error("Google sign in error", error)
      setIsGoogleLoading(false)
    }
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCredentialsSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    aria-label="Correo electrónico"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    aria-label="Contraseña"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {formError ? (
            <FieldError
              className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2"
              errors={[{ message: formError }]}
            />
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isGoogleLoading}
          >
            {(isSubmitting || isGoogleLoading) && (
              <Spinner className="text-primary-foreground" />
            )}
            Iniciar sesión
          </Button>
        </form>
      </Form>

      <FieldSeparator>O continúa con</FieldSeparator>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isSubmitting || isGoogleLoading}
        onClick={handleGoogleSignIn}
      >
        {isGoogleLoading ? (
          <>
            <Spinner />
            Conectando...
          </>
        ) : (
          <>
            <GoogleIcon aria-hidden className="size-4" />
            Continuar con Google
          </>
        )}
      </Button>
    </div>
  )
}

function GoogleIcon(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" role="img" {...props}>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
