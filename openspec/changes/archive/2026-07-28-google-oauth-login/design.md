## Context

We are extending the existing NestJS backend to support Google OAuth 2.0 sign-in via `@nestjs/passport` and `passport-google-oauth20`. Upon successful Google authentication, the backend will auto-provision new users in PostgreSQL if needed, issue the same `accessToken` and `refreshToken` HTTP-Only cookies used by credential login, and redirect the client to `http://localhost:5173/home`.

## Goals / Non-Goals

**Goals:**
- Install `@nestjs/passport`, `passport`, `passport-google-oauth20`, `@types/passport-google-oauth20`.
- Create `GoogleStrategy` in `backend/src/auth/strategies/google.strategy.ts` extending `PassportStrategy(Strategy, 'google')`.
- Expose `@Get('google')` and `@Get('google/callback')` in `AuthController`.
- Implement `validateOAuthUser(profile)` in `AuthService`:
  - Search user by email in PostgreSQL via `UsersService.findByEmail(email)`.
  - If missing, create new user via `usersService.create(...)` with a secure random hash for `password`.
  - Issue `accessToken` (30m) and `refreshToken` (7d) cookies using `res.cookie(...)` and persist hashed refresh token in DB (`prisma.refreshToken.create`).
  - Redirect client to `http://localhost:5173/home`.
- Add a "Continue with Google" button on `frontend/src/pages/LoginPage.tsx` pointing to `http://localhost:3000/api/v1/auth/google`.

**Non-Goals:**
- Implementing Apple, GitHub, or Facebook OAuth in this change (scoped strictly to Google OAuth 2.0).

## Decisions

### Decision 1: Direct Passport Guard for Google OAuth Route
Use `@UseGuards(AuthGuard('google'))` on `GET /auth/google` and `GET /auth/google/callback` with `@Public()` decorator.
- **Rationale**: Keeps OAuth flow lightweight and standard within NestJS architecture. `@Public()` ensures global `AuthGuard` skips token validation during OAuth handshake.

### Decision 2: Automatic User Provisioning
When Google returns a profile for an email not present in PostgreSQL DB, `AuthService.validateOAuthUser` will automatically insert a user record with `name`, `email`, and `role: USER`.
- **Rationale**: Eliminates friction so new users signing up via Google don't need a secondary registration form.

## Risks / Trade-offs

- **[Risk]** Missing Google OAuth credentials in `.env` could cause runtime errors on server boot.
  - **Mitigation**: Add defensive checks for `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `GoogleStrategy`.
