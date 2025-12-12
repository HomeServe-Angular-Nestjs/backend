import { FilterQuery, Model, PipelineStage, SortOrder } from 'mongoose';

import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { InjectModel } from '@nestjs/mongoose';
import { IReportDownloadTransactionData, IReportTransactionData } from '@core/entities/interfaces/admin.entity.interface';
import { ITransactionStats } from '@core/entities/interfaces/transaction.entity.interface';
import { Injectable } from '@nestjs/common';
import { PaymentDirection, TransactionStatus } from '@core/enum/transaction.enum';
import { SortQuery } from '@core/repositories/implementations/slot-rule.repository';
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

    // private _escapeRegex(input: string): string {
    //     return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // }


    // private _buildTransactionFilterQuery(filters: IWalletTransactionFilter, userId?: string): { match: FilterQuery<TransactionDocument>, sort: SortQuery<TransactionDocument> } {
    //     const match: FilterQuery<TransactionDocument> = {};

    //     if (userId) {
    //         match['transactionHistory.userId'] = this._toObjectId(userId);
    //     }

    //     if (filters.search) {
    //         const escaped = this._escapeRegex(filters.search);
    //         const searchRegex = new RegExp(escaped, 'i');

    //         match.$or = [
    //             {
    //                 $expr: {
    //                     $regexMatch: {
    //                         input: { $toString: "$transactionHistory._id" },
    //                         regex: searchRegex
    //                     }
    //                 }
    //             },
    //             { 'transactionHistory.gateWayDetails.paymentId': searchRegex },
    //             { 'transactionHistory.userDetails.email': searchRegex },
    //         ];
    //     }

    //     if (filters.date && filters.date !== 'all') {
    //         const now = new Date();
    //         let start: Date | null = null;

    //         switch (filters.date) {
    //             case 'last_six_months':
    //                 start = new Date();
    //                 start.setMonth(start.getMonth() - 6);
    //                 break;
    //             case 'last_year':
    //                 start = new Date();
    //                 start.setFullYear(start.getFullYear() - 1);
    //                 break;
    //             default:
    //                 start = new Date(0);
    //         }

    //         if (start) {
    //             match['transactionHistory.createdAt'] = { $gte: start, $lte: now };
    //         }
    //     }

    //     if (filters.method && filters.method !== 'all') {
    //         match['transactionHistory.direction'] = filters.method;
    //     }

    //     if (filters.type && filters.type !== 'all') {
    //         match['transactionHistory.transactionType'] = filters.type;
    //     }

    //     const sort: Record<string, SortOrder> = {};

    //     switch (filters.sort) {
    //         case 'newest':
    //             sort['transactionHistory.createdAt'] = -1;
    //             break;

    //         case 'oldest':
    //             sort['transactionHistory.createdAt'] = 1;
    //             break;

    //         case 'high':
    //             sort['transactionHistory.amount'] = -1;
    //             break;

    //         case 'low':
    //             sort['transactionHistory.amount'] = 1;
    //             break;

    //         default:
    //             sort['transactionHistory.createdAt'] = -1;
    //             break;
    //     }

    //     return { match, sort };
    // }

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

        const result = await this._bookingModel.aggregate(pipeline);
        return result[0] || {
            totalRevenue: 0,
            successRate: 0,
            avgTransactionValue: 0
        };
    }

    // async fetchTransactionsByAdminWithPagination(filters: IWalletTransactionFilter, options?: { page?: number, limit?: number }): Promise<TransactionDocument[]> {
    //     const page = options?.page || 1;
    //     const limit = options?.limit || 10;
    //     const skip = (page - 1) * limit;

    //     const { match, sort } = this._buildTransactionFilterQuery(filters);

    //     const pipeline: PipelineStage[] = [
    //         { $unwind: "$transactionHistory" },
    //         { $match: match },
    //         { $replaceRoot: { newRoot: "$transactionHistory" } },
    //         { $sort: sort },
    //         { $skip: skip },
    //         { $limit: limit }
    //     ];

    //     return await this._bookingModel.aggregate(pipeline);
    // }

    async updateStatus(txId: string, status: TransactionStatus): Promise<boolean> {
        return !!(await this._bookingModel.findOneAndUpdate(
            { _id: txId },
            { $set: { status } },
            { new: true }
        ));
    }

    // async getFilteredTransactionByUserIdWithPagination(userId: string, filters: IWalletTransactionFilter, options?: { page?: number, limit?: number }): Promise<TransactionDocument[]> {
    //     const page = options?.page && options.page > 0 ? options.page : 1;
    //     const limit = options?.limit && options.limit > 0 ? options.limit : 10;
    //     const skip = (page - 1) * limit;

    //     const { match, sort } = this._buildTransactionFilterQuery(filters, userId);

    //     const pipeline: any[] = [
    //         { $unwind: '$transactionHistory' },
    //         { $match: match },
    //         { $replaceRoot: { newRoot: '$transactionHistory' } },
    //         { $sort: sort },
    //         { $skip: skip },
    //         { $limit: limit },
    //     ];

    //     return await this._bookingModel.aggregate(pipeline);
    // }
}