import { WALLET_MODEL_NAME } from "@core/constants/model.constant";
import { WALLET_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { WalletRepository } from "@core/repositories/implementations/wallet.repository";
import { WalletDocument } from "@core/schema/wallet.schema";
import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

export const walletRepositoryProviders: Provider[] = [
    {
        provide: WALLET_REPOSITORY_NAME,
        useFactory: (walletModel: Model<WalletDocument>) =>
            new WalletRepository(walletModel),
        inject: [getModelToken(WALLET_MODEL_NAME)]
    }
];