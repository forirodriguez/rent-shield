# AGENTS.md — Rent Shield (Next 16 • React 19 • Auth.js v5 • Prisma 6 • Tailwind 4)

> **Propósito** — Este archivo guía a un agente local (sin tests/commits/PRs) para crear código **eficiente, reutilizable y seguro** con Next.js 16 (App Router), React 19, Auth.js v5 (NextAuth), Prisma 6 y Tailwind CSS 4. El agente debe **evaluar alternativas** y **elegir la mejor** en cada tarea, dejando comentarios inline breves cuando tome decisiones importantes.

---

## 0) Parámetros del proyecto

- **Node**: 22.17.1 (LTS)
- **Framework**: Next.js 16 (App Router only, Server Components por defecto).
- **React**: 19.x
- **Auth**: Auth.js v5 (next-auth@5 beta), **Credentials + Google OAuth**, **Prisma Adapter** para cuentas/auditoría.
- **Sessions**: `strategy: "jwt"` (implementación sencilla).
- **DB**: PostgreSQL + Prisma 6 (client generado en `lib/generated/prisma`).
- **UI**: Tailwind CSS 4 + shadcn/ui + tailwind-merge.
- **Forms/validación**: react-hook-form v7 + zod v4.
- **Lint/format**: ESLint 9 + Prettier (sin romper reglas de TS estricto).
- **TS**: `strict: true` (prohibido `any` y `unknown`), `@/*` path alias.

> **Principio RSC** — Priorizar Server Components. Sólo usar Client Components cuando haya estado/efectos/handlers, animations o APIs del navegador.

---

## 1) Estructura mínima de carpetas (App Router)

```
src/
  app/
    (auth)/
      login/
      register/
      layout.tsx
    api/
      auth/[...nextauth]/route.ts
      revalidate/route.ts  // endpoint utilitario opcional para revalidaciones manuales
    manager/
    owner/
    super-admin/
    tenant/
  components/
    ui/        // wrappers de shadcn con design tokens
    forms/
  lib/
    auth/
      config.ts
      helpers.ts
    db/
      prisma.ts
    cache/
      tags.ts
    utils/
      env.ts
      types.ts
    generated/
      prisma/   // prisma client output
  styles/
    globals.css
  hooks/
  actions/     // Server Functions ("use server") para mutaciones y dominios
prisma/
  schema.prisma
proxy.ts
```

**Reglas**

- **Dominio primero**: crea subcarpetas en `actions/` (p. ej. `actions/user.ts`) con Server Functions por entidad.
- **UI reusable**: todo componente visual de shadcn se envuelve en `components/ui` para imponer tokens (Tailwind v4).
- **Import alias**: usar `@/lib/...`, `@/components/...`, etc.

---

## 2) Tailwind CSS v4 — tema base y uso

### 2.1 globals.css (tokens)

```css
/* src/styles/globals.css */
@import "tailwindcss";

/* Definir tokens con @theme (Tailwind v4) */
@theme {
  --font-sans: ui-sans-serif, system-ui, Inter, "Segoe UI", Roboto, Arial,
    "Apple Color Emoji", "Segoe UI Emoji";
  --color-bg: hsl(0 0% 100%);
  --color-fg: hsl(222 47% 11%);
  --color-primary: hsl(222 89% 56%);
  --color-primary-foreground: hsl(0 0% 100%);
  --color-muted: hsl(220 14% 96%);
  --color-border: hsl(220 13% 91%);
  --radius: 0.75rem; /* 12px */
}

:root {
  color-scheme: light;
}

html,
body,
#__next {
  height: 100%;
}
body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-fg);
}

/* Utilidades opcionales */
.container {
  width: 100%;
  margin-inline: auto;
  padding-inline: 1rem;
}
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}
```

### 2.2 patrones de uso

- Preferir clases utilitarias. Centralizar variantes en wrappers de shadcn.
- Usar **tailwind-merge** para combinar classNames y evitar colisiones.
- Mantener **tokens** en `@theme` y leerlos vía `var(--token)` cuando necesite CSS puro.

---

## 3) shadcn/ui — wrappers y consistencia

