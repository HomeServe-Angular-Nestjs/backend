import { BaseEntity } from '@core/entities/base/implementation/base.entity';
import { ITransaction } from '@core/entities/interfaces/transaction.entity.interface';
import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '@core/enum/transaction.enum';

export class Transaction extends BaseEntity implements ITransaction {
    userId: string;
    transactionType: TransactionType
    direction: PaymentDirection;
    source: PaymentSource;
    status: TransactionStatus;
    amount: number;
    currency: string;
    gateWayDetails: {
        orderId: string,
        paymentId: string,
        signature: string,
        receipt: string | null,
    }
    userDetails: {
        email: string,
        contact: string,
    }

    constructor(partial: Partial<Transaction>) {
        super(partial);
        Object.assign(this, partial);
    }
}