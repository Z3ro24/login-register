## Why

To protect user accounts against credential theft, brute-force attacks, weak passwords, and token compromise, the application requires enhanced security controls:
1. Detection of reused/revoked refresh tokens with immediate global revocation of all active sessions for the compromised user.
2. Granular rate limiting on sensitive endpoints (`POST /auth/login` and `POST /users`).
3. Strong password complexity enforcement via DTO validation.
4. An endpoint `POST /auth/logout-all` allowing users to invalidate all active sessions across all devices.

## What Changes

- **Refresh Token Reuse Detection (`AuthService.rotateRefreshToken`)**: If a token presented for refresh is found in DB with `isRevoked: true`, revoke ALL active refresh tokens associated with that user ID (`updateMany({ where: { userId }, data: { isRevoked: true } })`) and throw an `UnauthorizedException`.
- **Strict Rate Limiting (`AuthController` & `UsersController`)**: Apply `@Throttle()` decorators:
  - `POST /auth/login`: Max 5 attempts per minute.
  - `POST /users`: Max 5 attempts per minute (or hour).
- **Password Complexity Validation (`CreateUserDto`)**: Enforce minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (`@$!%*?&`).
- **Logout All Devices (`POST /auth/logout-all`)**: Expose a protected endpoint in `AuthController` and `AuthService` that revokes all refresh tokens for the current user in DB and clears client cookies.
- **Frontend Service Update (`authService.ts`)**: Add `logoutAll` method to `authService`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `auth`: Enhance `/auth/refresh` to detect revoked token reuse and invalidate all user sessions, add `POST /auth/logout-all` endpoint, and apply strict rate limiting on `/auth/login`.
- `user-management`: Update `CreateUserDto` password validation rules and apply rate limiting on `POST /users`.
- `frontend-auth-logic`: Add `logoutAll` service method to `authService.ts`.

## Impact

- **Backend**: `AuthService`, `AuthController`, `UsersController`, `CreateUserDto`.
- **Frontend**: `authService.ts`.
