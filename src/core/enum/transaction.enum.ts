export enum TransactionStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export enum TransactionType {
    BOOKING = 'booking',
    SUBSCRIPTION = 'subscription',
    CUSTOMER_COMMISSION = 'customer_commission',
    PROVIDER_COMMISSION = 'provider_commission',
    REFUND = 'refund',
    BOOKING_RELEASE = 'booking_release',
    TAX = 'tax',
}

export enum PaymentDirection {
    DEBIT = 'debit',
    CREDIT = 'credit',
}

export enum PaymentSource {
    RAZORPAY = 'razorpay',
    INTERNAL = 'internal', // for wallet/commission transfers
}