import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BOOKINGS_MODEL_NAME } from '@core/constants/model.constant';
import { IBookedSlot, IBookingStats } from '@core/entities/interfaces/booking.entity.interface';
import { ITopProviders } from '@core/entities/interfaces/user.entity.interface';
import { BookingDocument, SlotDocument } from '@core/schema/bookings.schema';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { IBookingReportData, IReportCustomerMatrix, IReportDownloadBookingData, IReportProviderMatrix } from '@core/entities/interfaces/admin.entity.interface';
import { SlotStatusEnum } from '@core/enum/slot.enum';

@Injectable()
export class BookingRepository extends BaseRepository<BookingDocument> implements IBookingRepository {
    constructor(
        @InjectModel(BOOKINGS_MODEL_NAME)
        private readonly _bookingModel: Model<BookingDocument>
    ) {
        super(_bookingModel);
    }

    async findBookingsByCustomerIdWithPagination(customerId: string | Types.ObjectId, skip: number, limit: number): Promise<BookingDocument[]> {
        return await this._bookingModel
            .find({ customerId: this._toObjectId(customerId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async findBookingsByProviderId(providerId: string | Types.ObjectId): Promise<BookingDocument[]> {
        return await this._bookingModel
            .find({ providerId: this._toObjectId(providerId) })
            .sort({ createdAt: -1 })
            .lean();
    }

    async count(filter?: FilterQuery<BookingDocument>): Promise<number> {
        return await this._bookingModel.countDocuments(filter);
    }

    async countDocumentsByCustomer(customerId: string | Types.ObjectId): Promise<number> {
        return await this._bookingModel.countDocuments({ customerId: this._toObjectId(customerId) });
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



    async generateBookingReport(data: Partial<IReportDownloadBookingData>): Promise<IBookingReportData[]> {
        const pipeline: PipelineStage[] = [];

        const match: FilterQuery<BookingDocument> = {};

        if (data.fromDate && data.toDate) {
            match.createdAt = {
                $gte: new Date(data.fromDate),
                $lte: new Date(data.toDate)
            };
        }

        if (data.status) {
            match.bookingStatus = data.status
        }

        if (data.userId) {
            match.customerId = data.userId;
        }

        // Generating $match stage.
        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match });
        }

        // Generating $addFields stage.
        pipeline.push(
            {
                $addFields: {
                    customerObjectId: { $toObjectId: '$customerId' },
                    providerObjectId: { $toObjectId: '$providerId' }
                }
            }
        );

        // Generating $lookup and $ $unwind stage.
        pipeline.push(
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerObjectId',
                    foreignField: '_id',
                    as: 'customers'
                }
            },
            {
                $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'providers',
                    localField: 'providerObjectId',
                    foreignField: '_id',
                    as: 'providers'
                }
            },
            {
                $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
            },
        );

        // Generating $sort stage.
        pipeline.push({ $sort: { createdAt: -1 } });

        // Generating $project stage.
        pipeline.push({
            $project: {
                bookingId: '$_id',
                customerEmail: '$customers.email',
                providerEmail: '$providers.email',
                totalAmount: '$totalAmount',
                date: '$createdAt',
                phone: '$customers.phone',
                bookingStatus: '$bookingStatus',
                paymentStatus: '$paymentStatus',
                transactionId: '$transactionId',
            }
        });

        return await this._bookingModel.aggregate(pipeline);
    }

    async getCustomerReportMatrix(id: string): Promise<IReportCustomerMatrix> {
        const pipeline: PipelineStage[] = [];

        pipeline.push(
            {
                $match: { customerId: id }
            },
            {
                $group: {
                    _id: '$customerId',
                    totalBookings: {
                        $sum: 1
                    },
                    totalSpend: { $sum: "$totalAmount" },
                    totalRefunded: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", "refunded"] }, "$totalAmount", 0]
                        }
                    }
                }
            },
        );

        pipeline.push(
            {
                $project: {
                    _id: 0,
                    totalBookings: 1,
                    totalSpend: 1,
                    totalRefunded: 1
                }
            }
        )

        const [reportMatrix] = await this._bookingModel.aggregate(pipeline);
        return reportMatrix ?? {
            totalBookings: 0,
            totalSpend: 0,
            totalRefunded: 0
        };
    }

    async getProviderReportMatrix(id: string): Promise<IReportProviderMatrix> {
        const pipeline: PipelineStage[] = [];

        pipeline.push(
            {
                $match: { providerId: id }
            },
            {
                $group: {
                    _id: '$providerId',
                    totalBookings: { $sum: 1 },
                    totalEarnings: {
                        $sum: {
                            $cond: [{ $eq: ["$bookingStatus", 'confirmed'] }, "$totalAmount", 0]
                        }
                    },
                    totalRefunds: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", 'refunded'] }, '$totalAmount', 0]
                        }
                    },
                }
            }
        );

        pipeline.push(
            {
                $project: {
                    _id: 0,
                    totalBookings: 1,
                    totalEarnings: 1,
                    totalRefunds: 1
                }
            }
        )

        const [matrix] = await this._bookingModel.aggregate(pipeline);
        return matrix ?? {
            totalBookings: 0,
            totalEarnings: 0,
            totalRefunds: 0
        };
    }

    async findSlotsByDate(date: string | Date): Promise<SlotDocument[]> {
        const dateOnly = new Date(date);
        const result = await this._bookingModel.find({ 'slot.date': dateOnly }).lean();
        return result.map(r => r.slot);
    }

    async findBookedSlots(ruleId: string): Promise<SlotDocument[]> {
        const result = await this._bookingModel
            .find({ 'slot.ruleId': this._toObjectId(ruleId) })
            .lean();
        return result.map(r => r.slot)
    }

    async isAlreadyBooked(ruleId: string, from: string, to: string): Promise<boolean> {
        const result = await this._bookingModel.find(
            {
                'slot.ruleId': this._toObjectId(ruleId),
                'slot.from': from,
                'slot.to': to
            });
        return result.length !== 0;
    }

    async updateSlotStatus(ruleId: string, from: string, to: string): Promise<boolean> {
        return !!(await this._bookingModel.findOneAndUpdate(
            {
                'slot.ruleId': this._toObjectId(ruleId),
                'slot.from': from,
                'slot.to': to
            },
            {
                $set: { 'slot.status': SlotStatusEnum.PENDING }
            },
            { new: true }
        ));
    }
}