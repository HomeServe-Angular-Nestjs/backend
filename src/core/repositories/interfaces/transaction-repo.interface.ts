import { IReportDownloadTransactionData, IReportTransactionData } from '@core/entities/interfaces/admin.entity.interface';
import { TransactionStatus } from '@core/enum/transaction.enum';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { BookingDocument, TransactionDocument } from '@core/schema/bookings.schema';

export interface ITransactionRepository extends IBaseRepository<BookingDocument> {
    createNewTransaction(bookingId: string, transaction: Partial<TransactionDocument>): Promise<TransactionDocument | null>;
    findTransactionById(bookingId: string, transactionId: string): Promise<TransactionDocument | null>;
    count(): Promise<number>;
    countByUserId(userId: string): Promise<number>;
    getReportDetails(filter: IReportDownloadTransactionData): Promise<IReportTransactionData[]>;
    updateStatus(txId: string, status: TransactionStatus): Promise<boolean>;
}