1. Instalar y generar componentes con CLI de shadcn.
2. Crear **wrappers** en `components/ui` para inyectar estilos base y tokens (por ejemplo, `Button.tsx` que extienda el `Button` de shadcn con tamaños/variants propios).
3. Evitar duplicación: cualquier ajuste se hace en el wrapper, no en cada page.

### 3.1 Directiva UI/SSR obligatoria

- **shadcn como base**: todo componente visual debe derivar de un wrapper de shadcn en `components/ui`; evita recrear primitivas con Tailwind sueltas salvo que no exista equivalente y documenta el motivo inline.
- **SSR primero**: cada vista se implementa como Server Component; sólo marca `"use client"` en piezas interactivas aisladas y justifica el trade-off en un comentario corto.
- **Code-splitting agresivo**: los componentes cliente deben ser los más pequeños posibles, importando lógica compartida desde Server Components/acciones; usa `React.lazy` o `next/dynamic` para cargar secciones interactivas pesadas y limita su superficie a handlers y estado local.
- **Reutilización disciplinada**: cuando una UI se repita en múltiples dominios, promuévela a `components/modules/<dominio>` o `components/forms/<uso>` y reexporta desde un `index.ts` para mantener una sola fuente de estilos y props controladas.
- **Convención de carpetas**: dentro de `/components`, mantén `ui/` (wrappers de shadcn), `forms/` (RHF + zod), `layout/` (shells estructurales) y subcarpetas por dominio (`modules/tenant`, `modules/owner`, etc.); crea nuevas carpetas sólo cuando existan ≥2 piezas relacionadas y documenta su propósito en el README del directorio si no es obvio.

---

## 4) Prisma 6 — cliente único y patrones

### 4.1 Cliente singleton

```ts
// src/lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
```

**Reglas**

- Importar siempre desde `"@prisma/client";`.
- Evitar múltiples instancias en dev/hot-reload.
- Usa `select` con typing explícito; no devolver entidades crudas a Cliente.

### 4.2 Migraciones y seguridad

- Mantener `prisma/schema.prisma` como fuente de verdad; generar client a `"@prisma/client";`.
- **Nunca** exponer campos sensibles (password, tokens).
- Añadir índices cuando haya filtros frecuentes (email en `User` ya es único; evalúa índices compuestos por consultas reales).
- Para paginación, preferir **cursor-based** sobre `skip/take` en tablas grandes.

---

## 5) Auth.js v5 — configuración y callbacks

### 5.1 Config base (JWT + Credentials + Google + PrismaAdapter)

```ts
// src/lib/auth/config.ts
import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Extiende tipos de sesión del lado del cliente
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role: import("@prisma/client").UserRole;
    };
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  // Sencillez: strategy JWT (sin persistir sesión). PrismaAdapter para accounts/verification.
  session: { strategy: "jwt" },
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      allowDangerousEmailAccountLinking: false,
    }),
    Credentials({
      authorize: async (raw) => {
        const { email, password } = credentialsSchema.parse(raw);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        const ok = await bcrypt.compare(password, user.password);
        return ok
          ? { id: user.id, name: user.name, email: user.email, role: user.role }
          : null;
      },
    }),
  ],
  callbacks: {
    // auth() en el server expone lo que retornes desde jwt()
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id as string;
        // @ts-expect-error extendemos token
        token.role = (user as any).role ?? token.role;
      }
      // Ejemplo: marcar proveedor OAuth si aplica
      if (account?.provider) token.provider = account.provider;
      return token;
    },
    session: async ({ session, token }) => {
      // Sólo para cliente (useSession). auth() ignora session() y lee de jwt().
      if (session.user && token) {
        session.user.id = String(token.id);
        // @ts-expect-error token extendido
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: "/auth/login" },
});
```

### 5.2 Uso en rutas y Server Components

```ts
// ejemplo en un Server Component o Route Handler
import { auth } from "@/lib/auth/config";

export default async function Page() {
  const session = await auth(); // Server-side; seguro
  // ...render
}
```

**Reglas**

