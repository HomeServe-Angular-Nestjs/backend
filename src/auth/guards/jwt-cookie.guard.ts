import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtCookieGuard extends AuthGuard('jwt-cookie') {
  handleRequest(err: any, user: any, info: any, context: any) {
    if (err || !user) {
      const response = context.switchToHttp().getResponse();

      // Clears invalid cookies
      response.clearCookie('access_token');
      response.clearCookie('refresh_token');

      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
