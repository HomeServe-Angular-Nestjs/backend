import { TRANSACTION_MODEL_NAME, WALLET_MODEL_NAME } from "@core/constants/model.constant";
import { TRANSACTION_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { LoggerFactory } from "@core/logger/implementation/logger.factory";
import { TransactionRepository } from "@core/repositories/implementations/transaction.repository";
import { WalletRepository } from "@core/repositories/implementations/wallet.repository";
import { TransactionDocument } from "@core/schema/transaction.schema";
import { WalletDocument } from "@core/schema/wallet.schema";
import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

export const walletRepositoryProviders: Provider[] = [
    {
        provide: WALLET_REPOSITORY_NAME,
        useFactory: (walletModel: Model<WalletDocument>) =>
            new WalletRepository(new LoggerFactory(), walletModel),
        inject: [getModelToken(WALLET_MODEL_NAME)]
    },
    {
        provide: TRANSACTION_REPOSITORY_NAME,
        useFactory: (transactionModel: Model<TransactionDocument>) =>
            new TransactionRepository(transactionModel),
        inject: [getModelToken(TRANSACTION_MODEL_NAME)]
    },

];