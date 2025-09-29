import { Model } from 'mongoose'
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { CUSTOMER_MODEL_NAME, PLAN_MODEL_NAME, PROVIDER_MODEL_NAME, SUBSCRIPTION_MODEL_NAME } from '@core/constants/model.constant';
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PLAN_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { PlanRepository } from '@core/repositories/implementations/plan.repository';
import { SubscriptionRepository } from '@core/repositories/implementations/subscription.repository';
import { PlanDocument } from '@core/schema/plans.schema';
import { SubscriptionDocument } from '@core/schema/subscription.schema';
import { CustomerDocument } from '@core/schema/customer.schema';
import { CustomerRepository } from '@core/repositories/implementations/customer.repository';
import { ProviderDocument } from '@core/schema/provider.schema';
import { ProviderRepository } from '@core/repositories/implementations/provider.repository';

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
    },
    {
        provide: CUSTOMER_REPOSITORY_INTERFACE_NAME, 
        useFactory: (customerModel: Model<CustomerDocument>) =>
            new CustomerRepository(customerModel),
        inject: [getModelToken(CUSTOMER_MODEL_NAME)]
    },
    {
        provide: PROVIDER_REPOSITORY_INTERFACE_NAME,
        useFactory: (providerModel: Model<ProviderDocument>) =>
            new ProviderRepository(providerModel),
        inject: [getModelToken(PROVIDER_MODEL_NAME)]
    },
]; 