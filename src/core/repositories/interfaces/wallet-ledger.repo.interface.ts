import { ITransactionTableData } from "@core/entities/interfaces/transaction.entity.interface";
import { IWalletTransactionFilter } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { WalletLedgerDocument } from "@core/schema/wallet-ledger.schema";

export interface IWalletLedgerRepository extends IBaseRepository<WalletLedgerDocument> {
    getTotalRevenueForAdmin(fromDate: Date, toDate?: Date | null): Promise<number>;
    getAdminWalletLedgerByTransactionId(transactionId: string): Promise<WalletLedgerDocument | null>;
    getFilteredLedgersByUserIdWithPagination(userId: string, filters: IWalletTransactionFilter, options: { page: number; limit: number }): Promise<ITransactionTableData[]>;
    getTotalLedgerCountByUserId(userId: string): Promise<number>;
}