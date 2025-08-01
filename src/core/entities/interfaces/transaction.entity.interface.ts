import { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';
import { TransactionStatus, TransactionType } from '@core/enum/transaction.enum';

export interface ITransaction extends IEntity {
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
}

export interface IRazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    offer_id: string | null;
    status: 'created' | 'attempted' | 'paid';
    attempts: number;
    created_at: number;
}

export interface IVerifiedPayment {
    verified: boolean,
    transaction: ITransaction
}