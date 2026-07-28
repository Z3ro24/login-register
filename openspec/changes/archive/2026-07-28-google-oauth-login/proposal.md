## Why

Users currently must register and log in using email and password credentials. To provide a frictionless, one-click authentication experience, the application needs to support Google OAuth 2.0 sign-in using `@nestjs/passport` while reusing the existing secure HTTP-Only JWT cookies (`accessToken` and `refreshToken`).

## What Changes

- **Backend Google OAuth Strategy (`GoogleStrategy`)**: Implement a Passport strategy using `passport-google-oauth20` that extracts user profile information (email, name) from Google OAuth tokens.
- **Backend Endpoints (`AuthController`)**:
  - `GET /auth/google`: Public endpoint to initiate the Google OAuth 2.0 consent flow.
  - `GET /auth/google/callback`: Public callback endpoint that processes Google's authorization code, provisions/queries the user in PostgreSQL, generates `accessToken` and `refreshToken` cookies, and redirects to the frontend dashboard (`/home`).
- **User Service Provisioning (`AuthService.validateOAuthUser`)**: Automatically create a user record with `role: USER` if the Google email does not exist in DB, or retrieve the existing user.
- **Frontend Google Sign-In Button**: Add a "Continue with Google" button on `LoginPage` redirecting to `http://localhost:3000/api/v1/auth/google`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `auth`: Add Google OAuth 2.0 authentication endpoints (`GET /auth/google` and `GET /auth/google/callback`) and automatic user provisioning upon successful OAuth consent.

## Impact

- **Backend Dependencies**: `@nestjs/passport`, `passport`, `passport-google-oauth20`, `@types/passport-google-oauth20`.
- **Backend Files**: `AuthModule`, `AuthController`, `AuthService`, `GoogleStrategy`.
- **Frontend Files**: `LoginPage.tsx`.
- **Environment**: Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` to `backend/.env`.
