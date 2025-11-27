import { Request } from 'express';
import { Profile, Strategy } from 'passport-google-oauth20';

import { LOGIN_SERVICE_INTERFACE_NAME } from '@core/constants/service.constant';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ILoginService } from '@modules/auth/services/interfaces/login-service.interface';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserType } from '@core/entities/interfaces/user.entity.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  private readonly logger: ICustomLogger

  constructor(
    private _config: ConfigService,
    @Inject(LOGGER_FACTORY)
    private readonly loggerFactory: ILoggerFactory,
    @Inject(LOGIN_SERVICE_INTERFACE_NAME)
    private _loginService: ILoginService,
  ) {
    super({
      clientID: _config.get('GOOGLE_CLIENT_ID') as string,
      clientSecret: _config.get('GOOGLE_CLIENT_SECRET') as string,
      callbackURL: _config.get('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
      passReqToCallback: true,
      // state: true,
    });

    this.logger = this.loggerFactory.createLogger(GoogleStrategy.name);
  }

  async validate(req: Request, accessToken: string, refreshToken: string, profile: Profile,) {
    try {

      const userType = req.query.state as UserType;

      if (!userType) {
        throw new BadRequestException('User type is missing.');
      }

      const user = await this._loginService.findOrCreateUser({
        googleId: profile.id,
        email: profile.emails?.[0]?.value ?? '',
        name: profile.displayName ?? '',
        avatar: profile.photos?.[0]?.value ?? '',
        type: userType,
      });

      if (!user) {
        throw new UnauthorizedException('User does not exist.');
      }

      user['type'] = userType || '';

      return user;
    } catch (err) {
      this.logger.error('GoogleStrategy validate error:', err);
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
