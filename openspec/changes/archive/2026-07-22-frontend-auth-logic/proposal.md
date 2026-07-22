## Why

The frontend application requires full integration of user authentication logic, global state management, and form validation using Redux Toolkit, TanStack Query, Axios, and React Hook Form to communicate securely with the backend API.

## What Changes

- Install frontend state management and HTTP client packages: `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query`, `@reduxjs/toolkit`, `react-redux`, `axios`, and `zod`.
- Create Redux store configuration at `src/store/store.ts` and auth state slice at `src/store/slices/auth.slice.ts`.
- Configure the central Axios instance at `src/services/apiService.ts` with `withCredentials: true` and base URL `http://localhost:3000/api/v1`.
- Implement API call functions in `src/services/authService.ts` for login (`POST /auth/login`), user registration (`POST /users`), and logout (`POST /auth/logout`).
- Build interactive form handlers in `src/pages/auth/LoginPage.tsx` and `src/pages/auth/RegisterPage.tsx` using `react-hook-form` and Zod validation schemas.
- Connect form submissions to TanStack Query mutations, updating Redux Toolkit auth state upon successful response.

## Capabilities

### New Capabilities
- `frontend-auth-logic`: Frontend authentication state management, form handlers, TanStack Query mutations, and Axios HTTP client services.

### Modified Capabilities

## Impact

- **Frontend dependencies**: Adds `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query`, `@reduxjs/toolkit`, `react-redux`, `axios`, and `zod` to `frontend/package.json`.
- **State & Services**: Populates `src/store/`, `src/services/`, `src/pages/auth/`, and `src/main.tsx` (wrapping with Redux Provider and QueryClientProvider).
