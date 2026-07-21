## ADDED Requirements

### Requirement: User creation
The system SHALL support creating a new user with the specified attributes (name, email, password).
- The system SHALL auto-generate a unique `id` (UUIDv4) and set `isActive` to `true`, `created_at` and `updated_at` to the current timestamp, and `deleteAt` to `null`.
- The system SHALL verify that a user with the same email does not already exist prior to creation. If it exists, the system SHALL reject the request.

#### Scenario: Successful user creation
- **WHEN** a client sends a POST request to `/users` with valid `name`, unique `email`, and `password`
- **THEN** the system SHALL create the user, hash the password, and return the created user object (excluding the password field) with status code 201.

#### Scenario: User creation with duplicate email
- **WHEN** a client sends a POST request to `/users` with an `email` that already exists in the database
- **THEN** the system SHALL reject the creation request with status code 409 (Conflict).

#### Scenario: User creation with invalid input data
- **WHEN** a client sends a POST request to `/users` with missing fields or an invalid email format
- **THEN** the system SHALL reject the request with status code 400 (Bad Request).

### Requirement: User retrieval
The system SHALL support retrieving user details by their ID.
- The system MUST exclude the password field from the returned user object.

#### Scenario: Successful user retrieval
- **WHEN** a client sends a GET request to `/users/:id` with a valid, existing user ID
- **THEN** the system SHALL return the user details (excluding the password) with status code 200.

#### Scenario: User retrieval for non-existent user
- **WHEN** a client sends a GET request to `/users/:id` with a non-existent UUID
- **THEN** the system SHALL return status code 404 (Not Found).

### Requirement: User update
The system SHALL support updating user attributes by ID.
- Updatable fields: `name` (string), `email` (string), `password` (string), `isActive` (boolean).
- If `email` is updated, the system SHALL verify that the new email does not belong to any other user.
- The system SHALL automatically set `updated_at` to the current timestamp on update.

#### Scenario: Successful user update
- **WHEN** a client sends a PATCH request to `/users/:id` with valid data
- **THEN** the system SHALL update the user attributes, update `updated_at`, and return the updated user object (excluding the password field) with status code 200.

#### Scenario: User update with colliding email
- **WHEN** a client sends a PATCH request to `/users/:id` with an `email` that is already registered to another user
- **THEN** the system SHALL reject the update request with status code 409 (Conflict).

#### Scenario: User update for non-existent user
- **WHEN** a client sends a PATCH request to `/users/:id` with a non-existent UUID
- **THEN** the system SHALL return status code 404 (Not Found).

### Requirement: User soft-deletion
The system SHALL support deleting a user by their ID.
- When a user is deleted, the system SHALL perform a soft delete by setting `isActive` to `false` and setting `deleteAt` to the current timestamp.

#### Scenario: Successful user soft-deletion
- **WHEN** a client sends a DELETE request to `/users/:id` with an existing user ID
- **THEN** the system SHALL set `isActive` to `false`, `deleteAt` to the current timestamp, and return status code 200.

#### Scenario: User soft-deletion for non-existent user
- **WHEN** a client sends a DELETE request to `/users/:id` with a non-existent UUID
- **THEN** the system SHALL return status code 404 (Not Found).
