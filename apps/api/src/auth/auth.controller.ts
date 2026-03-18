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
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

type AuthenticatedRequest = Request & {
  user: unknown;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ description: '로그인 성공 후 세션 쿠키를 발급합니다.' })
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

  @ApiCookieAuth(SESSION_COOKIE_NAME)
  @ApiOperation({ summary: '현재 로그인 사용자 조회' })
  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    return { user: req.user };
  }

  @Public()
  @ApiOperation({ summary: '로그아웃' })
  @ApiOkResponse({ description: '세션 쿠키를 제거합니다.' })
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