- **`auth()`** sólo en server. **`useSession()`** en cliente.
- Campos sensibles **nunca** en `session()`; exponer sólo lo necesario.
- Para RBAC, crea helpers en `lib/auth/helpers.ts` (p. ej. `requireRole`).

---

## 6) Caching y revalidación (Next 16)

### 6.1 Principios

- `fetch()` en RSC cachea por defecto; usa `cache: "no-store"` para datos altamente volátiles.
- Añade **tags** a `fetch` (opción `next: { tags: ["users"] }`) para revalidar selectivamente con `revalidateTag("users")`.
- Tras **mutaciones en Server Functions**, llamar **inmediatamente** a `revalidatePath()` o `revalidateTag()` según el alcance del dato.

### 6.2 Helpers

```ts
// src/lib/cache/tags.ts
export const TAGS = {
  USERS: "users",
  PRODUCTS: "products",
} as const;
```

```ts
// Ejemplo de fetch con tag
export async function getUsers() {
  const res = await fetch(`${process.env.API_BASE_URL}/users`, {
    next: { tags: ["users"] },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}
```

```ts
// Ejemplo Server Function de mutación
"use server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { TAGS } from "@/lib/cache/tags";

export async function createUser(input: { name: string; email: string }) {
  await prisma.user.create({ data: input });
  revalidateTag(TAGS.USERS); // revalida inmediatamente
}
```

**Errores comunes a evitar**

- Mutar y **olvidar revalidar** (verás datos stale).
- Revalidar con un **tag** distinto al usado en `fetch`.
- Llamar revalidación en el cliente (no soportado).

---

## 7) Server Functions (React 19) y patrones de mutación

- Declarar con `"use server"` en el tope del archivo.
- Pasar funciones a componentes cliente **sólo** cuando sea necesario.
- Manejar errores con `try/catch` y devolver respuestas tipadas.
- Tras mutar, **revalidar** el caché adecuado (ver §6).

Ejemplo con formulario (RHF + zod):

```tsx
// src/components/forms/create-user-form.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUser } from "@/actions/user"; // Server Function
import { Button } from "@/components/ui/button";

const Schema = z.object({ name: z.string().min(1), email: z.string().email() });

type Values = z.infer<typeof Schema>;

export function CreateUserForm() {
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    mode: "onSubmit",
  });

  const onSubmit = async (values: Values) => {
    await createUser(values);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
      <input
        {...form.register("name")}
        className="border p-2 rounded"
        placeholder="Name"
      />
      <input
        {...form.register("email")}
        className="border p-2 rounded"
        placeholder="Email"
      />
      <Button type="submit">Create</Button>
    </form>
  );
}
```

---

## 7.1) Zod v4 — Sintaxis correcta y errores comunes

> **CRÍTICO**: Este proyecto usa **Zod v4**, que tiene cambios importantes en la API de mensajes de error. Usar sintaxis de v3 causará errores de build en producción.

### 7.1.1 Sintaxis correcta para mensajes de error

**✅ CORRECTO (Zod v4)**
```typescript
import { z } from "zod";

// Para campos requeridos, usa { error: "mensaje" }
const schema = z.object({
  name: z.string({ error: "El nombre es obligatorio" }),
  email: z.string({ error: "El email es obligatorio" }).email("Email inválido"),
  age: z.number({ error: "La edad es obligatoria" }).min(18, "Debes ser mayor de edad"),
  role: z.enum(["ADMIN", "USER"], { error: "Selecciona un rol válido" }),
});
```

**❌ INCORRECTO (Zod v3 - causará errores de build)**
```typescript
// NO USAR - sintaxis de Zod v3
const schema = z.object({
  name: z.string({ required_error: "mensaje" }), // ❌ required_error no existe en v4
  email: z.string({ errorMap: () => ({ message: "mensaje" }) }), // ❌ errorMap en params no existe
  role: z.enum(["ADMIN"], { errorMap: () => ({ message: "mensaje" }) }), // ❌ errorMap en enum
});
```

### 7.1.2 Patrones comunes

