import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SubscriptionDocumentType } from "src/core/schema/subscription.schema";
import { SUBSCRIPTION_MODEL_NAME } from "src/core/constants/model.constant";
import { ISubscription } from "src/core/entities/interfaces/subscription.entity.interface";
import { Subscription } from "src/core/entities/implementation/subscription.entity";
import { ISubscriptionRepository } from "../interfaces/subscription-repo.interface";
import { BaseRepository } from "../base/implementations/base.repository";
import { IAdminDashboardSubscription } from "src/core/entities/interfaces/admin.entity.interface";

@Injectable()
export class SubscriptionRepository extends BaseRepository<ISubscription, SubscriptionDocumentType> implements ISubscriptionRepository {
    constructor(
        @InjectModel(SUBSCRIPTION_MODEL_NAME)
        private readonly _subscriptionModel: Model<SubscriptionDocumentType>
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

    protected override toEntity(doc: SubscriptionDocumentType): ISubscription {
        return new Subscription({
            id: doc.id,
            userId: doc.userId,
            name: doc.name,
            transactionId: doc.transactionId,
            role: doc.role,
            planId: doc.planId,
            duration: doc.duration,
            features: doc.features,
            startTime: doc.startTime.toString(),
            endDate: doc.endDate?.toString(),
            renewalType: doc.renewalType,
            isActive: doc.isActive,
            isDeleted: doc.isDeleted,
            paymentStatus: doc.paymentStatus,
            cancelledAt: doc.cancelledAt?.toString(),
            metadata: doc.metadata,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}