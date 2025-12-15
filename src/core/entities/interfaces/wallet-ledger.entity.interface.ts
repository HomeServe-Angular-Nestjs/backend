import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { IPagination } from "@core/entities/interfaces/booking.entity.interface";
import { UserType } from "@core/entities/interfaces/user.entity.interface";
import { CurrencyType, PaymentDirection, PaymentSource, TransactionType } from "@core/enum/transaction.enum";

export interface IWalletLedger extends IEntity {
    walletId: string;
    userId: string;
    userRole: UserType | null;
    direction: PaymentDirection;
    type: TransactionType;
    amount: number;
    currency: CurrencyType;
    balanceBefore: number;
    balanceAfter: number;
    journalId: string | null;
    bookingId: string | null;
    subscriptionId: string | null;
    bookingTransactionId: string | null;
    subscriptionTransactionId: string | null;
    gatewayOrderId: string | null;
    gatewayPaymentId: string | null;
    source: PaymentSource;
    metadata?: Record<string, any>;
}

export interface IWalletTransactionFilter {
    page?: number;
    search?: string;
    sort?: 'newest' | 'oldest' | 'high' | 'low';
    type?: TransactionType | 'all';
    date?: 'all' | 'last_six_months' | 'last_year';
    method?: PaymentDirection | 'all';
}

export interface ICustomerTransactionData {
    transactionId: string;
    paymentId: string | null;
    amount: number;
    method: PaymentDirection;
    source: PaymentSource,
    transactionType: TransactionType;
    createdAt: Date;
}

export interface ICustomerTransactionDataWithPagination {
    transactions: ICustomerTransactionData[];
    pagination: IPagination;
}

export interface IProviderTransactionData {
    createdAt: string;
    paymentId: string | null;
    amount: number;
    method: PaymentDirection;
    transactionType: TransactionType;
    bookingId: string | null;
    subscriptionId: string | null;
    source: PaymentSource;
}

export interface IProviderTransactionDataWithPagination {
    transactions: IProviderTransactionData[];
    pagination: IPagination;
}

export interface IProviderTransactionOverview {
    balance: number;
    totalCredit: number;
    totalDebit: number;
    netGain: number;
}

export interface ITransactionAdminList {
    dateTime: string;
    counterparty: {
        email: string;
        role: UserType;
    };
    type: TransactionType;
    direction: PaymentDirection;
    amount: number;
    referenceType: string;
    referenceId: string;
    source: PaymentSource;
}

export interface IAdminTransactionDataWithPagination {
    transactions: ITransactionAdminList[];
    pagination: IPagination;
}

export interface ITransactionStats {
    balance: number;
    grossPayments: number;
    providerPayouts: number;
    platformCommission: number;
    gstCollected: number;
    refundIssued: number;
    netProfit: number;
}