**Strings con validación**
```typescript
const UserSchema = z.object({
  // Campo requerido con mensaje personalizado
  name: z.string({ error: "El nombre es obligatorio" })
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres"),
  
  // Email
  email: z.string({ error: "El email es obligatorio" })
    .email("Ingresa un email válido"),
  
  // Password con múltiples validaciones
  password: z.string({ error: "La contraseña es obligatoria" })
    .min(8, "Mínimo 8 caracteres")
    .max(128, "Máximo 128 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula"),
});
```

**Numbers con validación**
```typescript
const ProductSchema = z.object({
  price: z.number({ error: "El precio es obligatorio" })
    .positive("Debe ser mayor a 0")
    .max(999999, "Precio demasiado alto"),
  
  quantity: z.number({ error: "La cantidad es obligatoria" })
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 unidad"),
});
```

**Enums**
```typescript
const APP_ROLES = ["SUPER_ADMIN", "OWNER", "MANAGER", "TENANT"] as const;

const CreateUserSchema = z.object({
  role: z.enum(APP_ROLES, {
    error: "Selecciona un rol válido", // ✅ Correcto en v4
  }),
});
```

**Opcionales y defaults**
```typescript
const ConfigSchema = z.object({
  // Campo opcional
  description: z.string().optional(),
  
  // Campo opcional con mensaje si se proporciona pero es inválido
  website: z.string({ error: "URL inválida" }).url().optional(),
  
  // Con valor por defecto
  isActive: z.boolean().default(true),
  
  // Opcional con transformación
  tags: z.array(z.string()).optional().default([]),
});
```

### 7.1.3 Integración con React Hook Form

**✅ Patrón correcto**
```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema SIN anotación de tipo explícita (deja que Zod infiera)
const formSchema = z.object({
  name: z.string({ error: "El nombre es obligatorio" })
    .min(2, "Mínimo 2 caracteres"),
  email: z.string({ error: "El email es obligatorio" })
    .email("Email inválido"),
});

// Inferir tipo del schema
type FormValues = z.infer<typeof formSchema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema), // ✅ Funciona correctamente
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // ...resto del componente
}
```

**❌ Evitar anotaciones de tipo explícitas**
```typescript
// ❌ NO HACER - puede causar conflictos de tipos
const formSchema: z.ZodType<FormValues> = z.object({
  // ...
});
```

### 7.1.4 Server Actions con Zod

```typescript
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// Schema para validación de input
const createUserSchema = z.object({
  name: z.string({ error: "El nombre es obligatorio" })
    .min(2, "Mínimo 2 caracteres"),
  email: z.string({ error: "El email es obligatorio" })
    .email("Email inválido"),
  password: z.string({ error: "La contraseña es obligatoria" })
    .min(8, "Mínimo 8 caracteres"),
  role: z.enum(["SUPER_ADMIN", "OWNER", "MANAGER", "TENANT"], {
    error: "Rol inválido",
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export async function createUser(input: CreateUserInput) {
  try {
    // Validar input
    const data = createUserSchema.parse(input);
    
    // Crear usuario
    const user = await db.user.create({ data });
    
    // Revalidar
    revalidatePath("/admin/users");
    
    return { success: true, user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Acceder a errores con .issues (NO .errors)
      return { 
        success: false, 
        error: "Datos inválidos",
        issues: error.issues, // ✅ Correcto
      };
    }
    return { success: false, error: "Error al crear usuario" };
  }
}
```

### 7.1.5 Manejo de errores de Zod

**✅ Acceder a errores correctamente**
```typescript
try {
  schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    // ✅ Usar .issues (NO .errors)
    console.log(error.issues);
    
    // Formatear errores para el usuario
    const formattedErrors = error.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }
}
```

**❌ Forma incorrecta**
```typescript
try {
  schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.errors); // ❌ .errors no existe en Zod v4
  }
}
```

### 7.1.6 Transformaciones y refinamientos

```typescript
const TransformSchema = z.object({
  // Transformar string a número
  age: z.string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().min(18, "Debes ser mayor de edad")),
  
  // Refinamiento personalizado
  password: z.string({ error: "Contraseña requerida" })
    .min(8)
    .refine(
      val => /[A-Z]/.test(val),
      { message: "Debe contener al menos una mayúscula" }
    ),
  
  // Validación condicional
  confirmPassword: z.string(),
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // Especifica dónde mostrar el error
  }
);
```

