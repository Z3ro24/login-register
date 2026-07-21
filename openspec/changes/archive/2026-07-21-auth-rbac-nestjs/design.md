## Context

We are implementing authentication and authorization (RBAC) in the NestJS backend. We need to store user roles in the database, authenticate clients using Access and Refresh tokens stored in secure, HTTP-only cookies, and implement guards/decorators to control endpoint access.

## Goals / Non-Goals

**Goals:**
- Add `role` (string column) to the `User` Prisma model with a default value of `'USER'`.
- Implement `AuthModule` with JWT token signing and verification (`@nestjs/jwt`).
- Send JWT tokens to clients in secure HTTP-only, SameSite cookies (`accessToken` cookie valid for 30 minutes, `refreshToken` for 7 days).
- Implement a global `AuthGuard` to verify JWTs, and a `RolesGuard` to check roles.
- Create a composite decorator `@Auth(...roles)` and parameters decorator `@ActiveUser()`.
- Implement a `/auth/login` endpoint for credentials sign-in, and `/auth/refresh` to refresh access tokens.
- Secure existing `/users` endpoints so only authorized roles can manipulate data (e.g. only ADMIN can delete).

**Non-Goals:**
- Setting up third-party OAuth authentication.
- Implementing Redis-based session storage or token blacklisting.
- Password recovery flows.

## Decisions

### Decision 1: Database Role Attribute
We will add `role` as a string column in the Prisma `User` model, mapping to a TypeScript enum.
- **Prisma Schema**: `role String @default("USER")`
- **TypeScript Enum**:
  ```typescript
  export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
  }
  ```
- **Rationale**: Keeps model definition simple, flexible, and fully compatible with PostgreSQL migrations while leveraging TypeScript compile-time checks.

### Decision 2: Cookie-based JWT Transport (Secure-by-Default)
Tokens will be sent using `res.cookie(...)` instead of JSON bodies.
- **AccessToken Cookie**: Max-Age of 30 minutes (`1800000` ms), HTTP-only, secure, sameSite: `'strict'`.
- **RefreshToken Cookie**: Max-Age of 7 days (`604800000` ms), HTTP-only, secure, sameSite: `'strict'`.
- **Rationale**: Storing JWTs in HTTP-only cookies prevents client-side Javascript access, eliminating XSS steal vectors.

### Decision 3: Global AuthGuard & RolesGuard Integration
We will register `AuthGuard` as a global guard in `AppModule` using `APP_GUARD`.
- **Authentication**: All endpoints require a valid JWT by default. Public endpoints must be explicitly bypassed using a custom `@Public()` decorator.
- **Authorization**: The `RolesGuard` will be applied selectively at controller or route levels, or bundled within a composite `@Auth(...roles)` decorator:
  ```typescript
  export const Auth = (...roles: Role[]) => applyDecorators(
    Roles(...roles),
    UseGuards(AuthGuard, RolesGuard),
  );
  ```
- **Rationale**: Enforces a secure-by-default architecture where developers cannot accidentally expose protected endpoints.

### Decision 4: Token Refresh Mechanism
We will expose an `/auth/refresh` POST endpoint.
- **Logic**: It will read the `refreshToken` cookie, verify it against the JWT refresh secret, and generate a new `accessToken` cookie.
- **Rationale**: Enables seamless session extension without requiring the user to re-enter credentials every 30 minutes.

### Decision 5: Logout Cookie Clearance
We will expose an `/auth/logout` POST endpoint.
- **Logic**: It will call `res.clearCookie('accessToken')` and `res.clearCookie('refreshToken')` (or set their `Max-Age` to `0`) with the matching security flags (`httpOnly: true`, `secure: true`, `sameSite: 'strict'`).
- **Rationale**: Ensures complete termination of the user's active tokens on the client side without exposing token state to JavaScript.

## Risks / Trade-offs

- **[Risk]** Accessing cookies in cross-origin configurations might fail if sameSite is too strict.
  - **Mitigation** Set cookie `sameSite` to `'lax'` or `'none'` (if cross-origin) in production, but since the frontend will be served from the same domain/origin or dev server proxy, `'lax'` with `credentials: true` is standard.
- **[Risk]** Existing users in the database do not have a `role` field.
  - **Mitigation** The Prisma migration will automatically assign `'USER'` to all existing records since the column defines a `@default("USER")`.
