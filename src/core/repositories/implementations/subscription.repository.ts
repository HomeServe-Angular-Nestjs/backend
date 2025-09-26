import { Model } from 'mongoose';

import { SUBSCRIPTION_MODEL_NAME } from '@core/constants/model.constant';
import { IAdminDashboardSubscription } from '@core/entities/interfaces/admin.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ISubscriptionRepository } from '@core/repositories/interfaces/subscription-repo.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubscriptionDocument } from '@core/schema/subscription.schema';
import { PlanRoleEnum } from '@core/enum/subscription.enum';
import { PaymentStatus } from '@core/enum/bookings.enum';

@Injectable()
export class SubscriptionRepository extends BaseRepository<SubscriptionDocument> implements ISubscriptionRepository {
    constructor(
        @InjectModel(SUBSCRIPTION_MODEL_NAME)
        private readonly _subscriptionModel: Model<SubscriptionDocument>
    ) {
        super(_subscriptionModel);
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

    async findSubscription(userId: string, role: PlanRoleEnum): Promise<SubscriptionDocument | null> {
        return await this._subscriptionModel.findOne(
            {
                userId: this._toObjectId(userId),
                role
            }
        );
    }

    async findSubscriptionById(subscriptionId: string): Promise<SubscriptionDocument | null> {
        return await this._subscriptionModel.findOne({ _id: subscriptionId });
    }

    async updatePaymentStatus(subscriptionId: string, status: PaymentStatus, transactionId: string): Promise<boolean> {
        const result = await this._subscriptionModel.updateOne(
            { _id: subscriptionId },
            {
                $set: {
                    status,
                    transactionId: this._toObjectId(transactionId)
                }
            },
        );

        return result.modifiedCount === 1;
    }
}