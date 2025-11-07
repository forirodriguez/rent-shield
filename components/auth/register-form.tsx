"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerUser } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  APP_ROLES,
  DEFAULT_APP_ROLE,
  getRoleNavigationPath,
  type AppRole,
} from "@/lib/constants/roles";

type RoleValue = AppRole;

type RoleOption = {
  value: RoleValue;
  label: string;
  description: string;
  icon: string;
  accent: string;
};

// Evitamos importar Prisma en el cliente manteniendo los valores del enum localmente.
const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "TENANT",
    label: "Tenant",
    description: "Inquilino con acceso a recibos y contratos",
    icon: "👤",
    accent: "text-teal-600",
  },
  {
    value: "MANAGER",
    label: "Manager",
    description: "Gestor operativo con control de unidades",
    icon: "👔",
    accent: "text-indigo-600",
  },
  {
    value: "OWNER",
    label: "Owner",
    description: "Propietario con reportes avanzados",
    icon: "🏢",
    accent: "text-orange-600",
  },
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Acceso total para auditoría y soporte",
    icon: "⚡",
    accent: "text-purple-600",
  },
];

const registerSchema = z
  .object({
    name: z
      .string({ error: "El nombre es obligatorio" })
      .min(2, "Ingresa al menos 2 caracteres"),
    email: z
      .string({ error: "El email es obligatorio" })
      .email("Ingresa un email válido"),
    password: z
      .string({ error: "La contraseña es obligatoria" })
      .min(8, "Debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string({ error: "Confirma tu contraseña" })
      .min(8, "Debe tener al menos 8 caracteres"),
    role: z.enum(APP_ROLES),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
      });
    }
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: DEFAULT_APP_ROLE,
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    try {
      const result = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      if (!result.success) {
        setServerError(result.error ?? "No pudimos crear tu cuenta");
        return;
      }

      const resolvedRole = result.user.role as RoleValue;

      // Intentamos iniciar sesión automáticamente para redirigir al tablero correcto sin pasos extra.
      const authResult = await signIn("credentials", {
        email: result.user.email,
        password: values.password,
        redirect: false,
      });

      if (authResult?.error) {
        // Si el inicio automático falla, devolvemos al login para que complete el flujo manualmente.
        router.push("/login?registered=true");
        router.refresh();
        return;
      }

      router.push(getRoleNavigationPath(resolvedRole));
      router.refresh();
    } catch (error) {
      setServerError("Ocurrió un error inesperado. Intenta nuevamente.");
      console.error("Register error", error);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>Selecciona tu rol</FormLabel>
                <FormDescription>
                  Usa la opción que represente mejor tu perfil actual.
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {ROLE_OPTIONS.map((option) => {
                      const radioId = `role-${option.value.toLowerCase()}`;
                      const isActive = field.value === option.value;

                      return (
                        <Label
                          key={option.value}
                          htmlFor={radioId}
                          className={cn(
                            "cursor-pointer rounded-xl border p-4 text-left transition-all",
                            "hover:border-primary/50 hover:bg-primary/5",
                            isActive
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-background"
                          )}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={radioId}
                            className="sr-only"
                            disabled={isSubmitting}
                          />
                          <span
                            className={cn(
                              "flex items-center gap-2 text-sm font-semibold",
                              option.accent
                            )}
                          >
                            <span aria-hidden className="text-lg">
                              {option.icon}
                            </span>
                            {option.label}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="name"
                      placeholder="Juan Pérez"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
                      autoComplete="new-password"
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Debe contener al menos 8 caracteres.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {serverError ? (
            <FieldError
              className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2"
              errors={[{ message: serverError }]}
            />
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="text-primary-foreground" />
                Creando cuenta...
              </>
            ) : (
              "Crear cuenta"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
