## 1. Setup & Package Installation

- [x] 1.1 Ask user and install dependencies: `helmet`, `csurf`, `@types/csurf`, `cookie-parser`, `@types/cookie-parser`, and `@nestjs/throttler`.

## 2. Global Security Middleware in main.ts

- [x] 2.1 Integrate Helmet globally.
- [x] 2.2 Configure CORS enabling credentials and loading allowed origins from environment variables.
- [x] 2.3 Set up `cookie-parser` and `csurf` middleware for global CSRF protection.
- [x] 2.4 Enable `trust proxy` setting in Express underlying adapter to ensure rate limits parse correct client IPs.

## 3. Rate Limiting in AppModule

- [x] 3.1 Register `ThrottlerModule` in `AppModule` with limits (e.g., 100 requests per 1 minute window).
- [x] 3.2 Configure the global `ThrottlerGuard` to apply rate limiting across all endpoints.

## 4. CSRF Token Endpoint

- [x] 4.1 Create a simple endpoint (e.g., in a security or app controller) to expose the CSRF token to clients.
