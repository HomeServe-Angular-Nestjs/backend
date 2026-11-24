import Redis from 'ioredis';

import { REDIS_CLIENT } from '@configs/redis/redis.module';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { UserType } from '@core/entities/interfaces/user.entity.interface';
import { IRefreshResult, ITokenService } from '@modules/auth/services/interfaces/token-service.interface';
import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ErrorMessage, ErrorCodes } from '@core/enum/error.enum';

const REFRESH_DUPLICATE_WINDOW_SECONDS = 5;
const ROTATE_REFRESH_TOKEN_SCRIPT = `
local currentJti = redis.call('GET', KEYS[1])
local presentedJti = ARGV[1]
local nextJti = ARGV[2]
local sessionTtl = tonumber(ARGV[3])
local duplicateWindow = tonumber(ARGV[4])

if not currentJti then
  redis.call('DEL', KEYS[2])
  return {-1, ''}
end

if currentJti == presentedJti then
  redis.call('SADD', KEYS[2], presentedJti)
  redis.call('EXPIRE', KEYS[2], sessionTtl)
  redis.call('SET', KEYS[1], nextJti, 'EX', sessionTtl)
  redis.call('SET', KEYS[3], nextJti, 'EX', duplicateWindow)
  return {1, nextJti}
end

if redis.call('EXISTS', KEYS[3]) == 1 then
  redis.call('EXPIRE', KEYS[1], sessionTtl)
  return {2, currentJti}
end

redis.call('DEL', KEYS[1], KEYS[2])
return {-1, ''}
`;

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
    this.ACCESS_EXPIRES_IN = this._configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    this.REFRESH_EXPIRES_IN = this._configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  private getSessionKey(sid: string): string {
    return `session:${sid}`;
  }

  private getRotatedKey(sid: string): string {
    return `session:${sid}:rot`;
  }

  private getRotationResultKey(sid: string, jti: string): string {
    return `session:${sid}:rotation:${jti}`;
  }

  private getBlacklistTokenKey(token: string): string {
    return `blacklist:${token}`;
  }

  private getRefreshTtlSeconds(): number {
    const ttlEnv = this._configService.get('REDIS_TTL');
    const ttl = parseInt(ttlEnv, 10);
    return isNaN(ttl) ? 60 * 60 * 24 * 7 : ttl;
  }

  private _signRefresh(userId: string, email: string, type: string, jti: string, sid: string): string {
    return this._jwtService.sign(
      { sub: userId, email, type, jti, sid },
      { secret: this.REFRESH_SECRET, expiresIn: this.REFRESH_EXPIRES_IN },
    );
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

  async createSession(userId: string, email: string, type: string): Promise<IRefreshResult> {
    const sid = uuidv4();
    const jti = uuidv4();

    try {
      const refreshToken = this._signRefresh(userId, email, type, jti, sid);
      if (!refreshToken) throw new Error('Failed to sign refresh token');

      const ttl = this.getRefreshTtlSeconds();
      const sessionKey = this.getSessionKey(sid);

      await this._redis.set(sessionKey, jti);
      await this._redis.expire(sessionKey, ttl);
      await this._redis.expire(this.getRotatedKey(sid), ttl);

      const payload: IPayload = { sub: userId, email, type: type as UserType, jti, sid };
      return { refreshToken, payload };
    } catch (err) {
      this.logger.error('Session creation error:', err);
      throw new InternalServerErrorException('Failed to create session');
    }
  }

  async rotateRefreshToken(refreshToken: string): Promise<IRefreshResult> {
    const payload = await this._refreshPayload(refreshToken);
    const sid = payload.sid as string;
    const jti = payload.jti as string;
    const candidateJti = uuidv4();
    const result = await this._redis.eval(
      ROTATE_REFRESH_TOKEN_SCRIPT,
      3,
      this.getSessionKey(sid),
      this.getRotatedKey(sid),
      this.getRotationResultKey(sid, jti),
      jti,
      candidateJti,
      this.getRefreshTtlSeconds(),
      REFRESH_DUPLICATE_WINDOW_SECONDS,
    );

    if (!Array.isArray(result) || result.length !== 2) {
      throw new InternalServerErrorException('Invalid refresh rotation result');
    }

    const status = Number(result[0]);
    const nextJti = result[1] == null ? '' : String(result[1]);
    if (status === -1) {
      throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
    }
    if ((status !== 1 && status !== 2) || !nextJti) {
      throw new InternalServerErrorException('Invalid refresh rotation result');
    }

    const newRefreshToken = this._signRefresh(payload.sub, payload.email, payload.type, nextJti, sid);

    return {
      refreshToken: newRefreshToken,
      payload: { sub: payload.sub, email: payload.email, type: payload.type, jti: nextJti, sid },
    };
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

      const sid = payload.sid;
      if (!sid) throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);

      const sessionKey = this.getSessionKey(sid);
      const currentJti = await this._redis.get(sessionKey);

      if (!currentJti) {
        await this._destroyFamily(sid);
        throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
      }

      const isRotated = await this._redis.sismember(this.getRotatedKey(sid), payload.jti as string);
      if (payload.jti !== currentJti || isRotated) {
        await this._destroyFamily(sid);
        throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
      }

      return payload;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.error('Refresh token validation error:', err);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async _refreshPayload(refreshToken: string): Promise<IPayload> {
    let payload: IPayload;
    try {
      payload = await this._jwtService.verifyAsync<IPayload>(refreshToken, {
        secret: this.REFRESH_SECRET,
      });
    } catch (error) {
      if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
        throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
      }
      throw error;
    }

    if (!payload.sid || !payload.jti) {
      throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
    }
    return payload;
  }

  private async _destroyFamily(sid: string): Promise<void> {
    await this._redis.del(this.getSessionKey(sid));
    await this._redis.del(this.getRotatedKey(sid));
  }

  private async _invalidateRefreshFamily(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    try {
      const decoded: any = this._jwtService.decode(refreshToken);
      const sid = decoded?.sid;
      if (sid) {
        await this._destroyFamily(sid);
      }
    } catch (err) {
      this.logger.error('Failed to destroy session family:', err);
    }
  }

  async validateAccessToken(token: string): Promise<IPayload> {
    try {
      const blacklistKey = this.getBlacklistTokenKey(token);
      const hasBlacklisted = await this._redis.get(blacklistKey);
      if (hasBlacklisted) {
        throw new UnauthorizedException({
          code: ErrorCodes.SESSION_EXPIRED,
          message: ErrorMessage.UNAUTHORIZED_ACCESS,
        });
      }
    } catch (err) {
      // Best-effort blacklist check: a Redis outage at startup should not
      // invalidate a stateless access token that is still valid by signature.
      if (err instanceof UnauthorizedException) throw err;
      this.logger.warn(`Redis unavailable during access token validation, skipping blacklist check: ${err}`);
    }

    return await this._jwtService.verifyAsync<IPayload>(token, {
      secret: this.ACCESS_SECRET,
    });
  }

  async invalidateAccessToken(token: string): Promise<void> {
    if (!token) return;

    const decoded: any = this._jwtService.decode(token);
    const expiryInSec = decoded?.exp ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 1) : 60 * 60;

    const blacklistKey = this.getBlacklistTokenKey(token);
    await this._redis.setex(blacklistKey, expiryInSec, 'blacklisted');
  }

  async invalidateRefreshToken(refreshToken: string): Promise<void> {
    await this._invalidateRefreshFamily(refreshToken);
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
