import { Test, TestingModule } from '@nestjs/testing';
import { SESSION_COOKIE_OPTIONS } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    login: jest.Mock;
    logout: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: SessionAuthGuard,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('sets the session cookie on login', async () => {
    authService.login.mockResolvedValue({
      sessionId: 'session-1',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
      },
    });
    const res = {
      cookie: jest.fn(),
    } as any;

    await expect(
      controller.login(
        { email: 'user@example.com', password: 'password123' },
        res,
      ),
    ).resolves.toEqual({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
      },
    });
    expect(res.cookie).toHaveBeenCalledWith(
      'session_id',
      'session-1',
      expect.objectContaining(SESSION_COOKIE_OPTIONS),
    );
  });

  it('returns the user injected by the session guard', async () => {
    await expect(
      controller.me({
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
        },
      } as any),
    ).resolves.toEqual({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
      },
    });
  });

  it('clears the cookie and deletes the session on logout', async () => {
    const res = {
      clearCookie: jest.fn(),
    } as any;

    await expect(
      controller.logout(
        {
          cookies: {
            session_id: 'session-1',
          },
        } as any,
        res,
      ),
    ).resolves.toEqual({ ok: true });
    expect(authService.logout).toHaveBeenCalledWith('session-1');
    expect(res.clearCookie).toHaveBeenCalledWith(
      'session_id',
      expect.objectContaining(SESSION_COOKIE_OPTIONS),
    );
  });
});
