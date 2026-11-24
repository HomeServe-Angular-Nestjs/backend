import { Request, Response } from 'express';
import { ILoggerFactory } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { ITokenService } from '@modules/auth/services/interfaces/token-service.interface';
import { IChatSocketService } from '@modules/websockets/services/interface/chat-socket-service.interface';
import { ChatController } from './chat.controller';

describe('ChatController access token refresh', () => {
  it('uses the middleware-authenticated principal without revalidating the refresh cookie', async () => {
    const user: IPayload = {
      sub: 'customer-1',
      email: 'customer@example.com',
      type: 'customer',
    };
    const tokenService = {
      generateAccessToken: jest.fn().mockReturnValue('new-access-token'),
      validateRefreshToken: jest.fn(),
    } as unknown as ITokenService;
    const loggerFactory = {
      createLogger: jest.fn().mockReturnValue({ log: jest.fn() }),
    } as unknown as ILoggerFactory;
    const controller = new ChatController(
      loggerFactory,
      {} as unknown as IChatSocketService,
      tokenService,
    );
    const request = {
      user,
      cookies: { refresh_token: 'already-rotated-token' },
    } as unknown as Request;
    const response = {
      cookie: jest.fn(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await controller.newAccessToken(request, response);

    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      user.sub,
      user.email,
      user.type,
    );
    expect(tokenService.validateRefreshToken).not.toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith({ success: true });
  });
});
