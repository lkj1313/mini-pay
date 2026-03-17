import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';

type AuthenticatedRequest = Request & {
  user: unknown;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    res.cookie(SESSION_COOKIE_NAME, result.sessionId, SESSION_COOKIE_OPTIONS);

    return {
      user: result.user,
    };
  }

  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    return { user: req.user };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = req.cookies?.[SESSION_COOKIE_NAME];

    if (sessionId) {
      await this.authService.logout(sessionId);
    }

    res.clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);

    return { ok: true };
  }
}
