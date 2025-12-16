import { FilterQuery, Model, PipelineStage } from 'mongoose';

import { SUBSCRIPTION_MODEL_NAME } from '@core/constants/model.constant';
import { IAdminDashboardSubscription } from '@core/entities/interfaces/admin.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ISubscriptionRepository } from '@core/repositories/interfaces/subscription-repo.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubscriptionDocument } from '@core/schema/subscription.schema';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { TransactionDocument } from '@core/schema/bookings.schema';
import { IAdminSubscriptionList, ISubscriptionFilters } from '@core/entities/interfaces/subscription.entity.interface';

@Injectable()
export class SubscriptionRepository extends BaseRepository<SubscriptionDocument> implements ISubscriptionRepository {
    constructor(
        @InjectModel(SUBSCRIPTION_MODEL_NAME)
        private readonly _subscriptionModel: Model<SubscriptionDocument>
    ) {
        super(_subscriptionModel);
    }

    private _escapeRegex(input: string): string {
        return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async _getFilterQuery(filters: ISubscriptionFilters): Promise<FilterQuery<SubscriptionDocument>> {
        const match: FilterQuery<SubscriptionDocument> = { isDeleted: false };

        if (filters.search) {
            const escaped = this._escapeRegex(filters.search);
            const searchRegex = new RegExp(escaped, 'i');

            match.$or = [
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$_id" },
                            regex: searchRegex
                        }
                    }
                },
                { 'userDetails.email': searchRegex }
            ];
        }

        if (filters.payment && filters.payment !== 'all') {
            match.paymentStatus = filters.payment;
        }

        if (filters.duration && filters.duration !== 'all') {
            match.duration = filters.duration;
        }

        return match;
    }

    async getSubscriptionChartData(): Promise<IAdminDashboardSubscription> {
        const result = await this._subscriptionModel.aggregate([
            {
                $group: {
                    _id: {
                        name: "$name",
                        duration: "$duration",
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    free: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.name", "free"] }, "$count", 0]
                        }
                    },
                    totalPremium: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.name", "premium"] }, "$count", 0]
                        }
                    },
                    monthlyPremium: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$_id.name", "premium"] },
                                        { $eq: ["$_id.duration", "monthly"] }
                                    ]
                                },
                                "$count",
                                0
                            ]
                        }
                    },
                    yearlyPremium: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$_id.name", "premium"] },
                                        { $eq: ["$_id.duration", "yearly"] }
                                    ]
                                },
                                "$count",
                                0
                            ]
                        }
                    }
                },
            },
            {
                $project: {
                    _id: 0,
                    free: 1,
                    totalPremium: 1,
                    monthlyPremium: 1,
                    yearlyPremium: 1
                }
            }
        ]);

        return result.length > 0 ? result[0] : {
            free: 0,
            totalPremium: 0,
            monthlyPremium: 0,
            yearlyPremium: 0
        };
    }

    async findSubscription(userId: string, userType: string): Promise<SubscriptionDocument | null> {
        return await this._subscriptionModel.findOne(
            {
                userId: this._toObjectId(userId),
                role: userType,
                isActive: true
            }
        );
    }

    async findSubscriptionById(subscriptionId: string): Promise<SubscriptionDocument | null> {
        return await this._subscriptionModel.findOne({ _id: subscriptionId });
    }

    async count(): Promise<number> {
        return await this._subscriptionModel.countDocuments();
    }

    async fetchCurrentActiveSubscription(subscriptionId: string): Promise<SubscriptionDocument | null> {
        return await this._subscriptionModel.findOne(
            {
                _id: subscriptionId,
                isActive: true,
                isDeleted: false,
                endDate: { $lte: new Date() }
            }
        );
    }

    async updatePaymentStatus(subscriptionId: string, status: PaymentStatus): Promise<boolean> {
        const result = await this._subscriptionModel.updateOne(
            { _id: subscriptionId },
            {
                $set: {
                    paymentStatus: status,
                    isActive: true
                }
            }
        );

        return result.modifiedCount === 1;
    }

    async cancelSubscriptionByUserId(userId: string, userType: string): Promise<boolean> {
        const result = await this._subscriptionModel.updateMany(
            {
                userId: this._toObjectId(userId),
                role: userType,
                isActive: true,
            },
            {
                $set: {
                    cancelledAt: new Date(),
                    isActive: false
                }
            }
        );

        return result.modifiedCount >= 1;
    }

    async findActiveSubscriptionByUserId(userId: string, userType: string): Promise<SubscriptionDocument | null> {
        const now = new Date();

        return await this._subscriptionModel.findOne(
            {
                userId: this._toObjectId(userId),
                role: userType,
                isActive: true,
                isDeleted: false,
                paymentStatus: PaymentStatus.PAID,
                startTime: { $lte: now },
                endDate: { $gte: now }
            }
        );
    }

    async removeSubscriptionById(subscriptionId: string): Promise<boolean> {
        const result = await this._subscriptionModel.deleteOne({ _id: subscriptionId });
        return result && result.deletedCount == 1;
    }

    async createNewTransactionBySubscriptionId(subscriptionId: string, transaction: Partial<TransactionDocument>): Promise<TransactionDocument | null> {
        const result = await this._subscriptionModel.findOneAndUpdate(
            { _id: subscriptionId },
            { $push: { transactionHistory: transaction } },
            {
                new: true,
                runValidators: true,
                projection: { transactionHistory: 1 }
            }
        );
        console.log('mongo: ', result);
        if (!result || result.transactionHistory.length < 1) return null;

        const history = result.transactionHistory;

        return history.slice(-1)[0];
    }

    async findFilteredSubscriptionWithPagination(filters: ISubscriptionFilters, options?: { page?: number; limit?: number; }): Promise<IAdminSubscriptionList[]> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        const matchQuery = await this._getFilterQuery(filters);
        const pipeline: PipelineStage[] = [];

        pipeline.push(
            {
                $lookup: {
                    from: "providers",
                    localField: "userId",
                    foreignField: "_id",
                    as: "provider"
                }
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "userId",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            {
                $addFields: {
                    userDetails: {
                        $cond: [
                            { $gt: [{ $size: "$provider" }, 0] },
                            { $arrayElemAt: ["$provider", 0] },
                            { $arrayElemAt: ["$customer", 0] }
                        ]
                    }
                }
            },
            { $unset: ["provider", "customer"] },
            { $match: matchQuery },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        );

        pipeline.push(
            {
                $project: {
                    _id: 0,
                    subscriptionId: '$_id',
                    user: {
                        email: '$userDetails.email',
                        role: '$role'
                    },
                    plan: {
                        name: '$name',
                        duration: '$duration'
                    },
                    amount: '$price',
                    status: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [
                                            { $ne: ['$endDate', null] },
                                            { $lt: ['$endDate', '$$NOW'] }
                                        ]
                                    },
                                    then: 'expired'
                                },
                                {
                                    case: { $eq: ["$isActive", true] },
                                    then: "active"
                                },
                            ],
                            default: 'inactive'
                        }
                    },
                    isActive: 1,
                    paymentStatus: 1,
                    renewalType: 1,
                    validity: {
                        start: '$startTime',
                        end: '$endDate'
                    }
                }
            });

        const result = await this._subscriptionModel.aggregate(pipeline);
        return result;
    }

    async updateSubscriptionStatus(subscriptionId: string, status: boolean): Promise<boolean> {
        const result = await this._subscriptionModel.updateOne(
            { _id: subscriptionId },
            { $set: { isActive: status } }
        );

        return result.modifiedCount === 1;
    }
}