import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SubscriptionDocumentType } from "src/core/schema/subscription.schema";
import { SUBSCRIPTION_MODEL_NAME } from "src/core/constants/model.constant";
import { ISubscription } from "src/core/entities/interfaces/subscription.entity.interface";
import { Subscription } from "src/core/entities/implementation/subscription.entity";
import { ISubscriptionRepository } from "../interfaces/subscription-repo.interface";
import { BaseRepository } from "../base/implementations/base.repository";

@Injectable()
export class SubscriptionRepository extends BaseRepository<ISubscription, SubscriptionDocumentType> implements ISubscriptionRepository {
    constructor(
        @InjectModel(SUBSCRIPTION_MODEL_NAME)
        private readonly _subscriptionModel: Model<SubscriptionDocumentType>
    ) {
        super(_subscriptionModel);
    }

    protected override toEntity(doc: SubscriptionDocumentType): ISubscription {
        return new Subscription({
            id: doc.id,
            userId: doc.userId,
            name: doc.name,
            transactionId: doc.transactionId,
            role: doc.role,
            planId: doc.planId,
            duration: doc.duration,
            features: doc.features,
            startTime: doc.startTime.toString(),
            endDate: doc.endDate?.toString(),
            renewalType: doc.renewalType,
            isActive: doc.isActive,
            isDeleted: doc.isDeleted,
            paymentStatus: doc.paymentStatus,
            cancelledAt: doc.cancelledAt?.toString(),
            metadata: doc.metadata,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}