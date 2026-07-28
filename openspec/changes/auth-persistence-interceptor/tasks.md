## 1. Backend Login Payload & /auth/me Endpoint

- [x] 1.1 Update `AuthService.signIn` in `backend/src/auth/auth.service.ts` to return only `{ name, email, role }`.
- [x] 1.2 Implement `getMe` in `backend/src/auth/auth.service.ts` and expose `GET /auth/me` endpoint in `backend/src/auth/auth.controller.ts` returning `{ id, name, email, role }`.

## 2. Frontend Services & Axios Interceptor

- [x] 2.1 Update `User` interface in `frontend/src/store/slices/auth.slice.ts` (allowing optional `id`).
- [x] 2.2 Add `getMe` method to `frontend/src/services/authService.ts`.
- [x] 2.3 Configure Axios response interceptor in `frontend/src/services/apiService.ts` to catch 401 errors, attempt token refresh once, or dispatch logout and redirect to `/`.

## 3. Session Hydration & App Integration

- [x] 3.1 Implement session hydration hook `useAuthInit` in `frontend/src/hooks/useAuthInit.ts` calling `authService.getMe()` on app initialization.
- [x] 3.2 Integrate `useAuthInit` into `frontend/src/navigation/App.tsx` or `frontend/src/navigation/Index.tsx` to restore session state on F5 page reloads.
