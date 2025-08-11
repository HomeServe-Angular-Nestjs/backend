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
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid'
import { VerifyTokenDto } from '@modules/auth/dtos/login.dto';
import { ErrorMessage } from '@core/enum/error.enum';

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

  private getRefreshTokenKey(userId: string): string {
    return `user:${userId}:refresh`;
  }

  private getBlacklistTokenKey(token: string): string {
    return `blacklist:${token}`;
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
    const refreshPayload = { sub: userId, email, type, jti: uuidv4() };
    try {
      const refreshToken = this._jwtService.sign(refreshPayload, {
        secret: this.REFRESH_SECRET,
        expiresIn: this.REFRESH_EXPIRES_IN,
      });

      const redisKey = this.getRefreshTokenKey(userId);
      await this._redis.sadd(redisKey, refreshToken);

      const verifyStorage = await this._redis.sismember(redisKey, refreshToken);
      if (!verifyStorage) {
        throw new Error('Failed to store refresh token in Redis');
      }

      const ttlEnv = this._configService.get('REDIS_TTL');
      const ttl = parseInt(ttlEnv, 10);

      if (isNaN(ttl)) {
        this.logger.warn(`Invalid REDIS_TTL value "${ttlEnv}", defaulting to 3600 seconds`);
      }
      const finalTtl = isNaN(ttl) ? 60 * 60 : ttl;

      await this._redis.expire(redisKey, finalTtl);

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

  async validateRefreshToken(refreshToken: string): Promise<IPayload | null> {
    try {
      const blacklistKey = this.getBlacklistTokenKey(refreshToken);

      const hasBlacklisted = await this._redis.get(blacklistKey);
      if (hasBlacklisted) {
        throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
      }

      const payload = await this._jwtService.verifyAsync<IPayload>(refreshToken, {
        secret: this.REFRESH_SECRET,
      });

      return payload;
    } catch (err) {
      this.logger.error('Token generation error:', err);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async invalidateTokens(userId: string, token: string): Promise<void> {
    const blacklistKey = this.getBlacklistTokenKey(token);
    const refreshKey = this.getRefreshTokenKey(userId);
    await this._redis.srem(refreshKey, token);

    const decoded: any = this._jwtService.decode(token);
    const expiryInSec = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 60 * 60 * 24 * 7;

    await this._redis.setex(blacklistKey, expiryInSec, 'blacklisted');
  }

  async verifyToken(token: string): Promise<IPayload> {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      return await this._jwtService.verifyAsync<IPayload>(token, {
        secret: this._configService.get('JWT_VERIFICATION_SECRET'),
      });
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }

      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }

      throw new UnauthorizedException('Token verification failed');
    }
  }

  decode(token: string): IPayload | null {
    return this._jwtService.decode(token);
  }
}

