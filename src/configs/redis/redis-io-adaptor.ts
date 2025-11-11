import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory } from '@core/logger/interface/logger-factory.interface';
import { createAdapter } from '@socket.io/redis-adapter';

export class RedisIoAdapter extends IoAdapter {
    private readonly logger: ICustomLogger;

    constructor(
        private readonly _loggerFactory: ILoggerFactory,
        private app: INestApplication,
        private configService: ConfigService,
    ) {
        super(app);
        this.logger = this._loggerFactory.createLogger(RedisIoAdapter.name);
    }

    override createIOServer(port: number, options?: any) {
        const server = super.createIOServer(port, options);

        const multiInstance = this.configService.get<boolean>('MULTI_INSTANCE') ?? false;
        if (!multiInstance) {
            this.logger.log('RedisIoAdapter disabled (single-instance mode)');
            return server;
        }

        const host = this.configService.get<string>('REDIS_HOST');
        const redisPort = this.configService.get<string>('REDIS_PORT');
        const password = this.configService.get<string>('REDIS_PASSWORD');
        const rawTLS = this.configService.get<string>('REDIS_TLS') ?? 'false';
        const useTLS = rawTLS === 'true';

        if (!host || !redisPort || !password) {
            this.logger.error('❌ Missing Redis configuration (host/port/password)');
            throw new Error('Redis configuration incomplete');
        }

        const protocol = useTLS ? 'rediss' : 'redis';
        const redisUrl = `${protocol}://default:${password}@${host}:${redisPort}`;

        this.logger.debug(`🔄 Connecting Redis adapter...`);
        this.logger.debug(`Adapter set: ${server.of('/video-call').adapter.constructor.name}`);

        (async () => {
            try {
                const pubClient = createClient({
                    url: redisUrl,
                    socket: useTLS ? { tls: true, rejectUnauthorized: false } : {},
                });
                const subClient = pubClient.duplicate();

                await Promise.all([pubClient.connect(), subClient.connect()]);

                const redisAdapter = createAdapter(pubClient, subClient);

                server.adapter(redisAdapter);

                const videoCallNsp = server._nsps.get('/video-call');
                if (videoCallNsp) {
                    // Assign the adapter instance (not call)
                    videoCallNsp.adapter = server.of('/').adapter;
                }

                this.logger.debug(`Adapter set for /: ${server.of('/').adapter.constructor.name}`);
                this.logger.debug(`Adapter set for /video-call: ${server.of('/video-call').adapter.constructor.name}`);

                this.logger.log('✅ RedisIoAdapter successfully connected to Redis')
            } catch (error) {
                this.logger.error(`❌ Failed to connect to Redis at ${redisUrl}`);
                this.logger.error(error);
            }
        })();

        return server;
    }
}
