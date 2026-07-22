## Context

The application stores session tokens in HTTP-Only cookies. To prevent Cross-Site Request Forgery (CSRF) attacks, we implement the Double Submit Cookie Pattern via `doubleCsrfProtection` in NestJS and Axios request interceptors in React.

## Goals / Non-Goals

**Goals:**
- Expose `@Get('csrf-token')` endpoint in `AuthController` using `generateToken(req, res)` from `csrf.config.ts`.
- Enable `app.use(doubleCsrfProtection)` middleware in `backend/src/main.ts` after `cookieParser`.
- Add `getCsrfToken` method to `frontend/src/services/authService.ts`.
- Implement `setCsrfToken` helper and Axios request interceptor in `frontend/src/services/apiService.ts` to attach `x-csrf-token` header on mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- Fetch CSRF token during `useAuthInit.ts` app initialization.

**Non-Goals:**
- Requiring CSRF tokens for safe idempotent `GET` / `HEAD` requests.

## Decisions

### Decision 1: Double Submit Cookie Pattern via `csrf-csrf`
Leverage existing `csrf.config.ts` configuration (`doubleCsrfProtection` and `generateToken`):
- **Rationale**: Standard, high-performance CSRF protection for Express/NestJS applications using signed cookies.

### Decision 2: In-Memory Token Storage in Frontend
Store the retrieved `csrfToken` string in module memory in `apiService.ts` and set it via `setCsrfToken`:
- **Rationale**: Keeps token accessible for Axios interceptors without polluting localStorage or DOM.

## Risks / Trade-offs

- **[Risk]** Mutating requests fail with HTTP 403 if CSRF token fetch hasn't completed.
  - **Mitigation**: Fetch CSRF token during initial app startup in `useAuthInit` before submitting forms.
