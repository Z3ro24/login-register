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

  // Cookie parser is required before using csrf-csrf protection
  app.use(
    cookieParser(process.env.COOKIE_SECRET ?? 'cookie-secret-fallback-for-dev'),
  );

  // Double submit cookie CSRF protection
  // app.use(doubleCsrfProtection);

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
