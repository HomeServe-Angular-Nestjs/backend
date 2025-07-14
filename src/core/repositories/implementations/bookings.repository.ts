import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../base/implementations/base.repository";
import { IBooking } from "../../entities/interfaces/booking.entity.interface";
import { BookingDocument } from "../../schema/bookings.schema";
import { InjectModel } from "@nestjs/mongoose";
import { BOOKINGS_MODEL_NAME } from "../../constants/model.constant";
import { FilterQuery, Model, Types } from "mongoose";
import { Booking } from "../../entities/implementation/bookings.entity";

@Injectable()
export class BookingRepository extends BaseRepository<Booking, BookingDocument> {
    constructor(
        @InjectModel(BOOKINGS_MODEL_NAME)
        private readonly _bookingModel: Model<BookingDocument>
    ) {
        super(_bookingModel);
    }

    async count(filter?: FilterQuery<BookingDocument>): Promise<number> {
        return await this._bookingModel.countDocuments(filter);
    }

    async aggregate(pipeline: any[]): Promise<any[]> {
        return await this._bookingModel.aggregate(pipeline).exec();
    }


    protected toEntity(doc: BookingDocument | Record<string, any>): IBooking {
        return new Booking({
            id: (doc._id as Types.ObjectId).toString(),
            customerId: doc.customerId,
            providerId: doc.providerId,
            totalAmount: doc.totalAmount,
            services: doc.services,
            bookingStatus: doc.bookingStatus,
            paymentStatus: doc.paymentStatus,
            location: doc.location,
            actualArrivalTime: doc.actualArrivalTime,
            expectedArrivalTime: doc.expectedArrivalTime,
            cancellationReason: doc.cancellationReason,
            cancelStatus: doc.cancelStatus,
            cancelledAt: doc.cancelledAt,
            transactionId: doc.transactionId,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        })
    }

}