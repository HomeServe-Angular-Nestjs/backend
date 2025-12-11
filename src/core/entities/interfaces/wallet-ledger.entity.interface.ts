import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
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