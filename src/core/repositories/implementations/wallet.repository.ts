import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IWalletRepositoryInterface } from "@core/repositories/interfaces/wallet-repo.interface";
import { WalletDocument } from "@core/schema/wallet.schema";
import { Injectable } from "@nestjs/common";

@Injectable()
export class WalletRepository extends BaseRepository<WalletDocument> implements IWalletRepositoryInterface {
    // constructor(
    //     @Inject()
    // ) { }
}