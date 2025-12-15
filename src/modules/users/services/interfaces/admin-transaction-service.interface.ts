import { IAdminTransactionDataWithPagination, ITransactionStats } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { TransactionReportDownloadDto } from "@modules/users/dtos/admin-user.dto";
import { ProviderWalletFilterDto } from "@modules/wallet/dto/wallet.dto";

export interface IAdminTransactionService {
    downloadTransactionReport(reportFilterData: TransactionReportDownloadDto): Promise<Buffer>;
    getTransactionStats(): Promise<IResponse<ITransactionStats>>;
    getTransactionLists(adminId: string, filterData: ProviderWalletFilterDto): Promise<IResponse<IAdminTransactionDataWithPagination>>;
}