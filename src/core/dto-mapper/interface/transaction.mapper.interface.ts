import { ITransaction } from "@core/entities/interfaces/transaction.entity.interface";
import { TransactionDocument } from "@core/schema/transaction.schema";

export interface ITransactionMapper {
    toEntity(doc: TransactionDocument): ITransaction;
}