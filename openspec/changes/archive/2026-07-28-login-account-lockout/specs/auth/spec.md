## MODIFIED Requirements

### Requirement: User sign in
The system SHALL support authenticating users via their credentials (email and password) and enforce account lockout upon repeated authentication failures for a specific email address.

#### Scenario: Account locked due to repeated failed login attempts
- **WHEN** 5 consecutive failed login attempts occur for a specific email address within a 15-minute window
- **THEN** the system SHALL reject subsequent login requests for that email address with HTTP 401 Unauthorized indicating the account is temporarily locked out.

#### Scenario: Successful sign in resets failed attempt counter
- **WHEN** a client successfully authenticates with valid credentials for an email address that had previous failed attempts
- **THEN** the system SHALL reset the failed login attempt counter and lockout timer for that email address.
