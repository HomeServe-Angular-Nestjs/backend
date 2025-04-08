import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { SignUpController } from "./controllers/signup.controller";
import { LoginController } from "./controllers/login.controller";

import { repositoryProvider } from "./providers/repositories.provider";
import { serviceProvider } from "./providers/service.provider";
import { utilityProvider } from "./providers/utility.provider";

import { CommonModule } from "../../core/common.module";
import { RedisModule } from "../../redis/redis.module";

import { GoogleStrategy } from "./strategies/google.strategy";
import { PassportModule } from "@nestjs/passport";

@Module({
    imports: [
        PassportModule.register({ session: true }),

        JwtModule.registerAsync({
            useFactory: (config: ConfigService) => {
                const secret = config.get<string>('JWT_ACCESS_SECRET');
                if (!secret) throw new Error('JWT_SECRET missing in env');

                return {
                    global: true,
                    secret: config.get<string>('JWT_ACCESS_SECRET') || (() => {
                        console.error('MISSING JWT_SECRET IN ENV');
                        throw new Error('JWT secret missing');
                    })(),
                    signOptions: {
                        expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN') || (() => {
                            console.error('MISSING JWT_SECRET IN ENV');
                            throw new Error('JWT secret missing');
                        })(),
                    }
                };
            },
            inject: [ConfigService],
        }),

        CommonModule,
        RedisModule,
    ],
    controllers: [SignUpController, LoginController],
    providers: [
        ...repositoryProvider,
        ...serviceProvider,
        ...utilityProvider,
        GoogleStrategy,
    ],
    exports: [JwtModule],
})
export class AuthModule { }
