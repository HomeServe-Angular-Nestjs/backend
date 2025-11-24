import { ITransactionStats, ITransactionDataWithPagination } from "@core/entities/interfaces/transaction.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { TransactionReportDownloadDto } from "@modules/users/dtos/admin-user.dto";
import { ProviderWalletFilterDto } from "@modules/wallet/dto/wallet.dto";

export interface IAdminTransactionService {
    downloadTransactionReport(reportFilterData: TransactionReportDownloadDto): Promise<Buffer>;
    getTransactionStats(): Promise<IResponse<ITransactionStats>>;
    getTransactionTableData(filters: ProviderWalletFilterDto): Promise<IResponse<ITransactionDataWithPagination>>;
}