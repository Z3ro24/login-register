## Why

Clearing client-side HTTP-Only cookies during `/auth/logout` does not invalidate a JWT on the server, leaving stolen refresh tokens active until expiration. Storing SHA-256 hashes of refresh tokens in the database enables instant server-side revocation and automatic token rotation upon refresh.

## What Changes

- **Database Model (`schema.prisma`)**: Add `RefreshToken` model storing SHA-256 token hashes, `userId` relation, `isRevoked` flag, and `expiresAt` timestamp. Execute Prisma database migration.
- **Login Flow (`POST /auth/login`)**: Hash the generated `refreshToken` with SHA-256 and insert a record into `RefreshToken` table.
- **Refresh Flow (`POST /auth/refresh`)**: Verify JWT signature, hash incoming cookie token, look up token in DB, enforce `isRevoked === false`, rotate token by setting `isRevoked: true` on old token, save new hashed token record, and set updated cookies.
- **Logout Flow (`POST /auth/logout`)**: Extract cookie `refreshToken`, hash it, update its DB record to `isRevoked: true` (or delete), and clear HTTP-Only cookies.

## Capabilities

### New Capabilities

### Modified Capabilities
- `auth`: Require DB-backed SHA-256 refresh token validation, automatic token rotation on `/auth/refresh`, and server-side revocation on `/auth/logout`.

## Impact

- **Database**: Adds `RefreshToken` table with relation to `User` in PostgreSQL database.
- **Backend Code**: `schema.prisma`, `AuthService` (`signIn`, `verifyRefreshToken`, `logout`, token hashing helper), and `AuthController`.
