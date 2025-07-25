import { Model } from 'mongoose';

import {
    ADMIN_MODEL_NAME, CUSTOMER_MODEL_NAME, OTP_MODEL_NAME, PROVIDER_MODEL_NAME
} from '@core/constants/model.constant';
import {
    ADMIN_REPOSITORY_INTERFACE_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME,
    OTP_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME
} from '@core/constants/repository.constant';
import { AdminRepository } from '@core/repositories/implementations/admin.repository';
import { CustomerRepository } from '@core/repositories/implementations/customer.repository';
import { OtpRepository } from '@core/repositories/implementations/otp.repository';
import { ProviderRepository } from '@core/repositories/implementations/provider.repository';
import { AdminDocument } from '@core/schema/admin.schema';
import { CustomerDocument } from '@core/schema/customer.schema';
import { OtpDocument } from '@core/schema/otp.schema';
import { ProviderDocument } from '@core/schema/provider.schema';
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

export const repositoryProvider: Provider[] = [
  {
    provide: CUSTOMER_REPOSITORY_INTERFACE_NAME,
    useFactory: (customerModel: Model<CustomerDocument>) =>
      new CustomerRepository(customerModel),
    inject: [getModelToken(CUSTOMER_MODEL_NAME)],
  },
  {
    provide: OTP_REPOSITORY_INTERFACE_NAME,
    useFactory: (otpModel: Model<OtpDocument>) => new OtpRepository(otpModel),
    inject: [getModelToken(OTP_MODEL_NAME)],
  },
  {
    provide: PROVIDER_REPOSITORY_INTERFACE_NAME,
    useFactory: (providerModel: Model<ProviderDocument>) =>
      new ProviderRepository(providerModel),
    inject: [getModelToken(PROVIDER_MODEL_NAME)],
  },
  {
    provide: ADMIN_REPOSITORY_INTERFACE_NAME,
    useFactory: (adminModel: Model<AdminDocument>) =>
      new AdminRepository(adminModel),
    inject: [getModelToken(ADMIN_MODEL_NAME)],
  },
];
