import { Model } from 'mongoose';

import { ADMIN_SETTINGS_MODEL_NAME, PLAN_MODEL_NAME } from '@core/constants/model.constant';
import { ADMIN_SETTINGS_REPOSITORY_NAME, PLAN_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import { PlanRepository } from '@core/repositories/implementations/plan.repository';
import { AdminSettingsRepository } from '@core/repositories/implementations/admin-settings.repository';
import { LoggerFactory } from '@core/logger/implementation/logger.factory';
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { PlanDocument } from '@core/schema/plans.schema';
import { AdminSettingsDocument } from '@core/schema/admin-settings.schema';

export const planRepositoryProvider: Provider[] = [
    {
        provide: ADMIN_SETTINGS_REPOSITORY_NAME,
        useFactory: (adminSettingsModel: Model<AdminSettingsDocument>) =>
            new AdminSettingsRepository(adminSettingsModel, new LoggerFactory()),
        inject: [getModelToken(ADMIN_SETTINGS_MODEL_NAME)]
    },
    {
        provide: PLAN_REPOSITORY_INTERFACE_NAME,
        useFactory: (planModel: Model<PlanDocument>) =>
            new PlanRepository(planModel),
        inject: [getModelToken(PLAN_MODEL_NAME)]
    }
];