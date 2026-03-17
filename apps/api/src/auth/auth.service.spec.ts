import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';
import {
  SESSION_ABSOLUTE_TTL_MS,
  SESSION_IDLE_TTL_SECONDS,
} from './auth.constants';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: {
    getUserByEmail: jest.Mock;
    findOne: jest.Mock;
  };
  let redisService: {
    set: jest.Mock;
    get: jest.Mock;
    del: jest.Mock;
    expire: jest.Mock;
  };
  const compareMock = bcrypt.compare as jest.Mock;

  beforeEach(async () => {
    userService = {
      getUserByEmail: jest.fn(),
      findOne: jest.fn(),
    };
    redisService = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      expire: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a session with idle ttl when login succeeds', async () => {
    const createdAt = new Date('2026-03-16T00:00:00.000Z');
    const updatedAt = new Date('2026-03-16T00:00:01.000Z');
    userService.getUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      password: 'hashed-password',
      createdAt,
      updatedAt,
    });
    compareMock.mockResolvedValue(true);

    const result = await service.login({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(result).toEqual({
      sessionId: expect.any(String),
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        createdAt,
        updatedAt,
      },
    });
    expect(redisService.set).toHaveBeenCalledWith(
      `session:${result.sessionId}`,
      expect.any(String),
      SESSION_IDLE_TTL_SECONDS,
    );
    expect(JSON.parse(redisService.set.mock.calls[0][1])).toEqual({
      userId: 'user-1',
      email: 'user@example.com',
      issuedAt: expect.any(Number),
    });
  });

  it('rejects login when user does not exist', async () => {
    userService.getUserByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login when password is invalid', async () => {
    userService.getUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    compareMock.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns null when session does not exist', async () => {
    redisService.get.mockResolvedValue(null);

    await expect(service.getSessionUser('missing-session')).resolves.toBeNull();
  });

  it('returns the user and refreshes idle ttl for a valid session', async () => {
    redisService.get.mockResolvedValue(
      JSON.stringify({
        userId: 'user-1',
        email: 'user@example.com',
        issuedAt: Date.now(),
      }),
    );
    userService.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
    });

    await expect(service.getSessionUser('session-1')).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
    });
    expect(redisService.expire).toHaveBeenCalledWith(
      'session:session-1',
      SESSION_IDLE_TTL_SECONDS,
    );
    expect(userService.findOne).toHaveBeenCalledWith('user-1');
  });

  it('deletes the session when the absolute timeout has passed', async () => {
    redisService.get.mockResolvedValue(
      JSON.stringify({
        userId: 'user-1',
        email: 'user@example.com',
        issuedAt: Date.now() - SESSION_ABSOLUTE_TTL_MS - 1,
      }),
    );

    await expect(service.getSessionUser('session-1')).resolves.toBeNull();

    expect(redisService.del).toHaveBeenCalledWith('session:session-1');
    expect(redisService.expire).not.toHaveBeenCalled();
    expect(userService.findOne).not.toHaveBeenCalled();
  });

  it('deletes the session on logout', async () => {
    await service.logout('session-1');

    expect(redisService.del).toHaveBeenCalledWith('session:session-1');
  });
});
