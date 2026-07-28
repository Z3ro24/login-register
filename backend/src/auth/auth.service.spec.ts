import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let prismaService: any;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  });

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findOne: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockPrismaService = {
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const email = 'testlock@example.com';
    const password = 'password123';
    const hashedPassword = 'hashedPassword123';
    const user = {
      id: 'uuid-123',
      name: 'Test User',
      email,
      password: hashedPassword,
      isActive: true,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: null,
    };

    it('should successfully sign in, store hashed token in DB, and return sanitized user data with tokens', async () => {
      usersService.findByEmail.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce('mockAccessToken')
        .mockResolvedValueOnce('mockRefreshToken');

      const result = await service.signIn(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: user.id,
            token: expect.any(String),
          }),
        }),
      );
      expect(result).toEqual({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.signIn('unknown@example.com', password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn('wrongpass@example.com', password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should lock account after 5 consecutive failed login attempts', async () => {
      const lockEmail = 'lockmeout@example.com';
      usersService.findByEmail.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Perform 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await expect(service.signIn(lockEmail, 'wrongpass')).rejects.toThrow(
          UnauthorizedException,
        );
      }

      // 6th attempt should fail immediately with lockout exception message
      await expect(service.signIn(lockEmail, 'wrongpass')).rejects.toThrow(
        'Too many failed login attempts for this account',
      );
    });
  });

  describe('rotateRefreshToken', () => {
    it('should rotate refresh token successfully when valid and not revoked', async () => {
      const payload = { sub: 'uuid-123', email: 'test@example.com', role: 'USER' };
      jwtService.verifyAsync.mockResolvedValue(payload);
      prismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'token-uuid',
        token: 'hashedToken',
        userId: 'uuid-123',
        isRevoked: false,
      });
      jwtService.signAsync
        .mockResolvedValueOnce('newAccessToken')
        .mockResolvedValueOnce('newRefreshToken');

      const result = await service.rotateRefreshToken('validToken');

      expect(prismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-uuid' },
        data: { isRevoked: true },
      });
      expect(prismaService.refreshToken.create).toHaveBeenCalled();
      expect(result).toEqual({
        newAccessToken: 'newAccessToken',
        newRefreshToken: 'newRefreshToken',
      });
    });

    it('should detect reuse and trigger mass revocation if token is revoked in DB', async () => {
      const payload = { sub: 'uuid-123', email: 'test@example.com', role: 'USER' };
      jwtService.verifyAsync.mockResolvedValue(payload);
      prismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'token-uuid',
        token: 'hashedToken',
        userId: 'uuid-123',
        isRevoked: true,
      });

      await expect(service.rotateRefreshToken('revokedToken')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'uuid-123' },
        data: { isRevoked: true },
      });
    });
  });

  describe('revokeRefreshToken', () => {
    it('should mark refresh token as revoked in DB', async () => {
      await service.revokeRefreshToken('tokenToRevoke');

      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: service.hashToken('tokenToRevoke') },
        data: { isRevoked: true },
      });
    });
  });

  describe('revokeAllUserRefreshTokens', () => {
    it('should revoke all refresh tokens for a given user', async () => {
      await service.revokeAllUserRefreshTokens('uuid-123');

      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'uuid-123' },
        data: { isRevoked: true },
      });
    });
  });
});
