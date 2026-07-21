## Context

We are securing the NestJS backend application. Security must be implemented using standard Express-compatible middleware (since NestJS uses Express by default) and NestJS framework configurations. We will follow official NestJS documentation guidelines to integrate Helmet, CORS policies, CSRF tokens, and rate limits.

## Goals / Non-Goals

**Goals:**
- Enable Helmet globally to secure HTTP headers.
- Configure CORS to restrict API access to trusted origins.
- Set up cookie-based CSRF protection using `csurf` and `cookie-parser`.
- Implement API Rate Limiting using `@nestjs/throttler` (ThrottlerModule) configured globally (e.g., 100 requests per 1 minute window).
- Secure the backend against brute-force attacks and cross-origin resource requests.

**Non-Goals:**
- Creating customized authorization policies (RBAC, ABAC) or authenticating clients with JWTs.
- Implementing IP whitelists or Web Application Firewall (WAF) routing.

## Decisions

### Decision 1: Helmet Integration
We will use the standard `helmet` package as global middleware in `main.ts`.
- **Implementation**:
  ```typescript
  import helmet from 'helmet';
  app.use(helmet());
  ```
- **Rationale**: Quickly configures standard headers like Content-Security-Policy, HSTS, and X-Frame-Options to mitigate clickjacking and XSS.

### Decision 2: Environment-based CORS Configuration
CORS will be configured globally on the NestJS app instance in `main.ts`.
- **Implementation**:
  ```typescript
  app.enableCors({
    origin: process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : true,
    credentials: true,
  });
  ```
- **Rationale**: Uses native NestJS APIs and allows environment variables to adjust permitted frontend domains between dev and production.

### Decision 3: Cookie-based CSRF Protection
We will implement cookie-based CSRF validation using `csurf` and `cookie-parser` globally.
- **Implementation**:
  ```typescript
  import * as cookieParser from 'cookie-parser';
  import * as csurf from 'csurf';

  app.use(cookieParser());
  app.use(csurf({ cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' } }));
  ```
- **Rationale**: Traditional cookie-based CSRF is the recommended pattern in the official NestJS documentation for securing forms and API mutations.

### Decision 4: ThrottlerModule for Rate Limiting
Rate limiting will be handled via the official `@nestjs/throttler` package.
- **Implementation**: Register `ThrottlerModule` in `app.module.ts` and set `ThrottlerGuard` as a global guard.
  ```typescript
  @Module({
    imports: [
      ThrottlerModule.forRoot([{
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests
      }]),
    ],
    providers: [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
      },
    ],
  })
  export class AppModule {}
  ```
- **Rationale**: Out-of-the-box NestJS support, easy overrides via `@SkipThrottle()` and `@Throttle()` decorators at controller level.

## Risks / Trade-offs

- **[Risk]** Rate limiting blocks legitimate requests originating behind a load balancer or proxy (e.g. Cloudflare, AWS ALB).
  - **Mitigation** Set the `trust proxy` option in the underlying Express server (`app.getHttpAdapter().getInstance().set('trust proxy', 1);`) so the rate limiter parses client IP addresses from the `X-Forwarded-For` header.
- **[Risk]** Client mutations fail due to lack of CSRF tokens on initial requests.
  - **Mitigation** Provide an endpoint (e.g., `GET /api/v1/security/csrf-token`) that generates and returns a CSRF token for the frontend to consume.
