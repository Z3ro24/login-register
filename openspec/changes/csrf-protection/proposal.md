## Why

Since session tokens are stored in HTTP-Only cookies, cross-site requests are vulnerable to Cross-Site Request Forgery (CSRF) attacks. Implementing the Double Submit Cookie pattern via `csrf-csrf` middleware on the backend and an automatic Axios request interceptor on the frontend prevents unauthorized state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) from third-party origins.

## What Changes

- **Backend (`main.ts`)**: Enable global `doubleCsrfProtection` middleware after cookie parser.
- **Backend (`AuthController`)**: Expose `@Get('csrf-token')` endpoint with `@Public()` decorator to return generated CSRF token.
- **Frontend (`apiService.ts`)**: Configure an Axios request interceptor to automatically attach `x-csrf-token` header on state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Frontend (`authService.ts` / `useAuthInit.ts`)**: Fetch CSRF token during app initialization and store it in memory for API requests.

## Capabilities

### New Capabilities

### Modified Capabilities
- `auth`: Require CSRF token generation endpoint `GET /auth/csrf-token` and enforce `doubleCsrfProtection` validation on state-mutating HTTP requests.
- `frontend-auth-logic`: Attach `x-csrf-token` request header via Axios interceptor on state-mutating requests.

## Impact

- **Backend**: `main.ts` and `AuthController`.
- **Frontend**: `apiService.ts`, `authService.ts`, and `useAuthInit.ts`.
