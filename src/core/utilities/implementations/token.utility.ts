import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';

import { IPayload } from '../../misc/payload.interface';
import { ITokenUtility } from '../interface/token.utility.interface';

@Injectable()
export class TokenUtility implements ITokenUtility {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateAccessToken(payload: IPayload): string {
    return this.jwtService.sign(payload);
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
