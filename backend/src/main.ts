import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma/prisma-client-exception.filter';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';

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

  // Cookie parser is required before using csurf
  app.use(cookieParser());

  // Cookie-based CSRF protection
  // app.use(
  //   csurf({
  //     cookie: {
  //       key: '_csrf',
  //       path: '/',
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === 'production',
  //       sameSite: 'lax',
  //     },
  //   }),
  // );

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
