import { ITransaction } from "@core/entities/interfaces/transaction.entity.interface";
import { TransactionDocument } from "@core/schema/bookings.schema";

export interface ITransactionMapper {
    toEntity(doc: TransactionDocument): ITransaction;
    toDocument(entity: Partial<ITransaction>): Partial<TransactionDocument>;
}