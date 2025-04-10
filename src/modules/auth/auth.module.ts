import { Module } from "@nestjs/common";

import { SignUpController } from "./controllers/signup.controller";
import { LoginController } from "./controllers/login.controller";

import { repositoryProvider } from "./providers/repositories.provider";
import { serviceProvider } from "./providers/service.provider";
import { utilityProvider } from "./providers/utility.provider";

import { RedisModule } from "../../redis/redis.module";

import { GoogleStrategy } from "./strategies/google.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtConfigModule } from "../../configs/jwt/jwt.module";

@Module({
    imports: [
        PassportModule.register({ session: true }),
        JwtConfigModule,
        RedisModule,
    ],
    controllers: [SignUpController, LoginController],
    providers: [
        ...repositoryProvider,
        ...serviceProvider,
        ...utilityProvider,
        GoogleStrategy,
    ],
    exports: [],
})
export class AuthModule { }
