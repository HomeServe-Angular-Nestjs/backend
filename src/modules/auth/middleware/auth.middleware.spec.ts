import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ILoggerFactory } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { ITokenService } from '@modules/auth/services/interfaces/token-service.interface';
import { AuthMiddleware } from './auth.middleware';

describe('AuthMiddleware refresh identity', () => {
  it('sets req.user from the verified refresh payload, not the decoded access token', async () => {
    const verifiedPayload: IPayload = {
      sub: 'verified-customer',
      email: 'verified@example.com',
      type: 'customer',
      sid: 'session-1',
      jti: 'new-jti',
    };
    const tokenService = {
      validateAccessToken: jest.fn().mockRejectedValue(new UnauthorizedException()),
      rotateRefreshToken: jest.fn().mockResolvedValue({
        refreshToken: 'rotated-refresh-token',
        payload: verifiedPayload,
      }),
      generateAccessToken: jest.fn().mockReturnValue('new-access-token'),
      decode: jest.fn().mockReturnValue({ sub: 'untrusted-user', type: 'provider' }),
    } as unknown as ITokenService;
    const loggerFactory = {
      createLogger: jest.fn().mockReturnValue({
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      }),
    } as unknown as ILoggerFactory;
    const middleware = new AuthMiddleware(loggerFactory, tokenService);
    const request = {
      originalUrl: '/chat/new_access_token',
      cookies: {
        access_token: 'invalid-access-token',
        refresh_token: 'valid-refresh-token',
      },
    } as unknown as Request;
    const response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    await middleware.use(request, response, next);

    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      'verified-customer',
      'verified@example.com',
      'customer',
    );
    expect(tokenService.decode).not.toHaveBeenCalled();
    expect(request.user).toEqual(verifiedPayload);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('can establish the request principal from a valid refresh token when access cookie is absent', async () => {
    const verifiedPayload: IPayload = {
      sub: 'verified-customer',
      email: 'verified@example.com',
      type: 'customer',
      sid: 'session-1',
      jti: 'new-jti',
    };
    const tokenService = {
      rotateRefreshToken: jest.fn().mockResolvedValue({
        refreshToken: 'rotated-refresh-token',
        payload: verifiedPayload,
      }),
      generateAccessToken: jest.fn().mockReturnValue('new-access-token'),
    } as unknown as ITokenService;
    const loggerFactory = {
      createLogger: jest.fn().mockReturnValue({
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      }),
    } as unknown as ILoggerFactory;
    const middleware = new AuthMiddleware(loggerFactory, tokenService);
    const request = {
      originalUrl: '/chat/new_access_token',
      cookies: { refresh_token: 'valid-refresh-token' },
    } as unknown as Request;
    const response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    await middleware.use(request, response, next);

    expect(tokenService.rotateRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
    expect(request.user).toEqual(verifiedPayload);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
