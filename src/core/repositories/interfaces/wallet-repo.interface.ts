import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { WalletDocument } from "@core/schema/wallet.schema";

export interface IWalletRepository extends IBaseRepository<WalletDocument> {
    findWallet(userId: string): Promise<WalletDocument | null>;
}