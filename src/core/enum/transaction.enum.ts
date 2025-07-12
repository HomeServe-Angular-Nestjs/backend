export enum TransactionStatus {
    CREATED = 'created',
    ATTEMPTED = 'attempted',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export enum TransactionType {
    BOOKING = 'Booking',
    SUBSCRIPTION = 'Subscription',
}