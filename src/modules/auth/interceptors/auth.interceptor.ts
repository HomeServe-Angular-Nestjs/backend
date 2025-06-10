import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Inject,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
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
};

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuthInterceptor.name);

  constructor(
    @Inject(TOKEN_SERVICE_NAME)
    private readonly tokenService: ITokenService,
  ) { }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const accessToken = (req.cookies?.['access_token']);

    const attachUserFromToken = async (token: string) => {
      const payload = await this.tokenService.validateAccessToken(token);
      req.user = payload;
    };

    try {
      if (!accessToken) {
        throw new NotFoundException('Access token not found in request');
      }

      await attachUserFromToken(accessToken);
      return next.handle();
    } catch (accessError) {
      this.logger.warn('Access token invalid or missing. Trying refresh flow...', accessError);

      let userId: string | undefined;
      let email: string | undefined;

      try {
        if (accessToken) {
          const decoded = this.tokenService.decode(accessToken);
          if (decoded && typeof decoded === 'object') {
            userId = decoded.sub;
            email = decoded.email;
          }
        }

        if (!userId) {
          throw new UnauthorizedException('Cannot identify user for refresh token');
        }

        const payload = await this.tokenService.validateRefreshToken(userId);
        if (!payload) throw new UnauthorizedException('Invalid refresh token');

        const newAccessToken = this.tokenService.generateAccessToken(userId, payload.email);

        res.cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          path: '/',
        });

        await attachUserFromToken(newAccessToken);
        this.logger.debug('New access token issued');
        return next.handle();
      } catch (refreshError) {
        this.logger.error('Refresh token flow failed:', refreshError);
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }
}
