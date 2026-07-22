## Purpose

Define the frontend directory structure and component scaffolds for authentication, navigation, custom hooks, API services, and Zod validators.
## Requirements
### Requirement: Frontend directory structure
The system SHALL organize the `frontend/src` codebase into modular directories: `pages/auth`, `pages/app`, `navigation`, `hooks`, `services`, and `validators`.

#### Scenario: Directory and file scaffolding
- **WHEN** the frontend scaffold is generated
- **THEN** the system SHALL create `pages/auth/LoginPage.tsx`, `pages/auth/RegisterPage.tsx`, `pages/app/HomePage.tsx`, `navigation/App.tsx`, `navigation/Auth.tsx`, `navigation/Index.tsx`, `hooks/useAuthInit.ts`, `hooks/useFcmToken.ts`, `services/apiService.ts`, `services/authService.ts`, and Zod validation schema files under `frontend/src/`.

### Requirement: Component placeholder syntax
The system SHALL implement all React UI components as functional arrow components using default exports without embedding complex business logic at this stage.

#### Scenario: Component rendering scaffold
- **WHEN** a scaffolded React component is imported
- **THEN** it MUST export a standard arrow function returning a placeholder JSX container (e.g., `const Component = () => <div>Component</div>; export default Component`).

