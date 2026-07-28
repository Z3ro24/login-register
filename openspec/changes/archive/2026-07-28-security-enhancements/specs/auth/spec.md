## ADDED Requirements

### Requirement: Refresh token reuse detection and automatic global revocation
The system SHALL detect attempts to reuse revoked refresh tokens during `POST /auth/refresh`. When a revoked token is presented, the system SHALL revoke ALL active refresh tokens for the associated user in the database and reject the request with HTTP 401 Unauthorized.

#### Scenario: Attempted refresh with a revoked token
- **WHEN** a client sends a refresh token to `/auth/refresh` whose database record has `isRevoked: true`
- **THEN** the system SHALL update all `RefreshToken` records for that `userId` to `isRevoked: true` and return HTTP 401 Unauthorized.

### Requirement: Revoke all active sessions on logout-all
The system SHALL provide a protected `POST /auth/logout-all` endpoint that invalidates all active refresh tokens for the authenticated user in the database.

#### Scenario: User revokes all active sessions
- **WHEN** an authenticated user sends a POST request to `/auth/logout-all`
- **THEN** the system SHALL set `isRevoked: true` on all `RefreshToken` records matching the user's ID and clear HTTP-Only session cookies.

## MODIFIED Requirements

### Requirement: User sign-in rate limiting
The system SHALL limit the rate of login attempts to prevent brute-force attacks.

#### Scenario: Excessive login attempts throttled
- **WHEN** more than 5 login requests are sent to `POST /auth/login` within 60 seconds from the same client
- **THEN** the system SHALL return HTTP 429 Too Many Requests.
