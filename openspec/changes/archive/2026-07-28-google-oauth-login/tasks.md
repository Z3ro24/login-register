## 1. Backend Dependencies & Setup

- [x] 1.1 Install `@nestjs/passport`, `passport`, `passport-google-oauth20`, and `@types/passport-google-oauth20` in `backend`.
- [x] 1.2 Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` variables to `backend/.env`.

## 2. Backend Google OAuth Implementation

- [x] 2.1 Create `GoogleStrategy` in `backend/src/auth/strategies/google.strategy.ts`.
- [x] 2.2 Register `PassportModule` and `GoogleStrategy` in `backend/src/auth/auth.module.ts`.
- [x] 2.3 Implement `validateOAuthUser` in `backend/src/auth/auth.service.ts` to query/create user and issue JWT cookies.
- [x] 2.4 Add `@Get('google')` and `@Get('google/callback')` routes in `backend/src/auth/auth.controller.ts`.

## 3. Frontend Integration & UI

- [x] 3.1 Add "Continue with Google" button to `frontend/src/pages/LoginPage.tsx` linking to `http://localhost:3000/api/v1/auth/google`.

## 4. Verification & Testing

- [x] 4.1 Verify backend build (`pnpm run build`) and test execution (`pnpm test`).
- [x] 4.2 Verify frontend build (`pnpm run build`).
