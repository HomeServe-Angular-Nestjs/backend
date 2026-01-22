import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BOOKINGS_MODEL_NAME } from '@core/constants/model.constant';
import { IBookingStats, IRatingDistribution, IRevenueMonthlyGrowthRateData, IRevenueTrendRawData, RevenueChartView, IRevenueCompositionData, ITopServicesByRevenue, INewOrReturningClientData, IAreaSummary, IServiceDemandData, ILocationRevenue, ITopAreaRevenue, IUnderperformingArea, IPeakServiceTime, IRevenueBreakdown, IBookingsBreakdown, IReviewDetailsRaw, IReviewFilter, IAdminBookingFilter, IAdminBookingList } from '@core/entities/interfaces/booking.entity.interface';
import { IReviewFilters, PaginatedReviewResponse, IBookingPerformanceData, IComparisonChartData, IComparisonOverviewData, IOnTimeArrivalChartData, IProviderRevenueOverview, IResponseTimeChartData, ITopProviders, ITotalReviewAndAvgRating } from '@core/entities/interfaces/user.entity.interface';

import { BookingDocument, SlotDocument } from '@core/schema/bookings.schema';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { IAdminReviewStats, IBookingReportData, IReportCustomerMatrix, IReportDownloadBookingData, IReportProviderMatrix } from '@core/entities/interfaces/admin.entity.interface';

import { SlotStatusEnum } from '@core/enum/slot.enum';
import { BookingStatus, CancelStatus, PaymentStatus } from '@core/enum/bookings.enum';
import { UpdateQuery } from 'mongoose';

@Injectable()
export class BookingRepository extends BaseRepository<BookingDocument> implements IBookingRepository {
    constructor(
        @InjectModel(BOOKINGS_MODEL_NAME)
        private readonly _bookingModel: Model<BookingDocument>
    ) {
        super(_bookingModel);
    }

    private _escapeRegex(input: string): string {
        return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
            .find({ providerId: this._toObjectId(providerId), paymentStatus: { $ne: PaymentStatus.UNPAID } })
            .sort({ createdAt: -1 })
            .lean();
    }

    async findPaidBookings(bookingId: string): Promise<BookingDocument | null> {
        return this._bookingModel.findOne({ _id: bookingId, paymentStatus: { $ne: PaymentStatus.UNPAID } });
    }

    async fetchFilteredBookingsWithPagination(filter: IAdminBookingFilter, option?: { page: number; limit: number; }): Promise<IAdminBookingList[]> {
        const page = option?.page ?? 1;
        const limit = option?.limit ?? 10;
        const skip = (page - 1) * limit;

        const match: FilterQuery<BookingDocument> = {};

        const pipeline: PipelineStage[] = [];

        pipeline.push(
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $lookup: {
                    from: 'providers',
                    localField: 'providerId',
                    foreignField: '_id',
                    as: 'provider'
                }
            },
            { $unwind: '$provider' },
        );

