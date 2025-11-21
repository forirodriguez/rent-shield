# 📘 Zod v4 - Guía Rápida de Referencia

> **Versión del proyecto**: Zod v4.1.12  
> **Última actualización**: 2025-11-21

## 🚨 Regla de Oro

**NUNCA uses sintaxis de Zod v3**. Causará errores de build en producción.

## ✅ Sintaxis Correcta (Zod v4)

### Campos Requeridos

```typescript
// ✅ CORRECTO
z.string({ error: "Campo requerido" })
z.number({ error: "Número requerido" })
z.boolean({ error: "Booleano requerido" })

// ❌ INCORRECTO (Zod v3)
z.string({ required_error: "Campo requerido" })
z.string({ errorMap: () => ({ message: "Campo requerido" }) })
```

### Validaciones con Mensajes

```typescript
// ✅ CORRECTO
z.string().email("Email inválido")
z.string().min(8, "Mínimo 8 caracteres")
z.number().positive("Debe ser positivo")

// ❌ INCORRECTO (Zod v3)
z.string().email({ message: "Email inválido" })
z.string().min(8, { message: "Mínimo 8 caracteres" })
```

### Enums

```typescript
// ✅ CORRECTO
z.enum(["ADMIN", "USER"], { error: "Rol inválido" })

// ❌ INCORRECTO (Zod v3)
z.enum(["ADMIN", "USER"], { errorMap: () => ({ message: "Rol inválido" }) })
```

### Manejo de Errores

```typescript
// ✅ CORRECTO
try {
  schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.issues); // ✅ .issues
  }
}

// ❌ INCORRECTO (Zod v3)
try {
  schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.errors); // ❌ .errors no existe
  }
}
```

## 📋 Checklist de Migración v3 → v4

Cuando encuentres código antiguo, actualiza:

- [ ] `{ required_error: "..." }` → `{ error: "..." }`
- [ ] `{ errorMap: () => ({ message: "..." }) }` → `{ error: "..." }`
- [ ] `.email({ message: "..." })` → `.email("...")`
- [ ] `.min(n, { message: "..." })` → `.min(n, "...")`
- [ ] `error.errors` → `error.issues`
- [ ] Remover `z.ZodType<T>` en schemas de formularios

## 🔧 Patrones Comunes

### Formulario Básico

```typescript
const schema = z.object({
  name: z.string({ error: "Nombre requerido" })
    .min(2, "Mínimo 2 caracteres"),
  email: z.string({ error: "Email requerido" })
    .email("Email inválido"),
  age: z.number({ error: "Edad requerida" })
    .min(18, "Debes ser mayor de edad"),
});

type FormData = z.infer<typeof schema>;
```

### Con React Hook Form

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ✅ SIN anotación de tipo explícita
const schema = z.object({
  email: z.string({ error: "Email requerido" }).email("Email inválido"),
  password: z.string({ error: "Password requerido" }).min(8, "Mínimo 8"),
});

type FormValues = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  
  // ...
}
```

### Server Action

```typescript
"use server";
import { z } from "zod";

const inputSchema = z.object({
  name: z.string({ error: "Nombre requerido" }),
  email: z.string({ error: "Email requerido" }).email("Email inválido"),
});

export type Input = z.infer<typeof inputSchema>;

export async function createUser(input: Input) {
  try {
    const data = inputSchema.parse(input);
    // ... lógica
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        issues: error.issues // ✅ .issues
      };
    }
    return { success: false, error: "Error desconocido" };
  }
}
```

## 🐛 Errores Comunes de Build

### Error 1: `Property 'errorMap' does not exist`

```typescript
// ❌ Causa
z.string({ errorMap: () => ({ message: "Error" }) })

// ✅ Solución
z.string({ error: "Error" })
```

### Error 2: `Property 'required_error' does not exist`

```typescript
// ❌ Causa
z.string({ required_error: "Error" })

// ✅ Solución
z.string({ error: "Error" })
```

### Error 3: `Property 'errors' does not exist on type 'ZodError'`

```typescript
// ❌ Causa
error.errors

// ✅ Solución
error.issues
```

### Error 4: Type conflicts con zodResolver

```typescript
// ❌ Causa
const schema: z.ZodType<FormValues> = z.object({ ... });

// ✅ Solución
const schema = z.object({ ... });
type FormValues = z.infer<typeof schema>;
```

## 📚 Ejemplos Completos

### Validación de Usuario

```typescript
const UserSchema = z.object({
  name: z.string({ error: "Nombre requerido" })
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres"),
  
  email: z.string({ error: "Email requerido" })
    .email("Email inválido"),
  
  password: z.string({ error: "Password requerido" })
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener una mayúscula")
    .regex(/[0-9]/, "Debe contener un número"),
  
  role: z.enum(["ADMIN", "USER", "GUEST"], {
    error: "Rol inválido",
  }),
  
  age: z.number({ error: "Edad requerida" })
    .int("Debe ser un número entero")
    .min(18, "Debes ser mayor de edad")
    .max(120, "Edad inválida"),
});
```

### Validación con Confirmación

```typescript
const PasswordSchema = z.object({
  password: z.string({ error: "Password requerido" })
    .min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string({ error: "Confirmación requerida" }),
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  }
);
```

### Campos Opcionales

```typescript
const ProfileSchema = z.object({
  // Requeridos
  email: z.string({ error: "Email requerido" }).email("Email inválido"),
  
  // Opcionales
  bio: z.string().optional(),
  website: z.string().url("URL inválida").optional(),
  
  // Con default
  notifications: z.boolean().default(true),
  theme: z.enum(["light", "dark"]).default("light"),
  
  // Array opcional con default
  tags: z.array(z.string()).optional().default([]),
});
```

## 🎯 Mejores Prácticas

1. **Siempre usa `{ error: "mensaje" }`** para campos requeridos
2. **Pasa mensajes directamente** a validadores (`.email("mensaje")`)
3. **Usa `error.issues`** en lugar de `error.errors`
4. **No anotes tipos explícitos** en schemas de formularios
5. **Infiere tipos** con `z.infer<typeof schema>`
6. **Valida en Server Actions** antes de procesar datos
7. **Maneja errores de Zod** con `instanceof z.ZodError`

## 🔗 Referencias

- **Documentación completa**: Ver `AGENTS.md` sección §7.1
- **Zod oficial**: https://zod.dev/
- **React Hook Form**: https://react-hook-form.com/

---

**Recuerda**: Si ves sintaxis de Zod v3 en el código, actualízala inmediatamente para evitar errores de build.
