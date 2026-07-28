## Why

To improve security and user session persistence, the backend needs to refine the `/auth/login` payload (returning only `name`, `email`, and `role`) and expose a GET `/auth/me` endpoint to validate cookie tokens on page refresh. Simultaneously, the frontend needs an Axios interceptor to automatically attempt token refreshes on HTTP 401 errors, clear session state and redirect to login if refresh fails, and rehydrate session data via `useAuthInit` to maintain login persistence without exposing tokens to JavaScript memory or localStorage.

## What Changes

- **Backend (`POST /auth/login`)**: Modify response payload to return only `{ name, email, role }`.
- **Backend (`GET /auth/me`)**: Add a protected endpoint returning `{ id, name, email, role }` after validating the active HTTP-Only `accessToken` cookie.
- **Frontend (`apiService.ts`)**: Attach an Axios response interceptor handling HTTP 401 errors. It will call `/auth/refresh` once to retry the failed request; if refresh fails, it clears Redux state and redirects the user to `/`.
- **Frontend (`authService.ts`)**: Add `getMe` service method calling `GET /auth/me`.
- **Frontend (`useAuthInit.ts`)**: Implement session rehydration on initial application mount using `authService.getMe()`, updating Redux state on success or clearing it on error.

## Capabilities

### New Capabilities

### Modified Capabilities
- `auth`: Update `/auth/login` response payload and add `GET /auth/me` endpoint.
- `frontend-auth-logic`: Add Axios 401 refresh/logout interceptor and `useAuthInit` session hydration hook.

## Impact

- **Backend**: `AuthController` (`POST /auth/login` and `GET /auth/me`) and `AuthService` (`getMe`).
- **Frontend**: `apiService.ts` (interceptor), `authService.ts` (`getMe`), `useAuthInit.ts` (hydration hook), and `App.tsx` / `Index.tsx`.
