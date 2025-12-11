import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { WalletLedgerDocument } from "@core/schema/wallet-ledger.schema";

export interface IWalletLedgerRepository extends IBaseRepository<WalletLedgerDocument> {
    getTotalRevenueForAdmin(fromDate: Date, toDate?: Date | null): Promise<number>;
    getAdminWalletLedgerByTransactionId(transactionId: string): Promise<WalletLedgerDocument | null>
}