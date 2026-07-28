# Full-Stack Authentication & Registration System

Sistema completo de autenticación y gestión de usuarios construido con una arquitectura robusta, segura y desacoplada entre un backend en **NestJS** y un frontend en **React + Vite**.

---

## 🛠️ Backend (NestJS API)

El backend expone una API RESTful modular bajo el prefijo `/api/v1`, implementando autenticación JWT basada en **Cookies HTTP-Only**, protección CSRF Double Submit Cookie, autenticación con Google OAuth 2.0 (`@nestjs/passport`), detección de reuso de tokens con revocación masiva, bloqueo temporal de cuenta por múltiples intentos fallidos por email, control de acceso por roles (RBAC) y persistencia con **Prisma ORM** y **PostgreSQL**.

### 🚀 Tecnologías del Backend
* **Framework:** [NestJS 11](https://nestjs.com/) (Node.js con TypeScript)
* **OAuth & Autenticación:** Passport.js (`@nestjs/passport`, `passport-google-oauth20`)
* **ORM & Base de Datos:** [Prisma ORM 7](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/)
* **Autenticación & Criptografía:** `@nestjs/jwt`, `bcrypt` (para contraseñas), `crypto` (hashing SHA-256 de tokens)
* **Seguridad Middleware & Throttling:** `helmet` (encabezados HTTP seguros), `cookie-parser`, `csrf-csrf` (Protección CSRF Double Submit Cookie), `@nestjs/throttler` (Rate Limiting por IP) + Bloqueo de cuenta por Email (Account Lockout)
* **Validación de Datos:** `class-validator` y `class-transformer` con `ValidationPipe` global y validación estricta de complejidad de contraseñas mediante Regex
* **Testing:** `Jest` (Pruebas unitarias para servicios y controladores)

---

## 📡 Endpoints del API (`/api/v1`)

### 🔐 Módulo de Autenticación (`/auth`)

| Método | Endpoint | Acceso | Rate Limit | Descripción | Body / Parámetros | Respuesta Ejemplo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/auth/csrf-token` | Público | Global | Emite el token CSRF e instala la cookie de validación `_csrf`. | N/A | `{ "csrfToken": "string" }` |
| `POST` | `/auth/login` | Público | **5 req/min (IP) + Bloqueo Email** | Autentica usuario. Bloquea la cuenta por 15 min tras 5 intentos fallidos consecutivos por email. | `{ "email": "...", "password": "..." }` | `{ "name": "...", "email": "...", "role": "USER" }` |
| `GET` | `/auth/google` | Público | Global | **Iniciar sesión con Google OAuth 2.0**. Redirige a la pantalla de consentimiento de Google. | N/A | Redirección a Google |
| `GET` | `/auth/google/callback` | Público | Global | **Callback de Google OAuth 2.0**. Procesa el código de autorización, crea/obtiene usuario en DB, emite cookies e inicia sesión en `/home`. | Query Params de Google | Redirección a `http://localhost:5173/home` |
| `GET` | `/auth/me` | Autenticado | Global | Valida la cookie `accessToken` activa y retorna los datos del perfil actual. | N/A | `{ "id": "uuid", "name": "...", "email": "...", "role": "USER" }` |
| `POST` | `/auth/refresh` | Público | Global | Rotación de Refresh Tokens. Detección de reuso: si se envía un token ya revocado, revoca **todas** las sesiones del usuario. | Cookie `refreshToken` | `{ "message": "Token refreshed successfully" }` |
| `POST` | `/auth/logout` | Público | Global | Cierra sesión en el dispositivo actual. Invalida el `refreshToken` en DB y borra cookies. | Cookie `refreshToken` | `{ "message": "Logged out successfully" }` |
| `POST` | `/auth/logout-all` | Autenticado | Global | **Cierra sesión en todos los dispositivos**. Invalida todos los `RefreshToken` del usuario en DB y borra cookies. | N/A | `{ "message": "Logged out from all devices successfully" }` |

---

### 👤 Módulo de Usuarios (`/users`)

| Método | Endpoint | Acceso | Rate Limit | Descripción | Body / Parámetros | Respuesta Ejemplo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users` | Público | **5 req/min** | Registra un nuevo usuario con validación estricta de complejidad de contraseña. | `{ "name": "...", "email": "...", "password": "..." }` | `{ "id": "uuid", "name": "...", "email": "...", "role": "USER" }` |
| `GET` | `/users` | Solo Admin | Global | Obtiene la lista completa de usuarios registrados. | N/A | `[{ "id": "uuid", "name": "...", "email": "..." }]` |
| `GET` | `/users/:id` | Autenticado | Global | Obtiene los detalles de un usuario por su ID. | Param: `id` (UUID) | `{ "id": "uuid", "name": "...", "email": "..." }` |
| `PATCH` | `/users/:id` | Propietario / Admin | Global | Actualiza los datos del usuario especificado. | Body con campos a actualizar | `{ "id": "uuid", "name": "..." }` |
| `DELETE` | `/users/:id` | Solo Admin | Global | Realiza la eliminación lógica (soft delete) del usuario. | Param: `id` (UUID) | `{ "message": "User deleted successfully" }` |

---

## 🛡️ Medidas de Seguridad Implementadas en el Backend

1. **Google OAuth 2.0 Integrado & Reuso Homogéneo de Cookies (`@nestjs/passport`):**
   * Endpoint `GET /auth/google` inicia el flujo de autenticación con Google.
   * `GoogleStrategy` extrae y valida el perfil devuelto por Google. Si el usuario no existe en PostgreSQL, se provisiona automáticamente con `role: USER`.
   * El callback `GET /auth/google/callback` emite exactamente el mismo par de cookies HTTP-Only (`accessToken` y `refreshToken`) que el login por correo, manteniendo la misma capa de seguridad unificada.

2. **Bloqueo de Cuenta por Email (Account Lockout contra Botnets):**
   * Previene ataques de fuerza bruta distribuidos a través de múltiples IPs reales.
   * Si se registran **5 intentos fallidos consecutivos** para una misma cuenta de email dentro de un rango de 15 minutos, el backend **bloquea temporalmente el inicio de sesión para ese email por 15 minutos**, respondiendo con `HTTP 401 Unauthorized`. Al iniciar sesión con éxito, el contador se resetea a cero.

3. **Detección de Reuso de Tokens & Revocación Masiva (Refresh Token Reuse Detection):**
   * Al solicitar una rotación en `POST /auth/refresh`, si se presenta un token que ya fue revocado (`isRevoked: true`), el backend detecta una **posible brecha o robo de token** y ejecuta una revocación masiva automática (`UPDATE refresh_tokens SET is_revoked = true WHERE user_id = X`), cerrando inmediatamente la sesión en **todos los dispositivos** del usuario.

4. **Cierre de Sesión en Todos los Dispositivos (`POST /auth/logout-all`):**
   * Endpoint dedicado que permite invalidar en la base de datos todos los tokens de refresco emitidos para la cuenta del usuario, cerrando sesión activamente en cualquier navegador o aplicación donde estuviera abierta.

5. **Rate Limiting Granular Estricto & Protección Anti-Spoofing (`@Throttle` + `trust proxy: 1`):**
   * `POST /auth/login` y `POST /users` están protegidos con un límite de **máximo 5 peticiones por minuto por IP**.
   * Se configura `app.set('trust proxy', 1)` para confiar únicamente en el primer proxy inverso de confianza (ej. NGINX, Cloudflare) y desestimar falsificaciones del encabezado `X-Forwarded-For`.

6. **Validación de Complejidad de Contraseñas (Regex):**
   * `CreateUserDto` exige mediante `class-validator` contraseñas de al menos 8 caracteres con la presencia obligatoria de al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (`@$!%*?&`).

7. **Protección CSRF (Double Submit Cookie Pattern):**
   * Implementada a través de `csrf-csrf` y el middleware `doubleCsrfProtection`.
   * El cliente obtiene el token vía `GET /auth/csrf-token` y Axios lo adjunta en el encabezado HTTP `x-csrf-token` para todas las peticiones que modifican estado (`POST`, `PUT`, `PATCH`, `DELETE`).

8. **Cookies HTTP-Only & SameSite Strict:**
   * Las credenciales de sesión (`accessToken` y `refreshToken`) se emiten exclusivamente en encabezados HTTP `Set-Cookie` marcados como `httpOnly: true`, `sameSite: 'strict'` y `secure: process.env.NODE_ENV === 'production'`, protegiendo la sesión contra ataques **XSS**.

9. **Revocación Real en Servidor & Hashing SHA-256:**
   * Los tokens de refresco se guardan en PostgreSQL como **hashes SHA-256** (`crypto.createHash('sha256')`).

10. **Control de Acceso Basado en Roles (RBAC) - Seguro por Defecto:**
    * `AuthGuard` y `RolesGuard` están registrados como guardias globales (`APP_GUARD`). Todas las rutas creadas en el servidor requieren autenticación previa por defecto, salvo las explícitamente marcadas con `@Public()`.

11. **Variables de Entorno Estrictas:**
    * Se exige la presencia obligatoria de `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_CALLBACK_URL` en el archivo `.env`.

---

## 🎨 Frontend (React + Vite App)

El frontend proporciona una interfaz SPA moderna y responsiva orientada al manejo de estados globales, formularios declarativos, botón de autenticación con Google y rehidratación de sesión segura.

### 🚀 Tecnologías del Frontend
* **Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Bundler & Build Tool:** [Vite 8](https://vitejs.dev/)
* **Estado Global:** [Redux Toolkit](https://redux-toolkit.js.org/) (`@reduxjs/toolkit` y `react-redux`)
* **Peticiones HTTP & Asincronía:** [TanStack Query v5](https://tanstack.com/query) + [Axios](https://axios-http.com/)
* **Manejo de Formularios & Validación:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (`@hookform/resolvers`)
* **Navegación:** [React Router v7](https://reactrouter.com/) (`react-router-dom`)

---

## 🚀 Guía de Instalación y Ejecución

### Prerequisitos
* [Node.js](https://nodejs.org/) `>= 18`
* [pnpm](https://pnpm.io/) instalador de paquetes (`npm i -g pnpm`)
* Instancia en ejecución de **PostgreSQL**
* Credenciales de Google Cloud Console (OAuth 2.0 Client ID)

---

### 1. Configuración del Backend

1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```

2. Instala las dependencias:
   ```bash
   pnpm install
   ```

3. Crea un archivo `.env` en la raíz de `backend/` basado en el siguiente ejemplo:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://postgres:password@localhost:5432/login_register?schema=public"

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

   # Security Secrets
   COOKIE_SECRET="super-secret-cookie-key-here"
   JWT_ACCESS_SECRET="super-secret-access-token-key-here"
   JWT_REFRESH_SECRET="super-secret-refresh-token-key-here"
   CSRF_SECRET="super-secret-csrf-key-here"

   # Google OAuth 2.0 Configuration
   GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_CALLBACK_URL="http://localhost:3000/api/v1/auth/google/callback"
   ```

4. Ejecuta las migraciones de Prisma para preparar PostgreSQL:
   ```bash
   npx prisma migrate dev
   ```

5. Inicia el servidor backend en modo desarrollo:
   ```bash
   pnpm run start:dev
   ```
   * El servidor estará escuchando en `http://localhost:3000/api/v1`.

6. *(Opcional)* Ejecutar la suite de pruebas unitarias:
   ```bash
   pnpm test
   ```

---

### 2. Configuración del Frontend

1. En una nueva terminal, navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   pnpm install
   ```

3. Inicia el servidor de desarrollo Vite:
   ```bash
   pnpm run dev
   ```
   * La aplicación web estará disponible en `http://localhost:5173`.
