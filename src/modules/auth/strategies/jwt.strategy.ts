import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from '@nestjs/passport';
import { Cache } from "cache-manager";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { getAccessKey } from "../interceptors/auth.interceptor";
import { UserType } from "../dtos/login.dto";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        @Inject(CACHE_MANAGER) private cache: Cache
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    const userType = req.headers['x-user-type'] as UserType;
                    const accessKey = getAccessKey(userType);
                    return req.cookies?.[accessKey];
                }
            ]),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        });
    }

    async validate(payload: any) {
        const isRevoked = await this.cache.get(`jti:${payload.jti}:revoked`);
        if (isRevoked) {
            throw new Error('Token revoked');
        }

        return {
            userId: payload.sub,
            email: payload.email,
            jti: payload.jti
        }
    }
}