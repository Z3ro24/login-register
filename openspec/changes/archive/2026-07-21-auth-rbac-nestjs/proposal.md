## Why

The backend application requires authentication and authorization (RBAC) to secure endpoints, manage user sessions securely using HTTP-only cookies (Access Token & Refresh Token), and restrict administrative routes to specific roles (e.g., ADMIN).

## What Changes

- Add `role` column to the `User` database model in Prisma schema.
- Create `AuthModule` containing controllers, services, guards, and decorators for authentication.
- Implement token-based authentication via HTTP-only cookies (`accessToken` and `refreshToken`).
- Set up a composite decorator `@Auth()` and custom guards (`AuthGuard`, `RolesGuard`) to enforce RBAC policies globally.
- Extend `UsersModule` DTOs and database calls to support the new `role` attribute.

## Capabilities

### New Capabilities
- `auth`: JWT Authentication and Role-based Access Control (RBAC) implementation including token generation, extraction from cookies, and route protection.

### Modified Capabilities
- `users`: User creation, retrieval, and update requirements must incorporate the `role` property.

## Impact

- **Database**: Prisma schema migration to add `role` (string column with a default value of 'USER') to the `User` model.
- **API Endpoints**: New `/auth/login` endpoint for sign-in, and secured `/users` endpoints requiring specific roles.
- **Dependencies**: Install `@nestjs/jwt` for token signing and validation.
