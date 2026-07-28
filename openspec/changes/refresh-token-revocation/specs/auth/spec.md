## ADDED Requirements

### Requirement: Database-backed refresh token persistence and rotation
The system SHALL store SHA-256 hashes of refresh tokens in the `RefreshToken` database table and perform token rotation on `/auth/refresh`.

#### Scenario: Refresh token rotation on valid request
- **WHEN** a valid refresh token cookie is submitted to `/auth/refresh`
- **THEN** the system SHALL verify its DB record, mark the previous token as revoked (`isRevoked: true`), create a new hashed refresh token record in DB, and set updated HTTP-Only cookies.

#### Scenario: Revoked or missing refresh token rejection
- **WHEN** a refresh token cookie is sent to `/auth/refresh` that does not exist in DB or has `isRevoked === true`
- **THEN** the system SHALL return HTTP 401 Unauthorized and reject session renewal.

### Requirement: Server-side token revocation on logout
The system SHALL mark the refresh token as revoked in the database during sign-out (`POST /auth/logout`).

#### Scenario: Server-side token invalidation upon sign-out
- **WHEN** a user invokes `POST /auth/logout` with a refresh token cookie
- **THEN** the system SHALL update its DB record to `isRevoked: true` and clear the HTTP-Only cookies in the response.
