import { ISubscriptionMapper } from "@core/dto-mapper/interface/subscription.mapper.interface";
import { Subscription } from "@core/entities/implementation/subscription.entity";
import { ISubscription } from "@core/entities/interfaces/subscription.entity.interface";
import { SubscriptionDocument } from "@core/schema/subscription.schema";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SubscriptionMapper implements ISubscriptionMapper {
    toEntity(doc: SubscriptionDocument): ISubscription {
        return new Subscription({
            id: doc.id,
            userId: doc.userId,
            name: doc.name,
            transactionId: doc.transactionId,
            role: doc.role,
            planId: doc.planId,
            price: doc.price,
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