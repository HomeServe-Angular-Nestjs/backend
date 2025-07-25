import { Model } from 'mongoose';

import { PROVIDER_MODEL_NAME, SCHEDULES_MODEL_NAME } from '@core/constants/model.constant';
import {
    PROVIDER_REPOSITORY_INTERFACE_NAME, SCHEDULES_REPOSITORY_NAME
} from '@core/constants/repository.constant';
import { ProviderRepository } from '@core/repositories/implementations/provider.repository';
import { SchedulesRepository } from '@core/repositories/implementations/schedules.repository';
import { ProviderDocument } from '@core/schema/provider.schema';
import { SchedulesDocument } from '@core/schema/schedules.schema';
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

export const schedulesRepositoryProviders: Provider[] = [
    {
        provide: SCHEDULES_REPOSITORY_NAME,
        useFactory: (schedulesModel: Model<SchedulesDocument>) =>
            new SchedulesRepository(schedulesModel),
        inject: [getModelToken(SCHEDULES_MODEL_NAME)]
    },
    {
        provide: PROVIDER_REPOSITORY_INTERFACE_NAME,
        useFactory: (providerModel: Model<ProviderDocument>) =>
            new ProviderRepository(providerModel),
        inject: [getModelToken(PROVIDER_MODEL_NAME)]
    }
]