        if (filter.search) {
            const escaped = this._escapeRegex(filter.search);
            const searchRegex = new RegExp(escaped, 'i');

            match.$or = [
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: '$_id' },
                            regex: searchRegex
                        }
                    }
                },
                { 'customer.email': searchRegex },
                { 'provider.email': searchRegex },
                { 'customer.username': searchRegex },
                { 'provider.username': searchRegex },
            ];
        }

        if (filter.bookingStatus && filter.bookingStatus !== 'all') {
            match.bookingStatus = filter.bookingStatus;
        }

        if (filter.paymentStatus && filter.paymentStatus !== 'all') {
            match.paymentStatus = filter.paymentStatus;
        }

        pipeline.push({ $match: match });
        pipeline.push({ $sort: { createdAt: -1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });
        pipeline.push({
            $project: {
                _id: 0,
                bookingId: '$_id',
                customer: {
                    id: '$customer._id',
                    avatar: '$customer.avatar',
                    username: '$customer.username',
                    email: '$customer.email',
                },
                provider: {
                    id: '$provider._id',
                    avatar: '$provider.avatar',
                    username: '$provider.username',
                    email: '$provider.email',
                },
                date: '$createdAt',
                status: '$bookingStatus',
                paymentStatus: '$paymentStatus',
            }
        });

        return await this._bookingModel.aggregate(pipeline);
    }

    async count(filter?: FilterQuery<BookingDocument>): Promise<number> {
        return await this._bookingModel.countDocuments(filter);
    }

    async countDocumentsByCustomer(customerId: string | Types.ObjectId): Promise<number> {
        return await this._bookingModel.countDocuments({ customerId: this._toObjectId(customerId) });
    }

    async bookingStatus(): Promise<IBookingStats> {
        const result = await this._bookingModel.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ["$bookingStatus", BookingStatus.COMPLETED] }, 1, 0]
                        }
                    },
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ["$bookingStatus", BookingStatus.PENDING] }, 1, 0]
                        }
                    },
                    cancelled: {
                        $sum: {
                            $cond: [{ $eq: ["$bookingStatus", BookingStatus.CANCELLED] }, 1, 0]
                        }
                    },
                    unpaid: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", PaymentStatus.UNPAID] }, 1, 0]
                        }
                    },
                    refunded: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", PaymentStatus.REFUNDED] }, 1, 0]
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

        return result && result[0] ? result[0] : {
            total: 0,
            completed: 0,
            pending: 0,
            cancelled: 0,
            unpaid: 0,
            refunded: 0
        };
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

    async isAlreadyBooked(ruleId: string, from: string, to: string, dateISO: string): Promise<boolean> {
        const result = await this._bookingModel.find(
            {
                'slot.ruleId': this._toObjectId(ruleId),
                'slot.from': from,
                'slot.to': to,
                'slot.date': new Date(dateISO)
            });
        return result.length !== 0;
    }

    async isAlreadyRequestedForCancellation(bookingId: string): Promise<boolean> {
        return await this._bookingModel.exists({
            _id: bookingId,
            cancelStatus: CancelStatus.IN_PROGRESS
        }).then(Boolean);
    }

    async markBookingCancelledByCustomer(customerId: string, bookingId: string, reason: string, cancelStatus: CancelStatus, bookingStatus: BookingStatus): Promise<BookingDocument | null> {
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        const now = new Date();

        return await this._bookingModel.findOneAndUpdate(
            {
                _id: bookingId,
                customerId: this._toObjectId(customerId),
                bookingStatus: { $nin: [BookingStatus.CANCELLED, BookingStatus.COMPLETED] },
                createdAt: {
                    $gte: new Date(now.getTime() - TWENTY_FOUR_HOURS)
                }
            },
            {
                $set: {
                    bookingStatus,
                    cancellationReason: reason,
                    cancelStatus,
                }
            },
            { new: true }
        );
    }

    async updatePaymentStatus(bookingId: string, status: PaymentStatus): Promise<BookingDocument | null> {
        return this._bookingModel.findOneAndUpdate(
            { _id: bookingId },
            { $set: { paymentStatus: status } },
            { new: true }
        ).lean();
    }

    async updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<BookingDocument | null> {
        return await this._bookingModel.findOneAndUpdate(
            { _id: bookingId },
            { $set: { bookingStatus: newStatus } },
            { new: true }
        );
    }

    async markBookingCancelledByProvider(providerId: string, bookingId: string, bookingStatus: BookingStatus, cancelStatus: CancelStatus, reason?: string): Promise<BookingDocument | null> {
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        const now = new Date();
        const updateData: UpdateQuery<BookingDocument> = {
            bookingStatus,
            cancelStatus,
            cancelledAt: now,
            'slot.status': SlotStatusEnum.RELEASED
        };

        if (reason) {
            updateData.cancellationReason = reason;
        }

        return await this._bookingModel.findOneAndUpdate(
            {
                _id: bookingId,
                providerId: this._toObjectId(providerId),
                bookingStatus: { $nin: [BookingStatus.CANCELLED, BookingStatus.COMPLETED] },
                cancelStatus: { $ne: CancelStatus.CANCELLED },
                createdAt: {
                    $gte: new Date(now.getTime() - TWENTY_FOUR_HOURS)
                }
            },
            { $set: updateData },
            { new: true }
        );
    }

    async addReview(bookingId: string, desc: string, rating: number): Promise<boolean> {
        const result = await this._bookingModel.updateOne(
            { _id: bookingId },
            {
                $set: {
                    review: {
                        desc,
                        rating,
                        writtenAt: new Date(),
                        isReported: false,
                        isActive: true
                    }
                }
            }
        );

        return result.modifiedCount > 0;
    }

    async getAvgRating(providerId: string): Promise<number> {
        const result = await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                }
            },
            {
                $unwind: "$review"
            },
            {
                $match: {
                    "review.rating": { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: null,
                    avg: { $avg: "$review.rating" }
                }
            }
        ]);

        return result?.[0]?.avg ?? 0;
    }

    async getAvgRatingAndTotalReviews(providerId?: string): Promise<ITotalReviewAndAvgRating[]> {
        let matchQuery: Record<string, any> = {
            review: { $exists: true, $ne: null },
            'review.isActive': true
        };

        if (providerId) {
            matchQuery.providerId = this._toObjectId(providerId);
        }

        const result = await this._bookingModel.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: "$providerId",
                    avgRating: { $avg: "$review.rating" },
                    totalReviews: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    providerId: { $toString: "$_id" },
                    avgRating: { $ifNull: ["$avgRating", 0] },
                    totalReviews: 1
                }
            }
        ]);

        return result.length > 0 ? result : [];
    }

    async getPerformanceSummary(providerId: string): Promise<any> {
        const result = await this._bookingModel.aggregate([
            {
                $match: { providerId: this._toObjectId(providerId) }
            },
            {
                $facet: {
                    responseTime: [
                        { $match: { respondedAt: { $exists: true, $ne: null } } },
                        {
                            $group: {
                                _id: null,
                                avgResponseTime: {
                                    $avg: {
                                        $divide: [
                                            { $subtract: ["$respondedAt", "$createdAt"] },
                                            1000 * 60
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    onTimeArrival: [
                        { $match: { actualArrivalTime: { $exists: true, $ne: null } } },
                        {
                            $addFields: {
                                arrivalDelayMins: {
                                    $divide: [
                                        { $subtract: ["$actualArrivalTime", "$expectedArrivalTime"] },
                                        1000 * 60
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                onTimePercent: {
                                    $avg: {
                                        $cond: [{ $lte: ["$arrivalDelayMins", 5] }, 100, 0]
                                    }
                                }
                            }
                        }
                    ],
                    avgRating: [
                        { $match: { 'review.rating': { $exists: true, $ne: null } } },
                        { $group: { _id: null, avgRating: { $avg: "$review.rating" } } }
                    ],
                    completionRate: [
                        {
                            $group: {
                                _id: null,
                                completionRate: {
                                    $avg: {
                                        $cond: [{ $eq: ["$bookingStatus", BookingStatus.COMPLETED] }, 100, 0]
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    avgResponseTime: {
                        $floor: {
                            $ifNull: [{ $arrayElemAt: ["$responseTime.avgResponseTime", 0] }, 0]
                        }
                    },
                    onTimePercent: {
                        $floor: {
                            $ifNull: [{ $arrayElemAt: ["$onTimeArrival.onTimePercent", 0] }, 0]
                        }
                    },
                    avgRating: {
                        $round: [
                            { $ifNull: [{ $arrayElemAt: ["$avgRating.avgRating", 0] }, 0] },
                            2
                        ]
                    },
                    completionRate: {
                        $floor: {
                            $ifNull: [{ $arrayElemAt: ["$completionRate.completionRate", 0] }, 0]
                        }
                    }
                }
            }

        ]);

        return result[0];
    }

    async getBookingPerformanceData(providerId: string): Promise<IBookingPerformanceData[]> {
        return await this._bookingModel.aggregate([
            { $match: { providerId: this._toObjectId(providerId) } },
            {
                $addFields: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                }
            },
            { $match: { year: new Date().getFullYear() } },
            {
                $group: {
                    _id: "$month",
                    completed: {
                        $sum: { $cond: [{ $eq: ["$bookingStatus", BookingStatus.COMPLETED] }, 1, 0] }
                    },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ["$bookingStatus", BookingStatus.CANCELLED] }, 1, 0] }
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    month: {
                        $arrayElemAt: [
                            [
                                "",
                                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
                            ],
                            "$_id"
                        ]
                    },
                    completed: 1,
                    cancelled: 1,
                    total: 1
                }
            }
        ]);
    }

    async getRatingDistributionsByProviderId(providerId: string): Promise<IRatingDistribution[]> {
        return await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                    review: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$review.rating",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    rating: "$_id",
                    count: 1
                }
            }
        ]);
    }

    async getRecentReviews(providerId: string, limit: number = 10): Promise<BookingDocument[]> {
        return await this._bookingModel
            .find(
                { providerId: this._toObjectId(providerId), review: { $exists: true, $ne: null } },
                'review customerId'
            )
            .populate({
                path: 'customerId',
                select: 'username',
            })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    async getResponseDistributionTime(providerId: string): Promise<IResponseTimeChartData[]> {
        return await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                    respondedAt: { $exists: true, $ne: null }
                }
            },
            {
                $addFields: {
                    responseTimeInSeconds: {
                        $round: {
                            $divide: [{ $subtract: ["$respondedAt", "$createdAt"] }, 1000]
                        }
                    }
                }
            },
            {
                $bucket: {
                    groupBy: "$responseTimeInSeconds",
                    boundaries: [0, 60, 600, 3600, 86400, Number.MAX_SAFE_INTEGER],
                    default: "> 1 day",
                    output: { count: { $sum: 1 } },
                }
            }
        ]);
    }

    async getReviews(providerId: string, filters: IReviewFilter, options?: { page?: number; limit?: number }): Promise<IReviewDetailsRaw[]> {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 10;
        const skip = (page - 1) * limit;

        const baseMatch: Record<string, any> = {
            providerId: this._toObjectId(providerId),
            review: { $exists: true, $ne: null }
        };

        const pipeline: PipelineStage[] = [
            { $match: baseMatch },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer',
                },
            },
            { $unwind: '$customer' }
        ];

        if (filters.search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'customer.email': { $regex: filters.search, $options: 'i' } },
                        { 'review.desc': { $regex: filters.search, $options: 'i' } }
                    ]
                }
            });
        }

        if (filters.rating) {
            pipeline.push({
                $match: { 'review.rating': filters.rating }
            });
        }

        if (filters.time) {
            const now = new Date();
            let pastDate: Date | null = null;

            if (filters.time === 'last_6_months') pastDate = new Date(now.setMonth(now.getMonth() - 6));
            if (filters.time === 'last_year') pastDate = new Date(now.setFullYear(now.getFullYear() - 1));

            if (pastDate) {
                pipeline.push({
                    $match: { 'review.writtenAt': { $gte: pastDate } }
                });
            }
        }

        pipeline.push(
            {
                $lookup: {
                    from: 'services',
                    localField: 'services.serviceId',
                    foreignField: '_id',
                    as: 'serviceDetails',
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    desc: '$review.desc',
                    rating: '$review.rating',
                    writtenAt: '$review.writtenAt',
                    avatar: '$customer.avatar',
                    email: '$customer.email',
                    username: '$customer.username',
                    services: '$services',
                    serviceDetails: '$serviceDetails',
                },
            },
            { $sort: { writtenAt: filters.sort === 'asc' ? 1 : -1 } },
            { $skip: skip },
            { $limit: limit }
        );

        return await this._bookingModel.aggregate(pipeline);
    }


    async countReviews(providerId: string): Promise<number> {
        return await this._bookingModel.countDocuments({
            providerId: this._toObjectId(providerId),
            review: { $exists: true, $ne: null }
        });
    }

    async getOnTimeArrivalData(providerId: string): Promise<IOnTimeArrivalChartData[]> {
        return await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                    actualArrivalTime: { $exists: true, $ne: null },
                    expectedArrivalTime: { $exists: true, $ne: null },
                    bookingStatus: BookingStatus.COMPLETED
                }
            },
            {
                $addFields: {
                    monthNumber: { $month: "$actualArrivalTime" },
                    arrivalDelayInSeconds: {
                        $divide: [
                            { $subtract: ["$actualArrivalTime", "$expectedArrivalTime"] }, 1000]
                    }
                }
            },
            {
                $group: {
                    _id: "$monthNumber",
                    totalDeliveries: { $sum: 1 },
                    onTimeDeliveries: {
                        $sum: { $cond: [{ $lte: ["$arrivalDelayInSeconds", 600] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    monthNumber: "$_id",
                    percentage: {
                        $multiply: [
                            { $divide: ["$onTimeDeliveries", "$totalDeliveries"] },
                            100
                        ]
                    }
                }
            },
            { $sort: { monthNumber: 1 } }
        ]);
    }

    async getComparisonOverviewData(providerId: string): Promise<IComparisonOverviewData> {
        const providerObjId = this._toObjectId(providerId);

        const result = await this._bookingModel.aggregate([
            {
                $match: {
                    bookingStatus: BookingStatus.COMPLETED,
                    $expr: {
                        $eq: [{ $year: "$createdAt" }, new Date().getFullYear()]
                    }
                }
            },
            {
                $facet: {
                    // ----------------- Growth Rate -----------------
                    growthRate: [
                        {
                            $project: {
                                totalAmount: 1,
                                rating: { $ifNull: ["$review.rating", 0] },
                                month: { $month: "$createdAt" },
                            }
                        },
                        {
                            $group: {
                                _id: { providerId: "$providerId", month: "$month" },
                                totalCompleted: { $sum: 1 },
                                avgRating: { $avg: "$rating" },
                                revenue: { $sum: "$totalAmount" }
                            }
                        },
                        { $sort: { "_id.providerId": 1, "_id.month": 1 } },
                        {
                            $setWindowFields: {
                                partitionBy: "$_id.providerId",
                                sortBy: { "_id.month": 1 },
                                output: {
                                    prevTotal: {
                                        $shift: {
                                            by: -1,
                                            output: { $add: ["$totalCompleted", "$avgRating", "$revenue"] }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                growthRate: {
                                    $cond: [
                                        { $eq: ["$prevTotal", 0] },
                                        0,
                                        {
                                            $multiply: [
                                                {
                                                    $divide: [
                                                        { $subtract: [{ $add: ["$totalCompleted", "$avgRating", "$revenue"] }, "$prevTotal"] },
                                                        "$prevTotal"
                                                    ]
                                                },
                                                100
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                overallAvgGrowth: { $avg: "$growthRate" }
                            }
                        },
                        {
                            $project: { _id: 0, overallAvgGrowth: 1 }
                        }
                    ],

                    // ----------------- Monthly Trend -----------------
                    monthlyTrend: [
                        {
                            $match: {
                                providerId: providerObjId
                            }
                        },
                        {
                            $group: {
                                _id: { $month: "$createdAt" },
                                totalRevenue: { $sum: "$totalAmount" }
                            }
                        },
                        { $sort: { _id: -1 } },
                        { $limit: 2 },
                        { $sort: { _id: 1 } },
                        {
                            $group: {
                                _id: null,
                                months: { $push: "$_id" },
                                revenues: { $push: "$totalRevenue" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                previousMonth: { $arrayElemAt: ["$months", 0] },
                                currentMonth: { $arrayElemAt: ["$months", 1] },
                                previousRevenue: { $arrayElemAt: ["$revenues", 0] },
                                currentRevenue: { $arrayElemAt: ["$revenues", 1] },
                                growthPercentage: {
                                    $cond: [
                                        { $eq: [{ $arrayElemAt: ["$revenues", 0] }, 0] },
                                        null,
                                        {
                                            $multiply: [
                                                {
                                                    $divide: [
                                                        { $subtract: [{ $arrayElemAt: ["$revenues", 1] }, { $arrayElemAt: ["$revenues", 0] }] },
                                                        { $arrayElemAt: ["$revenues", 0] }
                                                    ]
                                                },
                                                100
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],

                    // ----------------- Provider Rank -----------------
                    providerRank: [
                        { $match: { "review.isActive": true } },
                        {
                            $group: {
                                _id: "$providerId",
                                avgRating: { $avg: "$review.rating" }
                            }
                        },
                        { $sort: { avgRating: -1 } },
                        {
                            $group: {
                                _id: null,
                                providers: { $push: { providerId: "$_id", avgRating: "$avgRating" } },
                                total: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                providerRank: {
                                    $let: {
                                        vars: {
                                            index: {
                                                $indexOfArray: ["$providers.providerId", providerObjId]
                                            }
                                        },
                                        in: {
                                            $cond: [
                                                { $lte: ["$total", 1] },
                                                100,
                                                {
                                                    $multiply: [
                                                        {
                                                            $divide: [
                                                                { $subtract: ["$total", { $add: ["$$index", 1] }] },
                                                                { $subtract: ["$total", 1] }
                                                            ]
                                                        },
                                                        100
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    growthRate: { $arrayElemAt: ["$growthRate.overallAvgGrowth", 0] },
                    monthlyTrend: { $arrayElemAt: ["$monthlyTrend", 0] },
                    providerRank: { $arrayElemAt: ["$providerRank.providerRank", 0] }
                }
            }
        ]);

        return result[0] || null;
    }


    async getComparisonData(providerId: string): Promise<IComparisonChartData[]> {
        const objectProviderId = this._toObjectId(providerId);
        const currentYear = new Date().getFullYear();

        return await this._bookingModel.aggregate([
            {
                $match: {
                    bookingStatus: BookingStatus.COMPLETED,
                    "review.isActive": true,
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                        $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`)
                    }
                }
            },
            {
                $addFields: {
                    score: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$bookingStatus", BookingStatus.COMPLETED] },
                                    { $ne: ["$actualArrivalTime", null] },
                                    { $lte: ["$actualArrivalTime", "$expectedArrivalTime"] }
                                ]
                            },
                            "$review.rating",
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, providerId: "$providerId" },
                    totalScore: { $sum: "$score" },
                    completedBookings: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.month",
                    providerData: {
                        $push: {
                            providerId: "$_id.providerId",
                            totalScore: "$totalScore",
                            completedBookings: "$completedBookings"
                        }
                    },
                    totalPlatformScore: { $sum: "$totalScore" },
                    totalProviders: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    performance: {
                        $let: {
                            vars: {
                                your: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$providerData",
                                                as: "p",
                                                cond: { $eq: ["$$p.providerId", objectProviderId] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            },
                            in: { $ifNull: ["$$your.totalScore", 0] }
                        }
                    },
                    platformAvg: {
                        $cond: [
                            { $gt: ["$totalProviders", 0] },
                            { $divide: ["$totalPlatformScore", "$totalProviders"] },
                            0
                        ]
                    }
                }
            },
            { $sort: { month: 1 } }
        ]);
    }

    async getRevenueOverview(providerId: string): Promise<IProviderRevenueOverview> {
        const result = await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                    bookingStatus: BookingStatus.COMPLETED
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    currentPeriodRevenue: {
                        $sum: {
                            $cond: [{ $eq: [{ $month: "$createdAt" }, new Date().getMonth() + 1] }, "$totalAmount", 0]
                        }
                    },
                    previousPeriodRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: [{ $month: "$createdAt" }, new Date().getMonth() === 0 ? 12 : new Date().getMonth()] },
                                "$totalAmount", 0
                            ]
                        }
                    },
                    completedTransactions: {
                        $sum: {
                            $cond: [{ $eq: ["$transactionId", null] }, 0, 1]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: { $round: { $cond: [{ $eq: ["$totalRevenue", 0] }, 0, "$totalRevenue"] } },
                    revenueGrowth: {
                        $round: {
                            $multiply: [
                                {
                                    $divide: [
                                        { $subtract: ["$currentPeriodRevenue", "$previousPeriodRevenue"] },
                                        { $round: "$previousPeriodRevenue" }
                                    ]
                                },
                                100
                            ]
                        }
                    },
                    completedTransactions: { $cond: [{ $eq: ["$completedTransactions", 0] }, 0, "$completedTransactions"] },
                    avgTransactionValue: {
                        $round: {
                            $cond: [
                                { $gt: ["$completedTransactions", 0] },
                                {
                                    $divide:
                                        ["$totalRevenue", "$completedTransactions"]
                                }, 0]
                        }
                    }
                }
            }
        ]);

        return result[0];
    }

    async getRevenueTrendOverTime(providerId: string, view: RevenueChartView): Promise<IRevenueTrendRawData> {
        const matchStage: FilterQuery<BookingDocument> = {
            bookingStatus: BookingStatus.COMPLETED,
        };

        if (view === 'monthly' || view === 'quarterly') {
            const currentYear = new Date().getFullYear();
            matchStage.createdAt = {
                $gte: new Date(currentYear, 0, 1),
                $lt: new Date(currentYear + 1, 0, 1)
            };
        }

        const getGroupId = () => {
            switch (view) {
                case 'monthly':
                    return { month: { $month: "$createdAt" } };
                case 'quarterly':
                    return { quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } } };
                case 'yearly':
                    return { year: { $year: "$createdAt" } };
            }
        };

        const aggregation: PipelineStage[] = [
            {
                $facet: {
                    providerRevenue: [
                        { $match: { ...matchStage, providerId: this._toObjectId(providerId) } },
                        { $group: { _id: getGroupId(), totalRevenue: { $sum: "$totalAmount" } } },
                        {
                            $sort: view === 'monthly' ? { "_id.month": 1 } :
                                view === 'quarterly' ? { "_id.quarter": 1 } :
                                    { "_id.year": 1 }
                        }
                    ],
                    platformAverage: [
                        {
                            $match: {
                                ...matchStage,
                                providerId: { $ne: this._toObjectId(providerId) }
                            }
                        },
                        { $group: { _id: getGroupId(), totalRevenue: { $avg: "$totalAmount" } } },
                        {
                            $sort: view === 'monthly' ? { "_id.month": 1 } :
                                view === 'quarterly' ? { "_id.quarter": 1 } :
                                    { "_id.year": 1 }
                        }
                    ]
                }
            }
        ];

        const rawResult = await this._bookingModel.aggregate(aggregation);
        const providerRevenue = rawResult[0].providerRevenue;
        const platformAverage = rawResult[0].platformAverage;

        const mapLabel = (item) => {
            if (view === 'monthly') return new Date(0, item._id.month - 1).toLocaleString('en-US', { month: 'short' });
            if (view === 'quarterly') return `Q${item._id.quarter}`;
            return item._id.year.toString();
        }

        const cleanProvider = providerRevenue.map(item => ({
            label: mapLabel(item),
            totalRevenue: item.totalRevenue
        }));

        const cleanPlatform = platformAverage.map(item => ({
            label: mapLabel(item),
            totalRevenue: item.totalRevenue
        }));

        return { providerRevenue: cleanProvider, platformAvg: cleanPlatform };
    }

    async getRevenueGrowthByMonth(providerId: string): Promise<IRevenueMonthlyGrowthRateData[]> {
        return await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                    $expr: {
                        $eq: [{ $year: "$createdAt" }, new Date().getFullYear()]
                    }
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.month": 1 } },
            {
                $setWindowFields: {
                    sortBy: { "_id.month": 1 },
                    output: {
                        prevMonthRevenue: { $shift: { output: "$totalRevenue", by: -1 } }
                    }
                }
            },
            {
                $addFields: {
                    prevMonthRevenue: { $ifNull: ["$prevMonthRevenue", 0] },
                    growthRate: {
                        $cond: [
                            { $eq: [{ $ifNull: ["$prevMonthRevenue", 0] }, 0] },
                            0,
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            { $subtract: ["$totalRevenue", "$prevMonthRevenue"] },
                                            "$prevMonthRevenue"
                                        ]
                                    },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    totalRevenue: 1,
                    growthRate: { $round: ["$growthRate", 2] }
                }
            }
        ]);
    }

    async getRevenueCompositionByServiceCategory(providerId: string): Promise<IRevenueCompositionData[]> {
        return await this._bookingModel.aggregate([
            {
                $match: { providerId: this._toObjectId(providerId) }
            },
            { $unwind: "$services" },
            {
                $addFields: {
                    "services.serviceId": { $toObjectId: "$services.serviceId" },
                }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: "services.serviceId",
                    foreignField: "_id",
                    as: "serviceDetails"
                }
            },
            {
                $unwind: {
                    path: "$serviceDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$serviceDetails.title",
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    totalRevenue: 1
                }
            }
        ]);
    }

    async getTopTenServicesByRevenue(providerId: string): Promise<ITopServicesByRevenue[]> {
        return await this._bookingModel.aggregate([
            { $match: { providerId: this._toObjectId(providerId) } },
            { $unwind: "$services" },
            {
                $addFields: {
                    "services.serviceId": { $toObjectId: "$services.serviceId" },
                }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'services.serviceId',
                    foreignField: "_id",
                    as: 'serviceDetails'
                }
            },
            { $unwind: "$serviceDetails" },
            { $unwind: "$serviceDetails.subService" },
            {
                $group: {
                    _id: "$serviceDetails.subService.title",
                    revenue: { $sum: "$totalAmount" },
                    totalBookings: { $sum: 1 },
                }
            },
            {
                $addFields: {
                    avgRevenue: {
                        $cond: {
                            if: { $eq: ["$totalBookings", 0] },
                            then: 0,
                            else: { $divide: ["$revenue", "$totalBookings"] },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    service: "$_id",
                    revenue: 1,
                    totalBookings: 1,
                    avgRevenue: 1
                }
            },
            { $sort: { revenue: 1 } },
            { $limit: 10 }
        ]);
    }

    async getNewAndReturningClientData(providerId: string): Promise<INewOrReturningClientData[]> {
        const currentYear = new Date().getFullYear();

        return await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                    bookingStatus: "completed",
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
                    }
                }
            },

            // Lookup the customer's first completed booking
            {
                $lookup: {
                    from: "bookings",
                    let: { custId: "$customerId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$customerId", "$$custId"] },
                                bookingStatus: "completed"
                            }
                        },
                        { $sort: { createdAt: 1 } },
                        { $limit: 1 }
                    ],
                    as: "firstBooking"
                }
            },

            { $unwind: "$firstBooking" },

            // Extract month and check if booking is first for this customer
            {
                $addFields: {
                    month: { $month: "$createdAt" },
                    isNewClient: {
                        $eq: [
                            { $month: "$firstBooking.createdAt" },
                            { $month: "$createdAt" }
                        ]
                    }
                }
            },

            // Group by month and new/returning
            {
                $group: {
                    _id: { month: "$month", isNewClient: "$isNewClient" },
                    count: { $sum: 1 }
                }
            },

            // Reshape data: merge new vs returning per month
            {
                $group: {
                    _id: "$_id.month",
                    newClients: {
                        $sum: { $cond: [{ $eq: ["$_id.isNewClient", true] }, "$count", 0] }
                    },
                    returningClients: {
                        $sum: { $cond: [{ $eq: ["$_id.isNewClient", false] }, "$count", 0] }
                    }
                }
            },

            // Sort by month
            { $sort: { "_id": 1 } },

            // Converting month number to readable month name
            {
                $project: {
                    _id: 0,
                    month: {
                        $arrayElemAt: [
                            ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                            { $subtract: ["$_id", 1] }
                        ]
                    },
                    newClients: 1,
                    returningClients: 1
                }
            }
        ]);
    }

    async getAreaSummaryData(providerId: string): Promise<IAreaSummary> {
        const result = await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                    bookingStatus: BookingStatus.COMPLETED
                }
            },
            {
                $addFields: {
                    areaName: {
                        $trim: {
                            input: {
                                $ifNull: [
                                    { $arrayElemAt: [{ $split: ["$location.address", ","] }, 3] },
                                    "Unknown"
                                ]
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$areaName",
                    totalBooking: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            },
            // collecting all areas with their revenue in an array for easy extraction
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: "$totalBooking" },
                    areas: {
                        $push: {
                            area: "$_id",
                            revenue: "$totalRevenue"
                        },
                    }
                }
            },
            // add top and bottom performing areas
            {
                $addFields: {
                    topPerformingArea: { $arrayElemAt: ["$areas.area", 0] },
                    underperformingArea: {
                        $arrayElemAt: ["$areas.area", { $subtract: [{ $size: "$areas" }, 1] }]
                    }
                }
            },
            // get peak booking hour from the main collection
            {
                $lookup: {
                    from: "bookings",
                    pipeline: [
                        { $match: { bookingStatus: "completed" } },
                        {
                            $group: {
                                _id: "$slot.from",
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { count: -1 } },
                        {
                            $limit: 1
                        }
                    ],
                    as: "peakHour"
                }
            },
            {
                $project: {
                    _id: 0,
                    totalBookings: 1,
                    topPerformingArea: 1,
                    underperformingArea: 1,
                    peakBookingHour: { $arrayElemAt: ["$peakHour._id", 0] }
                }
            }
        ]);

        return result[0];
    }

    async getServiceDemandData(providerId: string): Promise<IServiceDemandData[]> {
        return await this._bookingModel.aggregate([
            { $match: { providerId: this._toObjectId(providerId) } },
            {
                $group: {
                    _id: {
                        day: { $dayOfWeek: "$createdAt" }, // 1 (Sunday) to 7 (Saturday)
                        hour: { $hour: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    day: {
                        $arrayElemAt: [
                            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                            { $subtract: ["$_id.day", 1] }
                        ]
                    },
                    hour: {
                        $concat: [
                            { $toString: "$_id.hour" },
                            ":00"
                        ]
                    },
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { day: 1, hour: 1 } }
        ]);
    }

    async getServiceDemandByLocation(providerId: string): Promise<ILocationRevenue[]> {
        const now = new Date();
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        return await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                    bookingStatus: BookingStatus.COMPLETED,
                    createdAt: { $gte: previousMonthStart }
                }
            },
            {
                $addFields: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                }
            },
            {
                $group: {
                    _id: {
                        locationName: "$location.address",
                        year: "$year",
                        month: "$month"
                    },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            {
                $group: {
                    _id: "$_id.locationName",
                    monthlyData: {
                        $push: {
                            month: "$_id.month",
                            year: "$_id.year",
                            totalRevenue: "$totalRevenue"
                        }
                    }
                }
            },
            {
                $project: {
                    locationName: "$_id",
                    monthlyData: 1,
                    _id: 0
                }
            },
            {
                $addFields: {
                    current: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$monthlyData",
                                    cond: { $eq: ["$$this.month", now.getMonth() + 1] }
                                }
                            },
                            0
                        ]
                    },
                    previous: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$monthlyData",
                                    cond: { $eq: ["$$this.month", now.getMonth()] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    locationName: 1,
                    totalRevenue: "$current.totalRevenue",
                    previousRevenue: "$previous.totalRevenue",
                    changePct: {
                        $cond: [
                            { $and: [{ $ifNull: ["$previous.totalRevenue", false] }, { $ne: ["$previous.totalRevenue", 0] }] },
                            {
                                $round: [
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    { $subtract: ["$current.totalRevenue", "$previous.totalRevenue"] },
                                                    "$previous.totalRevenue"
                                                ]
                                            },
                                            100
                                        ]
                                    },
                                    2
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);
    }

    async getTopAreasRevenue(providerId: string): Promise<ITopAreaRevenue[]> {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        return await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                    bookingStatus: BookingStatus.COMPLETED,
                    createdAt: { $gte: startOfLastMonth, $lte: now }
                }
            },
            {
                $addFields: {
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' }
                }
            },
            {
                $group: {
                    _id: { locationName: '$location.address', month: '$month', year: '$year' },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            },
            {
                $group: {
                    _id: '$_id.locationName',
                    monthlyData: {
                        $push: {
                            month: '$_id.month',
                            year: '$_id.year',
                            totalRevenue: '$totalRevenue'
                        }
                    }
                }
            },
            {
                $project: {
                    locationName: '$_id',
                    _id: 0,
                    totalRevenue: {
                        $let: {
                            vars: {
                                currentMonth: {
                                    $first: {
                                        $filter: {
                                            input: '$monthlyData',
                                            as: 'm',
                                            cond: {
                                                $and: [
                                                    { $eq: ['$$m.month', now.getMonth() + 1] },
                                                    { $eq: ['$$m.year', now.getFullYear()] }
                                                ]
                                            }
                                        }
                                    }
                                },
                                lastMonth: {
                                    $first: {
                                        $filter: {
                                            input: '$monthlyData',
                                            as: 'm',
                                            cond: {
                                                $and: [
                                                    { $eq: ['$$m.month', now.getMonth()] },
                                                    { $eq: ['$$m.year', now.getFullYear()] }
                                                ]
                                            }
                                        }
                                    }
                                }
                            },
                            in: '$$currentMonth.totalRevenue'
                        }
                    },
                    prevRevenue: {
                        $let: {
                            vars: {
                                lastMonth: {
                                    $first: {
                                        $filter: {
                                            input: '$monthlyData',
                                            as: 'm',
                                            cond: {
                                                $and: [
                                                    { $eq: ['$$m.month', now.getMonth()] },
                                                    { $eq: ['$$m.year', now.getFullYear()] }
                                                ]
                                            }
                                        }
                                    }
                                }
                            },
                            in: '$$lastMonth.totalRevenue'
                        }
                    }
                }
            },
            {
                $addFields: {
                    changePct: {
                        $cond: [
                            { $or: [{ $eq: ['$prevRevenue', 0] }, { $not: ['$prevRevenue'] }] },
                            0,
                            {
                                $multiply: [
                                    { $divide: [{ $subtract: ['$totalRevenue', '$prevRevenue'] }, '$prevRevenue'] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            },
            {
                $project: {
                    locationName: 1,
                    totalRevenue: 1,
                    changePct: { $round: ['$changePct', 2] }
                }
            }
        ]);
    }

    async getUnderperformingAreas(providerId: string): Promise<IUnderperformingArea[]> {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        return await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                    bookingStatus: BookingStatus.COMPLETED,
                    createdAt: { $gte: lastMonthStart }
                }
            },
            {
                // Group by location address and month/year
                $group: {
                    _id: {
                        locationName: '$location.address',
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            },
            {
                // Reshape data per location
                $group: {
                    _id: '$_id.locationName',
                    revenues: {
                        $push: {
                            month: '$_id.month',
                            year: '$_id.year',
                            totalRevenue: '$totalRevenue'
                        }
                    }
                }
            },
            {
                // Project last month, current month, and change
                $project: {
                    locationName: '$_id',
                    lastMonthRevenue: {
                        $let: {
                            vars: {
                                lm: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$revenues',
                                                as: 'r',
                                                cond: {
                                                    $and: [
                                                        { $eq: ['$$r.year', lastMonthStart.getFullYear()] },
                                                        { $eq: ['$$r.month', lastMonthStart.getMonth() + 1] }
                                                    ]
                                                }
                                            }
                                        },
                                        0
                                    ]
                                }
                            },
                            in: { $ifNull: ['$$lm.totalRevenue', 0] }
                        }
                    },
                    currentMonthRevenue: {
                        $let: {
                            vars: {
                                cm: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$revenues',
                                                as: 'r',
                                                cond: {
                                                    $and: [
                                                        { $eq: ['$$r.year', currentMonthStart.getFullYear()] },
                                                        { $eq: ['$$r.month', currentMonthStart.getMonth() + 1] }
                                                    ]
                                                }
                                            }
                                        },
                                        0
                                    ]
                                }
                            },
                            in: { $ifNull: ['$$cm.totalRevenue', 0] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    changePct: {
                        $round: {
                            $cond: [
                                { $eq: ['$lastMonthRevenue', 0] },
                                0,
                                {
                                    $multiply: [
                                        { $divide: [{ $subtract: ['$currentMonthRevenue', '$lastMonthRevenue'] }, '$lastMonthRevenue'] },
                                        100
                                    ]
                                }
                            ]
                        }
                    }
                }
            },
            { $sort: { changePct: 1 } }
        ]);
    }

    async getPeakServiceTime(providerId: string): Promise<IPeakServiceTime[]> {
        return await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                    bookingStatus: BookingStatus.COMPLETED,
                    "expectedArrivalTime": { $exists: true, $ne: null }
                }
            },
            {
                $addFields: {
                    hour: { $hour: "$expectedArrivalTime" },
                    dayOfWeek: { $isoDayOfWeek: "$expectedArrivalTime" }
                }
            },
            {
                $group: {
                    _id: "$hour",
                    weekdayBookings: {
                        $sum: {
                            $cond: [{ $lte: ["$dayOfWeek", 5] }, 1, 0]
                        }
                    },
                    weekendBookings: {
                        $sum: {
                            $cond: [{ $gte: ["$dayOfWeek", 6] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    hour: '$_id',
                    weekdayBookings: 1,
                    weekendBookings: 1
                }
            },
            { $sort: { hour: 1 } }
        ]);
    }

    async getRevenueBreakdown(providerId: string): Promise<IRevenueBreakdown> {
        const providerIdObj = this._toObjectId(providerId);

        const result = await this._bookingModel.aggregate([
            {
                $facet: {
                    bookings: [
                        { $match: { providerId: providerIdObj } },
                        {
                            $group: {
                                _id: null,
                                completedCount: {
                                    $sum: { $cond: [{ $eq: ['$paymentStatus', PaymentStatus.PAID] }, 1, 0] }
                                },
                                pendingCount: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $ne: ['$bookingStatus', BookingStatus.COMPLETED] },
                                                    { $ne: ['$bookingStatus', BookingStatus.CANCELLED] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    earnings: [
                        {
                            $lookup: {
                                from: 'transactions',
                                localField: 'providerId',
                                foreignField: 'userId',
                                as: 'transactions'
                            }
                        },
                        { $unwind: '$transactions' },
                        {
                            $match: {
                                'transactions.transactionType': 'booking_release',
                                'transactions.direction': 'credit',
                                'transactions.userId': providerIdObj
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalEarnings: { $sum: { $divide: ['$transactions.amount', 100] } }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    totalEarnings: { $ifNull: [{ $arrayElemAt: ['$earnings.totalEarnings', 0] }, 0] },
                    completedCount: { $ifNull: [{ $arrayElemAt: ['$bookings.completedCount', 0] }, 0] },
                    pendingCount: { $ifNull: [{ $arrayElemAt: ['$bookings.pendingCount', 0] }, 0] }
                }
            }
        ]);

        return result[0];
    }

    async getBookingsBreakdown(providerId: string): Promise<IBookingsBreakdown> {
        const result = await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                }
            },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    upcomingBookings: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$bookingStatus', BookingStatus.COMPLETED] },
                                        { $ne: ['$bookingStatus', BookingStatus.CANCELLED] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    cancelledBookings: {
                        $sum: {
                            $cond: [{ $eq: ['$bookingStatus', BookingStatus.CANCELLED] }, 1, 0]
                        }
                    },
                    totalAmount: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalBookings: 1,
                    upcomingBookings: 1,
                    cancelledBookings: 1,
                    averageBookingValue: {
                        $cond: [
                            { $eq: ['$totalBookings', 0] },
                            0,
                            { $divide: ['$totalAmount', '$totalBookings'] }
                        ]
                    }
                }
            }
        ]);

        return result[0]
    }

    async getBookingsCompletionRate(providerId: string): Promise<number> {
        const result = await this._bookingModel.aggregate([
            {
                $match: {
                    providerId: this._toObjectId(providerId),
                }
            },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    completedCount: {
                        $sum: {
                            $cond: [{ $eq: ['$bookingStatus', BookingStatus.COMPLETED] }, 1, 0]
                        }
                    },
                    cancelledCount: {
                        $sum: {
                            $cond: [{ $eq: ['$bookingStatus', BookingStatus.CANCELLED] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    completionRate: {
                        $multiply: [
                            {
                                $cond: [
                                    {
                                        $lte: [
                                            {
                                                $subtract: [
                                                    { $ifNull: ['$totalBookings', 0] },
                                                    { $ifNull: ['$cancelledCount', 0] }
                                                ]
                                            },
                                            0
                                        ]
                                    },
                                    0,
                                    {
                                        $divide: [
                                            { $ifNull: ['$completedCount', 0] },
                                            {
                                                $subtract: [
                                                    { $ifNull: ['$totalBookings', 0] },
                                                    { $ifNull: ['$cancelledCount', 0] }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            100
                        ]
                    }
                }
            }
        ]);

        return result?.[0]?.completionRate ?? 0;
    }

    async isAnyBookingOngoing(customerId: string, providerId: string): Promise<boolean> {
        const exists = await this._bookingModel.exists({
            customerId: this._toObjectId(customerId),
            providerId: this._toObjectId(providerId),
            bookingStatus: {
                $in: [
                    BookingStatus.PENDING,
                    BookingStatus.CONFIRMED,
                    BookingStatus.IN_PROGRESS,
                ]
            },
        });
        return Boolean(exists);
    }

    async fetchBookingsByProviderOnSameDate(customerId: string, providerId: string, date: Date | string): Promise<BookingDocument[]> {
        const formattedDate = new Date(date);
        formattedDate.setHours(0, 0, 0, 0);

        return this._bookingModel.find({
            customerId: this._toObjectId(customerId),
            providerId: this._toObjectId(providerId),
            'slot.date': formattedDate,
        });
    }

    async findAllBookingsByProviderOnSameDate(providerId: string, date: Date | string): Promise<BookingDocument[]> {
        const formattedDate = new Date(date);
        formattedDate.setHours(0, 0, 0, 0);

        return this._bookingModel.find({
            providerId: this._toObjectId(providerId),
            'slot.date': formattedDate,
            bookingStatus: { $ne: BookingStatus.CANCELLED },
            paymentStatus: { $ne: PaymentStatus.FAILED }
        });
    }

    async completedBookingsCount(providerId: string): Promise<number> {
        return await this._bookingModel.countDocuments({
            providerId: this._toObjectId(providerId),
            bookingStatus: BookingStatus.COMPLETED
        });
    }

    async getAdminReviews(filter: IReviewFilters): Promise<PaginatedReviewResponse> {
        const page = filter.page || 1;

        const limit = 10;
        const skip = (page - 1) * limit;

        const match: FilterQuery<BookingDocument> = {
            review: { $exists: true, $ne: null }
        };

        if (filter.minRating) {
            match['review.rating'] = { $gte: Number(filter.minRating) };
        }

        const pipeline: PipelineStage[] = [];

        pipeline.push(
            { $match: match },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $lookup: {
                    from: 'providers',
                    localField: 'providerId',
                    foreignField: '_id',
                    as: 'provider'
                }
            },
            { $unwind: '$provider' }
        );

        if (filter.search) {
            const searchRegex = new RegExp(this._escapeRegex(filter.search), 'i');
            if (filter.searchBy === 'review id') {
                pipeline.push({
                    $match: {
                        $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: searchRegex } }
                    }
                });
            // } else if (filter.searchBy === 'customer') {
            //     pipeline.push({ $match: { 'customer.username': searchRegex } });
            } else if (filter.searchBy === 'provider') {
                pipeline.push({ $match: { 'provider.username': searchRegex } });
            } else if (filter.searchBy === 'content') {
                pipeline.push({ $match: { 'review.desc': searchRegex } });
            } else {
                pipeline.push({
                    $match: {
                        $or: [
                            { 'customer.username': searchRegex },
                            { 'provider.username': searchRegex },
                            { 'review.desc': searchRegex }
                        ]
                    }
                });
            }
        }

        const countPipeline = [...pipeline, { $count: 'total' }];
        const [totalCountResult] = await this._bookingModel.aggregate(countPipeline);
        const total = totalCountResult?.total ?? 0;

        const sort: Record<string, 1 | -1> = {};
        if (filter.sortBy === 'highest') sort['review.rating'] = -1;
        else if (filter.sortBy === 'lowest') sort['review.rating'] = 1;
        else if (filter.sortBy === 'oldest') sort['review.writtenAt'] = 1;
        else sort['review.writtenAt'] = -1;

        pipeline.push(
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    reviewId: { $toString: '$_id' },
                    reviewedBy: {
                        customerId: { $toString: '$customer._id' },
                        customerName: '$customer.username',
                        customerEmail: '$customer.email',
                        customerAvatar: '$customer.avatar'
                    },
                    providerId: { $toString: '$provider._id' },
                    providerName: '$provider.username',
                    providerEmail: '$provider.email',
                    providerAvatar: { $ifNull: ['$provider.avatar', ''] },
                    isReported: '$review.isReported',
                    desc: '$review.desc',
                    rating: '$review.rating',
                    writtenAt: '$review.writtenAt',
                    isActive: '$review.isActive'

                }
            }
        );

        const reviews = await this._bookingModel.aggregate(pipeline);

        return {
            reviews,
            pagination: {
                total,
                page,
                limit,
            }
        };
    }

    async getAdminReviewStats(): Promise<IAdminReviewStats> {
        const result = await this._bookingModel.aggregate([
            { $match: { review: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    activeReviews: {
                        $sum: { $cond: [{ $eq: ["$review.isActive", true] }, 1, 0] }
                    },
                    reportedReviews: {
                        $sum: { $cond: [{ $eq: ["$review.isReported", true] }, 1, 0] }
                    },
                    averageRating: { $avg: "$review.rating" }
                }
            }
        ]);

        return result[0] ? {
            totalReviews: result[0].totalReviews,
            activeReviews: result[0].activeReviews,
            reportedReviews: result[0].reportedReviews,
            averageRating: Math.round((result[0].averageRating || 0) * 10) / 10
        } : {
            totalReviews: 0,
            activeReviews: 0,
            reportedReviews: 0,
            averageRating: 0
        };
    }

    async updateReviewStatus(reviewId: string, status: boolean): Promise<boolean> {
        const result = await this._bookingModel.updateOne(
            { _id: this._toObjectId(reviewId) },
            { $set: { 'review.isActive': status } }
        );
        return result.modifiedCount > 0;
    }
}

