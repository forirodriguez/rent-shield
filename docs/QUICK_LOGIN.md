# 🚀 Quick Login Feature (Development Only)

## Descripción

La página de login incluye una funcionalidad de "Quick Login" que permite iniciar sesión con un solo clic usando usuarios de prueba predefinidos. Esta característica está **solo disponible en modo desarrollo** y se oculta automáticamente en producción.

## Ubicación

- **Componente:** `components/auth/demo-credentials-card.tsx`
- **Página:** `app/(auth)/login/page.tsx`

## Características

### ✨ Funcionalidades

1. **Login con un clic**: Cada usuario de prueba tiene un botón que inicia sesión automáticamente
2. **Estados de carga**: Muestra un spinner mientras se procesa el login
3. **Manejo de errores**: Muestra mensajes de error si algo falla
4. **Deshabilitación durante carga**: Todos los botones se deshabilitan mientras se procesa un login
5. **Redirección automática**: Redirige al dashboard correspondiente después del login exitoso
6. **Solo desarrollo**: Se oculta automáticamente en producción

### 👥 Usuarios Disponibles

| Rol | Email | Password | Variante de Botón |
|-----|-------|----------|-------------------|
| **Super Admin** | superadmin@test.com | demo1234 | Default (primary) |
| **Owner** | owner@test.com | demo1234 | Secondary |
| **Manager** | manager@test.com | demo1234 | Outline |
| **Tenant** | tenant@test.com | demo1234 | Outline |

## Uso

### Para Desarrolladores

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Navega a `/login`

3. En el lado derecho verás la tarjeta "Quick Login (Dev)"

4. Haz clic en cualquier botón de usuario para iniciar sesión automáticamente

### Para Testing

Esta funcionalidad es especialmente útil para:
- **Testing rápido** de diferentes roles de usuario
- **Demos** a clientes o stakeholders
- **Desarrollo** de features específicas por rol
- **QA** para probar permisos y vistas por rol

## Seguridad

### ⚠️ Importante

- ✅ **Solo visible en desarrollo**: `process.env.NODE_ENV !== "production"`
- ✅ **No se compila en producción**: Next.js elimina el código en build
- ✅ **Contraseñas hasheadas**: Las contraseñas en la base de datos están hasheadas con bcrypt
- ✅ **Usa NextAuth**: Utiliza el mismo flujo de autenticación que el login normal

### Verificación de Seguridad

Para verificar que no aparece en producción:

```bash
# Build de producción
npm run build

# Iniciar en modo producción
npm start

# Navega a /login - la tarjeta Quick Login NO debe aparecer
```

## Personalización

### Cambiar Usuarios

Edita el array `DEMO_CREDENTIALS` en `components/auth/demo-credentials-card.tsx`:

```typescript
const DEMO_CREDENTIALS = [
  { 
    role: "Tu Rol", 
    email: "tu@email.com", 
    variant: "default" as const 
  },
  // ... más usuarios
];
```

### Cambiar Password

Edita la constante `PASSWORD` en el mismo archivo:

```typescript
const PASSWORD = "tu_password_aqui";
```

**Nota:** Asegúrate de que los usuarios existan en la base de datos con esa contraseña.

### Crear Usuarios de Prueba

Usa el script de seed para crear/recrear usuarios:

```bash
npm run db:seed-demo
```

## Troubleshooting

### El botón no funciona

1. Verifica que el usuario existe en la base de datos:
   ```bash
   npm run db:users
   ```

2. Verifica que la contraseña es correcta:
   ```bash
   npm run db:test-login superadmin@test.com demo1234
   ```

3. Revisa los logs en la consola del navegador y en la terminal del servidor

### No veo la tarjeta Quick Login

1. Verifica que estás en modo desarrollo:
   ```bash
   echo $NODE_ENV  # Debe estar vacío o ser "development"
   ```

2. Verifica que el servidor está corriendo en modo dev:
   ```bash
   npm run dev  # NO npm start
   ```

### Error de autenticación

Si ves errores de autenticación, verifica:

1. Que NextAuth está configurado correctamente en `lib/auth.config.ts`
2. Que las variables de entorno están configuradas en `.env.local`
3. Que la base de datos está accesible

## Código de Ejemplo

### Uso del Componente

```tsx
import { DemoCredentialsCard } from "@/components/auth/demo-credentials-card";

export default function LoginPage() {
  return (
    <div>
      {/* Formulario de login normal */}
      <LoginForm callbackUrl="/dashboard" />
      
      {/* Quick Login (solo en dev) */}
      <DemoCredentialsCard callbackUrl="/dashboard" />
    </div>
  );
}
```

### Flujo de Login

```typescript
const handleQuickLogin = async (email: string) => {
  // 1. Limpiar errores previos
  setError(null);
  setLoadingEmail(email);

  // 2. Intentar login con NextAuth
  const result = await signIn("credentials", {
    email,
    password: PASSWORD,
    redirect: false,
  });

  // 3. Manejar errores
  if (result?.error) {
    setError(`Error al iniciar sesión como ${email}`);
    setLoadingEmail(null);
    return;
  }

  // 4. Redirigir al dashboard
  router.push(callbackUrl);
  router.refresh();
};
```

## Referencias

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [React Hook Form](https://react-hook-form.com/)
