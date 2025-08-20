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
            userId: doc.userId,
            transactionType: doc.transactionType,
            direction: doc.direction,
            source: doc.source,
            status: doc.status,
            amount: doc.amount,
            currency: doc.currency,
            gateWayDetails: {
                orderId: doc.gateWayDetails.orderId,
                paymentId: doc.gateWayDetails.paymentId,
                signature: doc.gateWayDetails.signature,
                receipt: doc.gateWayDetails.receipt,
            },
            userDetails: {
                email: doc.userDetails.email,
                contact: doc.userDetails.contact,
            },
            createdAt: doc.createdAt,
        });
    }

    toDocument(entity: Omit<ITransaction, "id">): Partial<TransactionDocument> {
        return {
            userId: entity.userId,
            transactionType: entity.transactionType,
            gateWayDetails: {
                orderId: entity.gateWayDetails.orderId,
                paymentId: entity.gateWayDetails.paymentId,
                signature: entity.gateWayDetails.signature,
                receipt: entity.gateWayDetails.receipt ?? null,
            },
            amount: entity.amount,
            userDetails: {
                contact: entity.userDetails.contact,
                email: entity.userDetails.email,
            },
            status: entity.status,
            direction: entity.direction,
            source: entity.source,
        }
    }
} 