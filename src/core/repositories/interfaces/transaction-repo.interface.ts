import { ITransaction } from '@core/entities/interfaces/transaction.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { TransactionDocument } from '@core/schema/transaction.schema';

export interface ITransactionRepository extends BaseRepository<ITransaction, TransactionDocument> {
    getTotalRevenue(date: Date): Promise<number>;
}