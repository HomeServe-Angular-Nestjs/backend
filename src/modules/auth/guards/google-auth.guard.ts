import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    req.authInfo = { state: req.query.state };

    return super.canActivate(context);
  }

  override getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    return {
      state: req.authInfo?.state,
    };
  }

  override handleRequest(err, user, info, context) {
    // console.log("🔥 GOOGLE HANDLE REQUEST ERROR:", { err, user, info });
    if (err || !user) throw err || new UnauthorizedException('Google login failed');
    return user;
  }
}
