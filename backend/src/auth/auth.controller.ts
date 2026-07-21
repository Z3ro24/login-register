import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import * as express from 'express';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const { email, password } = loginDto;
    const result = await this.authService.signIn(email, password);

    // Set Access Token in cookie
    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/',
    });

    // Set Refresh Token in cookie
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return result.user;
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const refreshToken = request.cookies?.['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const payload = await this.authService.verifyRefreshToken(refreshToken);
    const newAccessToken = await this.authService.generateAccessTokenFromPayload(payload);

    response.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/',
    });

    return { message: 'Token refreshed successfully' };
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: express.Response) {
    response.cookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    response.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}
