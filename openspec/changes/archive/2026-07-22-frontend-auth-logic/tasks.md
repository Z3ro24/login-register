## 1. Setup & Package Installation

- [x] 1.1 Install dependencies in `frontend`: `@reduxjs/toolkit`, `react-redux`, `@tanstack/react-query`, `axios`, `react-hook-form`, `@hookform/resolvers`, and `zod`.

## 2. Redux Store & Auth Slice

- [x] 2.1 Implement `authSlice.ts` in `frontend/src/store/slices/auth.slice.ts` managing `user`, `isAuthenticated`, and actions (`setCredentials`, `logout`).
- [x] 2.2 Configure `store.ts` in `frontend/src/store/store.ts` exporting `store`, `RootState`, and `AppDispatch`.

## 3. Services & API Client

- [x] 3.1 Configure Axios instance in `frontend/src/services/apiService.ts` with `baseURL: 'http://localhost:3000/api/v1'` and `withCredentials: true`.
- [x] 3.2 Implement `authService.ts` in `frontend/src/services/authService.ts` with methods for login, register, and logout API calls.

## 4. Validators & Root Providers

- [x] 4.1 Define Zod schemas in `frontend/src/validators/authValidator.ts` for login and registration forms.
- [x] 4.2 Wrap application root in `frontend/src/main.tsx` with Redux `<Provider>` and TanStack Query `<QueryClientProvider>`.

## 5. Form Logic Implementation

- [x] 5.1 Implement form submission, TanStack Query mutation, and Redux dispatch logic in `frontend/src/pages/auth/LoginPage.tsx`.
- [x] 5.2 Implement form submission, TanStack Query mutation, and Redux dispatch logic in `frontend/src/pages/auth/RegisterPage.tsx`.
