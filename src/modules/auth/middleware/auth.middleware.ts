import { NextFunction, Request, Response } from 'express';

import { TOKEN_SERVICE_NAME } from '@core/constants/service.constant';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ITokenService } from '@modules/auth/services/interfaces/token-service.interface';
import {
    Inject, Injectable, NestMiddleware, NotFoundException, UnauthorizedException
} from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(TOKEN_SERVICE_NAME)
        private readonly tokenService: ITokenService,
    ) {
        this.logger = this.loggerFactory.createLogger(AuthMiddleware.name);
    }

    async use(req: Request, res: Response, next: NextFunction): Promise<void> {
        const isAuthRoute = ['login', 'signup'].some(route =>
            req.originalUrl.split('/').includes(route)
        );

        if (isAuthRoute) {
            return next();
        }

        const accessToken = req.cookies?.['access_token'];

        const attachUserFromToken = async (token: string) => {
            const payload = await this.tokenService.validateAccessToken(token);
            req.user = payload;
        };

        try {
            if (!accessToken) {
                throw new NotFoundException('Access token not found in request');
            }

            await attachUserFromToken(accessToken);
            return next();
        } catch (accessError) {
            this.logger.warn(`Access token invalid or missing. Trying refresh flow... Error: ${accessError}`);

            let userId: string | undefined;
            let email: string | undefined;
            let userType: string | undefined;

            try {
                if (accessToken) {
                    const decoded = this.tokenService.decode(accessToken);
                    if (decoded && typeof decoded === 'object') {
                        userId = decoded.sub;
                        email = decoded.email;
                        userType = decoded.type
                    }
                }

                if (!userId || !userType) {
                    throw new UnauthorizedException('Cannot identify user for refresh token');
                }

                const payload = await this.tokenService.validateRefreshToken(userId);
                if (!payload) throw new UnauthorizedException('Invalid refresh token');

                const newAccessToken = this.tokenService.generateAccessToken(userId, payload.email, userType);

                res.cookie('access_token', newAccessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    path: '/',
                });

                await attachUserFromToken(newAccessToken);
                this.logger.debug('New access token issued');
                return next();
            } catch (refreshError) {
                this.logger.error('Refresh token flow failed:', refreshError);
                throw new UnauthorizedException('Invalid or expired token');
            }
        }
    }
}
