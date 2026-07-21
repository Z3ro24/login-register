import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as express from 'express';
import { generateCsrfToken } from './csrf.config';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('security/csrf-token')
  @Public()
  getCsrfToken(@Req() req: express.Request, @Res() res: express.Response) {
    const token = generateCsrfToken(req, res);
    return res.json({ csrfToken: token });
  }
}
