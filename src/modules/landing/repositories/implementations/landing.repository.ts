import { Model, PipelineStage } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
    BOOKINGS_MODEL_NAME, CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME,
    PROVIDER_SERVICE_MODEL_NAME, SERVICE_CATEGORY_MODEL_NAME
} from '@core/constants/model.constant';
import { BookingDocument } from '@core/schema/bookings.schema';
import { ProviderDocument } from '@core/schema/provider.schema';
import { ProviderServiceDocument } from '@core/schema/provider-service.schema';
import { ServiceCategoryDocument } from '@core/schema/service-category';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import {
    ILandingCategory, ILandingFeaturedProvider, ILandingStatistics, ILandingTestimonial
} from '@core/entities/interfaces/landing.entity.interface';
import { ILandingRepository } from '@modules/landing/repositories/interfaces/landing-repository.interface';

@Injectable()
export class LandingRepository extends BaseRepository<BookingDocument> implements ILandingRepository {
    constructor(
        @InjectModel(BOOKINGS_MODEL_NAME)
        private readonly _bookingModel: Model<BookingDocument>,
        @InjectModel(PROVIDER_MODEL_NAME)
        private readonly _providerModel: Model<ProviderDocument>,
        @InjectModel(PROVIDER_SERVICE_MODEL_NAME)
        private readonly _providerServiceModel: Model<ProviderServiceDocument>,
        @InjectModel(SERVICE_CATEGORY_MODEL_NAME)
        private readonly _serviceCategoryModel: Model<ServiceCategoryDocument>,
        @InjectModel(CUSTOMER_MODEL_NAME)
        private readonly _customerModel: Model<any>,
    ) {
        super(_bookingModel);
    }

    async getStatistics(): Promise<ILandingStatistics> {
        const [completedJobs, verifiedProviders, ratingResult, totalCategories] = await Promise.all([
            this._bookingModel.countDocuments({ bookingStatus: 'completed' }),
            this._providerModel.countDocuments({
                verificationStatus: 'verified',
                isActive: true,
                isDeleted: false,
            }),
            this._bookingModel.aggregate<{ avg: number }>([
                { $match: { review: { $exists: true, $ne: null }, 'review.isActive': true } },
                { $group: { _id: null, avg: { $avg: '$review.rating' } } },
            ]),
            this._serviceCategoryModel.countDocuments({ isActive: true, isDeleted: false }),
        ]);

        return {
            completedJobs,
            verifiedProviders,
            averageRating: Math.round((ratingResult?.[0]?.avg ?? 0) * 10) / 10,
            totalCategories,
        };
    }

