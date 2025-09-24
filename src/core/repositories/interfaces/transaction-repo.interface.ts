import { IReportDownloadTransactionData, IReportTransactionData } from '@core/entities/interfaces/admin.entity.interface';
import { ITransactionStats } from '@core/entities/interfaces/transaction.entity.interface';
import { TransactionStatus } from '@core/enum/transaction.enum';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { TransactionDocument } from '@core/schema/transaction.schema';

export interface ITransactionRepository extends BaseRepository<TransactionDocument> {
    findTransactionById(id: string): Promise<TransactionDocument | null>;
    count(): Promise<number>;
    getTotalRevenue(date: Date): Promise<number>;
    getReportDetails(filter: IReportDownloadTransactionData): Promise<IReportTransactionData[]>;
    getTransactionStats(): Promise<ITransactionStats>;
    fetchTransactionsWithPagination(page: number, limit?: number, skip?: number): Promise<TransactionDocument[]>;
    updateStatus(txId: string, status: TransactionStatus): Promise<boolean>;
}