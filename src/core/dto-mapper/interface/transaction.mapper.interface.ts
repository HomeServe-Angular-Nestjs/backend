import type { ITransaction } from '@core/entities/interfaces/transaction.entity.interface';
import type { TransactionDocument } from '@core/schema/bookings.schema';

export interface ITransactionMapper {
  toEntity(doc: TransactionDocument): ITransaction;
  toDocument(entity: Partial<ITransaction>): Partial<TransactionDocument>;
}
