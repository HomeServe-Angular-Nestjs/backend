import { UpdateQuery } from "mongoose";
import { IBooking } from "../../entities/interfaces/booking.entity.interface";
import { BookingDocument } from "../../schema/bookings.schema";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";

export interface IBookingRepository extends IBaseRepository<IBooking, BookingDocument> {
}