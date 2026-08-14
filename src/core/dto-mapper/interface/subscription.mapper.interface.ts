import type { ISubscription } from '@core/entities/interfaces/subscription.entity.interface';
import type { SubscriptionDocument } from '@core/schema/subscription.schema';

export interface ISubscriptionMapper {
  toEntity(doc: SubscriptionDocument): ISubscription;
  toDocument(entity: Omit<ISubscription, 'id'>): Partial<SubscriptionDocument>;
}
