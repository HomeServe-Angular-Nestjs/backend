import { ISubscription } from "src/core/entities/interfaces/subscription.entity.interface";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";
import { SubscriptionDocumentType } from "src/core/schema/subscription.schema";

export interface ISubscriptionRepository extends IBaseRepository<ISubscription, SubscriptionDocumentType> { }