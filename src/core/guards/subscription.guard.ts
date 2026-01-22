import { SUBSCRIPTION_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { IPayload } from "@core/misc/payload.interface";
import { ISubscriptionRepository } from "@core/repositories/interfaces/subscription-repo.interface";
import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class SubscriptionGuard implements CanActivate {
    constructor(
        @Inject(SUBSCRIPTION_REPOSITORY_NAME)
        private readonly _subscriptionRepository: ISubscriptionRepository
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user as IPayload;

        if (!user || !user.sub || !user.type) {
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED_ACCESS,
                message: ErrorMessage
            });
        }

        const subscription = await this._subscriptionRepository.findActiveSubscriptionByUserId(user.sub, user.type);
        console.log("subscription: ", subscription)
        if (!subscription) {
            throw new ForbiddenException({
                code: ErrorCodes.NO_ACTIVE_SUBSCRIPTION,
                message: 'You need an active subscription to access this resource.',
            });
        }

        return true;
    }
}