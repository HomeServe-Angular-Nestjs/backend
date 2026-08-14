import { SUBSCRIPTION_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { ErrorCodes } from '@core/enum/error.enum';
import { IPayload } from '@core/misc/payload.interface';
import { ISubscriptionRepository } from '@core/repositories/interfaces/subscription-repo.interface';
import { FEATURE_REGISTRY } from '@modules/plans/registry/feature.registry';
import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AnalyticsGuard implements CanActivate {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_NAME)
    private readonly _subscriptionRepository: ISubscriptionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as IPayload;

    if (!user || !user.sub || !user.type) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED_ACCESS,
        message: 'Unauthorized access.',
      });
    }

    const subscription = await this._subscriptionRepository.findActiveSubscriptionByUserId(user.sub, user.type);
    if (!subscription) {
      throw new ForbiddenException({
        code: ErrorCodes.NO_ACTIVE_SUBSCRIPTION,
        message: 'You need an active subscription to access this resource.',
      });
    }

    const analyticsEnabled = subscription.features?.[FEATURE_REGISTRY.ANALYTICS_DASHBOARD.key];
    if (analyticsEnabled !== true) {
      throw new ForbiddenException({
        code: ErrorCodes.FEATURE_NOT_INCLUDED,
        message: 'Analytics dashboard is not included in your plan. Upgrade to unlock it.',
      });
    }

    return true;
  }
}
