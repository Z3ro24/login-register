import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'access-secret-fallback-key',
      expiresIn: '30m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret-fallback-key',
      expiresIn: '7d',
    });

    const { password: _, ...userWithoutPassword } = user;
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  async verifyRefreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret-fallback-key',
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async generateAccessTokenFromPayload(payload: { sub: string; email: string; role: string }) {
    const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };
    return this.jwtService.signAsync(newPayload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'access-secret-fallback-key',
      expiresIn: '30m',
    });
  }
}
