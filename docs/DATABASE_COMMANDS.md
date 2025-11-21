# Database Diagnostic Commands

Este documento lista todos los comandos disponibles para diagnosticar y gestionar la base de datos.

## 🔍 Comandos de Diagnóstico

### 1. Probar conexión a la base de datos
```bash
npm run db:test
```
Verifica que la conexión a PostgreSQL funciona correctamente y muestra información sobre la base de datos.

### 2. Listar todos los usuarios
```bash
npm run db:users
```
Muestra todos los usuarios en la base de datos con su información básica (email, nombre, rol, si tienen contraseña).

### 3. Probar credenciales de login
```bash
npm run db:test-login <email> <password>
```
Prueba si un par de credenciales email/password funcionan correctamente.

**Ejemplo:**
```bash
npm run db:test-login test@example.com password123
```

### 4. Crear usuario de prueba
```bash
npm run db:create-test-user
```
Crea un usuario de prueba con credenciales conocidas:
- Email: `test@example.com`
- Password: `password123`
- Role: `SUPER_ADMIN`

### 5. Crear usuarios demo (RECOMENDADO)
```bash
npm run db:seed-demo
```
Crea 4 usuarios demo con diferentes roles. Si ya existen, los elimina y crea nuevos:
- **SUPER_ADMIN**: `superadmin@test.com` / `demo1234`
- **OWNER**: `owner@test.com` / `demo1234`
- **MANAGER**: `manager@test.com` / `demo1234`
- **TENANT**: `tenant@test.com` / `demo1234`

## 🗄️ Comandos de Gestión de Base de Datos

### 6. Abrir Prisma Studio
```bash
npm run db:studio
```
Abre una interfaz web visual para ver y editar datos en la base de datos.

### 7. Aplicar migraciones
```bash
npm run db:migrate
```
Aplica migraciones pendientes a la base de datos.

### 8. Sincronizar schema
```bash
npm run db:push
```
Sincroniza el schema de Prisma con la base de datos sin crear migraciones.

## 🐛 Troubleshooting

### Error: "Tenant or user not found"
Este error indica un problema de autenticación con PostgreSQL. Verifica:
1. Tu `DATABASE_URL` en `.env.local`
2. Que el usuario y contraseña de PostgreSQL son correctos
3. Que la base de datos existe

**Solución:** Ejecuta `npm run db:test` para diagnosticar el problema.

### Error: "CredentialsSignin"
Este error indica que las credenciales de login son incorrectas. Verifica:
1. Que el email existe en la base de datos
2. Que la contraseña es correcta
3. Que el usuario tiene una contraseña (no es solo OAuth)

**Solución:** 
1. Ejecuta `npm run db:users` para ver todos los usuarios
2. Ejecuta `npm run db:test-login <email> <password>` para probar las credenciales
3. Si es necesario, ejecuta `npm run db:create-test-user` para crear un usuario de prueba

### La aplicación no se conecta pero los scripts sí
Esto puede indicar un problema con las variables de entorno. Verifica:
1. Que `.env.local` tiene las mismas credenciales que `.env`
2. Reinicia el servidor de desarrollo después de cambiar variables de entorno

## 📝 Credenciales de Prueba

### Usuarios Demo (Recomendado)
Después de ejecutar `npm run db:seed-demo`:

| Rol | Email | Password |
|-----|-------|----------|
| **SUPER_ADMIN** | superadmin@test.com | demo1234 |
| **OWNER** | owner@test.com | demo1234 |
| **MANAGER** | manager@test.com | demo1234 |
| **TENANT** | tenant@test.com | demo1234 |

### Usuario de Prueba Alternativo
Después de ejecutar `npm run db:create-test-user`:
- **Email:** test@example.com
- **Password:** password123
- **Role:** SUPER_ADMIN

## 🔐 Usuarios Existentes

Para ver la lista completa de usuarios existentes, ejecuta:
```bash
npm run db:users
```
