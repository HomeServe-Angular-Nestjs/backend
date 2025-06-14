import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  PROVIDER_REPOSITORY_INTERFACE_NAME,
  SCHEDULE_REPOSITORY_NAME,
  SERVICE_OFFERED_REPOSITORY_NAME,
} from '../../../core/constants/repository.constant';

import { ProviderRepository } from '../../../core/repositories/implementations/provider.repository';
import { ServiceOfferedRepository } from '../../../core/repositories/implementations/serviceOffered.repository';

import {
  PROVIDER_MODEL_NAME,
  SCHEDULE_MODEL_NAME,
  SERVICE_OFFERED_MODEL_NAME,
} from '../../../core/constants/model.constant';

import { ProviderDocument } from '../../../core/schema/provider.schema';
import { ServiceDocument } from '../../../core/schema/service.schema';
// import { ScheduleDocument } from '../../../core/schema/schedule.schema';
// import { ScheduleRepository } from '../../../core/repositories/implementations/schedule.repository';

export const repositoryProviders: Provider[] = [
  {
    provide: PROVIDER_REPOSITORY_INTERFACE_NAME,
    useFactory: (providerModel: Model<ProviderDocument>) =>
      new ProviderRepository(providerModel),
    inject: [getModelToken(PROVIDER_MODEL_NAME)],
  },
  {
    provide: SERVICE_OFFERED_REPOSITORY_NAME,
    useFactory: (serviceOfferedModel: Model<ServiceDocument>) =>
      new ServiceOfferedRepository(serviceOfferedModel),
    inject: [getModelToken(SERVICE_OFFERED_MODEL_NAME)],
  },
  // {
  //   provide: SCHEDULE_REPOSITORY_NAME,
  //   useFactory: (scheduleModel: Model<ScheduleDocument>) =>
  //     new ScheduleRepository(scheduleModel),
  //   inject: [getModelToken(SCHEDULE_MODEL_NAME)]
  // }
];
