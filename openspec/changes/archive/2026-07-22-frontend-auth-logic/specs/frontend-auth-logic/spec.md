## ADDED Requirements

### Requirement: Global Auth State Management
The system SHALL maintain user authentication state (user profile, authentication status, and error states) using Redux Toolkit in `src/store/slices/auth.slice.ts` and expose the configured store at `src/store/store.ts`.

#### Scenario: Auth state updates
- **WHEN** user credentials are verified or session terminates
- **THEN** Redux Toolkit SHALL update the `user` state payload and `isAuthenticated` boolean flag accordingly.

### Requirement: Centralized Axios Client
The system SHALL configure a centralized Axios client at `src/services/apiService.ts` with `withCredentials: true` to ensure cookies (`accessToken` and `refreshToken`) are sent with all backend requests.

#### Scenario: HTTP request credentials
- **WHEN** an API request is dispatched to the backend
- **THEN** Axios SHALL attach `withCredentials: true` and direct requests to `http://localhost:3000/api/v1`.

### Requirement: Authentication Services
The system SHALL implement API methods in `src/services/authService.ts` for user login (`POST /auth/login`), user registration (`POST /users`), and logout (`POST /auth/logout`).

#### Scenario: Login service execution
- **WHEN** `authService.login` is invoked with credentials
- **THEN** it SHALL post the credentials to `/auth/login` and return the authenticated user record.

### Requirement: Form Validation and Mutation Hooks
The system SHALL implement form handling in `src/pages/auth/LoginPage.tsx` and `src/pages/auth/RegisterPage.tsx` using `react-hook-form` with Zod validation, executing mutations via TanStack Query and updating Redux state on success.

#### Scenario: Form submission and state synchronization
- **WHEN** valid login credentials are submitted in `LoginPage.tsx`
- **THEN** TanStack Query SHALL execute the login mutation, invoke `authService.login`, and dispatch `setCredentials` to Redux Toolkit.
