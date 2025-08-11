import * as cookie from 'cookie';
import { Socket } from 'socket.io';

import { TOKEN_SERVICE_NAME } from '@/core/constants/service.constant';
import { ErrorCodes, ErrorMessage } from '@/core/enum/error.enum';
import { IPayload } from '@/core/misc/payload.interface';
import { ITokenService } from '@/modules/auth/services/interfaces/token-service.interface';
import { IAuthSocketService } from '@modules/websockets/services/interface/auth-socket-service.interface';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';

@Injectable()
export class AuthSocketService implements IAuthSocketService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(TOKEN_SERVICE_NAME)
        private readonly _tokenService: ITokenService,
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory
    ) {
        this.logger = this._loggerFactory.createLogger(AuthSocketService.name);
    }

    private _extractTokenFromCookie(client: Socket): string {
        const cookies = client.handshake.headers.cookie;
        if (!cookies) throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);

        const parsedCookies = cookie.parse(cookies);

        const accessToken = parsedCookies['access_token'];

        if (!accessToken) throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);

        return accessToken;
    }

    async validateToken(client: Socket): Promise<IPayload> {
        const accessToken = this._extractTokenFromCookie(client);

        try {
            const user = await this._tokenService.validateAccessToken(accessToken);
            if (!user || !user.sub || !user.type) {
                throw new UnauthorizedException({
                    code: ErrorCodes.UNAUTHORIZED_ACCESS,
                    message: ErrorMessage.UNAUTHORIZED_ACCESS
                });
            }

            return user;
        } catch (accessError) {
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED_ACCESS,
                message: ErrorMessage.UNAUTHORIZED_ACCESS
            });
        }
    }
}