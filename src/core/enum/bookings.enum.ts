export enum BookingStatus {
    PENDING = 'pending', // initial/default stage
    CONFIRMED = 'confirmed', // after in_progress stage
    IN_PROGRESS = 'in_progress', // after pending stage
    COMPLETED = 'completed', // completion stage
    CANCELLED = 'cancelled', // cancellation stage
}

export enum CancelStatus {
    IN_PROGRESS = 'in_progress',
    CANCELLED = 'cancelled',
}

export enum PaymentStatus {
    UNPAID = 'unpaid',
    PAID = 'paid',
    REFUNDED = 'refunded',
    FAILED = 'failed',
}

export enum DateRange {
    TODAY = 'today',
    THIS_WEEK = 'thisWeek',
    THIS_MONTH = 'thisMonth',
    THIS_YEAR = 'thisYear'
}

export enum SortBy {
    NEWEST = 'newest',
    OLDEST = 'oldest',
    NAME_ASCENDING = 'nameAsc',
    NAME_DESCENDING = 'nameDesc'
}