import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    const [database, redis] = await Promise.all([
      this.prismaService.checkConnection(),
      this.redisService.checkConnection(),
    ]);

    const status =
      database.status === 'up' && redis.status === 'up' ? 'ok' : 'degraded';

    return {
      status,
      services: {
        database,
        redis,
      },
    };
  }
}
