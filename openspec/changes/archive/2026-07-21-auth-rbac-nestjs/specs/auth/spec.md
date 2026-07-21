## ADDED Requirements

### Requirement: User sign in
The system SHALL support authenticating users via their credentials (email and password).
- On success, the system SHALL generate an Access Token (valid for 30 minutes) and a Refresh Token (valid for 7 days) as JWTs.
- The system SHALL attach the tokens to the response headers using secure HTTP-only cookies: `accessToken` and `refreshToken`.
- The cookies MUST be configured with the flags: `httpOnly: true`, `secure: true` (in production), and `sameSite: 'strict'` or `'lax'`.

#### Scenario: Successful sign in
- **WHEN** a client sends a POST request to `/auth/login` with valid email and password
- **THEN** the system SHALL return status code 200, set the `accessToken` and `refreshToken` cookies, and return the authenticated user's details (excluding password).

#### Scenario: Sign in with invalid credentials
- **WHEN** a client sends a POST request to `/auth/login` with incorrect email or password
- **THEN** the system SHALL reject the request with status code 401 (Unauthorized).

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
