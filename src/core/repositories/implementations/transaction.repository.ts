import { Model } from 'mongoose';

import { TRANSACTION_MODEL_NAME } from '@core/constants/model.constant';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { TransactionDocument } from '@core/schema/transaction.schema';
import { InjectModel } from '@nestjs/mongoose';

export class TransactionRepository extends BaseRepository<TransactionDocument> implements ITransactionRepository {
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
}