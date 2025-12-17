import { WALLET_LEDGER_MODEL_NAME } from "@core/constants/model.constant";
import { ICustomerTransactionData, IProviderTransactionData, IProviderTransactionOverview, ITransactionStats, IWalletTransactionFilter } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { PaymentDirection, TransactionType } from "@core/enum/transaction.enum";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { SortQuery } from "@core/repositories/implementations/slot-rule.repository";
import { IWalletLedgerRepository } from "@core/repositories/interfaces/wallet-ledger.repo.interface";
import { WalletLedgerDocument } from "@core/schema/wallet-ledger.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage, SortOrder } from "mongoose";

@Injectable()
export class WalletLedgerRepository extends BaseRepository<WalletLedgerDocument> implements IWalletLedgerRepository {
    constructor(
        @InjectModel(WALLET_LEDGER_MODEL_NAME)
        private readonly _walletLedgerModel: Model<WalletLedgerDocument>
    ) {
        super(_walletLedgerModel);
    }

    private _escapeRegex(input: string): string {
        return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private _buildTransactionFilterQuery(filters: IWalletTransactionFilter, userId?: string): { match: FilterQuery<WalletLedgerDocument>, sort: SortQuery<WalletLedgerDocument> } {
        const match: FilterQuery<WalletLedgerDocument> = {};

        if (userId) {
            match.userId = this._toObjectId(userId);
        }

        if (filters.search) {
            const escaped = this._escapeRegex(filters.search);
            const searchRegex = new RegExp(escaped, 'i');

            match.$or = [
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$_id" },
                            regex: searchRegex
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$bookingTransactionId" },
                            regex: searchRegex
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$subscriptionTransactionId" },
                            regex: searchRegex
                        }
                    }
                },
            ];
        }

        if (filters.date && filters.date !== 'all') {
            const now = new Date();
            let start: Date | null = null;

            switch (filters.date) {
                case 'last_six_months':
                    start = new Date();
                    start.setMonth(start.getMonth() - 6);
                    break;
                case 'last_year':
                    start = new Date();
                    start.setFullYear(start.getFullYear() - 1);
                    break;
                default:
                    start = new Date(0);
            }

            if (start) {
                match.createdAt = { $gte: start, $lte: now };
            }
        }

        if (filters.method && filters.method !== 'all') {
            match.direction = filters.method;
        }

        if (filters.type && filters.type !== 'all') {
            const escaped = this._escapeRegex(filters.type);
            const searchRegex = new RegExp(escaped, 'i');
            match.type = searchRegex;
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
                sort.amount = 1;
                break;

            default:
                sort.createdAt = -1;
                break;
        }

        return { match, sort };
    }

    async count(): Promise<number> {
        return this._walletLedgerModel.countDocuments();
    }

    async getTotalLedgerCountByUserId(userId: string): Promise<number> {
        return await this._walletLedgerModel.countDocuments({ userId });
    }

    async getTotalRevenueForAdmin(fromDate: Date, toDate: Date | null = null): Promise<number> {
        const match: FilterQuery<WalletLedgerDocument> = {
            userRole: 'admin',
            direction: PaymentDirection.CREDIT,
            type: {
                $in: [
                    TransactionType.CUSTOMER_COMMISSION,
                    TransactionType.PROVIDER_COMMISSION,
                    TransactionType.SUBSCRIPTION_PAYMENT,
                    TransactionType.CANCELLATION_FEE,
                ],
            },
            createdAt: { $gte: fromDate },
        };

        if (toDate) {
            match.createdAt.$lte = toDate;
        }

        const result = await this._walletLedgerModel.aggregate([
            { $match: match },
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

    async getAdminWalletLedgerByTransactionId(transactionId: string): Promise<WalletLedgerDocument | null> {
        return await this._walletLedgerModel.findOne({
            type: 'admin',
            bookingTransactionId: transactionId,
        }).lean();
    }

    async getFilteredCustomerLedgersByUserIdWithPagination(userId: string, filters: IWalletTransactionFilter, options: { page: number; limit: number }): Promise<ICustomerTransactionData[]> {
        const page = options?.page && options.page > 0 ? options.page : 1;
        const limit = options?.limit && options.limit > 0 ? options.limit : 10;
        const skip = (page - 1) * limit;

        const { match, sort } = this._buildTransactionFilterQuery(filters, userId);

        const pipeline: any[] = [
            { $match: match },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    createdAt: 1,
                    transactionId: {
                        $ifNull: ['$bookingTransactionId', '$subscriptionTransactionId']
                    },
                    paymentId: "$gatewayPaymentId",
                    amount: { $divide: ["$amount", 100] },
                    method: "$direction",
                    source: "$source",
                    transactionType: "$type",
                }
            }
        ];

        return await this._walletLedgerModel.aggregate(pipeline);
    }

    async getFilteredProviderLedgersByUserIdWithPagination(userId: string, filters: IWalletTransactionFilter, options: { page: number; limit: number }): Promise<IProviderTransactionData[]> {
        const page = options?.page && options.page > 0 ? options.page : 1;
        const limit = options?.limit && options.limit > 0 ? options.limit : 10;
        const skip = (page - 1) * limit;

        const { match, sort } = this._buildTransactionFilterQuery(filters, userId);

        const pipeline: any[] = [
            { $match: match },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    createdAt: 1,
                    paymentId: "$gatewayPaymentId",
                    amount: { $divide: ["$amount", 100] },
                    method: "$direction",
                    transactionType: "$type",
                    bookingId: "$bookingId",
                    subscriptionId: "$subscriptionId",
                    source: "$source",
                }
            }
        ];

        return await this._walletLedgerModel.aggregate(pipeline);
    }

    async getProviderTransactionOverview(providerId: string): Promise<Omit<IProviderTransactionOverview, "balance">> {
        const pipeline: PipelineStage[] = [
            { $match: { userId: this._toObjectId(providerId) } },
            {
                $group: {
                    _id: null,
                    totalCredit: { $sum: { $cond: [{ $eq: ["$direction", PaymentDirection.CREDIT] }, "$amount", 0] } },
                    totalDebit: { $sum: { $cond: [{ $eq: ["$direction", PaymentDirection.DEBIT] }, "$amount", 0] } },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalCredit: { $divide: ["$totalCredit", 100] },
                    totalDebit: { $divide: ["$totalDebit", 100] },
                    netGain: { $divide: [{ $subtract: ["$totalCredit", "$totalDebit"] }, 100] }
                }
            }
        ];

        const result = await this._walletLedgerModel.aggregate(pipeline);
        return result[0] ?? { totalCredit: 0, totalDebit: 0, netGain: 0 };
    }

    async getAdminTransactionLists(adminId: string, filters: IWalletTransactionFilter, options: { page: number; limit: number }): Promise<WalletLedgerDocument[]> {
        const page = options?.page && options.page > 0 ? options.page : 1;
        const limit = options?.limit && options.limit > 0 ? options.limit : 10;
        const skip = (page - 1) * limit;

        const { match, sort } = this._buildTransactionFilterQuery(filters);

        return await this._walletLedgerModel
            .find(match)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async getTransactionStats(): Promise<Omit<ITransactionStats, "balance">> {
        const pipeline: PipelineStage[] = [
            {
                $group: {
                    _id: null,
                    grossPayments: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$userRole", 'customer'] },
                                        { $eq: ["$direction", PaymentDirection.DEBIT] },
                                    ]
                                },
                                "$amount",

                                0
                            ]
                        }
                    },
                    providerPayouts: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$userRole", 'provider'] },
                                        { $eq: ["$direction", PaymentDirection.CREDIT] },
                                    ]
                                },
                                "$amount",
                                0
                            ]
                        }
                    },
                    platformCommission: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$userRole", 'admin'] },
                                        { $eq: ["$direction", PaymentDirection.CREDIT] },
                                        {
                                            $in: [
                                                "$type",
                                                [
                                                    TransactionType.PROVIDER_COMMISSION,
                                                    TransactionType.CUSTOMER_COMMISSION,
                                                ],
                                            ],
                                        },
                                    ]
                                },
                                "$amount",
                                0
                            ]
                        }
                    },
                    gstCollected: {
                        $sum:
                        {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$userRole", 'admin'] },
                                        { $eq: ["$direction", PaymentDirection.CREDIT] },
                                        { $eq: ["$type", TransactionType.GST] }
                                    ]
                                },
                                "$amount",
                                0
                            ]
                        }
                    },
                    refundIssued: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$userRole", 'admin'] },
                                        { $eq: ["$direction", PaymentDirection.DEBIT] },
                                        { $eq: ["$type", TransactionType.BOOKING_REFUND] },
                                    ]
                                },
                                "$amount",
                                0
                            ]
                        }
                    },
                },
            },
            {
                $addFields: {
                    netProfit: {
                        $subtract: [
                            "$platformCommission",
                            { $add: ["$gstCollected", "$refundIssued"] },
                        ],
                    },

                }
            },
            {
                $project: {
                    _id: 0,
                    netProfit: { $divide: ["$netProfit", 100] },
                    providerPayouts: { $divide: ["$providerPayouts", 100] },
                    grossPayments: { $divide: ["$grossPayments", 100] },
                    platformCommission: { $divide: ["$platformCommission", 100] },
                    gstCollected: { $divide: ["$gstCollected", 100] },
                    refundIssued: { $divide: ["$refundIssued", 100] },
                }
            }
        ];

        const result = await this._walletLedgerModel.aggregate(pipeline);
        return result[0] || {
            netProfit: 0,
            providerPayouts: 0,
            grossPayments: 0,
            platformCommission: 0,
            gstCollected: 0,
            refundIssued: 0,
        };
    }
}