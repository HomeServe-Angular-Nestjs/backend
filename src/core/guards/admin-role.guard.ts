import { Request } from 'express';

import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { IPayload } from '@core/misc/payload.interface';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as IPayload;

    if (!user || !user.sub || !user.type) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED_ACCESS,
        message: ErrorMessage.UNAUTHORIZED_ACCESS,
      });
    }

    if (user.type !== 'admin') {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: 'Admin access required.',
      });
    }

    return true;
  }
}
