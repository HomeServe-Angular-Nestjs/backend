import { BaseEntity } from '@core/entities/base/implementation/base.entity';
import { ITransaction } from '@core/entities/interfaces/transaction.entity.interface';
import { TransactionStatus, TransactionType } from '@core/enum/transaction.enum';

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
    transactionType: TransactionType;

    constructor(partial: Partial<Transaction>) {
        super(partial);
        Object.assign(this, partial);
    }
}