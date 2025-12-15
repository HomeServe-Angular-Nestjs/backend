import { Model } from 'mongoose';

import {
  ADMIN_MODEL_NAME, CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME,
  WALLET_MODEL_NAME
} from '@core/constants/model.constant';
import {
  ADMIN_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME,
  OTP_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME,
  WALLET_REPOSITORY_NAME
} from '@core/constants/repository.constant';
import { AdminRepository } from '@core/repositories/implementations/admin.repository';
import { CustomerRepository } from '@core/repositories/implementations/customer.repository';
import { OtpRepository } from '@core/repositories/implementations/otp.repository';
import { ProviderRepository } from '@core/repositories/implementations/provider.repository';
import { AdminDocument } from '@core/schema/admin.schema';
import { CustomerDocument } from '@core/schema/customer.schema';
import { ProviderDocument } from '@core/schema/provider.schema';
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { WalletDocument } from '@core/schema/wallet.schema';
import { WalletRepository } from '@core/repositories/implementations/wallet.repository';
import { LoggerFactory } from '@core/logger/implementation/logger.factory';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@configs/redis/redis.module';

export const repositoryProvider: Provider[] = [
  {
    provide: CUSTOMER_REPOSITORY_INTERFACE_NAME,
    useFactory: (customerModel: Model<CustomerDocument>) =>
      new CustomerRepository(customerModel),
    inject: [getModelToken(CUSTOMER_MODEL_NAME)],
  },
  {
    provide: OTP_REPOSITORY_INTERFACE_NAME,
    useFactory: (redis: Redis) => new OtpRepository(redis),
    inject: [REDIS_CLIENT],
  },
  {
    provide: PROVIDER_REPOSITORY_INTERFACE_NAME,
    useFactory: (providerModel: Model<ProviderDocument>) =>
      new ProviderRepository(providerModel),
    inject: [getModelToken(PROVIDER_MODEL_NAME)],
  },
  {
    provide: ADMIN_REPOSITORY_NAME,
    useFactory: (adminModel: Model<AdminDocument>) =>
      new AdminRepository(adminModel, new LoggerFactory()),
    inject: [getModelToken(ADMIN_MODEL_NAME)],
  },
  {
    provide: WALLET_REPOSITORY_NAME,
    useFactory: (walletModel: Model<WalletDocument>) =>
      new WalletRepository(new LoggerFactory(), walletModel),
    inject: [getModelToken(WALLET_MODEL_NAME)],
  },
];
