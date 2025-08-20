export enum TransactionStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export enum TransactionType {
    BOOKING = 'Booking',
    SUBSCRIPTION = 'Subscription',
}

export enum PaymentDirection {
    DEBIT = 'debit',
    CREDIT = 'credit',   
}

export enum PaymentSource {
    RAZORPAY = 'razorpay',
    WALLET = 'wallet'
}