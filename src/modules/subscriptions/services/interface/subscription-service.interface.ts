import { ISubscription } from "src/core/entities/interfaces/subscription.entity.interface";
import { IResponse } from "src/core/misc/response.util";
import { CreateSubscriptionDto } from "../../dto/subscription.dto";

export interface ISubscriptionService {
    createSubscription(userId: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>>;
    fetchSubscription(userId: string): Promise<IResponse<ISubscription | null>>
}