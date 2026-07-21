## Purpose

Define global security configuration and middleware policies (Helmet headers, CORS origins, cookie-based CSRF protection, and Rate Limiting) for the NestJS application.
## Requirements
### Requirement: Secure HTTP headers
The system SHALL apply secure HTTP headers globally using Helmet to protect the application from common web vulnerabilities.
- Headers configured MUST include cross-origin policies, content security policies, frame options, and MIME-type sniffing prevention.

#### Scenario: Verify security headers are present
- **WHEN** a client sends any HTTP request to the backend
- **THEN** the system SHALL include security headers (such as `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Strict-Transport-Security`).

### Requirement: CORS policy restriction
The system SHALL configure a global Cross-Origin Resource Sharing (CORS) policy.
- Access MUST be restricted to allowed origins (configured via environment variables or allowed list).
- Standard request methods and credentials handling MUST be explicitly defined.

#### Scenario: Allowed origin request
- **WHEN** a client from a whitelisted origin sends a request with an `Origin` header
- **THEN** the system SHALL return the corresponding `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials: true` headers.

#### Scenario: Blocked origin request
- **WHEN** a client from an unconfigured origin sends a request
- **THEN** the system SHALL NOT include the CORS headers allowing access.

### Requirement: CSRF protection
The system SHALL apply CSRF (Cross-Site Request Forgery) protection globally.
- Mutating endpoints (POST, PATCH, DELETE, PUT) MUST require validation of a secure CSRF token.
- Safe read-only HTTP methods (GET, HEAD, OPTIONS) MUST bypass CSRF token validation.

#### Scenario: Request missing CSRF token
- **WHEN** a client sends a mutating HTTP request (e.g., POST) without a valid CSRF token
- **THEN** the system SHALL reject the request with HTTP 403 Forbidden.

#### Scenario: Request with valid CSRF token
- **WHEN** a client sends a mutating HTTP request including a valid CSRF token in the headers
- **THEN** the system SHALL validate the token and allow the request to proceed.

### Requirement: API rate limiting (throttling)
The system SHALL apply request rate limiting (throttling) globally.
- Maximum number of requests allowed per client IP within a specific TTL (time-to-live) window MUST be restricted.

#### Scenario: API usage under the limit
- **WHEN** a client sends requests within the allowed rate-limit threshold (e.g., 100 requests per minute)
- **THEN** the system SHALL allow the requests and include rate-limit status headers in the response.

#### Scenario: API usage exceeding the limit
- **WHEN** a client exceeds the configured request limit within the time window
- **THEN** the system SHALL reject further requests from that IP with HTTP 429 Too Many Requests.

