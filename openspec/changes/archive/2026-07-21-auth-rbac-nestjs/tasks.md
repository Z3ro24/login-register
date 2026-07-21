## 1. Database Migrations

- [x] 1.1 Add `role` column to the `User` model in `schema.prisma` with a default of "USER".
- [x] 1.2 Run database migrations (`prisma migrate dev --name add_user_role`) and regenerate Prisma client.

## 2. Setup & Dependencies

- [x] 2.1 Install dependencies: `@nestjs/jwt`.
- [x] 2.2 Define roles enum in `src/common/enums/role.enum.ts`.
- [x] 2.3 Add `role` validation and default value setup in `create-user.dto.ts` and `update-user.dto.ts`.
- [x] 2.4 Update user serialization logic in `users.service.ts` to ensure `role` is returned in responses.

## 3. Auth Core Module

- [x] 3.1 Implement `AuthService` with `signIn` method comparing hashes and generating `accessToken` & `refreshToken` tokens.
- [x] 3.2 Implement `AuthController` with endpoints: POST `/auth/login` (signs in and returns cookies), POST `/auth/refresh` (refreshes access token from cookie), and POST `/auth/logout` (clears cookies).
- [x] 3.3 Create and configure `AuthModule` importing `JwtModule` and registering services/controllers.

## 4. Guards, Decorators & Custom Params

- [x] 4.1 Create custom decorators: `@Public()`, `@Roles(...roles)`, and composite `@Auth(...roles)`.
- [x] 4.2 Create parameter decorator `@ActiveUser()` to extract payload from request.
- [x] 4.3 Implement `AuthGuard` extracting and verifying JWT from cookies, registering it globally in `AppModule`.
- [x] 4.4 Implement `RolesGuard` comparing token role with route allowed roles.

## 5. Routes Securing & Validation

- [x] 5.1 Enforce authentication globally in `AppModule`, verifying that public routes like `/auth/login` and `/users` (registration) are marked `@Public()`.
- [x] 5.2 Secure specific user endpoints (e.g. `/users/:id` updates and soft deletion should be restricted to ADMIN or owner).
- [x] 5.3 Verify implementation with endpoint tests and check HTTP-only cookies transmission.
