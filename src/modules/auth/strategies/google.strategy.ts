import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Profile, Strategy } from "passport-google-oauth20";
import { ILoginService } from "../services/interfaces/login-service.interface";
import { LOGIN_SERVICE_INTERFACE_NAME } from "../../../core/constants/service.constant";
import { UserType } from "../dtos/login.dto";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        private config: ConfigService,
        @Inject(LOGIN_SERVICE_INTERFACE_NAME)
        private loginService: ILoginService
    ) {
        super({
            clientID: config.get('GOOGLE_CLIENT_ID') as string,
            clientSecret: config.get('GOOGLE_CLIENT_SECRET') as string,
            callbackURL: config.get('GOOGLE_CALLBACK_URL'),
            scope: ['profile', 'email'],
            passReqToCallback: true,
        })
    }

    async validate(req: Request, accessToken: string, refreshToken: string, profile: Profile) {

        try {
            const userType = req.session['userType'];

            if (!userType) {
                throw new BadRequestException('User type is missing.');
            }

            const user = await this.loginService.findOrCreateUser({
                googleId: profile.id,
                email: profile.emails?.[0].value as string,
                name: profile.displayName,
                avatar: profile?.photos?.[0]?.value,
                type: userType as UserType
            });

            if (!user) {
                throw new UnauthorizedException('User does not exist.');
            }

            // user['type'] = userType;

            return user;
        } catch (err) {
            console.error("Error in validate:", err.message);
            throw new UnauthorizedException('Google authentication failed');
        }
    }
}