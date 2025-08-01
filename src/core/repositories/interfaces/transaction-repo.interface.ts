import { IReportDownloadTransactionData, IReportTransactionData } from '@core/entities/interfaces/admin.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { TransactionDocument } from '@core/schema/transaction.schema';

export interface ITransactionRepository extends BaseRepository<TransactionDocument> {
    getTotalRevenue(date: Date): Promise<number>;
    getReportDetails(filter: IReportDownloadTransactionData): Promise<IReportTransactionData[]>;
}