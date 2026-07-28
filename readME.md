# Full-Stack Authentication & Registration System

Sistema completo de autenticación y gestión de usuarios construido con una arquitectura robusta, segura y desacoplada entre un backend en **NestJS** y un frontend en **React + Vite**.

---

## 🛠️ Backend (NestJS API)

El backend expone una API RESTful modular bajo el prefijo `/api/v1`, implementando autenticación JWT basada en **Cookies HTTP-Only**, protección CSRF Double Submit Cookie, detección de reuso de tokens con revocación masiva, control de acceso por roles (RBAC) y persistencia con **Prisma ORM** y **PostgreSQL**.

### 🚀 Tecnologías del Backend
* **Framework:** [NestJS 11](https://nestjs.com/) (Node.js con TypeScript)
* **ORM & Base de Datos:** [Prisma ORM 7](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/)
* **Autenticación & Criptografía:** `@nestjs/jwt`, `bcrypt` (para contraseñas), `crypto` (hashing SHA-256 de tokens)
* **Seguridad Middleware & Throttling:** `helmet` (encabezados HTTP seguros), `cookie-parser`, `csrf-csrf` (Protección CSRF Double Submit Cookie), `@nestjs/throttler` (Rate Limiting granular)
* **Validación de Datos:** `class-validator` y `class-transformer` con `ValidationPipe` global y validación estricta de complejidad de contraseñas mediante Regex
* **Testing:** `Jest` (Pruebas unitarias para servicios y controladores)

---

## 📡 Endpoints del API (`/api/v1`)

### 🔐 Módulo de Autenticación (`/auth`)

| Método | Endpoint | Acceso | Rate Limit | Descripción | Body / Parámetros | Respuesta Ejemplo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/auth/csrf-token` | Público | Global | Emite el token CSRF e instala la cookie de validación `_csrf`. | N/A | `{ "csrfToken": "string" }` |
| `POST` | `/auth/login` | Público | **5 req/min** | Autentica usuario, emite cookies HttpOnly (`accessToken` y `refreshToken`) y guarda hash en DB. | `{ "email": "...", "password": "..." }` | `{ "name": "...", "email": "...", "role": "USER" }` |
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

1. **Detección de Reuso de Tokens & Revocación Masiva (Refresh Token Reuse Detection):**
   * Al solicitar una rotación en `POST /auth/refresh`, el sistema consulta la tabla `refresh_tokens`.
   * Si se presenta un token que ya fue revocado (`isRevoked: true`), el backend detecta una **posible brecha o robo de token** y ejecuta una revocación masiva automática (`UPDATE refresh_tokens SET is_revoked = true WHERE user_id = X`), cerrando inmediatamente la sesión en **todos los dispositivos** del usuario.

2. **Cierre de Sesión en Todos los Dispositivos (`POST /auth/logout-all`):**
   * Endpoint dedicado que permite invalidar en la base de datos todos los tokens de refresco emitidos para la cuenta del usuario, cerrando sesión activamente en cualquier navegador o aplicación donde estuviera abierta.

3. **Rate Limiting Granular Estricto (`@Throttle`):**
   * `POST /auth/login` y `POST /users` están protegidos con un límite de **máximo 5 peticiones por minuto por IP**, impidiendo ataques de fuerza bruta contra credenciales y spam en el registro de cuentas.

4. **Validación de Complejidad de Contraseñas (Regex):**
   * `CreateUserDto` exige mediante `class-validator` contraseñas de al menos 8 caracteres con la presencia obligatoria de:
     - Al menos 1 letra mayúscula.
     - Al menos 1 letra minúscula.
     - Al menos 1 número.
     - Al menos 1 carácter especial (`@$!%*?&`).

5. **Protección CSRF (Double Submit Cookie Pattern):**
   * Implementada a través de `csrf-csrf` y el middleware `doubleCsrfProtection`.
   * El cliente obtiene el token vía `GET /auth/csrf-token` y Axios lo adjunta en el encabezado HTTP `x-csrf-token` para todas las peticiones que modifican estado (`POST`, `PUT`, `PATCH`, `DELETE`).

6. **Cookies HTTP-Only & SameSite Strict:**
   * Las credenciales de sesión (`accessToken` y `refreshToken`) se emiten exclusivamente en encabezados HTTP `Set-Cookie` marcados como `httpOnly: true`, `sameSite: 'strict'` y `secure: process.env.NODE_ENV === 'production'`, protegiendo la sesión contra ataques **XSS**.

7. **Revocación Real en Servidor & Hashing SHA-256:**
   * Los tokens de refresco se guardan en PostgreSQL como **hashes SHA-256** (`crypto.createHash('sha256')`).
   * Al ejecutar cerrar sesión (`POST /auth/logout`), el servidor actualiza el registro en la base de datos a `isRevoked: true`.

8. **Control de Acceso Basado en Roles (RBAC) - Seguro por Defecto:**
   * `AuthGuard` y `RolesGuard` están registrados como guardias globales (`APP_GUARD`). Todas las rutas creadas en el servidor requieren autenticación previa por defecto, salvo las explícitamente marcadas con `@Public()`.

9. **Sanitización Estricta de Respuestas HTTP:**
   * Las contraseñas hasheadas nunca se exponen en las respuestas del API.

10. **Variables de Entorno Estrictas:**
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

1. **Gestión de Cierre de Sesión Completo y Global:**
   * Métodos `logout()` y `logoutAll()` en `authService.ts` que coordinan la revocación en backend y la limpieza de memoria del token CSRF en el bloque `finally`.

2. **Obtención y Envío de Token CSRF:**
   * Al iniciar la aplicación, `useAuthInit` solicita `GET /auth/csrf-token` y almacena el token en memoria.
   * El interceptor de peticiones salientes de Axios adjunta automáticamente el encabezado `x-csrf-token` en todas las peticiones `POST`, `PUT`, `PATCH` y `DELETE`.

3. **Persistencia de Sesión al Recargar la Página (F5):**
   * El hook personalizado `useAuthInit` consulta `GET /auth/me` para rehidratar el estado de Redux en memoria sin guardar credenciales en `localStorage`.

4. **Axios Response Interceptor para Errores 401:**
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
│   │   ├── auth/             # Módulo de Autenticación (Guards, Decoradores, JWT, Refresh Tokens, Logout All)
│   │   ├── users/            # Módulo de Gestión de Usuarios y Roles (DTOs con Regex Validation)
│   │   ├── prisma/           # Servicio y filtros de excepción de Prisma
│   │   ├── csrf.config.ts    # Configuración del Middleware CSRF
│   │   └── main.ts           # Configuración global NestJS (Helmet, CORS, Cookies, CSRF, Throttler)
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
