import { FilterQuery, Model, PipelineStage, SortOrder } from 'mongoose';

import { TRANSACTION_MODEL_NAME } from '@core/constants/model.constant';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { TransactionDocument } from '@core/schema/transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IReportDownloadTransactionData, IReportTransactionData } from '@core/entities/interfaces/admin.entity.interface';
import { ITransactionFilter, ITransactionStats } from '@core/entities/interfaces/transaction.entity.interface';
import { Injectable } from '@nestjs/common';
import { PaymentDirection, TransactionStatus } from '@core/enum/transaction.enum';

@Injectable()
export class TransactionRepository extends BaseRepository<TransactionDocument> implements ITransactionRepository {
    constructor(
        @InjectModel(TRANSACTION_MODEL_NAME)
        private readonly _transactionModel: Model<TransactionDocument>
    ) {
        super(_transactionModel);
    }

    async findTransactionById(id: string): Promise<TransactionDocument | null> {
        return await this._transactionModel
            .findById(id)
            .lean();
    }

    async count(): Promise<number> {
        return await this._transactionModel.countDocuments();
    }

    async countByUserId(userId: string): Promise<number> {
        return await this._transactionModel.countDocuments({ userId: this._toObjectId(userId) });
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

    async getTransactionStats(): Promise<ITransactionStats> {
        const pipeline: PipelineStage[] = [
            {
                $group: {
                    _id: null,
                    totalTransactions: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [{ $eq: ['$direction', PaymentDirection.CREDIT] }, "$amount", 0]
                        }
                    }
                }
            },
            {
                $addFields: {
                    successRate: 100, // all are paid
                    avgTransactionValue: {
                        $cond: [
                            { $eq: ["$totalTransactions", 0] },
                            0,
                            { $divide: ["$totalRevenue", "$totalTransactions"] }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalTransactions: 1,
                    totalRevenue: 1,
                    successRate: 1,
                    avgTransactionValue: 1
                }
            }
        ];

        const result = await this._transactionModel.aggregate(pipeline);
        return result[0] || {
            totalRevenue: 0,
            successRate: 0,
            avgTransactionValue: 0
        };
    }

    async fetchTransactionsWithPagination(page: number, limit = 1, skip = 1): Promise<TransactionDocument[]> {
        return await this._transactionModel
            .find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async updateStatus(txId: string, status: TransactionStatus): Promise<boolean> {
        return !!(await this._transactionModel.findOneAndUpdate(
            { _id: txId },
            { $set: { status } },
            { new: true }
        ));
    }

    async getFilteredTransactionByUserIdWithPagination(userId: string, filters: ITransactionFilter, options?: { page?: number, limit?: number }): Promise<TransactionDocument[]> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        const match: Record<string, any> = {
            userId: this._toObjectId(userId),
        };

        if (filters.search) {
            const searchRegex = new RegExp(filters.search, 'i');

            match.$or = [
                { _id: this._toObjectId(filters.search) },
                { 'gateWayDetails.paymentId': searchRegex },
                { 'userDetails.email': searchRegex },
            ];
        }

        if (filters.date && filters.date !== 'all') {
            const now = new Date();
            let start: Date;

            switch (filters.date) {
                case 'last_six_months':
                    start = new Date();
                    start.setMonth(start.getMonth() - 6);
                    break;

                case 'last_year':
                    start = new Date();
                    start.setFullYear(start.getFullYear() - 1);
                    break;
            }

            match.createdAt = { $gte: start, $lte: now };
        }

        if (filters.method && filters.method !== 'all') {
            match.direction = filters.method;
        }

        if (filters.type && filters.type !== 'all') {
            match.transactionType = filters.type;
        }

        const sort: Record<string, SortOrder> = {};

        switch (filters.sort) {
            case 'newest':
                sort.createdAt = -1;
                break;

            case 'oldest':
                sort.createdAt = 1;
                break;

            case 'high':
                sort.amount = -1;
                break;

            case 'low':
                console.log(filters.sort)
                sort.amount = 1;
                break;

            default:
                sort.createdAt = -1;
                break;
        }

        const result = await this._transactionModel
            .find(match)
            .select('_id amount source transactionType createdAt direction userDetails.email gateWayDetails.paymentId')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        return result;
    }
}