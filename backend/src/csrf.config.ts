import { doubleCsrf } from 'csrf-csrf';
import * as express from 'express';

export const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () =>
    process.env.CSRF_SECRET ?? 'c8f3e2b9a7d14f5e8023c91a6d4b7e2f5c1d8a9b3e7f4c0a2b6d8e1f5c3a7b9',
  getSessionIdentifier: () => '',
  getCsrfTokenFromRequest: (req: express.Request) => {
    return req.headers['x-csrf-token'] as string;
  },
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});
