import { BookingStatus, PaymentStatus } from "../../enum/schema.enum";
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
    totalBookings: number;
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
    scheduleId: string;
    slotId: string;
    services: {
        serviceId: string;
        subserviceIds: string[];
    }[];
    transactionId: string | null;
    paymentStatus: PaymentStatus;
}
