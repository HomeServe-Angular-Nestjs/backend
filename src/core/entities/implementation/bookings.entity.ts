import { BookingStatus, CancelStatus, PaymentStatus } from "../../enum/bookings.enum";
import { BaseEntity } from "../base/implementation/base.entity";
import { IBooking } from "../interfaces/booking.entity.interface";

export class Booking extends BaseEntity implements IBooking {
    customerId: string;
    providerId: string;
    totalAmount: number;
    expectedArrivalTime: Date;
    actualArrivalTime: Date | null;
    bookingStatus: BookingStatus;
    cancelledAt: Date | null;
    cancellationReason: string | null;
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
    paymentStatus: PaymentStatus;
    cancelStatus: CancelStatus | null;
    transactionId: string | null;

    constructor(partial: Partial<Booking>) {
        super(partial)
        Object.assign(this, partial);
    }
}
