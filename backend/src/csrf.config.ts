import { doubleCsrf } from 'csrf-csrf';
import * as express from 'express';

export const {
  doubleCsrfProtection,
  generateCsrfToken,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET ?? 'super-secret-csrf-key-fallback-for-dev',
  getSessionIdentifier: (req: express.Request) => {
    // Bind token to session cookie if exists, otherwise fallback to request IP
    return req.cookies?.['session-id'] ?? req.ip ?? 'anonymous';
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
