import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client/index';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(configService: ConfigService) {
    super({
      datasourceUrl:
        configService.get<string>('DATABASE_URL') ??
        'postgresql://postgres:postgres@localhost:5432/mini_pay',
    });
  }

  async checkConnection() {
    try {
      await this.$queryRaw`SELECT 1`;

      return { status: 'up' as const };
    } catch (error) {
      return {
        status: 'down' as const,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
