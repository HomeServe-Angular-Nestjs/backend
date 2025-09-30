import { ISubscriptionMapper } from "@core/dto-mapper/interface/subscription.mapper.interface";
import { Subscription } from "@core/entities/implementation/subscription.entity";
import { ISubscription } from "@core/entities/interfaces/subscription.entity.interface";
import { RenewalEnum } from "@core/enum/subscription.enum";
import { SubscriptionDocument } from "@core/schema/subscription.schema";
import { Injectable } from "@nestjs/common";
import { Document, Types } from "mongoose";

@Injectable()
export class SubscriptionMapper implements ISubscriptionMapper {
    toEntity(doc: SubscriptionDocument): ISubscription {
        return new Subscription({
            id: doc.id,
            userId: String(doc.userId),
            name: doc.name,
            transactionId: String(doc.transactionId),
            role: doc.role,
            planId: String(doc.planId),
            price: doc.price,
            duration: doc.duration,
            features: doc.features,
            startTime: new Date(doc.startTime),
            endDate: new Date(doc.endDate),
            renewalType: doc.renewalType,
            isActive: doc.isActive,
            isDeleted: doc.isDeleted,
            paymentStatus: doc.paymentStatus,
            cancelledAt: doc.cancelledAt ? new Date(doc.cancelledAt) : null,
            metadata: doc.metadata,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    toDocument(entity: ISubscription): Omit<SubscriptionDocument, keyof Document> {
        return {
            userId: new Types.ObjectId(entity.userId),
            name: entity.name,
            transactionId: entity.transactionId ? new Types.ObjectId(entity.transactionId) : null,
            role: entity.role,
            planId: new Types.ObjectId(entity.planId),
            price: entity.price,
            duration: entity.duration,
            features: entity.features,
            startTime: new Date(entity.startTime),
            endDate: new Date(entity.endDate),
            renewalType: entity?.renewalType ?? RenewalEnum.Manual,
            isActive: entity.isActive,
            isDeleted: entity.isDeleted,
            paymentStatus: entity.paymentStatus,
            cancelledAt: entity.cancelledAt ? new Date(entity.cancelledAt) : null,
            metadata: entity.metadata,
        }
    }
}