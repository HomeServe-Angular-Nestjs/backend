import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UserType } from '../dtos/login.dto';
import { ITokenService } from '../services/interfaces/token-service.interface';
import { TOKEN_SERVICE_NAME } from '../../../core/constants/service.constant';

export const getAccessKey = (userType: UserType): string => {
  let accessKey = '';
  switch (userType) {
    case 'customer':
      accessKey = 'C_accessToken';
      break;
    case 'provider':
      accessKey = 'P_accessToken';
      break;
    case 'admin':
      accessKey = 'A_accessToken';
      break;
    default: accessKey = '';
  }
  return accessKey
}

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(
    @Inject(TOKEN_SERVICE_NAME)
    private readonly tokenService: ITokenService
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest();

    const userType = req.headers['x-user-type'] as UserType;

    const accessKey = getAccessKey(userType);

    if (!accessKey) {
      throw new UnauthorizedException('Invalid or missing user type');
    }

    const accessToken = req.cookies?.[accessKey] || req.headers[accessKey.toLowerCase()];
    console.log(accessToken)

    if (!accessToken || typeof accessToken !== 'string') {
      throw new UnauthorizedException('Missing access accessToken');
    }

    try {
      const payload = await this.tokenService.validateAccessToken(accessToken);
      req.user = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    return next.handle()
  }
}
