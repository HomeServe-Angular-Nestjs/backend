import { BookingStatus, CancelStatus, PaymentStatus } from '../../enum/bookings.enum';
import { IEntity } from '../base/interfaces/base-entity.entity.interface';
import { SlotStatusEnum } from '@core/enum/slot.enum';
import { PaymentSource, TransactionType } from '@core/enum/transaction.enum';

export interface IBookingResponse {
    bookingId: string;
    provider: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    services: {
        id: string;
        name: string;
    }[];
    expectedArrivalTime: Date | string;
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus;
    cancelStatus: CancelStatus | null;
    totalAmount: number;
    createdAt: Date;
    transaction: {
        transactionId: string,
        paymentSource: PaymentSource
    } | null;
    review: IReview | null;
}

export interface IPagination {
    total: number;
    page: number;
    limit: number
}

export interface IBookingWithPagination {
    bookingData: IBookingResponse[];
    paginationData: IPagination;
}

export interface IProviderBookingLists {
    services: {
        id: string;
        title: string;
        image: string;
    }[];
    customer: {
        id: string;
        name: string;
        avatar: string;
        email: string;
    },
    bookingId: string;
    expectedArrivalTime: Date;
    totalAmount: number;
    createdAt: Date;
    paymentStatus: PaymentStatus;
    cancelStatus: CancelStatus | null;
    bookingStatus: BookingStatus;
}

export interface IPagination {
    page: number;
    limit: number;
    total: number;
}

export interface IResponseProviderBookingLists {
    bookingData: IProviderBookingLists[];
    paginationData: IPagination;
}

export interface IBookedSlot {
    ruleId: string;
    date: Date;
    from: string;
    to: string;
    status: SlotStatusEnum;
}

export interface IReview {
    desc: string;
    rating: number;
    writtenAt: Date | string;
    isActive: boolean;
    isReported: boolean;
}

export interface IBooking extends IEntity {
    customerId: string;
    providerId: string;
    totalAmount: number;
    expectedArrivalTime: Date;
    actualArrivalTime: Date | null;
    bookingStatus: BookingStatus;
    cancellationReason: string | null;
    cancelStatus: CancelStatus | null;
    cancelledAt: Date | null;
    location: {
        address: string;
        coordinates: [number, number];
    };
    slot: IBookedSlot;
    services: {
        serviceId: string;
        subserviceIds: string[];
    }[];
    transactionId: string | null;
    paymentStatus: PaymentStatus;
    review: IReview | null;
    respondedAt: Date | null;
}

export interface IBookingOverviewChanges {
    totalBookingsChange: number;
    pendingRequestsChange: number;
    completedJobsChange: number;
    pendingPaymentsChange: number;
    cancelledBookingsChange: number;
}

export interface IBookingOverviewData {
    pendingRequests: number;
    completedJobs: number;
    pendingPayments: number;
    cancelledBookings: number;
    totalBookings: number;
    changes?: IBookingOverviewChanges;
}

export interface IBookingDetailsBase {
    bookingId: string;
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    cancelStatus: CancelStatus | null;
    cancelReason: string | null;
    cancelledAt: Date | null;
    expectedArrivalTime: Date;
    totalAmount: number;
    orderedServices: IBookedService[];
    transaction: {
        id: string;
        paymentMethod: string;
        paymentDate: Date
    } | null;
}

export interface IBookedService {
    title: string;
    price: string;
    estimatedTime: string;
}

export interface IBookingDetailCustomer extends IBookingDetailsBase {
    provider: {
        name: string;
        email: string;
        phone: string;
    };
}

export interface IBookingDetailProvider extends IBookingDetailsBase {
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string;
        location: string;
    };
}

export interface IAdminBookingForTable {
    bookingId: string;
    customer: {
        avatar: string;
        id: string;
        username: string;
        email: string;
    };
    provider: {
        avatar: string;
        id: string;
        username: string;
        email: string;
    };
    date: Date;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
}

export interface IPaginatedBookingsResponse {
    bookingData: IAdminBookingForTable[];
    pagination: IPagination;
}

export interface IBookingStats {
    total: number;
    completed: number
    pending: number;
    cancelled: number;
    unpaid: number;
    refunded: number;
}

export interface IBookingInvoice {
    invoiceId: string;
    transactionId: string | null;
    transactionType: TransactionType | null;
    paymentStatus: PaymentStatus;
    paymentSource: PaymentSource | null;
    currency: string | null;
    services: IBookedService[];
    userType: 'customer' | 'provider';

    user: {
        name: string;
        email: string;
        contact?: string;
    };

    bookingDetails: {
        status: BookingStatus;
        expectedArrivalTime: string;
        actualArrivalTime?: string | null;
        slot: {
            from: string;
            to: string;
        };
    };

    location: {
        address: string;
        coordinates: [number, number];
    };

    paymentBreakup: {
        providerAmount: number;
        commission: number;
        gst: number;
        total: number;
    };

    paymentDetails: {
        orderId: string;
        paymentId: string;
        receipt: string;
        signature: string;
    } | null;
}

export interface IRatingDistribution {
    rating: string;
    count: number;
}

export interface IRecentReviews {
    name: string;
    desc: string;
    rating: number;
}