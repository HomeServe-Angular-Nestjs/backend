import { TRANSACTION_MAPPER } from "@core/constants/mappers.constant";
import { ISubscriptionMapper } from "@core/dto-mapper/interface/subscription.mapper.interface";
import { ITransactionMapper } from "@core/dto-mapper/interface/transaction.mapper.interface";
import { Subscription } from "@core/entities/implementation/subscription.entity";
import { ISubscription } from "@core/entities/interfaces/subscription.entity.interface";
import { RenewalEnum } from "@core/enum/subscription.enum";
import { TransactionDocument } from "@core/schema/bookings.schema";
import { SubscriptionDocument } from "@core/schema/subscription.schema";
import { Inject, Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class SubscriptionMapper implements ISubscriptionMapper {
    constructor(
        @Inject(TRANSACTION_MAPPER)
        private readonly _transactionMapper: ITransactionMapper
    ) { }

    toEntity(doc: SubscriptionDocument): ISubscription {
        return new Subscription({
            id: (doc._id as Types.ObjectId).toString(),
            userId: String(doc.userId),
            name: doc.name,
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
            transactionHistory: (doc.transactionHistory ?? []).map(tx => this._transactionMapper.toEntity(tx)),
            metadata: doc.metadata,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    toDocument(entity: ISubscription): Partial<SubscriptionDocument> {
        return {
            userId: new Types.ObjectId(entity.userId),
            name: entity.name,
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
            transactionHistory: (entity.transactionHistory ?? []).map(tnx => this._transactionMapper.toDocument(tnx) as TransactionDocument),
            metadata: entity.metadata,
        }
    }
}