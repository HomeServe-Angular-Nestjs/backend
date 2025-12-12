import { WALLET_LEDGER_MODEL_NAME } from "@core/constants/model.constant";
import { ITransactionTableData } from "@core/entities/interfaces/transaction.entity.interface";
import { IWalletTransactionFilter } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { PaymentStatus } from "@core/enum/bookings.enum";
import { PaymentDirection, TransactionType } from "@core/enum/transaction.enum";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { SortQuery } from "@core/repositories/implementations/slot-rule.repository";
import { IWalletLedgerRepository } from "@core/repositories/interfaces/wallet-ledger.repo.interface";
import { WalletLedgerDocument } from "@core/schema/wallet-ledger.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, SortOrder } from "mongoose";

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

    private _buildTransactionFilterQuery(filters: IWalletTransactionFilter, userId: string): { match: FilterQuery<WalletLedgerDocument>, sort: SortQuery<WalletLedgerDocument> } {
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
                sort.amount = 1;
                break;

            default:
                sort.createdAt = -1;
                break;
        }

        return { match, sort };
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

    async getFilteredLedgersByUserIdWithPagination(userId: string, filters: IWalletTransactionFilter, options: { page: number; limit: number }): Promise<ITransactionTableData[]> {
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

}