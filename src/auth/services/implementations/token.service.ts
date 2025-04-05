import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Cache } from "cache-manager";
import { v4 as uuidv4 } from 'uuid';
import { ITokenService } from "../interfaces/token-service.interface";
import { IPayload } from "../../dtos/payload.dto";

@Injectable()
export class TokenService implements ITokenService {
    constructor(
        private jwtService: JwtService,
        private config: ConfigService,
        @Inject(CACHE_MANAGER)
        private cache: Cache
    ) {
        this.testRedisConnection();
    }

    async generateToken(userId: string, email: string): Promise<string> {
        const jti = uuidv4();

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, email, jti },
                {
                    secret: this.config.get('JWT_ACCESS_SECRET'),
                    expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN')
                }
            ),
            this.jwtService.signAsync(
                { sub: userId, jti },
                {
                    secret: this.config.get('JWT_REFRESH_SECRET'),
                    expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN')
                }
            )
        ]);

        try {
            const ttl = parseInt(this.config.get<string>('REDIS_TTL', '3600'), 10) * 1000;

            await this.cache.set(
                `user:${userId}:refresh`,
                refreshToken,
                ttl
            );

            // Verify storage
            const storedToken = await this.cache.get(`user:${userId}:refresh`);
            if (!storedToken) {
                throw new Error('Failed to store refresh token in redis')
            }

        } catch (error) {
            console.error('Redis storage error:', error);
            throw new InternalServerErrorException(error || 'Error while saving refresh token');
        }
        
        return accessToken;
    }

    async validateAccessToken(token: string): Promise<IPayload> {
        return await this.jwtService.verify(token);
    }

    async validateRefreshToken(userId: string, token: string) {
        const storedToken = await this.cache.get(`user:${userId}:refresh`);
        return storedToken === token;
    }

    async invalidateTokens(userId: string) {
        await this.cache.del(`user:${userId}:refresh`);
    }

    private async testRedisConnection() {
        try {
            await this.cache.set('connection_test', 'success', 10);
            const value = await this.cache.get('connection_test');
            console.log('Redis connection test:', value === 'success' ? '✅ Success' : '❌ Failed');
        } catch (error) {
            console.error('Redis connection error:', error);
        }
    }
}