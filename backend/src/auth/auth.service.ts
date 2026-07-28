import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly failedAttemptsMap = new Map<
    string,
    { count: number; lockUntil: number | null; firstAttemptTime: number }
  >();

  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private getAccessSecret(): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is missing in .env');
    }
    return secret;
  }

  private getRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is missing in .env');
    }
    return secret;
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private checkAccountLockout(email: string) {
    const normalizedEmail = email.toLowerCase();
    const record = this.failedAttemptsMap.get(normalizedEmail);

    if (!record) return;

    const now = Date.now();

    // Check if account is currently locked out
    if (record.lockUntil) {
      if (now < record.lockUntil) {
        const remainingMinutes = Math.ceil((record.lockUntil - now) / 60000);
        throw new UnauthorizedException(
          `Too many failed login attempts for this account. Locked for ${remainingMinutes} more minute(s).`,
        );
      } else {
        // Lockout expired, reset record
        this.failedAttemptsMap.delete(normalizedEmail);
      }
    }
  }

  private registerFailedAttempt(email: string) {
    const normalizedEmail = email.toLowerCase();
    const now = Date.now();
    const record = this.failedAttemptsMap.get(normalizedEmail);

    if (!record) {
      this.failedAttemptsMap.set(normalizedEmail, {
        count: 1,
        lockUntil: null,
        firstAttemptTime: now,
      });
      return;
    }

    // Reset window if 15 minutes have passed since first attempt
    if (now - record.firstAttemptTime > this.LOCKOUT_DURATION_MS) {
      this.failedAttemptsMap.set(normalizedEmail, {
        count: 1,
        lockUntil: null,
        firstAttemptTime: now,
      });
      return;
    }

    record.count += 1;

    if (record.count >= this.MAX_FAILED_ATTEMPTS) {
      record.lockUntil = now + this.LOCKOUT_DURATION_MS;
    }
  }

  private resetFailedAttempts(email: string) {
    this.failedAttemptsMap.delete(email.toLowerCase());
  }

  async signIn(email: string, pass: string) {
    // 1. Check if the account is currently locked out
    this.checkAccountLockout(email);

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.registerFailedAttempt(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      this.registerFailedAttempt(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful sign in
    this.resetFailedAttempts(email);

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.getAccessSecret(),
      expiresIn: '30m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.getRefreshSecret(),
      expiresIn: '7d',
    });

    // Hash and store refresh token in DB
    const hashedToken = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateOAuthUser(profile: { email: string; name: string }) {
    const existingUser = await this.usersService.findByEmail(profile.email);
    let userId: string;
    let userName: string;
    let userEmail: string;
    let userRole: string;

    if (!existingUser) {
      const randomPassword = 'OAuthUserPassword123!';
      const createdUser = await this.usersService.create({
        name: profile.name,
        email: profile.email,
        password: randomPassword,
      });
      userId = createdUser.id;
      userName = createdUser.name;
      userEmail = createdUser.email;
      userRole = createdUser.role;
    } else {
      userId = existingUser.id;
      userName = existingUser.name;
      userEmail = existingUser.email;
      userRole = existingUser.role;
    }

    const payload = { sub: userId, email: userEmail, role: userRole };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.getAccessSecret(),
      expiresIn: '30m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.getRefreshSecret(),
      expiresIn: '7d',
    });

    const hashedToken = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId: userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        name: userName,
        email: userEmail,
        role: userRole,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findOne(userId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async verifyRefreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.getRefreshSecret(),
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async rotateRefreshToken(token: string) {
    // 1. Verify JWT signature
    const payload = await this.verifyRefreshToken(token);

    // 2. Check token in database
    const hashedToken = this.hashToken(token);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token is invalid or missing');
    }

    // Reuse Detection: If token is already revoked, an attacker may have stolen it!
    // Revoke ALL active refresh tokens for this user immediately for security.
    if (storedToken.isRevoked) {
      await this.revokeAllUserRefreshTokens(storedToken.userId);
      throw new UnauthorizedException('Security Alert: Refresh token reuse detected. All sessions revoked.');
    }

    // 3. Revoke current token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // 4. Generate new pair of tokens
    const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };

    const newAccessToken = await this.jwtService.signAsync(newPayload, {
      secret: this.getAccessSecret(),
      expiresIn: '30m',
    });

    const newRefreshToken = await this.jwtService.signAsync(newPayload, {
      secret: this.getRefreshSecret(),
      expiresIn: '7d',
    });

    // 5. Store new hashed token in DB
    const newHashedToken = this.hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        token: newHashedToken,
        userId: payload.sub,
        expiresAt,
      },
    });

    return {
      newAccessToken,
      newRefreshToken,
    };
  }

  async revokeRefreshToken(token: string) {
    if (!token) return;
    try {
      const hashedToken = this.hashToken(token);
      await this.prisma.refreshToken.updateMany({
        where: { token: hashedToken },
        data: { isRevoked: true },
      });
    } catch {
      // Ignore if token is not found
    }
  }

  async revokeAllUserRefreshTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async generateAccessTokenFromPayload(payload: { sub: string; email: string; role: string }) {
    const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };
    return this.jwtService.signAsync(newPayload, {
      secret: this.getAccessSecret(),
      expiresIn: '30m',
    });
  }
}
