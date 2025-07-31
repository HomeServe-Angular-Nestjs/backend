import { TransactionReportDownloadDto } from "@modules/users/dtos/admin-user.dto";

export interface IAdminTransactionService {
    downloadTransactionReport(reportFilterData: TransactionReportDownloadDto): Promise<Buffer>;
}