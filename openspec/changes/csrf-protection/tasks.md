## 1. Backend CSRF Protection

- [x] 1.1 Expose `GET /auth/csrf-token` endpoint in `backend/src/auth/auth.controller.ts` using `generateToken(req, res)` from `csrf.config.ts`.
- [x] 1.2 Enable `app.use(doubleCsrfProtection)` global middleware in `backend/src/main.ts` after `cookieParser`.

## 2. Frontend CSRF Token Integration

- [x] 2.1 Add `getCsrfToken` method in `frontend/src/services/authService.ts`.
- [x] 2.2 Add `setCsrfToken` helper and Axios request interceptor in `frontend/src/services/apiService.ts` to attach `x-csrf-token` header on mutating HTTP requests.
- [x] 2.3 Fetch CSRF token during `useAuthInit` startup in `frontend/src/hooks/useAuthInit.ts` and set it in `apiService`.

## 3. Verification

- [x] 3.1 Verify backend compilation (`pnpm run build`) and test suite (`pnpm test`).
- [x] 3.2 Verify frontend compilation (`pnpm run build`).
