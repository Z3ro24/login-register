## Purpose

Manage user accounts including registration with password complexity verification and rate limiting, user queries, updates, and soft deletion.

## Requirements

### Requirement: Password Complexity Validation
The system SHALL validate that user passwords satisfy strong complexity criteria during registration.

#### Scenario: Registration with weak password rejected
- **WHEN** a registration request is sent to `POST /users` with a password that fails complexity rules (less than 8 chars, or missing uppercase, lowercase, number, or special character)
- **THEN** the system SHALL return HTTP 400 Bad Request with a detailed validation message.

#### Scenario: Registration rate limiting
- **WHEN** more than 5 user registration requests are sent to `POST /users` within 60 seconds from the same client
- **THEN** the system SHALL return HTTP 429 Too Many Requests.
