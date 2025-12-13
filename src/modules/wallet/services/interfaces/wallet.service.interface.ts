import { ICustomerTransactionDataWithPagination, IProviderTransactionDataWithPagination } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { ProviderWalletFilterDto } from "@modules/wallet/dto/wallet.dto";

export interface IWalletService {
    getWallet(userId: string): Promise<IResponse<IWallet | null>>;
    getTransactions(customerId: string, filter: ProviderWalletFilterDto): Promise<IResponse<ICustomerTransactionDataWithPagination>>;
    getFilteredProviderTransactionsWithPagination(providerId: string, filter: ProviderWalletFilterDto): Promise<IResponse<IProviderTransactionDataWithPagination>>;
}