import { Controller, Inject, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express";
import { TOKEN_SERVICE_NAME } from "@core/constants/service.constant";
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { ITokenService } from "@modules/auth/services/interfaces/token-service.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";


@Controller('reservation')
export class ReservationController {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(TOKEN_SERVICE_NAME)
        private readonly _tokenService: ITokenService,
    ) {
        this.logger = this.loggerFactory.createLogger(ReservationController.name);
    }

    @Post('new_access_token')
    async newAccessToken(@Req() req: Request, @Res() res: Response) {
        this.logger.log('[Socket] Generating new access token...');
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED_ACCESS,
                message: ErrorMessage.UNAUTHORIZED_ACCESS
            });
        }

        const user = await this._tokenService.validateRefreshToken(refreshToken);

        if (!user || !user.type) {
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED_ACCESS,
                message: ErrorMessage.UNAUTHORIZED_ACCESS
            });
        }

        const newAccessToken = this._tokenService.generateAccessToken(user.sub, user.email, user.type);

        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path: '/',
        });

        return res.json({ success: true });
    }
}
