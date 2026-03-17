import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from '../../auth/auth.constants';
import { AuthService } from '../../auth/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

type AuthenticatedRequest = Request & {
  user?: unknown;
};

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const sessionId = request.cookies?.[SESSION_COOKIE_NAME];

    if (!sessionId) {
      throw new UnauthorizedException('Session not found.');
    }

    const user = await this.authService.getSessionUser(sessionId);

    if (!user) {
      throw new UnauthorizedException('Session expired.');
    }

    request.user = user;
    response.cookie(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);

    return true;
  }
}
