import { FilterQuery, Model, PipelineStage } from 'mongoose';

import { TRANSACTION_MODEL_NAME } from '@core/constants/model.constant';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { TransactionDocument } from '@core/schema/transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IReportDownloadTransactionData, IReportTransactionData } from '@core/entities/interfaces/admin.entity.interface';

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

    async getReportDetails(filter: IReportDownloadTransactionData): Promise<IReportTransactionData[]> {
        const pipeline: PipelineStage[] = [];

        const match: FilterQuery<TransactionDocument> = {};

        if (filter.fromDate && filter.toDate) {
            match.createdAt = {
                $gte: new Date(filter.fromDate),
                $lte: new Date(filter.toDate)
            };
        }

        if (filter.method) {
            match.method = filter.method;
        }

        if (filter.transactionType) {
            match.transactionType = filter.transactionType;
        }

        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match });
        }

        pipeline.push(
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    date: '$createdAt',
                    userId: 1,
                    email: 1,
                    amount: 1,
                    method: 1,
                    contact: 1,
                    transactionType: 1
                }
            }
        );

        return await this._transactionModel.aggregate(pipeline).exec();
    }
}