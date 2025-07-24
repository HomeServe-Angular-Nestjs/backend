import { ITransaction } from "src/core/entities/interfaces/transaction.entity.interface";
import { BaseRepository } from "../base/implementations/base.repository";
import { TransactionDocument } from "src/core/schema/transaction.schema";

export interface ITransactionRepository extends BaseRepository<ITransaction, TransactionDocument> {
    getTotalRevenue(date: Date): Promise<number>;
}