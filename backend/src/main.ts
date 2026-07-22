import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma/prisma-client-exception.filter';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { doubleCsrfProtection } from './csrf.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api/v1');

  // Trust proxy (enables rate limiters to read X-Forwarded-For headers correctly)
  app.set('trust proxy', 1);

  // Global secure headers
  app.use(helmet());

  // Global CORS configuration
  app.enableCors({
    origin: process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(',')
      : true,
    credentials: true,
  });

  // Cookie parser requires COOKIE_SECRET environment variable
  const cookieSecret = process.env.COOKIE_SECRET;
  if (!cookieSecret) {
    throw new Error('COOKIE_SECRET environment variable is missing in .env');
  }
  app.use(cookieParser(cookieSecret));

  // Debug middleware for inspecting CSRF headers and cookies
  app.use((req: any, res: any, next: any) => {
    if (req.method !== 'GET') {
      // console.log(`[CSRF Debug] ${req.method} ${req.url}`);
      // console.log(`[CSRF Debug] req.cookies:`, req.cookies);
      // console.log(`[CSRF Debug] x-csrf-token header:`, req.headers['x-csrf-token']);
    }
    next();
  });

  // Enable Double Submit Cookie CSRF Protection
  app.use(doubleCsrfProtection);

  // Enable global validation pipe for request DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Enable global Prisma client exception filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const port = process.env.PORT ?? 3000;
  console.log(`Server is running on port ${port}`);
  await app.listen(port);
}
bootstrap();
