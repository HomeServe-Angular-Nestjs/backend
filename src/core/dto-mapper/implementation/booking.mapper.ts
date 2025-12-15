import { Types } from 'mongoose';
import { IBookingMapper } from '@core/dto-mapper/interface/bookings.mapper.interface';
import { BookedSlot, Booking, Review } from '@core/entities/implementation/bookings.entity';
import { IBookedSlot, IBooking, IReview } from '@core/entities/interfaces/booking.entity.interface';
import { BookingDocument, ReviewDocument, SlotDocument, TransactionDocument } from '@core/schema/bookings.schema';
import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_MAPPER } from '@core/constants/mappers.constant';
import { ITransactionMapper } from '@core/dto-mapper/interface/transaction.mapper.interface';

@Injectable()
export class BookingMapper implements IBookingMapper {
    constructor(
        @Inject(TRANSACTION_MAPPER)
        private readonly _transactionMapper: ITransactionMapper
    ) { }

    toEntity(doc: BookingDocument): IBooking {
        return new Booking({
            id: (doc._id as Types.ObjectId).toString(),
            customerId: doc.customerId.toString(),
            providerId: doc.providerId.toString(),
            totalAmount: doc.totalAmount,
            slot: this.toSlotEntity(doc.slot),
            services: (doc.services ?? []).map(service => ({
                serviceId: service.serviceId.toString(),
                subserviceIds: service.subserviceIds.map(id => String(id)),
            })),
            bookingStatus: doc.bookingStatus,
            paymentStatus: doc.paymentStatus,
            location: doc.location,
            actualArrivalTime: doc.actualArrivalTime,
            expectedArrivalTime: doc.expectedArrivalTime,
            cancellationReason: doc.cancellationReason,
            cancelStatus: doc.cancelStatus,
            cancelledAt: doc.cancelledAt,
            transactionHistory: (doc.transactionHistory ?? []).map(tx => this._transactionMapper.toEntity(tx)),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            review: doc.review ? this.toReviewEntities(doc.review) : null,
            respondedAt: doc.respondedAt ?? null,
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
            services: entity.services.map(service => ({
                serviceId: new Types.ObjectId(service.serviceId),
                subserviceIds: service.subserviceIds.map(id => new Types.ObjectId(id)),
            })),
            slot: {
                ruleId: new Types.ObjectId(entity.slot.ruleId),
                date: new Date(entity.slot.date),
                from: entity.slot.from,
                to: entity.slot.to,
                status: entity.slot.status,
            },
            bookingStatus: entity.bookingStatus,
            transactionHistory: (entity.transactionHistory ?? []).map(tnx => this._transactionMapper.toDocument(tnx) as TransactionDocument),
            paymentStatus: entity.paymentStatus,
            cancellationReason: entity.cancellationReason,
            cancelStatus: entity.cancelStatus,
            cancelledAt: entity.cancelledAt ? new Date(entity.cancelledAt) : null,
            actualArrivalTime: entity?.actualArrivalTime ? new Date(entity.actualArrivalTime) : null,
            review: null,
            respondedAt: entity.respondedAt
        }
    }
}