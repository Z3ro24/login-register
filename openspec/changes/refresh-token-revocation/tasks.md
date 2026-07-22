## 1. Database Schema & Migration

- [x] 1.1 Add `RefreshToken` model to `backend/prisma/schema.prisma` with relation to `User`, `token` (SHA-256 hash), `isRevoked`, and `expiresAt`.
- [x] 1.2 Run database migration (`prisma migrate dev --name add_refresh_token_table`) and regenerate Prisma client.

## 2. Token Hashing & AuthService Updates

- [x] 2.1 Add SHA-256 token hashing helper `hashToken(token: string): string` in `backend/src/auth/auth.service.ts`.
- [x] 2.2 Update `AuthService.signIn` to create a `RefreshToken` database record with the SHA-256 token hash.
- [x] 2.3 Update `AuthService.verifyRefreshToken` / `refresh` logic to look up token hash in DB, check `isRevoked === false`, and perform token rotation (revoke old token, create new token record).
- [x] 2.4 Update `AuthService` and `AuthController.logout` to invalidate the refresh token in DB (`isRevoked: true`) during logout.

## 3. Unit Testing & Verification

- [x] 3.1 Update `auth.service.spec.ts` unit tests to mock `prisma.refreshToken` operations and verify token rotation and revocation.
- [x] 3.2 Verify backend build (`pnpm run build`) and test execution (`pnpm test`).
