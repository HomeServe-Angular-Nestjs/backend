import { WALLET_MODEL_NAME } from "@core/constants/model.constant";
import { ITransaction } from "@core/entities/interfaces/transaction.entity.interface";
import { UserType } from "@core/entities/interfaces/user.entity.interface";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { TransactionStatus, TransactionType } from "@core/enum/transaction.enum";
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IWalletRepository } from "@core/repositories/interfaces/wallet-repo.interface";
import { WalletDocument } from "@core/schema/wallet.schema";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

@Injectable()
export class WalletRepository extends BaseRepository<WalletDocument> implements IWalletRepository {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @InjectModel(WALLET_MODEL_NAME)
        private readonly _walletModel: Model<WalletDocument>
    ) {
        super(_walletModel);
        this.logger = this._loggerFactory.createLogger(WalletRepository.name);
    }

    async findWallet(userId: string): Promise<WalletDocument | null> {
        return await this._walletModel.findOne({ userId: this._toObjectId(userId) });
    }

    async getAdminWallet(): Promise<WalletDocument | null> {
        return await this._walletModel.findOne({ type: 'admin' });
    }

    async updateAdminAmount(amount: number): Promise<boolean> {
        return !!(await this._walletModel.findOneAndUpdate(
            { type: 'admin' },
            { $inc: { balance: amount } },
            { new: true }
        ));
    }

    async updateUserAmount(userId: string, type: UserType, amount: number): Promise<boolean> {
        const result = await this._walletModel.updateOne(
            { userId: this._toObjectId(userId), type },
            { $inc: { balance: amount } },
            { new: true }
        );
        return result.modifiedCount > 0;
    }

    async updateCustomerBalance(customerId: string, amount: number): Promise<boolean> {
        return !!(await this._walletModel.findOneAndUpdate(
            { userId: this._toObjectId(customerId), type: 'customer' },
            { $inc: { balance: amount } },
            { new: true }
        ));
    }
}