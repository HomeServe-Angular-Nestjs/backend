import { FilterQuery, Model, Types } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BOOKINGS_MODEL_NAME } from '../../constants/model.constant';
import { Booking } from '../../entities/implementation/bookings.entity';
import { IBooking, IBookingStats } from '../../entities/interfaces/booking.entity.interface';
import { ITopProviders } from '../../entities/interfaces/user.entity.interface';
import { BookingDocument } from '../../schema/bookings.schema';
import { BaseRepository } from '../base/implementations/base.repository';
import { IBookingRepository } from '../interfaces/bookings-repo.interface';

@Injectable()
export class BookingRepository extends BaseRepository<BookingDocument> implements IBookingRepository {
    constructor(
        @InjectModel(BOOKINGS_MODEL_NAME)
        private readonly _bookingModel: Model<BookingDocument>
    ) {
        super(_bookingModel);
    }

    async count(filter?: FilterQuery<BookingDocument>): Promise<number> {
        return await this._bookingModel.countDocuments(filter);
    }

    async bookingStatus(): Promise<IBookingStats | null> {
        const result = await this._bookingModel.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ["$bookingStatus", "completed"] }, 1, 0]
                        }
                    },
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ["$bookingStatus", "pending"] }, 1, 0]
                        }
                    },
                    cancelled: {
                        $sum: {
                            $cond: [{ $eq: ["$bookingStatus", "cancelled"] }, 1, 0]
                        }
                    },
                    unpaid: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", "unpaid"] }, 1, 0]
                        }
                    },
                    refunded: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", "refunded"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: 1,
                    completed: 1,
                    pending: 1,
                    cancelled: 1,
                    unpaid: 1,
                    refunded: 1
                }
            }
        ]);

        return result ? result[0] : null;
    }

    async getTopProviders(): Promise<ITopProviders[]> {
        const result = await this._bookingModel.aggregate([
            {
                $match: {
                    bookingStatus: { $ne: 'cancelled' },
                    paymentStatus: { $nin: ['failed', 'refunded'] },
                }
            },
            {
                $addFields: {
                    providerObjectId: { $toObjectId: "$providerId" }
                }
            },
            {
                $group: {
                    _id: "$providerObjectId",
                    totalEarnings: { $sum: "$totalAmount" },
                }
            },
            {
                $lookup: {
                    from: 'providers',
                    localField: "_id",
                    foreignField: "_id",
                    as: "provider"
                }
            },
            {
                $unwind: "$provider"
            },
            {
                $project: {
                    _id: 0,
                    totalEarnings: 1,
                    providerId: "$provider._id",
                    username: "$provider.username",
                    email: "$provider.email",
                }
            },
            { $sort: { totalEarnings: -1 } },
            { $limit: 10 }
        ]);

        return result.length > 0 ? result : [];
    }

    // protected toEntity(doc: BookingDocument | Record<string, any>): IBooking {
    //     return new Booking({
    //         id: (doc._id as Types.ObjectId).toString(),
    //         customerId: doc.customerId,
    //         providerId: doc.providerId,
    //         totalAmount: doc.totalAmount,
    //         services: doc.services,
    //         bookingStatus: doc.bookingStatus,
    //         paymentStatus: doc.paymentStatus,
    //         location: doc.location,
    //         actualArrivalTime: doc.actualArrivalTime,
    //         expectedArrivalTime: doc.expectedArrivalTime,
    //         cancellationReason: doc.cancellationReason,
    //         cancelStatus: doc.cancelStatus,
    //         cancelledAt: doc.cancelledAt,
    //         transactionId: doc.transactionId,
    //         createdAt: doc.createdAt,
    //         updatedAt: doc.updatedAt,
    //     });
    // }

}