## Why

The backend application requires basic security policies to protect endpoints from common web vulnerabilities (such as Cross-Site Request Forgery, Cross-Site Scripting, clickjacking, and Denial-of-Service attacks) before deploying to production.

## What Changes

- Integrate **Helmet** middleware to configure secure HTTP headers.
- Configure **CORS** (Cross-Origin Resource Sharing) to restrict which origins can access the API.
- Implement **CSRF** (Cross-Site Request Forgery) protection to secure mutable requests (POST, PATCH, DELETE).
- Implement **Rate Limiting** (Throttling) using NestJS `ThrottlerModule` to protect public endpoints from brute-force and scraping activities.

## Capabilities

### New Capabilities
- `security`: Global middleware and configuration for app security (CORS, Helmet headers, CSRF defense, and rate-limiting limits).

### Modified Capabilities

## Impact

- **Configuration**: Add new security configurations in `main.ts` and `app.module.ts`.
- **Dependencies**: Install `@nestjs/throttler`, `helmet`, and `csurf` (plus types) after confirmation.
