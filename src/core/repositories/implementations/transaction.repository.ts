import { Model, Types } from 'mongoose';

import { TRANSACTION_MODEL_NAME } from '@core/constants/model.constant';
import { Transaction } from '@core/entities/implementation/transaction.entity';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { TransactionDocument } from '@core/schema/transaction.schema';
import { InjectModel } from '@nestjs/mongoose';

export class TransactionRepository extends BaseRepository<Transaction, TransactionDocument> implements ITransactionRepository {
    constructor(
        @InjectModel(TRANSACTION_MODEL_NAME)
        private readonly _transactionModel: Model<TransactionDocument>
    ) {
        super(_transactionModel);
    }

    async getTotalRevenue(date: Date): Promise<number> {
        const result = await this._transactionModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: date },
                    method: { $ne: PaymentStatus.REFUNDED }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: { $divide: ['$total', 100] }
                }
            }
        ]);

        return result[0]?.total || 0;
    }

    protected toEntity(doc: TransactionDocument): Transaction {
        return new Transaction({
            id: (doc._id as Types.ObjectId).toString(),
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