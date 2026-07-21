## Context

We are implementing the `Users` module inside a NestJS backend project. The project currently has a default NestJS setup. The design must accommodate the specified database stack (Prisma ORM with PostgreSQL) and architecture rules (Feature First structure, with validation handled via DTOs and business logic contained entirely within the services).

## Goals / Non-Goals

**Goals:**
- Implement the User entity in the Prisma schema with unique constraints on `id` (UUID) and `email`.
- Expose NestJS REST endpoints for creating (`POST /users`), retrieving (`GET /users/:id`), updating (`PATCH /users/:id`), and soft-deleting (`DELETE /users/:id`) users.
- Verify user non-existence via email before executing creation.
- Protect passwords by hashing them with `bcrypt` before database storage and ensuring they are excluded from HTTP responses.
- Implement soft-deletion by setting `isActive` to `false` and `deleteAt` to the current timestamp.

**Non-Goals:**
- Creating authentication endpoints (login, logout, token refresh). This is out of scope for the current change.
- Creating frontend integration.

## Decisions

### Decision 1: Database ORM & Model Mapping
We will use **Prisma ORM** as specified in the project tech stack to model the User entity.
- **Prisma Schema definition**:
  ```prisma
  model User {
    id        String    @id @default(uuid()) @db.Uuid
    name      String
    email     String    @unique
    password  String
    isActive  Boolean   @default(true)
    createdAt DateTime  @default(now()) @map("created_at")
    updatedAt DateTime  @updatedAt @map("upddated_at")
    deleteAt  DateTime? @map("deleteAt")

    @@map("users")
  }
  ```
- **Rationale**: Keeps database columns mapped to exact names specified in the prompt while using Prisma conventions.

### Decision 2: Email Uniqueness Verification Flow
Verify email uniqueness at two levels:
1. **Service Level**: Before creating or updating a user, run a query to find a user by email. If found, throw a `ConflictException` (HTTP 409).
2. **Database Level**: Ensure the email column has a `@unique` index.
- **Rationale**: Service check provides descriptive error responses, while the database constraint serves as the final guard against race conditions.

### Decision 3: Password Hashing & Safe Serialization
We will use `bcrypt` to hash user passwords before storing them.
- When retrieving user details (`GET /users/:id`, `POST /users`, `PATCH /users/:id`), the service layer will explicitly query the fields or strip the `password` field before returning.
- **Rationale**: Storing raw passwords is a severe security risk. Explicitly stripping or omitting the password field ensures it is never leaked over the wire.

### Decision 4: Soft-deletion Mechanism
Instead of deleting records from the database, we will update the user record by setting `isActive = false` and `deleteAt = new Date()`.
- **Rationale**: Aligns with the presence of `deleteAt` and `isActive` fields on the requested Entity User.

## Risks / Trade-offs

- **[Risk]** Concurrent requests bypass the email uniqueness check in the service layer.
  - **Mitigation** Catch database unique constraint violations (Prisma code `P2002`) and throw a `ConflictException` (409) in the exception filters or controller.
- **[Risk]** Accidental exposure of the hashed password in API responses.
  - **Mitigation** Exclude the `password` field from the returned objects at the service level, or use a custom serialization interceptor / dedicated return DTOs.
