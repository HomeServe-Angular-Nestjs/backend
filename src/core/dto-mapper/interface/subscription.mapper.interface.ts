import { ISubscription } from "@core/entities/interfaces/subscription.entity.interface";
import { SubscriptionDocument } from "@core/schema/subscription.schema";

export interface ISubscriptionMapper {
    toEntity(doc: SubscriptionDocument): ISubscription;
}