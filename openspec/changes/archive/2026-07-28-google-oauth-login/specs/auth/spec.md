## MODIFIED Requirements

### Requirement: User sign in
The system SHALL support authenticating users via Google OAuth 2.0 in addition to credentials (email and password).

#### Scenario: Successful Google OAuth sign-in with existing user
- **WHEN** a client completes the Google OAuth 2.0 flow via `GET /auth/google/callback` for an email that exists in the database
- **THEN** the system SHALL attach `accessToken` and `refreshToken` HTTP-Only cookies to the response and redirect the client to `http://localhost:5173/home`.

#### Scenario: Successful Google OAuth sign-in with new user
- **WHEN** a client completes the Google OAuth 2.0 flow via `GET /auth/google/callback` for an email that does NOT exist in the database
- **THEN** the system SHALL provision a new `User` record with `role: USER`, attach `accessToken` and `refreshToken` HTTP-Only cookies, and redirect the client to `http://localhost:5173/home`.