### 7.1.7 Checklist de migración Zod v3 → v4

Si encuentras código con sintaxis v3, actualízalo así:

- [ ] `{ required_error: "..." }` → `{ error: "..." }`
- [ ] `{ errorMap: () => ({ message: "..." }) }` → `{ error: "..." }`
- [ ] `.email({ message: "..." })` → `.email("...")`
- [ ] `.min(n, { message: "..." })` → `.min(n, "...")`
- [ ] `error.errors` → `error.issues`
- [ ] Remover anotaciones `z.ZodType<T>` en schemas de formularios

### 7.1.8 Errores de build comunes y soluciones

**Error**: `Property 'errorMap' does not exist`
```typescript
// ❌ Causa
z.string({ errorMap: () => ({ message: "..." }) })

// ✅ Solución
z.string({ error: "..." })
```

**Error**: `Property 'required_error' does not exist`
```typescript
// ❌ Causa
z.string({ required_error: "..." })

// ✅ Solución
z.string({ error: "..." })
```

**Error**: `Property 'errors' does not exist on type 'ZodError'`
```typescript
// ❌ Causa
if (error instanceof z.ZodError) {
  console.log(error.errors);
}

// ✅ Solución
if (error instanceof z.ZodError) {
  console.log(error.issues);
}
```

**Error**: Type conflicts con `zodResolver`
```typescript
// ❌ Causa
const schema: z.ZodType<FormValues> = z.object({ ... });

// ✅ Solución - dejar que Zod infiera el tipo
const schema = z.object({ ... });
type FormValues = z.infer<typeof schema>;
```

---

## 8) Seguridad y exposición de datos


- Nunca enviar `password`, `refresh_token`, `access_token` al cliente.
- En `jwt()` incluir sólo `id`, `role` y metadatos no sensibles.
- En Server Components, los objetos completos pueden vivir en el server, pero **no** serialices estructuras con secretos a props.
- Sanitiza cualquier payload antes de devolverlo a componentes cliente.

---

## 9) ENV y tipado de variables

Implementar validación con zod y exportar tipos seguros:

```ts
// src/lib/utils/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(16),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  API_BASE_URL: z.string().url().optional(),
});

export const ENV = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  API_BASE_URL: process.env.API_BASE_URL,
});
```

> **Nota**: Next ya gestiona `.env.local`. No usar `dotenv` manual salvo scripts fuera de Next.

---

## 10) Convenciones de TypeScript

- `strict: true`, sin `any`/`unknown`.
- Modelar tipos con **zod** y derivar `z.infer<>`.
- Crear tipos DTO para **input/output** de acciones y APIs.
- Exportar tipos comunes desde `lib/utils/types.ts`.

Ejemplo DTO:

```ts
// src/lib/utils/types.ts
import { z } from "zod";

export const UserCreateInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["SUPER_ADMIN", "OWNER", "MANAGER", "TENANT"]).default("TENANT"),
});
export type TUserCreateInput = z.infer<typeof UserCreateInput>;
```

---

## 11) Acceso basado en roles (RBAC)

```ts
// src/lib/auth/helpers.ts
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  return session;
}

export function hasRole(role: string, allowed: readonly string[]) {
  return allowed.includes(role);
}

export async function requireRole(allowed: readonly string[]) {
  const session = await requireAuth();
  if (!hasRole(session.user.role, allowed)) redirect("/");
  return session;
}
```

Uso en Server Component:

```tsx
export default async function AdminPage() {
  const { user } = await requireRole(["SUPER_ADMIN", "OWNER"]);
  return <div>Admin</div>;
}
```

---

## 12) Rutas, errores y DX

- Crear **Route Handlers** sólo cuando se exponga una API o webhooks.
- Preferir **Server Functions** para mutaciones desde UI interna.
- Centralizar manejo de errores con utilidades (`assert`, `invariant`, mapeo a `AppError`).

Ejemplo pequeño:

