import { ISubscription } from '@core/entities/interfaces/subscription.entity.interface';
import { IResponse } from '@core/misc/response.util';
import { CreateSubscriptionDto } from '@modules/subscriptions/dto/subscription.dto';

export interface ISubscriptionService {
    createSubscription(userId: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>>;
    fetchSubscription(userId: string): Promise<IResponse<ISubscription | null>>
}