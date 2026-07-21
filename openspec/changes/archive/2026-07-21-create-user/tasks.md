## 1. Database Setup with Prisma

- [x] 1.1 Initialize Prisma ORM in the backend with PostgreSQL provider.
- [x] 1.2 Add the User model to `prisma/schema.prisma` including unique constraints on email and UUID mapping.
- [x] 1.3 Run Prisma migration to apply changes to the database.

## 2. Module Setup & Dependencies

- [x] 2.1 Ask user and install required dependencies: `bcrypt`, `@types/bcrypt`, `class-validator`, `class-transformer`.
- [x] 2.2 Generate the users resource scaffold using `nest g res users --no-spec`.
- [x] 2.3 Create and configure a shared `PrismaService` for database connection management.

## 3. Request Validation & Data Transfer Objects

- [x] 3.1 Define `CreateUserDto` with class-validator validation rules for name, email, and password.
- [x] 3.2 Define `UpdateUserDto` with class-validator validation rules for updating name, email, password, and isActive.

## 4. Core Service Logic

- [x] 4.1 Implement unique email check helper in `UsersService` that queries database by email.
- [x] 4.2 Implement user creation logic: hash password with bcrypt, save User record, and return user representation without the password.
- [x] 4.3 Implement user retrieval logic: query user by ID, throw NotFoundException (404) if not found, and return user representation without password.
- [x] 4.4 Implement user update logic: validate email uniqueness if updated, update the user attributes, modify updated_at, and return update without password.
- [x] 4.5 Implement soft-delete logic: set isActive to false and deleteAt to the current timestamp.

## 5. Controller Routing & Exception Filters

- [x] 5.1 Implement REST endpoint mapping: POST `/users`, GET `/users/:id`, PATCH `/users/:id`, DELETE `/users/:id`.
- [x] 5.2 Add exception handler or filter to convert Prisma unique constraint errors (P2002) into HTTP 409 Conflict exceptions.
- [x] 5.3 Register the `UsersModule` and validation pipe in `app.module.ts` / `main.ts`.
