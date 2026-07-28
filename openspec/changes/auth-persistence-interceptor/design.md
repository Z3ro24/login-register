## Context

The system requires backend payload refinement and frontend session persistence via HTTP-Only cookies. The backend must restrict `/auth/login` response fields and expose `GET /auth/me`, while the frontend must intercept HTTP 401 errors for token refresh and hydrate session state on page reloads (F5).

## Goals / Non-Goals

**Goals:**
- Update backend `AuthController` and `AuthService` so `POST /auth/login` returns only `{ name, email, role }`.
- Implement protected `GET /auth/me` in `AuthController` returning `{ id, name, email, role }`.
- Update `User` type in `frontend/src/store/slices/auth.slice.ts` to support optional/flexible fields.
- Add `getMe()` method to `frontend/src/services/authService.ts`.
- Attach a 401 response interceptor to Axios in `frontend/src/services/apiService.ts` to trigger `/auth/refresh` once or clear state/redirect on failure.
- Implement `useAuthInit` in `frontend/src/hooks/useAuthInit.ts` to call `getMe()` on app mount and dispatch credentials to Redux.

**Non-Goals:**
- Storing access or refresh tokens in `localStorage` or `sessionStorage`.
- Adding features outside session persistence and 401 interceptors.

## Decisions

### Decision 1: Backend Login Response Filtering
Modify `AuthService.signIn` return object:
- **Rationale**: Returns only `{ name, email, role }` as requested, preventing unnecessary database columns from leaking in the initial login response.

### Decision 2: `GET /auth/me` Session Verification
Implement `getMe` endpoint using `@ActiveUser()` context:
- **Rationale**: Validates that the HTTP-Only `accessToken` cookie is active and returns `{ id, name, email, role }` for page refresh rehydration.

### Decision 3: Axios 401 Interceptor with Retry Control
Configure an Axios response interceptor in `apiService.ts`:
- **Rationale**: Automatically catches expired `accessToken` (HTTP 401), issues a single `POST /auth/refresh` request, retries the failed original request on success, or triggers logout and redirect on failure.

### Decision 4: Initial Hydration Hook (`useAuthInit`)
Implement `useAuthInit.ts` returning `{ isLoading }`:
- **Rationale**: On F5 page refresh, `useAuthInit` calls `authService.getMe()`, updating Redux state on success before rendering page routes, preventing premature redirects to `/`.

## Risks / Trade-offs

- **[Risk]** Infinite refresh loops if `/auth/refresh` itself returns 401.
  - **Mitigation**: Exclude `/auth/refresh` and `/auth/login` from triggering the 401 retry interceptor logic.
