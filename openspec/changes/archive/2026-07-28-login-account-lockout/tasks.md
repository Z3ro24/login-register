## 1. Backend Account Lockout Implementation

- [x] 1.1 Implement email failed-attempt tracker (`failedAttemptsMap`) in `AuthService` in `backend/src/auth/auth.service.ts`.
- [x] 1.2 Update `AuthService.signIn` to enforce 5-failed-attempts lockout rule and reset state on successful login.
- [x] 1.3 Add unit tests in `backend/src/auth/auth.service.spec.ts` for account lockout after 5 failed attempts and counter reset on success.

## 2. Verification

- [x] 2.1 Run backend tests (`pnpm test`) and verify 100% passing.
- [x] 2.2 Verify backend build (`pnpm run build`).
