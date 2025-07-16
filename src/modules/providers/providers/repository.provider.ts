import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CUSTOMER_REPOSITORY_INTERFACE_NAME,
  PROVIDER_REPOSITORY_INTERFACE_NAME,
  SERVICE_OFFERED_REPOSITORY_NAME,
} from '../../../core/constants/repository.constant';
import { ProviderRepository } from '../../../core/repositories/implementations/provider.repository';
import { ServiceOfferedRepository } from '../../../core/repositories/implementations/serviceOffered.repository';
import {
  CUSTOMER_MODEL_NAME,
  PROVIDER_MODEL_NAME,
  SERVICE_OFFERED_MODEL_NAME,
} from '../../../core/constants/model.constant';
import { ProviderDocument } from '../../../core/schema/provider.schema';
import { ServiceDocument } from '../../../core/schema/service.schema';
import { CustomerDocument } from 'src/core/schema/customer.schema';
import { CustomerRepository } from 'src/core/repositories/implementations/customer.repository';

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
  {
    provide: CUSTOMER_REPOSITORY_INTERFACE_NAME,
    useFactory: (customerModel: Model<CustomerDocument>) =>
      new CustomerRepository(customerModel),
    inject: [getModelToken(CUSTOMER_MODEL_NAME)],
  },
];
