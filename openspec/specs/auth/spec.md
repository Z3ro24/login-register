## Purpose

Provide standard endpoints to manage User authentication sessions (sign-in, token refresh, sign-out, logout-all, and CSRF protection) with JWT security, token revocation, rate limiting, account lockout, and role-based access control (RBAC).

## Requirements

### Requirement: User sign in
The system SHALL support authenticating users via their credentials (email and password) and enforce account lockout upon repeated authentication failures for a specific email address.
- On success, the system SHALL generate an Access Token (valid for 30 minutes) and a Refresh Token (valid for 7 days) as JWTs.
- The system SHALL attach the tokens to the response headers using secure HTTP-only cookies: `accessToken` and `refreshToken`.
- The cookies MUST be configured with the flags: `httpOnly: true`, `secure: true` (in production), and `sameSite: 'strict'` or `'lax'`.

#### Scenario: Successful sign in
- **WHEN** a client sends a POST request to `/auth/login` with valid email and password
- **THEN** the system SHALL return status code 200, set the `accessToken` and `refreshToken` cookies, return the authenticated user's details (excluding password), and reset any failed attempt counters for that email.

#### Scenario: Sign in with invalid credentials
- **WHEN** a client sends a POST request to `/auth/login` with incorrect email or password
- **THEN** the system SHALL reject the request with status code 401 (Unauthorized) and increment the failed attempt counter for that email.

#### Scenario: Account locked due to repeated failed login attempts
- **WHEN** 5 consecutive failed login attempts occur for a specific email address within a 15-minute window
- **THEN** the system SHALL reject subsequent login requests for that email address with HTTP 401 Unauthorized indicating the account is temporarily locked out.

### Requirement: User sign-in rate limiting
The system SHALL limit the rate of login attempts to prevent brute-force attacks.

#### Scenario: Excessive login attempts throttled
- **WHEN** more than 5 login requests are sent to `POST /auth/login` within 60 seconds from the same client
- **THEN** the system SHALL return HTTP 429 Too Many Requests.

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

### Requirement: Request authentication
The system SHALL enforce token authentication globally for all endpoints unless explicitly marked as public.
- The system SHALL extract the Access Token from the request cookies.
- The system SHALL verify the signature and validity of the token, and attach the payload to the request context.

#### Scenario: Authenticated request to protected endpoint
- **WHEN** an authenticated client sends a request to a protected route with a valid `accessToken` cookie
- **THEN** the system SHALL allow the request to proceed.

#### Scenario: Unauthenticated request to protected endpoint
- **WHEN** a client sends a request to a protected route with a missing or expired `accessToken` cookie
- **THEN** the system SHALL reject the request with status code 401 (Unauthorized).

#### Scenario: Access to public endpoint
- **WHEN** a client sends a request to an endpoint explicitly marked with the `@Public()` decorator without sending cookies
- **THEN** the system SHALL allow the request to proceed.

### Requirement: Role-based access control
The system SHALL support role-based authorization (RBAC) to restrict access to endpoints based on user roles (e.g., ADMIN, USER).
- The system SHALL compare the user's role extracted from the authenticated JWT token with the allowed roles configured on the route.

#### Scenario: Accessing route with authorized role
- **WHEN** a user with the `ADMIN` role sends a request to an endpoint restricted to `ADMIN`
- **THEN** the system SHALL authorize the request and allow it to proceed.

#### Scenario: Accessing route with unauthorized role
- **WHEN** a user with the `USER` role sends a request to an endpoint restricted to `ADMIN`
- **THEN** the system SHALL reject the request with status code 403 (Forbidden).

### Requirement: User sign out
The system SHALL support logging out users by clearing their authentication session.
- The system SHALL clear both `accessToken` and `refreshToken` cookies on the client by setting their expiration date to the past.

#### Scenario: Successful sign out
- **WHEN** a client sends a POST request to `/auth/logout`
- **THEN** the system SHALL clear the cookies and return status code 200.
