## Context

The frontend application requires full implementation of authentication state, form handling, and API communication. We are connecting React Hook Form, TanStack Query, Redux Toolkit, and Axios with HTTP-Only cookies to communicate with the NestJS backend.

## Goals / Non-Goals

**Goals:**
- Configure Redux store at `src/store/store.ts` and auth slice at `src/store/slices/auth.slice.ts`.
- Configure central Axios client at `src/services/apiService.ts` with `withCredentials: true`.
- Implement API service methods in `src/services/authService.ts` for login, register, and logout.
- Define Zod form validation schemas in `src/validators/authValidator.ts`.
- Implement functional login and registration forms in `src/pages/auth/LoginPage.tsx` and `src/pages/auth/RegisterPage.tsx` using `react-hook-form`.
- Wrap application root in `src/main.tsx` with Redux `<Provider>` and TanStack Query `<QueryClientProvider>`.

**Non-Goals:**
- Adding complex UI CSS styling or custom design components.
- Adding features outside authentication and registration.

## Decisions

### Decision 1: Redux Toolkit for Session State
Store user session data (`user`, `isAuthenticated`) in Redux Toolkit state (`auth.slice.ts`):
- **Rationale**: Allows navigation guards (`App.tsx`, `Auth.tsx`) and components across the tree to inspect auth state synchronously.

### Decision 2: TanStack Query for Async Mutations
Use TanStack Query `useMutation` for `login`, `register`, and `logout` operations:
- **Rationale**: Handles loading states (`isPending`), error states (`isError`), and side-effects (`onSuccess`) cleanly without manual reducer flags.

### Decision 3: React Hook Form + Zod Resolvers
Use `useForm` with `@hookform/resolvers/zod`:
- **Rationale**: Provides type-safe form state, instant validation, and clean integration with Zod schemas.

### Decision 4: Axios with Credentials
Configure `axios.create({ baseURL: 'http://localhost:3000/api/v1', withCredentials: true })`:
- **Rationale**: Ensures the browser automatically receives, stores, and sends HTTP-Only `accessToken` and `refreshToken` cookies without storing tokens in localStorage.

## Risks / Trade-offs

- **[Risk]** Package conflicts during installation of `@reduxjs/toolkit`, `react-redux`, `@tanstack/react-query`, `axios`, `react-hook-form`, `@hookform/resolvers`, and `zod`.
  - **Mitigation**: Install compatible versions using `pnpm add` in the `frontend/` directory.
