// import { Global, Module } from "@nestjs/common";
// import { CacheModule } from '@nestjs/cache-manager'
// import { ConfigModule, ConfigService } from "@nestjs/config";
// import { redisStore } from "cache-manager-redis-store";
// import Redis from "ioredis";


// @Global()
// @Module({
//     providers: [
//         {
//             provide: 'REDIS_CLIENT',
//             useFactory: () => {
//                 return new Redis({
//                     host: process.env.REDIS_HOST,
//                     port: +process.env.REDIS_PORT,
//                     password: process.env.REDIS_PASSWORD,
//                     tls: true, // if using cloud redis with TLS
//                 });
//             },
//         },
//     ]
//     // imports: [
//     //     CacheModule.registerAsync({
//     //         imports: [ConfigModule],
//     //         useFactory: async (config: ConfigService) => {
//     //             const options = {
//     //                 store: redisStore,
//     //                 socket: {
//     //                     host: config.get('REDIS_HOST'),
//     //                     port: +config.get('REDIS_PORT'),
//     //                     tls: true
//     //                 },
//     //                 password: config.get('REDIS_PASSWORD'),
//     //                 ttl: config.get('REDIS_TTL'),
//     //             };
//     //             console.log(options)
//     //             return options;
//     //         },
//     //         inject: [ConfigService],
//     //     }),
//     // ],
//     // exports: [CacheModule]
// })
// export class RedisModule { }




// redis.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'REDIS_CLIENT',
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const client = new Redis({
                    host: configService.get<string>('REDIS_HOST'),
                    port: configService.get<number>('REDIS_PORT'),
                    password: configService.get<string>('REDIS_PASSWORD'),
                    tls: configService.get<boolean>('REDIS_TLS') ? {} : undefined,
                });

                // Optional: Log or test connection
                client.on('connect', () => console.log('✅ Redis connected'));
                client.on('error', (err) => console.error('❌ Redis error:', err));

                return client;
            },
        },
    ],
    exports: ['REDIS_CLIENT'],
})
export class RedisModule { }
