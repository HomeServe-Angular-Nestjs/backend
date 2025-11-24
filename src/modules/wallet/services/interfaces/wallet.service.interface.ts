import { ITransactionUserTableData } from "@core/entities/interfaces/transaction.entity.interface";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { ProviderWalletFilterDto } from "@modules/wallet/dto/wallet.dto";

export interface IWalletService {
    getWallet(userId: string): Promise<IResponse<IWallet | null>>;
    getTransactions(userId: string, filter: ProviderWalletFilterDto): Promise<IResponse<ITransactionUserTableData>>;
}