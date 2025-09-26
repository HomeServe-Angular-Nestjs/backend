import { WALLET_MODEL_NAME } from "@core/constants/model.constant";
import { ITransaction } from "@core/entities/interfaces/transaction.entity.interface";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { TransactionStatus, TransactionType } from "@core/enum/transaction.enum";
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IWalletRepository } from "@core/repositories/interfaces/wallet-repo.interface";
import { WalletDocument } from "@core/schema/wallet.schema";
import { UserType } from "@modules/auth/dtos/login.dto";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Model } from "mongoose";

@Injectable()
export class WalletRepository extends BaseRepository<WalletDocument> implements IWalletRepository {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(WALLET_MODEL_NAME)
        private readonly _walletModel: Model<WalletDocument>
    ) {
        super(_walletModel);
        this.logger = this._loggerFactory.createLogger(WalletRepository.name);
    }

    async findWallet(userId: string): Promise<WalletDocument | null> {
        return await this._walletModel.findOne({ userId: this._toObjectId(userId) });
    }

    async updateAdminAmount(amount: number): Promise<boolean> {
        return !!(await this._walletModel.findOneAndUpdate(
            { type: 'admin' },
            { $inc: { balance: amount } },
            { new: true }
        ));
    }

    async updateUserAmount(userId: string, type: UserType, amount: number): Promise<boolean> {
        return !!(await this._walletModel.findOneAndUpdate(
            { userId: this._toObjectId(userId), type },
            { $inc: { balance: amount } },
            { new: true }
        ));
    }

    async updateProviderBalance(providerId: string, amount: number): Promise<boolean> {
        return !!(await this._walletModel.findOneAndUpdate(
            { userId: this._toObjectId(providerId), type: 'provider' },
            { $inc: { balance: amount } },
            { new: true }
        ));
    }

    async updateCustomerBalance(customerId: string, amount: number): Promise<boolean> {
        return !!(await this._walletModel.findOneAndUpdate(
            { userId: this._toObjectId(customerId), type: 'customer' },
            { $inc: { balance: amount } },
            { new: true }
        ));
    }

    async bulkUpdate(transaction: ITransaction): Promise<void> {
        switch (transaction.transactionType) {
            case TransactionType.BOOKING: {
                // Customer paid -> Admin wallet gets credited
                await this.updateAdminAmount(transaction.amount);
                break;
            }

            case TransactionType.CUSTOMER_COMMISSION: {
                // Commission from customer -> stays in Admin wallet
                await this.updateAdminAmount(transaction.amount);
                break;
            }

            case TransactionType.PROVIDER_COMMISSION: {
                // Commission from provider -> stays in Admin wallet
                await this.updateAdminAmount(transaction.amount);
                break;
            }

            case TransactionType.BOOKING_RELEASE: {
                // Provider payout -> Admin wallet decreases, Provider wallet increases
                await this.updateAdminAmount(-transaction.amount);
                await this.updateProviderBalance(transaction.userId, transaction.amount);
                break;
            }

            case TransactionType.SUBSCRIPTION: {
                // User subscription -> Admin wallet increases
                await this.updateAdminAmount(transaction.amount);
                break;
            }

            default:
                this.logger.warn(`Unhandled transaction type: ${transaction.transactionType}`);
                throw new Error('')
        }
    }
}