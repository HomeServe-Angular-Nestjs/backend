import { ICustomerTransactionData, IProviderTransactionData, IProviderTransactionOverview, ITransactionAdminList, ITransactionStats, IWalletTransactionFilter } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { WalletLedgerDocument } from "@core/schema/wallet-ledger.schema";

export interface IWalletLedgerRepository extends IBaseRepository<WalletLedgerDocument> {
    getTotalRevenueForAdmin(fromDate: Date, toDate?: Date | null): Promise<number>;
    getAdminWalletLedgerByTransactionId(transactionId: string): Promise<WalletLedgerDocument | null>;
    getFilteredCustomerLedgersByUserIdWithPagination(userId: string, filters: IWalletTransactionFilter, options: { page: number; limit: number }): Promise<ICustomerTransactionData[]>;
    getFilteredProviderLedgersByUserIdWithPagination(userId: string, filters: IWalletTransactionFilter, options: { page: number; limit: number }): Promise<IProviderTransactionData[]>;
    getTotalLedgerCountByUserId(userId: string): Promise<number>;
    getProviderTransactionOverview(providerId: string): Promise<Omit<IProviderTransactionOverview, 'balance'>>;
    getAdminTransactionLists(adminId: string, filters: IWalletTransactionFilter, options: { page: number; limit: number }): Promise<WalletLedgerDocument[]>;
    count(): Promise<number>;
    getTransactionStats(): Promise<Omit<ITransactionStats, "balance">>;
    getAdminRevenueChartData(): Promise<{ date: string; amount: number }[]>;
}