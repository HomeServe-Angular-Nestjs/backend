import Redis from 'ioredis';

import { REDIS_CLIENT } from '@configs/redis/redis.module';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { ITokenService } from '@modules/auth/services/interfaces/token-service.interface';
import {
    Inject, Injectable, InternalServerErrorException, UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService implements ITokenService {
  private readonly logger: ICustomLogger;

  private readonly ACCESS_SECRET: string;
  private readonly REFRESH_SECRET: string;
  private readonly ACCESS_EXPIRES_IN: string;
  private readonly REFRESH_EXPIRES_IN: string;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly loggerFactory: ILoggerFactory,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
    @Inject(REDIS_CLIENT)
    private readonly _redis: Redis,
  ) {
    this.logger = this.loggerFactory.createLogger(TokenService.name);
    
    this.ACCESS_SECRET = this._configService.get<string>('JWT_ACCESS_SECRET') || 'your-access-secret';
    this.REFRESH_SECRET = this._configService.get<string>('JWT_REFRESH_SECRET') || 'your-refresh-secret';
    this.ACCESS_EXPIRES_IN = this._configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '10m';
    this.REFRESH_EXPIRES_IN = this._configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  generateAccessToken(userId: string, email: string, type: string): string {
    const accessPayload = { sub: userId, email, type };

    try {
      const accessToken = this._jwtService.sign(accessPayload, {
        secret: this.ACCESS_SECRET,
        expiresIn: this.ACCESS_EXPIRES_IN,
      });

      return accessToken;
    } catch (err) {
      this.logger.error('Token generation error:', err);
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  async generateRefreshToken(userId: string, email: string, type: string): Promise<string> {
    const refreshPayload = { sub: userId, email, type };
    try {
      const refreshToken = this._jwtService.sign(refreshPayload, {
        secret: this.REFRESH_SECRET,
        expiresIn: this.REFRESH_EXPIRES_IN,
      });

      const redisKey = this.getRefreshTokenKey(userId);
      const ttl = this._configService.get<string>('REDIS_TTL') || 60 * 60; // 1 hour

      await this._redis.set(redisKey, refreshToken, 'EX', ttl);

      const verifyStorage = await this._redis.get(redisKey);
      if (!verifyStorage) {
        throw new Error('Failed to store refresh token in Redis');
      }

      return refreshToken;
    } catch (err) {
      this.logger.error('Token generation error:', err);
      throw new InternalServerErrorException('Failed to generate refresh token');
    }
  }

  async validateAccessToken(token: string): Promise<IPayload> {
    return await this._jwtService.verifyAsync<IPayload>(token, {
      secret: this.ACCESS_SECRET,
    });
  }

  async validateRefreshToken(userId: string): Promise<IPayload | null> {
    try {
      const redisKey = this.getRefreshTokenKey(userId);
      const storedToken = await this._redis.get(redisKey);

      if (!storedToken) {
        throw new UnauthorizedException('No refresh token found in Redis');
      }

      const payload = await this._jwtService.verifyAsync<IPayload>(storedToken, {
        secret: this.REFRESH_SECRET,
      });

      return payload;
    } catch (err) {
      this.logger.error('Token generation error:', err);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async invalidateTokens(userId: string): Promise<void> {
    const redisKey = this.getRefreshTokenKey(userId);
    await this._redis.del(redisKey);
  }

  decode(token: string): IPayload | null {
    return this._jwtService.decode(token);
  }

  private getRefreshTokenKey(userId: string): string {
    return `user:${userId}:refresh`;
  }
}

