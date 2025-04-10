import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UserType } from '../dtos/login.dto';
import { ITokenService } from '../services/interfaces/token-service.interface';
import { TOKEN_SERVICE_NAME } from '../../../core/constants/service.constant';

const getAccessKey = (userType: UserType): string => {
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

    const userType = req.headers['X-User-Type'] as UserType;

    const accessToken = getAccessKey(userType);

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    const payload = await this.tokenService.validateAccessToken(accessToken);
    console.log(payload)
    req.user = payload;

    return next.handle()
  }
}
