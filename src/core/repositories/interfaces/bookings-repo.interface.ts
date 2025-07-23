import { FilterQuery, UpdateQuery } from "mongoose";
import { IBooking, IBookingStats } from "../../entities/interfaces/booking.entity.interface";
import { BookingDocument } from "../../schema/bookings.schema";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";

export interface IBookingRepository extends IBaseRepository<IBooking, BookingDocument> {
    count(filter?: FilterQuery<BookingDocument>): Promise<number>;
    bookingStatus(): Promise<IBookingStats | null>;
}