import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import * as express from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('security/csrf-token')
  getCsrfToken(@Req() req: express.Request) {
    return { csrfToken: req.csrfToken() };
  }
}
