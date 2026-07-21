import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const email = 'test@example.com';
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

    it('should successfully sign in and return tokens', async () => {
      usersService.findByEmail.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce('mockAccessToken')
        .mockResolvedValueOnce('mockRefreshToken');

      const result = await service.signIn(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deleteAt: user.deleteAt,
        },
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify token and return payload', async () => {
      const payload = { sub: 'uuid-123', email: 'test@example.com', role: 'USER' };
      jwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.verifyRefreshToken('validToken');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validToken', expect.any(Object));
      expect(result).toBe(payload);
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('JWT expired'));

      await expect(service.verifyRefreshToken('invalidToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
