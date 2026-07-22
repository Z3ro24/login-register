## Context

The backend uses JWT refresh tokens delivered via HTTP-Only cookies. Currently, logging out clears client cookies but does not revoke the token server-side. Storing SHA-256 hashes of refresh tokens in PostgreSQL via Prisma allows server-side revocation and token rotation.

## Goals / Non-Goals

**Goals:**
- Add `RefreshToken` entity in `schema.prisma` with relation to `User`.
- Run database migration to apply schema changes.
- Implement SHA-256 token hashing using Node.js `crypto` module (`crypto.createHash('sha256').update(token).digest('hex')`).
- Persist hashed refresh tokens in `signIn`.
- Validate refresh tokens in DB during `/auth/refresh`, enforcing `isRevoked === false`, and perform token rotation (revoke old token, generate and persist new token).
- Invalidate tokens in DB (`isRevoked: true`) during `/auth/logout`.

**Non-Goals:**
- Storing unhashed plaintext tokens in the database.
- Modifying frontend components or adding unrelated backend features.

## Decisions

### Decision 1: SHA-256 Hashing for Stored Tokens
Hash refresh tokens with SHA-256 (`crypto.createHash('sha256').update(token).digest('hex')`) before database insertion/lookup:
- **Rationale**: SHA-256 provides fast, deterministic indexing for high-entropy JWT secrets without plaintext storage risks.

### Decision 2: Automatic Token Rotation on Refresh
When `/auth/refresh` is invoked:
1. Verify JWT signature.
2. Hash incoming token and look up in `RefreshToken` table.
3. If missing or `isRevoked === true`, throw `UnauthorizedException`.
4. Update old token to `isRevoked: true`.
5. Generate new `refreshToken` string, save its SHA-256 hash in DB, and set new HTTP-Only cookies.
- **Rationale**: Prevents replay attacks and detects token theft attempts.

### Decision 3: Server-Side Revocation on Sign-out
In `AuthController.logout`:
1. Extract `refreshToken` from request cookies.
2. Hash token and update DB record to `isRevoked: true` (or delete).
3. Clear HTTP-Only cookies.
- **Rationale**: Fully invalidates session server-side when user logs out.

## Risks / Trade-offs

- **[Risk]** Database growth due to stored refresh token history.
  - **Mitigation**: Add cascade deletion on user removal and optional periodic cleanup of expired/revoked tokens.