    async getPopularCategories(): Promise<ILandingCategory[]> {
        const [categorySupply, categoryActivity] = await Promise.all([
            this._providerServiceModel.aggregate([
                { $match: { isDeleted: false, isActive: true } },
                {
                    $group: {
                        _id: '$categoryId',
                        providerIds: { $addToSet: '$providerId' },
                        startingPrice: { $min: '$price' },
                    },
                },
                {
                    $lookup: {
                        from: 'servicecategories',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'cat',
                    },
                },
                { $unwind: '$cat' },
                { $match: { 'cat.isActive': true, 'cat.isDeleted': false } },
                {
                    $project: {
                        _id: 0,
                        categoryId: { $toString: '$_id' },
                        name: '$cat.name',
                        providerCount: { $size: '$providerIds' },
                        startingPrice: 1,
                    },
                },
            ] as PipelineStage[]),
            this._bookingModel.aggregate([
                { $unwind: '$services' },
                {
                    $lookup: {
                        from: 'providerservices',
                        localField: 'services',
                        foreignField: '_id',
                        as: 'svc',
                    },
                },
                { $unwind: '$svc' },
                {
                    $addFields: {
                        ratingValue: {
                            $cond: [
                                {
                                    $and: [
                                        { $ifNull: ['$review', null] },
                                        { $eq: [{ $ifNull: ['$review.isActive', false] }, true] },
                                    ],
                                },
                                { $ifNull: ['$review.rating', null] },
                                null,
                            ],
                        },
                        ratedCount: {
                            $cond: [
                                {
                                    $and: [
                                        { $ifNull: ['$review', null] },
                                        { $eq: [{ $ifNull: ['$review.isActive', false] }, true] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
                {
                    $group: {
                        _id: '$svc.categoryId',
                        bookingCount: { $sum: 1 },
                        totalRating: { $sum: { $ifNull: ['$ratingValue', 0] } },
                        ratedCount: { $sum: '$ratedCount' },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        categoryId: { $toString: '$_id' },
                        bookingCount: 1,
                        avgRating: {
                            $cond: [
                                { $eq: ['$ratedCount', 0] },
                                0,
                                { $divide: ['$totalRating', '$ratedCount'] },
                            ],
                        },
                    },
                },
            ] as PipelineStage[]),
        ]);

        const activityMap = new Map<string, { bookingCount: number; avgRating: number }>();
        categoryActivity.forEach(item => {
            activityMap.set(item.categoryId, {
                bookingCount: item.bookingCount,
                avgRating: item.avgRating,
            });
        });

        return categorySupply
            .map(cat => {
                const activity = activityMap.get(cat.categoryId);
                return {
                    categoryId: cat.categoryId,
                    name: cat.name,
                    providerCount: cat.providerCount,
                    startingPrice: cat.startingPrice,
                    bookingCount: activity?.bookingCount ?? 0,
                    avgRating: Math.round((activity?.avgRating ?? 0) * 10) / 10,
                };
            })
            .sort((a, b) => b.bookingCount - a.bookingCount)
            .slice(0, 8);
    }

    async getFeaturedProviders(): Promise<ILandingFeaturedProvider[]> {
        const result = await this._providerModel.aggregate<ILandingFeaturedProvider>([
            {
                $match: {
                    verificationStatus: 'verified',
                    isActive: true,
                    isDeleted: false,
                },
            },
            {
                $lookup: {
                    from: 'bookings',
                    let: { pid: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$providerId', '$$pid'] },
                                review: { $ne: null },
                                'review.isActive': true,
                            },
                        },
                        { $project: { rating: '$review.rating' } },
                    ],
                    as: 'reviews',
                },
            },
            {
                $addFields: {
                    reviewCount: { $size: '$reviews' },
                    avgRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] },
                },
            },
            {
                $lookup: {
                    from: 'bookings',
                    let: { pid: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$providerId', '$$pid'] },
                                bookingStatus: 'completed',
                            },
                        },
                        { $project: { _id: 1 } },
                    ],
                    as: 'completed',
                },
            },
            { $addFields: { completedJobs: { $size: '$completed' } } },
            { $sort: { avgRating: -1, reviewCount: -1 } },
            { $limit: 6 },
            {
                $project: {
                    _id: 0,
                    id: { $toString: '$_id' },
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                    profession: 1,
                    experience: 1,
                    address: 1,
                    isCertified: 1,
                    avgRating: 1,
                    reviewCount: 1,
                    completedJobs: 1,
                },
            },
        ] as PipelineStage[]);

        return result.map(p => ({ ...p, avgRating: Math.round((p.avgRating ?? 0) * 10) / 10 }));
    }

    async getTestimonials(): Promise<ILandingTestimonial[]> {
        const result = await this._bookingModel.aggregate<ILandingTestimonial>([
            {
                $match: {
                    review: { $ne: null },
                    'review.isActive': true,
                    'review.rating': { $gte: 4 },
                },
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer',
                },
            },
            { $unwind: '$customer' },
            {
                $lookup: {
                    from: 'providerservices',
                    localField: 'services',
                    foreignField: '_id',
                    as: 'svc',
                },
            },
            {
                $addFields: {
                    firstCategoryId: { $arrayElemAt: ['$svc.categoryId', 0] },
                },
            },
            {
                $lookup: {
                    from: 'servicecategories',
                    localField: 'firstCategoryId',
                    foreignField: '_id',
                    as: 'cat',
                },
            },
            { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
            { $sort: { 'review.writtenAt': -1 } },
            { $limit: 6 },
            {
                $project: {
                    _id: 0,
                    customerName: '$customer.fullname',
                    customerAvatar: '$customer.avatar',
                    rating: '$review.rating',
                    text: '$review.desc',
                    serviceName: { $ifNull: ['$cat.name', 'Home Service'] },
                    date: '$review.writtenAt',
                },
            },
        ] as PipelineStage[]);

        return result.map(t => ({
            ...t,
            date: t.date ? new Date(t.date) : new Date(),
        }));
    }

    async searchCategories(text: string): Promise<ServiceCategoryDocument[]> {
        const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const prefix = `^${escaped}`;

        return this._serviceCategoryModel.find({
            isDeleted: false,
            isActive: true,
            $or: [
                { name: { $regex: prefix, $options: "i" } },
                { keywords: { $regex: prefix, $options: "i" } }
            ]
        }).lean();
    }
}