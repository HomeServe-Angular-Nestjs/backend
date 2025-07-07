import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { TOKEN_SERVICE_NAME } from "src/core/constants/service.constant";
import { ITokenService } from "src/modules/auth/services/interfaces/token-service.interface";
import { IAuthSocketService } from "../interface/auth-socket-service.interface";
import { Socket } from "socket.io";
import * as cookie from 'cookie';
import { ErrorMessage } from "src/core/enum/error.enum";
import { IPayload } from "src/core/misc/payload.interface";

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