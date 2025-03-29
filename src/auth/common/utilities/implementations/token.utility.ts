import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { ITokenUtility } from "../interface/token.utility.interface";
import { IPayload } from "../../entities/interfaces/payload.entity.interface";
import { CONFIG_SERVICE_NAME, JWT_SERVICE_NAME } from "src/auth/constants/service.constant";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TokenUtility implements ITokenUtility {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(CONFIG_SERVICE_NAME)
        private configService: ConfigService,
    ) { }

    generateAccessToken(payload: IPayload): string {
        return this.jwtService.sign(payload);
    }


    generateRefreshToken(user: IPayload): string {
        return ''
    }

    async verifyToken(token: string): Promise<IPayload> {

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            return await this.jwtService.verifyAsync<IPayload>(token, {
                secret: this.configService.get('JWT_VERIFICATION_SECRET'),
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
}