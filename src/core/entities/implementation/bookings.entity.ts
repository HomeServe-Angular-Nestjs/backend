import { BookingStatus, CancelStatus, PaymentStatus } from '@core/enum/bookings.enum';
import { BaseEntity } from '@core/entities/base/implementation/base.entity';
import { IBookedSlot, IBooking, IReview } from '@core/entities/interfaces/booking.entity.interface';
import { SlotStatusEnum } from '@core/enum/slot.enum';

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
    slot: IBookedSlot;
    services: {
        serviceId: string;
        subserviceIds: string[];
    }[];
    paymentStatus: PaymentStatus;
    cancelStatus: CancelStatus | null;
    transactionId: string | null;
    review: IReview | null;
    respondedAt: Date | null;

    constructor(partial: Partial<Booking>) {
        super(partial)
        Object.assign(this, partial);
    }
}


export class BookedSlot implements IBookedSlot {
    ruleId: string;
    date: Date;
    from: string;
    to: string;
    status: SlotStatusEnum;

    constructor(partial: Partial<BookedSlot>) {
        Object.assign(this, partial);
    }
}

export class Review implements IReview {
    id: string;
    reviewedBy: string;
    desc: string;
    writtenAt: Date;
    isReported: boolean;
    rating: number;
    isActive: boolean;

    constructor(partial: Partial<Review>) {
        Object.assign(this, partial);
    }
}
