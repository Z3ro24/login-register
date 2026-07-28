## ADDED Requirements

### Requirement: Axios Request Interceptor for CSRF Token Transmission
The system SHALL configure an Axios request interceptor in `src/services/apiService.ts` that attaches the `x-csrf-token` header to state-mutating HTTP requests (`POST`, `PUT`, `PATCH`, `DELETE`).

#### Scenario: Automatic CSRF header insertion
- **WHEN** a POST request is dispatched via Axios
- **THEN** the interceptor SHALL attach the in-memory `x-csrf-token` header to the outgoing request.
