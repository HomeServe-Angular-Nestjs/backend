import { Model } from 'mongoose';

import { PLAN_MODEL_NAME } from '@core/constants/model.constant';
import { PLAN_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import { PlanRepository } from '@core/repositories/implementations/plan.repository';
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { PlanDocument } from '@core/schema/plans.schema';

export const planRepositoryProvider: Provider[] = [
    {
        provide: PLAN_REPOSITORY_INTERFACE_NAME,
        useFactory: (planModel: Model<PlanDocument>) =>
            new PlanRepository(planModel),
        inject: [getModelToken(PLAN_MODEL_NAME)]
    }
];