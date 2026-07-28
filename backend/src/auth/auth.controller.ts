import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import * as express from 'express';
import { Public } from './decorators/public.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { generateCsrfToken } from '../csrf.config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('csrf-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  getCsrfToken(@Req() request: express.Request, @Res() response: express.Response) {
    const csrfToken = generateCsrfToken(request, response, { overwrite: true });
    return response.json({ csrfToken });
  }

  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
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

  @Get('google')
  @Public()
  @UseGuards(PassportAuthGuard('google'))
  async googleAuth() {
    // Passport initiates the Google OAuth 2.0 redirect flow automatically
  }

  @Get('google/callback')
  @Public()
  @UseGuards(PassportAuthGuard('google'))
  async googleAuthRedirect(
    @Req() request: express.Request,
    @Res() response: express.Response,
  ) {
    const googleUser = request.user as { email: string; name: string };
    if (!googleUser || !googleUser.email) {
      throw new UnauthorizedException('Google OAuth authentication failed');
    }

    const result = await this.authService.validateOAuthUser(googleUser);

    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/',
    });

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    const frontendUrl = process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(',')[0]
      : 'http://localhost:5173';

    return response.redirect(`${frontendUrl}/home`);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@ActiveUser('sub') userId: string) {
    return this.authService.getMe(userId);
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

    const { newAccessToken, newRefreshToken } =
      await this.authService.rotateRefreshToken(refreshToken);

    response.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/',
    });

    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return { message: 'Token refreshed successfully' };
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const refreshToken = request.cookies?.['refreshToken'];
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    const authCookieOptions: express.CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      expires: new Date(0),
      path: '/',
    };

    response.cookie('accessToken', '', authCookieOptions);
    response.cookie('refreshToken', '', authCookieOptions);

    // Clear CSRF cookie on logout
    response.cookie('_csrf', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @ActiveUser('sub') userId: string,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    await this.authService.revokeAllUserRefreshTokens(userId);

    const authCookieOptions: express.CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      expires: new Date(0),
      path: '/',
    };

    response.cookie('accessToken', '', authCookieOptions);
    response.cookie('refreshToken', '', authCookieOptions);

    response.cookie('_csrf', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      path: '/',
    });

    return { message: 'Logged out from all devices successfully' };
  }
}
