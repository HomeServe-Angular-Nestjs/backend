import { Model } from 'mongoose';

import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

import { PLAN_MODEL_NAME, SUBSCRIPTION_MODEL_NAME } from '@core/constants/model.constant';
import { PLAN_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { PlanRepository } from '@core/repositories/implementations/plan.repository';
import { SubscriptionRepository } from '@core/repositories/implementations/subscription.repository';
import { PlanDocument } from '@core/schema/plans.schema';
import { SubscriptionDocument } from '@core/schema/subscription.schema';

export const subscriptionRepositoryProviders: Provider[] = [
    {
        provide: SUBSCRIPTION_REPOSITORY_NAME,
        useFactory: (subscriptionModel: Model<SubscriptionDocument>) =>
            new SubscriptionRepository(subscriptionModel),
        inject: [getModelToken(SUBSCRIPTION_MODEL_NAME)]
    },
    {
        provide: PLAN_REPOSITORY_INTERFACE_NAME,
        useFactory: (planModel: Model<PlanDocument>) =>
            new PlanRepository(planModel),
        inject: [getModelToken(PLAN_MODEL_NAME)]
    }
]; 