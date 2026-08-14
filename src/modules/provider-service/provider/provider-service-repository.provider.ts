import {
  PLAN_MODEL_NAME,
  PROFESSION_MODEL_NAME,
  PROVIDER_SERVICE_MODEL_NAME,
  SERVICE_CATEGORY_MODEL_NAME,
  SUBSCRIPTION_MODEL_NAME,
  ADMIN_SETTINGS_MODEL_NAME,
} from '@core/constants/model.constant';
import {
  PLAN_REPOSITORY_INTERFACE_NAME,
  PROFESSION_REPOSITORY_NAME,
  PROVIDER_SERVICE_REPOSITORY_NAME,
  SERVICE_CATEGORY_REPOSITORY_NAME,
  SUBSCRIPTION_REPOSITORY_NAME,
  ADMIN_SETTINGS_REPOSITORY_NAME,
} from '@core/constants/repository.constant';
import { PlanRepository } from '@core/repositories/implementations/plan.repository';
import { ProfessionRepository } from '@core/repositories/implementations/profession.repository';
import { ProviderServiceRepository } from '@core/repositories/implementations/provider-service.repository';
import { ServiceCategoryRepository } from '@core/repositories/implementations/service-category.repository';
import { SubscriptionRepository } from '@core/repositories/implementations/subscription.repository';
import { AdminSettingsRepository } from '@core/repositories/implementations/admin-settings.repository';
import { LoggerFactory } from '@core/logger/implementation/logger.factory';
import type { PlanDocument } from '@core/schema/plans.schema';
import type { ProfessionDocument } from '@core/schema/profession.schema';
import type { ProviderServiceDocument } from '@core/schema/provider-service.schema';
import type { ServiceCategoryDocument } from '@core/schema/service-category';
import type { SubscriptionDocument } from '@core/schema/subscription.schema';
import type { AdminSettingsDocument } from '@core/schema/admin-settings.schema';
import type { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

export const providerServiceRepositoryProvider: Provider[] = [
  {
    provide: ADMIN_SETTINGS_REPOSITORY_NAME,
    useFactory: (adminSettingsModel: Model<AdminSettingsDocument>) => new AdminSettingsRepository(adminSettingsModel, new LoggerFactory()),
    inject: [getModelToken(ADMIN_SETTINGS_MODEL_NAME)],
  },
  {
    provide: PLAN_REPOSITORY_INTERFACE_NAME,
    useFactory: (planModel: Model<PlanDocument>) => new PlanRepository(planModel),
    inject: [getModelToken(PLAN_MODEL_NAME)],
  },
  {
    provide: SUBSCRIPTION_REPOSITORY_NAME,
    useFactory: (subscriptionModel: Model<SubscriptionDocument>) => new SubscriptionRepository(subscriptionModel),
    inject: [getModelToken(SUBSCRIPTION_MODEL_NAME)],
  },
  {
    provide: PROVIDER_SERVICE_REPOSITORY_NAME,
    useFactory: (providerServiceModel: Model<ProviderServiceDocument>) => new ProviderServiceRepository(providerServiceModel),
    inject: [getModelToken(PROVIDER_SERVICE_MODEL_NAME)],
  },
  {
    provide: PROFESSION_REPOSITORY_NAME,
    useFactory: (professionModel: Model<ProfessionDocument>) => new ProfessionRepository(professionModel),
    inject: [getModelToken(PROFESSION_MODEL_NAME)],
  },
  {
    provide: SERVICE_CATEGORY_REPOSITORY_NAME,
    useFactory: (serviceCategoryModel: Model<ServiceCategoryDocument>) => new ServiceCategoryRepository(serviceCategoryModel),
    inject: [getModelToken(SERVICE_CATEGORY_MODEL_NAME)],
  },
];
