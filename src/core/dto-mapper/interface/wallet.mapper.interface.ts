import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { WalletDocument } from "@core/schema/wallet.schema";

export interface IWalletMapper {
    toEntity(doc: WalletDocument): IWallet;
    toDocument(entity: Partial<IWallet>): Partial<WalletDocument>
}