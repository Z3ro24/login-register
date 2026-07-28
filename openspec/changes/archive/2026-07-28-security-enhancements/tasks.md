## 1. Backend Security Enhancements

- [x] 1.1 Update `AuthService.rotateRefreshToken` in `backend/src/auth/auth.service.ts` to detect revoked token reuse and trigger mass revocation of all refresh tokens for that user.
- [x] 1.2 Implement `revokeAllUserRefreshTokens` in `AuthService` and expose protected `POST /auth/logout-all` in `backend/src/auth/auth.controller.ts`.
- [x] 1.3 Apply `@Throttle({ default: { limit: 5, ttl: 60000 } })` decorator to `POST /auth/login` in `AuthController` and `POST /users` in `UsersController`.
- [x] 1.4 Update `CreateUserDto` in `backend/src/users/dto/create-user.dto.ts` with regex complexity validation rules for passwords.

## 2. Frontend Service Update

- [x] 2.1 Add `logoutAll` method to `frontend/src/services/authService.ts`.

## 3. Verification & Testing

- [x] 3.1 Update `auth.service.spec.ts` unit tests to cover token reuse detection and `logoutAll`.
- [x] 3.2 Verify backend build (`pnpm run build`) and test execution (`pnpm test`).
- [x] 3.3 Verify frontend build (`pnpm run build`).
