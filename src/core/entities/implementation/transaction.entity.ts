import { TransactionStatus } from "src/core/enum/transaction.enum";
import { BaseEntity } from "../base/implementation/base.entity";
import { ITransaction } from "../interfaces/transaction.entity.interface";

export class Transaction extends BaseEntity implements ITransaction {
    userId: string;
    orderId: string;
    paymentId: string;
    signature: string;
    amount: number;
    currency: string;
    status: TransactionStatus
    method?: string;
    email?: string;
    contact?: string;
    receipt?: string;

    constructor(partial: Partial<Transaction>) {
        super(partial);
        Object.assign(this, partial);
    }
}