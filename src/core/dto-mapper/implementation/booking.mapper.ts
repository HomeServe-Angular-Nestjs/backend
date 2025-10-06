import { Types } from 'mongoose';
import { IBookingMapper } from '@core/dto-mapper/interface/bookings.mapper.interface';
import { BookedSlot, Booking, Review } from '@core/entities/implementation/bookings.entity';
import { IBookedSlot, IBooking, IReview } from '@core/entities/interfaces/booking.entity.interface';
import { BookingDocument, ReviewDocument, SlotDocument } from '@core/schema/bookings.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BookingMapper implements IBookingMapper {
    toEntity(doc: BookingDocument): IBooking {
        return new Booking({
            id: (doc._id as Types.ObjectId).toString(),
            customerId: doc.customerId.toString(),
            providerId: doc.providerId.toString(),
            totalAmount: doc.totalAmount,
            slot: this.toSlotEntity(doc.slot),
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
            review: doc.review ? this.toReviewEntities(doc.review) : null,
        });
    }

    toSlotEntity(doc: SlotDocument): IBookedSlot {
        return new BookedSlot({
            ruleId: doc.ruleId.toString(),
            date: doc.date,
            from: doc.from,
            to: doc.to,
            status: doc.status
        });
    }

    toReviewEntities(reviewDoc: ReviewDocument): IReview {
        return new Review({
            desc: reviewDoc.desc,
            writtenAt: new Date(reviewDoc.writtenAt),
            isReported: reviewDoc.isReported,
            rating: reviewDoc.rating,
            isActive: reviewDoc.isActive,
        });
    }

    toDocument(entity: Omit<IBooking, 'id'>): Partial<BookingDocument> {
        return {
            customerId: new Types.ObjectId(entity.customerId),
            providerId: new Types.ObjectId(entity.providerId),
            totalAmount: entity.totalAmount,
            expectedArrivalTime: new Date(entity.expectedArrivalTime),
            location: entity.location,
            services: entity.services,
            slot: {
                ruleId: new Types.ObjectId(entity.slot.ruleId),
                date: new Date(entity.slot.date),
                from: entity.slot.from,
                to: entity.slot.to,
                status: entity.slot.status,
            },
            bookingStatus: entity.bookingStatus,
            transactionId: entity.transactionId
                ? new Types.ObjectId(entity.transactionId)
                : null,
            paymentStatus: entity.paymentStatus,
            cancellationReason: entity.cancellationReason,
            cancelStatus: entity.cancelStatus,
            cancelledAt: entity.cancelledAt ? new Date(entity.cancelledAt) : null,
            actualArrivalTime: entity?.actualArrivalTime ? new Date(entity.actualArrivalTime) : null,
            review: null,
        }
    }
}