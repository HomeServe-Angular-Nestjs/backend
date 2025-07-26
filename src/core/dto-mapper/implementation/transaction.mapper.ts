import { ITransactionMapper } from "@core/dto-mapper/interface/transaction.mapper.interface";
import { Transaction } from "@core/entities/implementation/transaction.entity";
import { ITransaction } from "@core/entities/interfaces/transaction.entity.interface";
import { TransactionDocument } from "@core/schema/transaction.schema";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TransactionMapper implements ITransactionMapper {
    toEntity(doc: TransactionDocument): ITransaction {
        return new Transaction({
            id: doc.id,
            userId: doc.userId,
            orderId: doc.orderId,
            paymentId: doc.paymentId,
            signature: doc.signature,
            amount: doc.amount,
            status: doc.status,
            currency: doc.currency,
            method: doc.method,
            email: doc.email,
            contact: doc.contact,
            receipt: doc.receipt,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            transactionType: doc.transactionType
        });
    }
} 