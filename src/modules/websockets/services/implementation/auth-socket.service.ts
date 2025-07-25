import * as cookie from 'cookie';
import { Socket } from 'socket.io';

import { TOKEN_SERVICE_NAME } from '@/core/constants/service.constant';
import { ErrorMessage } from '@/core/enum/error.enum';
import { IPayload } from '@/core/misc/payload.interface';
import { ITokenService } from '@/modules/auth/services/interfaces/token-service.interface';
import {
    IAuthSocketService
} from '@modules/websockets/services/interface/auth-socket-service.interface';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthSocketService implements IAuthSocketService {
    constructor(
        @Inject(TOKEN_SERVICE_NAME)
        private readonly _tokenService: ITokenService
    ) { }

    extractTokenFromCookie(client: Socket): string {

        const cookies = client.handshake.headers.cookie;
        if (!cookies) throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);

        const parsedCookies = cookie.parse(cookies);

        const token = parsedCookies['access_token'];
        if (!token) throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);

        return token;
    }

    async validateToken(token: string): Promise<IPayload> {
        return await this._tokenService.validateAccessToken(token);
    }

    async validateTokenWithRetry(token: string, retries: number = 3, delayMs: number = 500): Promise<IPayload> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await this.validateToken(token);
            } catch (err) {
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                } else {
                    throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
                }
            }
        }

        throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
    }
}