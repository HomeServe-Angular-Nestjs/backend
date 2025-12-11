import { IWalletLedger } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { WalletLedgerDocument } from "@core/schema/wallet-ledger.schema";

export interface IWalletLedgerMapper {
    toEntity(doc: WalletLedgerDocument): IWalletLedger;
    toDocument(entity: Partial<IWalletLedger>): Partial<WalletLedgerDocument>;
}