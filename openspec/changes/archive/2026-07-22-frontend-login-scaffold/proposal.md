## Why

The frontend application requires a structured module setup under `frontend/src` for authentication, navigation, custom hooks, services, and form validation to support sign-in and user dashboard flows.

## What Changes

- Create the initial frontend project folder structure under `frontend/src/`.
- Add page components in `src/pages/auth/` (`LoginPage.tsx`, `RegisterPage.tsx`) and `src/pages/app/` (`HomePage.tsx`).
- Add navigation components in `src/navigation/` (`App.tsx`, `Auth.tsx`, `Index.tsx`).
- Add custom hooks in `src/hooks/` (`useAuthInit.ts`, `useFcmToken.ts`).
- Add API service placeholders in `src/services/` (`apiService.ts`, `authService.ts`).
- Add Zod validation schema files in `src/validators/`.
- Ensure all React component placeholders use clean arrow function syntax with `export default`.

## Capabilities

### New Capabilities
- `frontend-auth-scaffold`: Directory structure and component placeholders for frontend authentication, navigation, services, custom hooks, and Zod validators.

### Modified Capabilities

## Impact

- **Frontend codebase**: Introduces scaffolded files in `frontend/src/pages`, `frontend/src/navigation`, `frontend/src/hooks`, `frontend/src/services`, and `frontend/src/validators`.
- **Dependencies**: React, React Router, and Zod setup in `frontend`.
