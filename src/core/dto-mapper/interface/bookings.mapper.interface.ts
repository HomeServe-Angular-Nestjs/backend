import { IBooking } from '@core/entities/interfaces/booking.entity.interface';
import { BookingDocument } from '@core/schema/bookings.schema';

export interface IBookingMapper {
    toEntity(doc: BookingDocument): IBooking;
}