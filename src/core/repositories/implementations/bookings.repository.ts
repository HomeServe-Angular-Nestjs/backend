import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BOOKINGS_MODEL_NAME } from '@core/constants/model.constant';
import { IBookingStats, IRatingDistribution, IRevenueMonthlyGrowthRateData, IRevenueTrendRawData, RevenueChartView, IRevenueCompositionData, ITopServicesByRevenue, INewOrReturningClientData, IAreaSummary, IServiceDemandData, ILocationRevenue, ITopAreaRevenue } from '@core/entities/interfaces/booking.entity.interface';
import { IBookingPerformanceData, IComparisonChartData, IComparisonOverviewData, IOnTimeArrivalChartData, IProviderRevenueOverview, IResponseTimeChartData, ITopProviders, ITotalReviewAndAvgRating } from '@core/entities/interfaces/user.entity.interface';
import { BookingDocument, SlotDocument } from '@core/schema/bookings.schema';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { IBookingReportData, IReportCustomerMatrix, IReportDownloadBookingData, IReportProviderMatrix } from '@core/entities/interfaces/admin.entity.interface';
import { SlotStatusEnum } from '@core/enum/slot.enum';
import { BookingStatus, CancelStatus, PaymentStatus } from '@core/enum/bookings.enum';

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

    async updateSlotStatus(ruleId: string, from: string, to: string, dateISO: string, status: SlotStatusEnum): Promise<boolean> {
        return !!(await this._bookingModel.findOneAndUpdate(
            {
                'slot.ruleId': this._toObjectId(ruleId),
                'slot.from': from,
                'slot.to': to,
                'slot.date': new Date(dateISO),
                'slot.status': status
            },
            {
                $set: { 'slot.status': SlotStatusEnum.PENDING }
            },
            { new: true }
        ));
    }

    async cancelBooking(bookingId: string, reason: string): Promise<BookingDocument | null> {
        return await this._bookingModel.findOneAndUpdate(
            {
                _id: bookingId,
                bookingStatus: { $ne: BookingStatus.CANCELLED }
            },
            {
                $set: {
                    cancelStatus: CancelStatus.IN_PROGRESS,
                    cancellationReason: reason,
                    cancelledAt: new Date(),
                    'slot.status': SlotStatusEnum.AVAILABLE
                }
            },
            { new: true }
        );
    }

    async updatePaymentStatus(bookingId: string, status: PaymentStatus, transactionId: string): Promise<BookingDocument | null> {
        return this._bookingModel.findOneAndUpdate(
            { _id: bookingId },
            {
                $set: {
                    paymentStatus: status,
                    transactionId: this._toObjectId(transactionId)
                }
            },
            { new: true }
        );
    }

    async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<BookingDocument | null> {
        const updateData: Record<string, string | Date> = { bookingStatus: status };

        if (status === BookingStatus.IN_PROGRESS) {
            updateData.respondedAt = new Date();
        }

        return await this._bookingModel.findOneAndUpdate(
            { _id: bookingId },
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
            { $match: { providerId: this._toObjectId(providerId) } },
            {
                $group: {
                    _id: null,
                    avg: { $avg: "$review.rating" }
                },
                $project: { avg: 1 }
            },
        ]);

        return result[0].avg ?? 0
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
}