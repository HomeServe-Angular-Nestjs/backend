import { WALLET_MODEL_NAME } from "@core/constants/model.constant";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IWalletRepository } from "@core/repositories/interfaces/wallet-repo.interface";
import { WalletDocument } from "@core/schema/wallet.schema";
import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";

@Injectable()
export class WalletRepository extends BaseRepository<WalletDocument> implements IWalletRepository {
    constructor(
        @Inject(WALLET_MODEL_NAME)
        private readonly _walletModel: Model<WalletDocument>
    ) {
        super(_walletModel);
    }
}