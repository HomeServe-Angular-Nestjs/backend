import { BookingStatus, PaymentStatus } from "../../enum/bookings.enum";
import { IEntity } from "../base/interfaces/base-entity.entity.interface";

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
    totalAmount: number;
    createdAt: Date;
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

export interface IBooking extends IEntity {
    customerId: string;
    providerId: string;
    totalAmount: number;
    expectedArrivalTime: Date;
    actualArrivalTime: Date | null;
    bookingStatus: BookingStatus;
    cancellationReason: string | null;
    cancelledAt: Date | null;
    location: {
        address: string;
        coordinates: [number, number];
    };
    scheduleData: {
        scheduleId: string;
        month: string;
        dayId: string;
        slotId: string;
    };
    services: {
        serviceId: string;
        subserviceIds: string[];
    }[];
    transactionId: string | null;
    paymentStatus: PaymentStatus;
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
    expectedArrivalTime: Date;
    totalAmount: number;
    orderedServices: {
        title: string;
        price: string;
        estimatedTime: string;
    }[];
    transaction: {
        id: string;
        paymentMethod: string;
        paymentDate: Date
    } | null;
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
        name: string;
        email: string;
        phone: string;
        location: string;
    };
}
