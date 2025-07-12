import { ISubscription } from "src/core/entities/interfaces/subscription.entity.interface";
import { BaseRepository } from "../base/implementations/base.repository";
import { SubscriptionDocumentType } from "src/core/schema/subscription.schema";
import { Subscription } from "src/core/entities/implementation/subscription.entity";
import { ISubscriptionRepository } from "../interfaces/subscription-repo.interface";
import { InjectModel } from "@nestjs/mongoose";
import { SUBSCRIPTION_MODEL_NAME } from "src/core/constants/model.constant";
import { Model } from "mongoose";

export class SubscriptionRepository extends BaseRepository<ISubscription, SubscriptionDocumentType> implements ISubscriptionRepository {
    constructor(
        @InjectModel(SUBSCRIPTION_MODEL_NAME)
        private readonly _subscriptionModel: Model<SubscriptionDocumentType>
    ) {
        super(_subscriptionModel);
    }

    protected override toEntity(doc: SubscriptionDocumentType): ISubscription {
        return new Subscription({});
    }
}