import { IBookedSlot, IBooking } from '@core/entities/interfaces/booking.entity.interface';
import { BookingDocument, SlotDocument } from '@core/schema/bookings.schema';

export interface IBookingMapper {
    toEntity(doc: BookingDocument): IBooking;
    toSlotEntity(doc: SlotDocument): IBookedSlot;
    toDocument(entity: Omit<IBooking, 'id'>): Partial<BookingDocument>;
}