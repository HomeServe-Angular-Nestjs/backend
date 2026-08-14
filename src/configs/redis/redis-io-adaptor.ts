import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';
import type { INestApplication } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import type { ILoggerFactory } from '@core/logger/interface/logger-factory.interface';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Server, ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private readonly logger: ICustomLogger;
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  constructor(
    private readonly _loggerFactory: ILoggerFactory,
    private readonly _app: INestApplication,
    private readonly _configService: ConfigService,
  ) {
    super(_app);
    this.logger = this._loggerFactory.createLogger(RedisIoAdapter.name);
  }

  async connectToRedis(): Promise<void> {
    const multiInstance = this._configService.get<boolean>('MULTI_INSTANCE') ?? false;
    if (!multiInstance) {
      this.logger.log('RedisIoAdapter disabled (single-instance mode)');
      return;
    }

    const host = this._configService.get<string>('REDIS_HOST');
    const redisPort = this._configService.get<string>('REDIS_PORT');
    const password = this._configService.get<string>('REDIS_PASSWORD');
    const rawTLS = this._configService.get<string>('REDIS_TLS') ?? 'false';
    const useTLS = rawTLS === 'true';

    if (!host || !redisPort || !password) {
      this.logger.error('❌ Missing Redis configuration (host/port/password)');
      throw new Error('Redis configuration incomplete');
    }

    const protocol = useTLS ? 'rediss' : 'redis';
    const redisUrl = `${protocol}://default:${password}@${host}:${redisPort}`;

    this.logger.debug('🔄 Connecting Socket.IO Redis adapter...');

    const pubClient = createClient({
      url: redisUrl,
      socket: useTLS ? { tls: true, rejectUnauthorized: false } : {},
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
    this.logger.log('✅ Socket.IO Redis adapter connected');
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options);

    if (this.adapterConstructor) {
      // Applies to every namespace, including /video-call and /chat.
      server.adapter(this.adapterConstructor);
      this.logger.log('🔄 Socket.IO Redis adapter applied to server');
    }

    return server;
  }
}
