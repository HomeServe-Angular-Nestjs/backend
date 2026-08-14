import type { IAdminTransactionDataWithPagination, ITransactionStats } from '@core/entities/interfaces/wallet-ledger.entity.interface';
import type { IResponse } from '@core/misc/response.util';
import type { TransactionReportDownloadDto } from '@modules/users/dtos/admin-user.dto';
import type { ProviderWalletFilterDto } from '@modules/wallet/dto/wallet.dto';

export interface IAdminTransactionService {
  downloadTransactionReport(reportFilterData: TransactionReportDownloadDto): Promise<Buffer>;
  getTransactionStats(): Promise<IResponse<ITransactionStats>>;
  getTransactionLists(adminId: string, filterData: ProviderWalletFilterDto): Promise<IResponse<IAdminTransactionDataWithPagination>>;
}
