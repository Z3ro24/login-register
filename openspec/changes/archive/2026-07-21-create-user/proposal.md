## Why

The application requires user registration and management capabilities to store user accounts. We need a robust, validated, and structured User module with endpoints for creating, updating, retrieving, and deleting users, ensuring user uniqueness based on email and id before allowing creation.

## What Changes

- Add a new database table and Entity for Users using Prisma.
- Generate a new NestJS `users` module with a controller, service, and database repository.
- Implement endpoints for User management:
  - `POST /users` (Create user)
  - `GET /users/:id` (Get user by ID)
  - `PATCH /users/:id` (Update user)
  - `DELETE /users/:id` (Soft-delete/delete user)
- Implement validation checks to ensure:
  - User `id` and `email` are unique.
  - Creation process searches and verifies that a user with the same email does not already exist.
- Define User entity fields:
  - `id`: UUID (unique)
  - `name`: string
  - `email`: string (unique)
  - `password`: string
  - `isActive`: boolean
  - `created_at`: date
  - `updated_at`: date
  - `deleteAt`: date

## Capabilities

### New Capabilities
- `users`: Standard CRUD endpoints for User management, including strict validation of unique emails and ids, as well as safe data retrieval.

### Modified Capabilities

## Impact

- **Database**: Add user schema to Prisma `schema.prisma`.
- **API**: Introduce new routes under `/users`.
- **Logic**: Create users service with validation logic for duplicates and safe user retrieval.
