import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis({
      host: configService.get<string>('REDIS_HOST') ?? 'localhost',
      port: Number(configService.get<string>('REDIS_PORT') ?? 6379),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
  }

  async checkConnection() {
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }

      const response = await this.client.ping();

      return {
        status: response === 'PONG' ? ('up' as const) : ('down' as const),
      };
    } catch (error) {
      return {
        status: 'down' as const,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async onModuleDestroy() {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }
}
