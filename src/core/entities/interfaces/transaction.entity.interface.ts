import { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';
import { IPagination } from '@core/entities/interfaces/booking.entity.interface';
import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '@core/enum/transaction.enum';

export interface ITransaction extends IEntity {
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

export interface ITransactionStats {
    totalTransactions: number;
    totalRevenue: number;
    successRate: number;
    avgTransactionValue: number;
}

export interface ITransactionTableData {
    transactionId: string;
    orderId: string;
    paymentId: string;
    userId: string;
    amount: number;
    userEmail?: string;
    contact?: string;
    method?: string;
    transactionType: string;
    createdAt: Date;
}

export interface ITransactionDataWithPagination {
    tableData: ITransactionTableData[];
    pagination: IPagination;
}