"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).optional(), // ← AGREGAR ESTA LÍNEA
});

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: UserRole; // ← AGREGAR ESTA LÍNEA
}) {
  try {
    const validated = registerSchema.parse(data);
    const requestedRole = validated.role ?? UserRole.TENANT;
    // Logueamos únicamente metadatos no sensibles para depurar errores de registro.
    console.info("[registerUser] Intentando crear usuario", {
      email: validated.email,
      role: requestedRole,
    });

    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return { success: false, error: "El email ya está registrado" };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const createdUser = await db.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: requestedRole, // ← MODIFICAR ESTA LÍNEA
      },
    });
    console.info("[registerUser] Usuario creado correctamente", {
      email: createdUser.email,
      role: createdUser.role,
      id: createdUser.id,
    });

    return { success: true };
  } catch (error) {
    console.error("[registerUser] Error al crear usuario", {
      email: data.email,
      role: data.role ?? UserRole.TENANT,
      error,
    });
    if (error instanceof z.ZodError) {
      return { success: false, error: "Datos inválidos" };
    }
    return { success: false, error: "Error al crear usuario" };
  }
}
