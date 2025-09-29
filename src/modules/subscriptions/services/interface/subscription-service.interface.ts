import { ISubscription } from '@core/entities/interfaces/subscription.entity.interface';
import { PlanRoleEnum } from '@core/enum/subscription.enum';
import { IResponse } from '@core/misc/response.util';
import { UserType } from '@modules/auth/dtos/login.dto';
import { CreateSubscriptionDto, IUpdatePaymentStatusDto } from '@modules/subscriptions/dto/subscription.dto';

export interface ISubscriptionService {
    createSubscription(userId: string, userType: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>>;
    fetchSubscription(userId: string, role: PlanRoleEnum): Promise<IResponse<ISubscription | null>>;
    getUpgradeAmount(role: UserType, currentSubscriptionId: string): Promise<IResponse<number>>;
    upgradeSubscription(userId: string, userTye: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>>;
    updatePaymentStatus(userId: string, userType: string, data: IUpdatePaymentStatusDto): Promise<IResponse>;
    removeSubscription(subscriptionId: string): Promise<IResponse>;
}