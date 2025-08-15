import { IReportDownloadTransactionData, IReportTransactionData } from '@core/entities/interfaces/admin.entity.interface';
import { ITransaction, ITransactionStats } from '@core/entities/interfaces/transaction.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { TransactionDocument } from '@core/schema/transaction.schema';

export interface ITransactionRepository extends BaseRepository<TransactionDocument> {
    count(): Promise<number>;
    getTotalRevenue(date: Date): Promise<number>;
    getReportDetails(filter: IReportDownloadTransactionData): Promise<IReportTransactionData[]>;
    getTransactionStats(): Promise<ITransactionStats>;
    fetchTransactionsWithPagination(page: number, limit?: number, skip?: number): Promise<TransactionDocument[]>;
}