## Why

To protect user accounts against distributed brute-force attacks across multiple IP addresses (e.g., botnets), the application needs an in-memory/time-window account lockout mechanism per email identifier.

## What Changes

- **Account Lockout Service Logic (`AuthService.signIn`)**:
  - Track failed login attempts per email.
  - If 5 consecutive failed attempts occur within a 15-minute window for a specific email address, reject subsequent login attempts for that email with an `UnauthorizedException` (e.g. "Too many failed login attempts for this account. Please try again after 15 minutes.") until the lockout window expires.
  - On successful sign in, clear the failed login tracking state for that email.

## Capabilities

### New Capabilities

### Modified Capabilities
- `auth`: Enhance `/auth/login` sign-in logic in `AuthService` to track and enforce email-based account lockouts upon 5 consecutive failed attempts within 15 minutes.

## Impact

- **Backend**: `AuthService`, `auth.service.spec.ts`.
