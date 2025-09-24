import { ITransactionMapper } from "@core/dto-mapper/interface/transaction.mapper.interface";
import { Transaction } from "@core/entities/implementation/transaction.entity";
import { ITransaction } from "@core/entities/interfaces/transaction.entity.interface";
import { TransactionDocument } from "@core/schema/transaction.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class TransactionMapper implements ITransactionMapper {
    toEntity(doc: TransactionDocument): ITransaction {
        return new Transaction({
            id: (doc._id as Types.ObjectId).toString(),
            userId: (doc.userId).toString(),
            transactionType: doc.transactionType,
            direction: doc.direction,
            source: doc.source,
            status: doc.status,
            amount: doc.amount,
            currency: doc.currency,
            gateWayDetails: doc.gateWayDetails ? {
                orderId: doc.gateWayDetails.orderId,
                paymentId: doc.gateWayDetails.paymentId,
                signature: doc.gateWayDetails.signature,
                receipt: doc.gateWayDetails.receipt,
            } : null,
            userDetails: doc.userDetails ? {
                email: doc.userDetails.email,
                contact: doc.userDetails.contact,
            } : null,
            createdAt: doc.createdAt,
            metadata: doc.metadata ? {
                bookingId: doc.metadata?.bookingId?.toString() ?? null,
                breakup: {
                    providerAmount: doc?.metadata?.breakup?.providerAmount ?? null,
                    commission: doc?.metadata?.breakup?.commission ?? null,
                    gst: doc?.metadata?.breakup?.gst ?? null,
                }
            } : null
        });
    }

    toDocument(entity: Omit<ITransaction, "id">): Partial<TransactionDocument> {
        return {
            userId: new Types.ObjectId(entity.userId),
            transactionType: entity.transactionType,
            gateWayDetails: entity.gateWayDetails ? {
                orderId: entity.gateWayDetails.orderId,
                paymentId: entity.gateWayDetails.paymentId,
                signature: entity.gateWayDetails.signature,
                receipt: entity.gateWayDetails.receipt ?? null,
            } : null,
            amount: entity.amount,
            userDetails: entity.userDetails ? {
                contact: entity.userDetails.contact,
                email: entity.userDetails.email,
            } : null,
            status: entity.status,
            direction: entity.direction,
            source: entity.source,
            metadata: entity?.metadata ? {
                bookingId: entity.metadata?.bookingId
                    ? new Types.ObjectId(entity.metadata.bookingId)
                    : null,
                breakup: {
                    providerAmount: entity.metadata?.breakup?.providerAmount ?? null,
                    commission: entity.metadata?.breakup?.commission ?? null,
                    gst: entity.metadata?.breakup?.gst ?? null,
                }
            } : null,
        }
    }
} 