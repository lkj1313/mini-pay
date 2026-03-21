import { randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';
import {
  SESSION_ABSOLUTE_TTL_MS,
  SESSION_IDLE_TTL_SECONDS,
} from './auth.constants';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private static readonly SESSION_PREFIX = 'session:';

  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userService.getUserByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const sessionId = randomUUID();
    const issuedAt = Date.now();
    const session = {
      userId: user.id,
      email: user.email,
      issuedAt,
    };

    await this.redisService.set(
      this.getSessionKey(sessionId),
      JSON.stringify(session),
      SESSION_IDLE_TTL_SECONDS,
    );

    return {
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async getSessionUser(sessionId: string) {
    const sessionKey = this.getSessionKey(sessionId);
    const session = await this.redisService.get(sessionKey);

    if (!session) {
      return null;
    }

    const parsedSession = JSON.parse(session) as {
      userId: string;
      email: string;
      issuedAt: number;
    };

    if (Date.now() - parsedSession.issuedAt > SESSION_ABSOLUTE_TTL_MS) {
      await this.redisService.del(sessionKey);
      return null;
    }

    await this.redisService.expire(sessionKey, SESSION_IDLE_TTL_SECONDS);

    return this.userService.findOne(parsedSession.userId);
  }

  async logout(sessionId: string) {
    await this.redisService.del(this.getSessionKey(sessionId));
  }

  private getSessionKey(sessionId: string) {
    return `${AuthService.SESSION_PREFIX}${sessionId}`;
  }
}
