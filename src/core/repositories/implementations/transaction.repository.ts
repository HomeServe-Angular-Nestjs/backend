import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { InjectModel } from '@nestjs/mongoose';
import { IReportDownloadTransactionData, IReportTransactionData } from '@core/entities/interfaces/admin.entity.interface';
import { Injectable } from '@nestjs/common';
import { TransactionStatus } from '@core/enum/transaction.enum';
import { BookingDocument, TransactionDocument } from '@core/schema/bookings.schema';
import { BOOKINGS_MODEL_NAME } from '@core/constants/model.constant';

@Injectable()
export class TransactionRepository extends BaseRepository<BookingDocument> implements ITransactionRepository {
    constructor(
        @InjectModel(BOOKINGS_MODEL_NAME)
        private readonly _bookingModel: Model<BookingDocument>
    ) {
        super(_bookingModel);
    }

    async createNewTransaction(bookingId: string, transaction: Partial<TransactionDocument>): Promise<TransactionDocument | null> {
        const result = await this._bookingModel.findOneAndUpdate(
            { _id: bookingId },
            { $push: { transactionHistory: transaction } },
            {
                new: true,
                runValidators: true,
                projection: { transactionHistory: 1 }
            }
        );

        if (!result || result.transactionHistory.length < 1) return null;

        const history = result.transactionHistory;

        return history.slice(-1)[0];
    }

    async findTransactionById(bookingId: string, transactionId: string): Promise<TransactionDocument | null> {
        const result = await this._bookingModel.findOne(
            {
                _id: bookingId,
                'transactionHistory._id': transactionId
            },
            { 'transactionHistory.$': 1 }
        ).lean();

        if (!result || !result.transactionHistory?.length) {
            return null;
        }

        return result.transactionHistory[0];
    }

    async count(): Promise<number> {
        const pipeline: PipelineStage[] = [
            { $unwind: '$transactionHistory' },
            { $count: 'count' }
        ]
        const res = await this._bookingModel.aggregate(pipeline).allowDiskUse(true);
        return res[0]?.count || 0;
    }

    async countByUserId(userId: string): Promise<number> {
        const pipeline: PipelineStage[] = [
            { $match: { userId: this._toObjectId(userId) } },
            { $unwind: '$transactionHistory' },
            { $count: 'count' }
        ]
        const res = await this._bookingModel.aggregate(pipeline).allowDiskUse(true);
        return res[0]?.count || 0;
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

        return await this._bookingModel.aggregate(pipeline).exec();
    }

    async updateStatus(txId: string, status: TransactionStatus): Promise<boolean> {
        return !!(await this._bookingModel.findOneAndUpdate(
            { _id: txId },
            { $set: { status } },
            { new: true }
        ));
    }
}