import { FilterQuery, UpdateQuery } from 'mongoose';

import { IBooking, IBookingStats } from '@core/entities/interfaces/booking.entity.interface';
import { ITopProviders } from '@core/entities/interfaces/user.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { BookingDocument } from '@core/schema/bookings.schema';

export interface IBookingRepository extends IBaseRepository<IBooking, BookingDocument> {
    count(filter?: FilterQuery<BookingDocument>): Promise<number>;
    bookingStatus(): Promise<IBookingStats | null>;
    getTopProviders():Promise<ITopProviders[]>;

}