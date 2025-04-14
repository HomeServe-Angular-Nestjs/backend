import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from 'uuid';
import { IPayload } from "../../misc/payload.interface";
import { ITokenService } from "../interfaces/token-service.interface";
import Redis from "ioredis";

@Injectable()
export class TokenService implements ITokenService {
    private readonly ACCESS_SECRET: string;
    private readonly REFRESH_SECRET: string;
    private readonly ACCESS_EXPIRES_IN: string;
    private readonly REFRESH_EXPIRES_IN: string;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ) {
        this.ACCESS_SECRET = this.configService.get<string>('JWT_ACCESS_SECRET') || 'your-access-secret';
        this.REFRESH_SECRET = this.configService.get<string>('JWT_REFRESH_SECRET') || 'your-refresh-secret';
        this.ACCESS_EXPIRES_IN = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '10s';
        this.REFRESH_EXPIRES_IN = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '1h';
    }

    async generateToken(userId: string, email: string): Promise<string> {
        const jti = uuidv4();

        const accessPayload = { sub: userId, email, jti };
        const refreshPayload = { sub: userId, jti };

        try {
            const [accessToken, refreshToken] = await Promise.all([
                this.jwtService.signAsync(accessPayload, {
                    secret: this.ACCESS_SECRET,
                    expiresIn: this.ACCESS_EXPIRES_IN
                }),
                this.jwtService.signAsync(refreshPayload, {
                    secret: this.REFRESH_SECRET,
                    expiresIn: this.REFRESH_EXPIRES_IN
                })
            ]);

            const redisKey = this.getRefreshTokenKey(userId);
            const ttl = this.configService.get<string>('REDIS_TTL') || 60 * 60; // 1 hour

            await this.redis.set(redisKey, refreshToken, 'EX', ttl);

            const verifyStorage = await this.redis.get(redisKey);
            if (!verifyStorage) {
                throw new Error('Failed to store refresh token in Redis');
            }

            return accessToken;

        } catch (err) {
            console.error('Token generation error:', err);
            throw new InternalServerErrorException('Failed to generate tokens');
        }
    }

    async validateAccessToken(token: string): Promise<IPayload> {
        return await this.jwtService.verifyAsync<IPayload>(token, {
            secret: this.ACCESS_SECRET
        });
    }

    async validateRefreshToken(userId: string): Promise<IPayload | null> {
        try {
            const redisKey = this.getRefreshTokenKey(userId);
            const storedToken = await this.redis.get(redisKey);

            if (!storedToken) {
                throw new UnauthorizedException('No refresh token found in Redis');
            }

            const payload = await this.jwtService.verifyAsync<IPayload>(storedToken, {
                secret: this.REFRESH_SECRET,
            });

            return payload;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async invalidateTokens(userId: string): Promise<void> {
        const redisKey = this.getRefreshTokenKey(userId);
        await this.redis.del(redisKey);
    }

    decode(token: string): null | { [key: string]: any } {
        return this.jwtService.decode(token);
    }

    private getRefreshTokenKey(userId: string): string {
        return `user:${userId}:refresh`;
    }
}