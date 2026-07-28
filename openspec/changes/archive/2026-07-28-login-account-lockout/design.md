## Context

While IP rate limiting (`ThrottlerGuard` with `trust proxy: 1`) prevents a single IP from spamming login attempts, distributed botnets can rotate real residential IPs to attack a single targeted account. Adding email-based account lockout closes this vector.

## Goals / Non-Goals

**Goals:**
- Implement a thread-safe in-memory map or time-window tracker in `AuthService` for failed login attempts by normalized email (`email.toLowerCase()`).
- Lockout threshold: 5 failed attempts within 15 minutes (900,000 ms).
- Lockout duration: 15 minutes from the time threshold is breached.
- Reset tracking upon successful sign in for that email.
- Expose clear error message: `"Too many failed login attempts for this account. Please try again after 15 minutes."`.

**Non-Goals:**
- Adding Redis/external cache dependencies (in-memory Map with sliding window/expiration is sufficient for current architecture).

## Decisions

### Decision 1: In-Memory Map with Expiration Window
Store `failedAttemptsMap: Map<string, { attempts: number; lockUntil: number | null; firstAttemptTime: number }>` inside `AuthService`.
- **Rationale**: Zero external setup required, ultra-fast performance, and lightweight memory footprint.
