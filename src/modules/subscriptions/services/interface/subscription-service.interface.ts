import { ISubscription } from '@core/entities/interfaces/subscription.entity.interface';
import { IResponse } from '@core/misc/response.util';
import { UserType } from '@modules/auth/dtos/login.dto';
import { CreateSubscriptionDto, IUpdatePaymentStatusDto } from '@modules/subscriptions/dto/subscription.dto';

export interface ISubscriptionService {
    createSubscription(userId: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>>;
    fetchSubscription(userId: string): Promise<IResponse<ISubscription | null>>;
    getUpgradeAmount(role: UserType, currentSubscriptionId: string): Promise<IResponse<number>>;
    upgradeSubscription(userId: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>>;
    updatePaymentStatus(data: IUpdatePaymentStatusDto): Promise<IResponse>;
}