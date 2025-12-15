export enum TransactionStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export enum TransactionType {
    BOOKING_PAYMENT = 'booking_payment',
    BOOKING_RELEASE = 'booking_release',
    BOOKING_REFUND = 'booking_refund',
    CANCELLATION_FEE = 'cancellation_fee',
    CUSTOMER_COMMISSION = 'customer_commission',
    PROVIDER_COMMISSION = 'provider_commission',
    GST = 'gst',
    SUBSCRIPTION_PAYMENT = 'subscription_payment',
}

export enum PaymentDirection {
    DEBIT = 'debit',
    CREDIT = 'credit',
}

export enum PaymentSource {
    RAZORPAY = 'razorpay',
    WALLET = 'wallet',
    INTERNAL = 'internal', // commission transfers
}

export enum CurrencyType {
    INR = 'INR',
}