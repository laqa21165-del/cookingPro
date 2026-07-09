import { Global, Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType, createClient } from 'redis';

@Global()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('REDIS_URL');
    if (!url) {
      return;
    }

    try {
      this.client = createClient({ url });
      this.client.on('error', (error) => this.logger.warn(`Redis error: ${String(error)}`));
      await this.client.connect();
    } catch (error) {
      this.logger.warn(`Redis unavailable in current environment: ${String(error)}`);
      this.client = null;
    }
  }

  getClient() {
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client?.isOpen) {
      await this.client.quit();
    }
  }
}

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
