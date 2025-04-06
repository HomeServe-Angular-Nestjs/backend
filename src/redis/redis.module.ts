import { Module } from "@nestjs/common";
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-store";
@Module({
    imports: [
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => {
                const options = {
                    store: redisStore,
                    socket: {
                        host: config.get('REDIS_HOST'),
                        port: +config.get('REDIS_PORT'),
                        tls: true
                    },
                    password: config.get('REDIS_PASSWORD'),
                    ttl: config.get('REDIS_TTL'),
                };
                return options;
            },
            inject: [ConfigService],
        }),
    ],
    exports: [CacheModule]
})
export class RedisModule { }