```ts
export class AppError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function invariant(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) throw new AppError(message, 400);
}
```

---

## 13) Rendimiento: patrones concretos

- **Evita hidratar** componentes innecesarios; usa RSC.
- **Streaming** en páginas pesadas (suspense/hydration boundaries).
- **Segmentación**: divide rutas en grupos (e.g. `(marketing)` vs `(app)`).
- **Memorización por request**: no abuses de caches globales si el dato cambia por usuario.
- **Imágenes**: `next/image` con `sizes` correctos y `priority` sólo para above-the-fold.
- **Revalidate inmediato** tras mutación (ver §6).
- **DB**: seleccionar sólo campos necesarios; crear índices cuando el patrón de consulta lo demuestre (usa `EXPLAIN ANALYZE`).

---

## 14) Prisma schema — puntos a vigilar

- `User.email` ya es `@unique`.
- `Account` tiene `@@unique([provider, providerAccountId])` (correcto para OAuth).
- Añadir índice en `Session.userId` si consultas por usuario.
- Si listados por `createdAt`, crear índice en `User.createdAt`.
- Password `String?` (nulo para OAuth) — validar en credenciales.

Ejemplo índices opcionales:

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String   @index
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  createdAt     DateTime  @default(now()) @index
  // ...resto
}
```

---

## 15) Login con formulario propio (Credentials) + Google

- Página `/auth/login` (client) con RHF+zod.
- Enviar a `signIn("credentials")` o a `signIn("google")`.
- Manejar errores de `authorize` con mensajes genéricos.

Snippet:

```tsx
"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type Values = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const params = useSearchParams();
  const form = useForm<Values>({ resolver: zodResolver(LoginSchema) });

  async function onSubmit(values: Values) {
    await signIn("credentials", {
      ...values,
      redirect: true,
      callbackUrl: params.get("callbackUrl") ?? "/",
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
      {/* inputs */}
      <button type="submit">Sign in</button>
      <button type="button" onClick={() => signIn("google")}>
        Sign in with Google
      </button>
    </form>
  );
}
```

---

## 16) Accesibilidad y UX

- Todos los inputs con `label` y `aria-*` apropiados.
- Focus visible; estados hover/active coherentes.
- Reducir motion si `prefers-reduced-motion`.

---

## 17) Checklist de PR internas del agente (aunque no haga PRs reales)

1. ¿Es RSC por defecto? Si no, justificar Client.
2. ¿DTOs validados vía zod?
3. ¿Server Function revalida cache tras mutación?
4. ¿No expone datos sensibles?
5. ¿Select mínimo en Prisma?
6. ¿Componente shadcn envuelto en `components/ui`?
7. ¿Clases tailwind limpias (tailwind-merge)?
8. ¿Tipos sin `any`/`unknown`?
9. ¿Imports con `@/`?
10. ¿Índices considerados cuando la query lo exige?

---

## 18) Pautas de resolución de problemas (pitfalls frecuentes)

- **auth() vs session()**: `auth()` (server) ignora `session()`; los datos expuestos provienen de `jwt()`.
- **Revalidación**: olvidar `revalidateTag/Path` tras mutar genera datos stale o UI que no refleja cambios.
- **RHF + Server Actions**: si pasas la action a un Client Component, manéjala con try/catch y feedback.
- **Tailwind v4**: tokens en `@theme`, no en `tailwind.config.js`.
- **Prisma en dev**: múltiples instancias si no usas singleton; puede lanzar warnings.
- **Zod v4**: usar sintaxis v3 (`required_error`, `errorMap` en params, `error.errors`) causará errores de build. Ver §7.1 para sintaxis correcta.

---

## 19) Scripts útiles (package.json)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 20) Roadmap opcional de mejora

- **Política de caché por segmento**: `(marketing)` con ISR/tags amplios; `(app)` con tags finos por entidad.
- **Feature flags** definidos en ENV con zod.
- **Logger estructurado** para server (pino) con sanitización.

---

### Fin

> El agente debe **seguir estas normas por defecto** y documentar cualquier excepción con un comentario breve en el archivo modificado (por qué se tomó la decisión y costo/beneficio).
