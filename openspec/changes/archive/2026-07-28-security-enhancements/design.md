## Context

To harden system security against token compromise, credential brute-forcing, and weak passwords, we are implementing:
1. Refresh Token Reuse Detection with Global Revocation.
2. Granular Throttling (`@Throttle()`) on auth and registration endpoints.
3. Password Complexity Enforcement in `CreateUserDto`.
4. Endpoint for Revoking All Sessions (`POST /auth/logout-all`).

## Goals / Non-Goals

**Goals:**
- In `AuthService.rotateRefreshToken`: if `storedToken.isRevoked === true`, trigger `prisma.refreshToken.updateMany({ where: { userId: storedToken.userId }, data: { isRevoked: true } })` and throw `UnauthorizedException`.
- Add `@Throttle({ default: { limit: 5, ttl: 60000 } })` to `POST /auth/login` and `POST /users`.
- Update `CreateUserDto` password field with `@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)`.
- Add `revokeAllUserRefreshTokens(userId: string)` in `AuthService` and expose `POST /auth/logout-all` in `AuthController`.
- Add `logoutAll` in `frontend/src/services/authService.ts`.

**Non-Goals:**
- Modifying UI layouts or adding third-party OAuth providers.

## Decisions

### Decision 1: Immediate Mass Revocation on Token Reuse Detection
When a revoked token is presented to `/auth/refresh`, we immediately revoke all tokens for `storedToken.userId`.
- **Rationale**: An attempt to use a revoked token indicates that an attacker possessed an older rotated token. Revoking all sessions forces re-authentication on all devices and protects the user.

### Decision 2: Specific Throttle Rules via `@Throttle()`
Use `@Throttle({ default: { limit: 5, ttl: 60000 } })` on `login` and `create`:
- **Rationale**: Mitigates automated brute-force attacks on user credentials and registration spam without impacting normal usage of other endpoints.

## Risks / Trade-offs

- **[Risk]** Users using simple passwords on existing accounts might not be affected, but new registrations will fail if passwords don't meet complexity.
  - **Mitigation**: Clear validation messages returned in the response DTO errors.
