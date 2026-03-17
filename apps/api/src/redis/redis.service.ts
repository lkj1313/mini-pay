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

  private async connectIfNeeded() {
    if (this.client.status === 'wait') {
      await this.client.connect();
    }
  }

  async checkConnection() {
    try {
      await this.connectIfNeeded();

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

  async set(key: string, value: string, ttlSeconds?: number) {
    await this.connectIfNeeded();

    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
      return;
    }

    await this.client.set(key, value);
  }

  async get(key: string) {
    await this.connectIfNeeded();
    return this.client.get(key);
  }

  async del(key: string) {
    await this.connectIfNeeded();
    return this.client.del(key);
  }

  async expire(key: string, ttlSeconds: number) {
    await this.connectIfNeeded();
    return this.client.expire(key, ttlSeconds);
  }

  async onModuleDestroy() {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }
}
