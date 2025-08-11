import { Types } from 'mongoose';

import { IBookingMapper } from '@core/dto-mapper/interface/bookings.mapper.interface';
import { Booking } from '@core/entities/implementation/bookings.entity';
import { IBooking } from '@core/entities/interfaces/booking.entity.interface';
import { BookingDocument } from '@core/schema/bookings.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BookingMapper implements IBookingMapper {
    toEntity(doc: BookingDocument): IBooking {
        return new Booking({
            id: (doc._id as Types.ObjectId).toString(),
            customerId: doc.customerId.toString(),
            providerId: doc.providerId.toString(),
            totalAmount: doc.totalAmount,
            slotId: doc.slotId.toString(),
            services: doc.services,
            bookingStatus: doc.bookingStatus,
            paymentStatus: doc.paymentStatus,
            location: doc.location,
            actualArrivalTime: doc.actualArrivalTime,
            expectedArrivalTime: doc.expectedArrivalTime,
            cancellationReason: doc.cancellationReason,
            cancelStatus: doc.cancelStatus,
            cancelledAt: doc.cancelledAt,
            transactionId: doc.transactionId?.toString(),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
}