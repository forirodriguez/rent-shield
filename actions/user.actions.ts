"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { APP_ROLES } from "@/lib/constants/roles";

const createUserSchema = z.object({
  name: z
    .string({ error: "El nombre es obligatorio" })
    .min(2, "Ingresa al menos 2 caracteres"),
  email: z
    .string({ error: "El email es obligatorio" })
    .email("Ingresa un email válido"),
  password: z
    .string({ error: "La contraseña es obligatoria" })
    .min(8, "Debe tener al menos 8 caracteres"),
  role: z.enum(APP_ROLES, {
    error: "Selecciona un rol válido",
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

type CreateUserSuccess = {
  success: true;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
};

type CreateUserFailure = {
  success: false;
  error: string;
};

export type CreateUserResult = CreateUserSuccess | CreateUserFailure;

export async function createUserAsSuperAdmin(
  input: CreateUserInput
): Promise<CreateUserResult> {
  await requireRole(UserRole.SUPER_ADMIN);

  try {
    const data = createUserSchema.parse(input);

    const existingUser = await db.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Ya existe un usuario con ese email",
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const createdUser = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as UserRole, // Convertimos el literal a enum de Prisma
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    // Revalidamos la vista administrativa para reflejar el nuevo usuario inmediatamente.
    revalidatePath("/super-admin/users");

    return { success: true, user: createdUser };
  } catch (error) {
    console.error("[createUserAsSuperAdmin] Error", {
      error,
      // Solo logueamos datos no sensibles para evitar exponer contraseñas.
      input: {
        email: input.email,
        role: input.role,
      },
    });

    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos" };
    }

    return { success: false, error: "No pudimos crear el usuario" };
  }
}
