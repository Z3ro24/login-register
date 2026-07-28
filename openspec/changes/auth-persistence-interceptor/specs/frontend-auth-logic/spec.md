## ADDED Requirements

### Requirement: Axios Response Interceptor for 401 Errors
The system SHALL configure an Axios response interceptor in `src/services/apiService.ts` that catches HTTP 401 errors and attempts to refresh the access token once via `POST /auth/refresh`.

#### Scenario: Automatic token refresh on 401
- **WHEN** an API request returns HTTP 401 Unauthorized
- **THEN** the interceptor SHALL call `/auth/refresh` once and retry the original request if refresh succeeds.

#### Scenario: Unrecoverable session termination on 401
- **WHEN** token refresh fails or `/auth/refresh` returns HTTP 401
- **THEN** the interceptor SHALL clear Redux auth state and redirect the user to `/`.

### Requirement: Page Refresh Session Hydration
The system SHALL invoke `authService.getMe()` inside `useAuthInit.ts` during application startup to restore session state in Redux.

#### Scenario: Successful session rehydration on page reload
- **WHEN** the application loads or the page is refreshed (F5)
- **THEN** `useAuthInit` SHALL request `GET /auth/me` and dispatch `setCredentials` to Redux on success.

#### Scenario: Unauthenticated page reload
- **WHEN** `GET /auth/me` fails during startup
- **THEN** `useAuthInit` SHALL dispatch `logout` to Redux state.
