import { WALLET_LEDGER_MODEL_NAME } from "@core/constants/model.constant";
import { PaymentStatus } from "@core/enum/bookings.enum";
import { PaymentDirection, TransactionType } from "@core/enum/transaction.enum";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IWalletLedgerRepository } from "@core/repositories/interfaces/wallet-ledger.repo.interface";
import { WalletLedgerDocument } from "@core/schema/wallet-ledger.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";

@Injectable()
export class WalletLedgerRepository extends BaseRepository<WalletLedgerDocument> implements IWalletLedgerRepository {
    constructor(
        @InjectModel(WALLET_LEDGER_MODEL_NAME)
        private readonly _walletLedgerModel: Model<WalletLedgerDocument>
    ) {
        super(_walletLedgerModel);
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

   
}