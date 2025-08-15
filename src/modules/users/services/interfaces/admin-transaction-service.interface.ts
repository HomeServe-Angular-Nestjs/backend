import { ITransactionStats, ITransactionDataWithPagination } from "@core/entities/interfaces/transaction.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { TransactionReportDownloadDto } from "@modules/users/dtos/admin-user.dto";

export interface IAdminTransactionService {
    downloadTransactionReport(reportFilterData: TransactionReportDownloadDto): Promise<Buffer>;
    getTransactionStats(): Promise<IResponse<ITransactionStats>>;
    getTransactionTableData(page: number): Promise<IResponse<ITransactionDataWithPagination>>;
}