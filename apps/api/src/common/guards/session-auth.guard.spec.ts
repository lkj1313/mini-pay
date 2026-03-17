import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SESSION_COOKIE_OPTIONS } from '../../auth/auth.constants';
import { AuthService } from '../../auth/auth.service';
import { SessionAuthGuard } from './session-auth.guard';

describe('SessionAuthGuard', () => {
  let guard: SessionAuthGuard;
  let authService: {
    getSessionUser: jest.Mock;
  };
  let reflector: {
    getAllAndOverride: jest.Mock;
  };

  beforeEach(() => {
    authService = {
      getSessionUser: jest.fn(),
    };
    reflector = {
      getAllAndOverride: jest.fn(),
    };

    guard = new SessionAuthGuard(
      authService as unknown as AuthService,
      reflector as unknown as Reflector,
    );
  });

  const createContext = (request: any, response: any) =>
    ({
      getArgs: () => [request, response],
      getArgByIndex: (index: number) => [request, response][index],
      getHandler: () => jest.fn(),
      getClass: () => class TestClass {},
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
      switchToRpc: () => ({} as any),
      switchToWs: () => ({} as any),
    }) as unknown as ExecutionContext;

  it('throws when the session cookie is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    await expect(
      guard.canActivate(createContext({ cookies: {} }, { cookie: jest.fn() })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws when the session is expired', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    authService.getSessionUser.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        createContext(
          { cookies: { session_id: 'session-1' } },
          { cookie: jest.fn() },
        ),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('injects the user and refreshes the cookie for a valid session', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const request = {
      cookies: {
        session_id: 'session-1',
      },
    } as any;
    const response = {
      cookie: jest.fn(),
    };
    authService.getSessionUser.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
    });

    await expect(
      guard.canActivate(createContext(request, response)),
    ).resolves.toBe(true);

    expect(authService.getSessionUser).toHaveBeenCalledWith('session-1');
    expect(request.user).toEqual({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'session_id',
      'session-1',
      expect.objectContaining(SESSION_COOKIE_OPTIONS),
    );
  });

  it('bypasses auth for public routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(
      guard.canActivate(createContext({ cookies: {} }, { cookie: jest.fn() })),
    ).resolves.toBe(true);

    expect(authService.getSessionUser).not.toHaveBeenCalled();
  });
});
