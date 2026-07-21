import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../../generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  override catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        const message = `Unique constraint failed on field(s): ${(exception.meta?.target as string[])?.join(', ') || 'unknown'}`;
        response.status(status).json({
          statusCode: status,
          message: message,
          error: 'Conflict',
        });
        break;
      }
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message: 'Record not found',
          error: 'Not Found',
        });
        break;
      }
      default:
        // Fall back to default NestJS exception handling
        super.catch(exception, host);
        break;
    }
  }
}
