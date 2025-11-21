"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_ROLES, type AppRole } from "@/lib/constants/roles";
import { createUserAsSuperAdmin } from "@/actions/user.actions";
import type { CreateUserInput } from "@/actions/user.actions";

type CreateUserFormValues = CreateUserInput;

const createUserFormSchema: z.ZodType<CreateUserFormValues> = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio" })
    .min(2, "Ingresa al menos 2 caracteres"),
  email: z
    .string({ required_error: "El email es obligatorio" })
    .email("Ingresa un email válido"),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(8, "Debe tener al menos 8 caracteres"),
  role: z.enum(APP_ROLES, {
    errorMap: () => ({ message: "Selecciona un rol válido" }),
  }),
});

type RoleDetail = {
  label: string;
  helper: string;
};

const ROLE_DETAILS: Record<AppRole, RoleDetail> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    helper: "Acceso total al sistema",
  },
  OWNER: {
    label: "Owner",
    helper: "Propietario con reportes avanzados",
  },
  MANAGER: {
    label: "Manager",
    helper: "Gestión operativa diaria",
  },
  TENANT: {
    label: "Tenant",
    helper: "Portal de inquilinos",
  },
};

export function CreateUserForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "TENANT",
    },
    mode: "onSubmit",
  });

  const handleSubmit = async (values: CreateUserFormValues) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const result = await createUserAsSuperAdmin(values);

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      setSuccessMessage(
        `Usuario ${result.user.email} creado como ${ROLE_DETAILS[(result.user.role as AppRole)]?.label ?? result.user.role}`
      );

      // Conservamos el rol seleccionado para acelerar altas masivas.
      form.reset({
        name: "",
        email: "",
        password: "",
        role: values.role,
      });
    } catch (error) {
      console.error("[CreateUserForm] submit error", error);
      setServerError("No pudimos crear al usuario. Intenta nuevamente.");
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full" disabled={isSubmitting}>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {APP_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex flex-col text-left">
                        <span className="font-medium">
                          {ROLE_DETAILS[role].label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {ROLE_DETAILS[role].helper}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Define el tipo de acceso que tendrá el nuevo usuario.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  placeholder="Ej. María González"
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
                  placeholder="usuario@rent-shield.com"
                  disabled={isSubmitting}
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
              <FormLabel>Contraseña temporal</FormLabel>
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
                Pídeles que la cambien al iniciar sesión.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError ? (
          <FieldError
            className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2"
            errors={[{ message: serverError }]}
          />
        ) : null}

        {successMessage ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {successMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner className="text-primary-foreground" />
              Creando usuario...
            </>
          ) : (
            "Registrar usuario"
          )}
        </Button>
      </form>
    </Form>
  );
}
