import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException, Inject, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { UserType } from '../dtos/login.dto';
import { ITokenService } from '../services/interfaces/token-service.interface';
import { TOKEN_SERVICE_NAME } from '../../../core/constants/service.constant';

export const getAccessKey = (userType: UserType): string => {
  switch (userType) {
    case 'customer':
      return 'C_accessToken';
    case 'provider':
      return 'P_accessToken';
    case 'admin':
      return 'A_accessToken';
    default:
      return '';
  }
}

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(
    @Inject(TOKEN_SERVICE_NAME)
    private readonly tokenService: ITokenService
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const userType = req.headers['x-user-type'] as UserType;

    const accessKey = getAccessKey(userType);

    if (!userType) {
      throw new UnauthorizedException('Missing x-user-type header');
    }

    const accessToken = req.cookies?.[accessKey] || req.headers[accessKey.toLowerCase()] as string;

    if (!accessToken) {
      throw new UnauthorizedException('Access token not found in request');
    }

    try {
      const payload = await this.tokenService.validateAccessToken(accessToken);
      req.user = payload;
      return next.handle();
    } catch (accessError) {
      try {
        const decodedAccessPayload = this.tokenService.decode(accessToken);

        if (!decodedAccessPayload || typeof decodedAccessPayload !== 'object') {
          throw new BadRequestException('Malformed access token');
        }

        const userId = decodedAccessPayload.sub;
        const refreshPayload = await this.tokenService.validateRefreshToken(userId);

        // console.log('[ACCESS]', decodedAccessPayload);
        // console.log('[REFRESH]', refreshPayload);

        const email = decodedAccessPayload.email;
        const newAccessToken = await this.tokenService.generateToken(userId, email);

        const tokenKey = getAccessKey(userType);
        res.cookie(tokenKey, newAccessToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 10 * 60 * 1000,
          path: '/'
        });

        const payload = await this.tokenService.validateAccessToken(newAccessToken);
        req.user = payload;
        return next.handle();
      } catch (refreshError) {
        console.error('[TOKEN ERROR] Refresh token flow failed:', refreshError);
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }
}
