import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ILoggerFactory } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { TokenService } from './token.service';

describe('TokenService refresh rotation', () => {
  const refreshPayload: IPayload = {
    sub: 'customer-1',
    email: 'customer@example.com',
    type: 'customer',
    sid: 'session-1',
    jti: 'old-jti',
  };

  let redisEval: jest.Mock;
  let jwtVerify: jest.Mock;
  let jwtSign: jest.Mock;
  let service: TokenService;

  beforeEach(() => {
    redisEval = jest.fn();
    jwtVerify = jest.fn().mockResolvedValue(refreshPayload);
    jwtSign = jest.fn((payload: IPayload) => JSON.stringify(payload));

    const redis = { eval: redisEval } as unknown as Redis;
    const jwt = { verifyAsync: jwtVerify, sign: jwtSign } as unknown as JwtService;
    const config = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    const loggerFactory = {
      createLogger: jest.fn().mockReturnValue({ error: jest.fn() }),
    } as unknown as ILoggerFactory;

    service = new TokenService(loggerFactory, jwt, config, redis);
  });

  it('returns the same current JTI for concurrent refreshes presenting the same token', async () => {
    let currentJti = refreshPayload.jti!;
    let duplicateResult: string | null = null;
    redisEval.mockImplementation(async (
      _script: string,
      _keyCount: number,
      _sessionKey: string,
      _rotatedKey: string,
      _resultKey: string,
      presentedJti: string,
      candidateJti: string,
    ) => {
      if (currentJti === presentedJti) {
        currentJti = candidateJti;
        duplicateResult = candidateJti;
        return [1, candidateJti];
      }

      if (duplicateResult) return [2, currentJti];
      currentJti = '';
      return [-1, ''];
    });

    const [first, second] = await Promise.all([
      service.rotateRefreshToken('old-refresh-token'),
      service.rotateRefreshToken('old-refresh-token'),
    ]);

    expect(first.payload.jti).toBe(second.payload.jti);
    expect(redisEval).toHaveBeenCalledTimes(2);
    expect(redisEval.mock.calls[0][0]).toContain("redis.call('SET', KEYS[3]");
    expect(jwtSign).toHaveBeenCalledTimes(2);
  });

  it('rejects a stale token after its duplicate window has expired', async () => {
    redisEval.mockResolvedValue([-1, '']);

    await expect(service.rotateRefreshToken('stale-refresh-token'))
      .rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('treats an expired refresh JWT as unauthorized instead of transient', async () => {
    jwtVerify.mockRejectedValue(new TokenExpiredError('jwt expired', new Date()));

    await expect(service.rotateRefreshToken('expired-refresh-token'))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(redisEval).not.toHaveBeenCalled();
  });

  it('rejects malformed atomic rotation results', async () => {
    redisEval.mockResolvedValue('unexpected');

    await expect(service.rotateRefreshToken('old-refresh-token'))
      .rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
