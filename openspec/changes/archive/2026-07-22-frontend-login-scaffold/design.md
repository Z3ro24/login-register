## Context

We are establishing the frontend project structure under `frontend/src/` to support user login, registration, home dashboard navigation, custom hooks, API services, and Zod form validation.

## Goals / Non-Goals

**Goals:**
- Scaffold `pages/auth/LoginPage.tsx`, `pages/auth/RegisterPage.tsx`, and `pages/app/HomePage.tsx`.
- Scaffold `navigation/App.tsx`, `navigation/Auth.tsx`, and `navigation/Index.tsx`.
- Scaffold `hooks/useAuthInit.ts` and `hooks/useFcmToken.ts`.
- Scaffold `services/apiService.ts` and `services/authService.ts`.
- Scaffold `validators/authValidator.ts` with Zod schemas.
- Follow a strict placeholder component pattern:
  ```tsx
  const ComponentName = () => {
    return <div>ComponentName</div>;
  };
  export default ComponentName;
  ```

**Non-Goals:**
- Implementing complete UI styling, Tailwind/CSS themes, or state management logic in this scaffolding phase.
- Adding features outside the specified frontend scope.

## Decisions

### Decision 1: Arrow Function Component Syntax
All React components will use arrow function declarations with `export default`:
- **Rationale**: Ensures standard, clean, and consistent component definitions across the frontend codebase.

### Decision 2: Domain-Driven Page Modularization
Pages are split into `pages/auth` (unauthenticated routes) and `pages/app` (authenticated routes):
- **Rationale**: Matches the navigation division between `Auth.tsx` (login/register routes) and `App.tsx` (authenticated dashboard routes).

### Decision 3: Service & Hook Layer Separation
API calls are isolated in `services/` (`apiService.ts`, `authService.ts`), while reusable state/lifecycle logic resides in `hooks/` (`useAuthInit.ts`, `useFcmToken.ts`).
- **Rationale**: Separation of concerns allows UI components to stay declarative.

## Risks / Trade-offs

- **[Risk]** Empty or placeholder files causing build/import issues if imported before being fully filled.
  - **Mitigation** Each JSX file will export a valid React functional component returning a minimal `<div>...</div>` placeholder so the Vite bundler compiles without errors.
