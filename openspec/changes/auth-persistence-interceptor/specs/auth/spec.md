## ADDED Requirements

### Requirement: Current user profile retrieval
The system SHALL provide a `GET /auth/me` endpoint protected by `AuthGuard` that validates the active `accessToken` cookie and returns `{ id, name, email, role }`.

#### Scenario: Successful user profile retrieval
- **WHEN** an authenticated GET request with a valid `accessToken` cookie is sent to `/auth/me`
- **THEN** the system SHALL return HTTP 200 with `{ id, name, email, role }`.

#### Scenario: Unauthorized user profile retrieval
- **WHEN** a GET request without a valid `accessToken` cookie is sent to `/auth/me`
- **THEN** the system SHALL return HTTP 401 Unauthorized.

## MODIFIED Requirements

### Requirement: User sign-in
The system SHALL authenticate user credentials via email and password, returning HTTP-Only cookies for access and refresh tokens and basic user profile details.

#### Scenario: Successful authentication
- **WHEN** user submits valid email and password credentials
- **THEN** system SHALL return status code 200, set HTTP-Only cookies `accessToken` and `refreshToken`, and return only `{ name, email, role }`.
