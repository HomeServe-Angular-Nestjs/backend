import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PLAN_MODEL_NAME, SUBSCRIPTION_MODEL_NAME } from "src/core/constants/model.constant";
import { PLAN_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME } from "src/core/constants/repository.constant";
import { PlanRepository } from "src/core/repositories/implementations/plan.repository";
import { SubscriptionRepository } from "src/core/repositories/implementations/subscription.repository";
import { PlanDocumentType } from "src/core/schema/plans.schema";
import { SubscriptionDocumentType } from "src/core/schema/subscription.schema";

export const subscriptionRepositoryProviders: Provider[] = [
    {
        provide: SUBSCRIPTION_REPOSITORY_NAME,
        useFactory: (subscriptionModel: Model<SubscriptionDocumentType>) =>
            new SubscriptionRepository(subscriptionModel),
        inject: [getModelToken(SUBSCRIPTION_MODEL_NAME)]
    },
    {
        provide: PLAN_REPOSITORY_INTERFACE_NAME,
        useFactory: (planModel: Model<PlanDocumentType>) =>
            new PlanRepository(planModel),
        inject: [getModelToken(PLAN_MODEL_NAME)]
    }
]; 