import { WALLET_LEDGER_MODEL_NAME, WALLET_MODEL_NAME } from "@core/constants/model.constant";
import { WALLET_LEDGER_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { LoggerFactory } from "@core/logger/implementation/logger.factory";
import { WalletLedgerRepository } from "@core/repositories/implementations/wallet-ledger.repository";
import { WalletRepository } from "@core/repositories/implementations/wallet.repository";
import { WalletLedgerDocument } from "@core/schema/wallet-ledger.schema";
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
        provide: WALLET_LEDGER_REPOSITORY_NAME,
        useFactory: (walletLedgerModel: Model<WalletLedgerDocument>) =>
            new WalletLedgerRepository(walletLedgerModel),
        inject: [getModelToken(WALLET_LEDGER_MODEL_NAME)]
    },
];