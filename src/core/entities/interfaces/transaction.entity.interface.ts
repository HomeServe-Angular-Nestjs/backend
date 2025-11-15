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
    gateWayDetails: IGatewayDetails | null;
    userDetails: ITxUserDetails | null;
    metadata?: ITransactionMetadata | null;
}

export interface ITxUserDetails {
    email: string;
    contact: string;
    role: string;
}

export interface IGatewayDetails {
    orderId: string,
    paymentId: string,
    signature: string,
    receipt: string | null,
}

export interface ITransactionMetadata {
    bookingId?: string | null;
    subscriptionId?: string | null;
    breakup?: {
        providerAmount?: number | null;
        commission?: number | null;
        gst?: number | null;
    } | null;
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

export interface IVerifiedBookingsPayment {
    verified: boolean;
    bookingId: string;
    transaction: ITransaction;
}

export interface IVerifiedSubscriptionPayment {
    verified: boolean;
    subscriptionId: string;
    transaction: ITransaction;
}

export interface ITransactionStats {
    totalTransactions: number;
    totalRevenue: number;
    successRate: number;
    avgTransactionValue: number;
}

export interface ITransactionTableData {
    transactionId: string;
    paymentId: string | null;
    amount: number;
    method: string;
    source: PaymentSource,
    transactionType: string;
    createdAt: Date;
}

export interface ITransactionDataWithPagination {
    tableData: ITransactionTableData[];
    pagination: IPagination;
}

export interface ITransactionUserTableData {
    transactions: (ITransactionTableData & { email: string })[];
    pagination: IPagination;
}

export interface ITransactionFilter {
    page?: number;
    search?: string;
    sort?: 'newest' | 'oldest' | 'high' | 'low';
    type?: TransactionType | 'all';
    date?: 'all' | 'last_six_months' | 'last_year';
    method?: PaymentDirection | 'all';
}
