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

    const userType = req.headers['x-user-type'] as UserType;

    if (!userType) {
      throw new UnauthorizedException('Missing x-user-type header');
    }

    const accessToken = (req.cookies?.['access_token']) || (req.headers['access_token']);

    if (!accessToken) {
      throw new UnauthorizedException('Access token not found in request');
    }

    const attachUserFromToken = async (token: string) => {
      const payload = await this.tokenService.validateAccessToken(token);
      req.user = payload;
    };

    try {
      await attachUserFromToken(accessToken);
      return next.handle();
    } catch (accessError) {
      try {
        const decoded = this.tokenService.decode(accessToken);

        if (!decoded || typeof decoded !== 'object') {
          throw new BadRequestException('Malformed access token');
        }

        const { sub, email } = decoded;
        const isValidRefreshToken = await this.tokenService.validateRefreshToken(sub);

        if (!isValidRefreshToken) {
          throw new UnauthorizedException('Invalid refresh token');
        }

        const newToken = this.tokenService.generateAccessToken(sub, email);
        if (!newToken) {
          throw new NotFoundException('Failed to generate new access token');
        }

        res.cookie('access_token', newToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 10 * 60 * 1000,
          path: '/',
        });

        await attachUserFromToken(newToken);
        return next.handle();
      } catch (refreshError) {
        this.logger.error('Refresh token flow failed:', refreshError);
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }
}
