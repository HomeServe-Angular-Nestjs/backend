import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { UserType } from "@core/entities/interfaces/user.entity.interface";
import { IWalletLedger } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { CurrencyType, PaymentDirection, PaymentSource, TransactionType } from "@core/enum/transaction.enum";

export class WalletLedger extends BaseEntity implements IWalletLedger {
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

    constructor(partial: Partial<IWalletLedger>) {
        super(partial);
        Object.assign(this, partial);
    }
}