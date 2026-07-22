## ADDED Requirements

### Requirement: CSRF Token Endpoint
The system SHALL expose a public `GET /auth/csrf-token` endpoint that returns a `{ csrfToken }` payload and sets a corresponding CSRF cookie.

#### Scenario: Successful CSRF token retrieval
- **WHEN** a client sends a GET request to `/auth/csrf-token`
- **THEN** the system SHALL return HTTP 200 with `{ csrfToken }` and set the CSRF cookie.

### Requirement: CSRF Token Validation
The system SHALL validate the `x-csrf-token` header on state-mutating HTTP requests (`POST`, `PUT`, `PATCH`, `DELETE`).

#### Scenario: Missing or invalid CSRF token on mutating request
- **WHEN** a client sends a POST request without a valid `x-csrf-token` header
- **THEN** the system SHALL return HTTP 403 Forbidden.
