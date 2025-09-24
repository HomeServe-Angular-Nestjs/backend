import { BaseEntity } from '@core/entities/base/implementation/base.entity';
import { IGatewayDetails, ITransaction, ITransactionMetadata, ITxUserDetails } from '@core/entities/interfaces/transaction.entity.interface';
import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '@core/enum/transaction.enum';

export class Transaction extends BaseEntity implements ITransaction {
    userId: string;
    transactionType: TransactionType
    direction: PaymentDirection;
    source: PaymentSource;
    status: TransactionStatus;
    amount: number;
    currency: string;
    gateWayDetails: IGatewayDetails | null;
    userDetails: ITxUserDetails | null;
    metadata?: ITransactionMetadata | null;

    constructor(partial: Partial<Transaction>) {
        super(partial);
        Object.assign(this, partial);
    }
}