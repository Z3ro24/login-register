# Full-Stack Authentication & Registration System

Sistema completo de autenticación y gestión de usuarios construido con una arquitectura robusta, segura y desacoplada entre un backend en **NestJS** y un frontend en **React + Vite**.

---

## 🛠️ Backend (NestJS API)

El backend expone una API RESTful modular bajo el prefijo `/api/v1`, implementando autenticación JWT basada en **Cookies HTTP-Only**, protección CSRF Double Submit Cookie, control de acceso por roles (RBAC) y persistencia con **Prisma ORM** y **PostgreSQL**.

### 🚀 Tecnologías del Backend
* **Framework:** [NestJS 11](https://nestjs.com/) (Node.js con TypeScript)
* **ORM & Base de Datos:** [Prisma ORM 7](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/)
* **Autenticación & Criptografía:** `@nestjs/jwt`, `bcrypt` (para contraseñas), `crypto` (hashing SHA-256 de tokens)
* **Seguridad Middleware:** `helmet` (encabezados HTTP seguros), `cookie-parser`, `csrf-csrf` (Protección CSRF Double Submit Cookie), `@nestjs/throttler` (Rate Limiting)
* **Validación de Datos:** `class-validator` y `class-transformer` con `ValidationPipe` global
* **Testing:** `Jest` (Pruebas unitarias para servicios y controladores)

---

## 📡 Endpoints del API (`/api/v1`)

### 🔐 Módulo de Autenticación (`/auth`)

| Método | Endpoint | Acceso | Descripción | Body / Parámetros | Respuesta Ejemplo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/auth/csrf-token` | Público | Emite el token CSRF e instala la cookie de validación `_csrf`. | N/A | `{ "csrfToken": "string" }` |
| `POST` | `/auth/login` | Público | Autentica usuario, emite cookies HttpOnly (`accessToken` y `refreshToken`) y guarda hash en DB. | `{ "email": "...", "password": "..." }` | `{ "name": "...", "email": "...", "role": "USER" }` |
| `GET` | `/auth/me` | Autenticado | Valida la cookie `accessToken` activa y retorna los datos del perfil actual. | N/A | `{ "id": "uuid", "name": "...", "email": "...", "role": "USER" }` |
| `POST` | `/auth/refresh` | Público | Rotación de Refresh Tokens. Valida el token en DB, revoca el anterior y emite nuevas cookies. | Cookie `refreshToken` | `{ "message": "Token refreshed successfully" }` |
| `POST` | `/auth/logout` | Público | Cierra sesión. Invalida el `refreshToken` en DB (`isRevoked: true`) y borra cookies HttpOnly. | Cookie `refreshToken` | `{ "message": "Logged out successfully" }` |

---

### 👤 Módulo de Usuarios (`/users`)

| Método | Endpoint | Acceso | Descripción | Body / Parámetros | Respuesta Ejemplo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users` | Público | Registra un nuevo usuario en la plataforma. | `{ "name": "...", "email": "...", "password": "..." }` | `{ "id": "uuid", "name": "...", "email": "...", "role": "USER" }` |
| `GET` | `/users` | Solo Admin | Obtiene la lista completa de usuarios registrados. | N/A | `[{ "id": "uuid", "name": "...", "email": "..." }]` |
| `GET` | `/users/:id` | Autenticado | Obtiene los detalles de un usuario por su ID. | Param: `id` (UUID) | `{ "id": "uuid", "name": "...", "email": "..." }` |
| `PATCH` | `/users/:id` | Propietario / Admin | Actualiza los datos del usuario especificado. | Body con campos a actualizar | `{ "id": "uuid", "name": "..." }` |
| `DELETE` | `/users/:id` | Solo Admin | Realiza la eliminación lógica (soft delete) del usuario. | Param: `id` (UUID) | `{ "message": "User deleted successfully" }` |

---

## 🛡️ Medidas de Seguridad Implementadas en el Backend

1. **Protección CSRF (Double Submit Cookie Pattern):**
   * Implementada a través de `csrf-csrf` y el middleware `doubleCsrfProtection`.
   * El cliente obtiene el token vía `GET /auth/csrf-token` y Axios lo adjunta en el encabezado HTTP `x-csrf-token` para todas las peticiones que modifican estado (`POST`, `PUT`, `PATCH`, `DELETE`).

2. **Cookies HTTP-Only & SameSite Strict:**
   * Las credenciales de sesión (`accessToken` y `refreshToken`) se emiten exclusivamente en encabezados HTTP `Set-Cookie` marcados como `httpOnly: true`, `sameSite: 'strict'` y `secure: process.env.NODE_ENV === 'production'`.
   * Esto previene robos de sesión mediante **ataques XSS** (Cross-Site Scripting).

3. **Revocación Real de Tokens en Servidor & Hashing SHA-256:**
   * Los tokens de refresco se guardan en la tabla `refresh_tokens` de PostgreSQL procesados mediante **hashes SHA-256** (`crypto.createHash('sha256')`).
   * Al ejecutar cerrar sesión (`POST /auth/logout`), el servidor actualiza el registro en la base de datos a `isRevoked: true`.

4. **Refresh Token Rotation (Rotación de Tokens):**
   * Cada solicitud al endpoint `POST /auth/refresh` invalida el token de refresco anterior (`isRevoked: true`) y emite un nuevo par de tokens (`accessToken` y `refreshToken`) registrando el nuevo hash en la base de datos.

5. **Control de Acceso Basado en Roles (RBAC) - Seguro por Defecto:**
   * `AuthGuard` y `RolesGuard` están registrados como guardias globales (`APP_GUARD`). Todas las rutas creadas en el servidor requieren autenticación previa por defecto, salvo las explícitamente marcadas con `@Public()`.
   * Los permisos administrativos se restringen mediante `@Roles(Role.ADMIN)`.

6. **Sanitización Estricta de Respuestas HTTP:**
   * Las contraseñas hasheadas nunca se exponen en las respuestas del API.

7. **Variables de Entorno Estrictas:**
   * Se exige la presencia obligatoria de `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` y `COOKIE_SECRET` en el archivo `.env`.

---

## 🎨 Frontend (React + Vite App)

El frontend proporciona una interfaz SPA moderna y responsiva orientada al manejo de estados globales, formularios declarativos y rehidratación de sesión segura.

### 🚀 Tecnologías del Frontend
* **Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Bundler & Build Tool:** [Vite 8](https://vitejs.dev/)
* **Estado Global:** [Redux Toolkit](https://redux-toolkit.js.org/) (`@reduxjs/toolkit` y `react-redux`)
* **Peticiones HTTP & Asincronía:** [TanStack Query v5](https://tanstack.com/query) + [Axios](https://axios-http.com/)
* **Manejo de Formularios & Validación:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (`@hookform/resolvers`)
* **Navegación:** [React Router v7](https://reactrouter.com/) (`react-router-dom`)

---

### 🔑 Características de Seguridad y Sesión en el Frontend

1. **Obtención y Envío de Token CSRF:**
   * Al iniciar la aplicación, `useAuthInit` solicita `GET /auth/csrf-token` y almacena el token en memoria.
   * El interceptor de peticiones salientes de Axios adjunta automáticamente el encabezado `x-csrf-token` en todas las peticiones `POST`, `PUT`, `PATCH` y `DELETE`.

2. **Persistencia de Sesión al Recargar la Página (F5):**
   * El hook personalizado `useAuthInit` consulta `GET /auth/me` para rehidratar el estado de Redux en memoria sin guardar credenciales en `localStorage`.

3. **Axios Response Interceptor para Errores 401:**
   * Captura errores `401 Unauthorized` e intenta renovar la sesión llamando a `POST /auth/refresh` de forma transparente. Si falla, ejecuta `logout()` y redirige al login.

---

## 🚀 Guía de Instalación y Ejecución

### Prerequisitos
* [Node.js](https://nodejs.org/) `>= 18`
* [pnpm](https://pnpm.io/) instalador de paquetes (`npm i -g pnpm`)
* Instancia en ejecución de **PostgreSQL**

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

---

## 🧪 Estructura del Proyecto

```text
login+register/
├── backend/                  # Servidor NestJS API
│   ├── prisma/               # Esquema e historial de migraciones de PostgreSQL
│   ├── src/
│   │   ├── auth/             # Módulo de Autenticación (Guards, Decoradores, JWT, Refresh Tokens)
│   │   ├── users/            # Módulo de Gestión de Usuarios y Roles
│   │   ├── prisma/           # Servicio y filtros de excepción de Prisma
│   │   ├── csrf.config.ts    # Configuración del Middleware CSRF
│   │   └── main.ts           # Configuración global NestJS (Helmet, CORS, Cookies, CSRF, Pipes)
├── frontend/                 # Cliente SPA React
│   ├── src/
│   │   ├── hooks/            # Hooks personalizados (useAuthInit)
│   │   ├── navigation/       # Configuración de rutas (App.tsx)
│   │   ├── pages/            # Páginas (LoginPage, RegisterPage, HomePage, 404)
│   │   ├── services/         # Cliente Axios e Interceptores (apiService, authService)
│   │   ├── store/            # Redux Toolkit Store y auth.slice.ts
│   │   └── validators/       # Esquemas de validación Zod
└── README.md                 # Documentación del proyecto
```
