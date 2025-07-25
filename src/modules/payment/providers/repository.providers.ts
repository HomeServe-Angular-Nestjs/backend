import { Model } from 'mongoose';

import {
    CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME, TRANSACTION_MODEL_NAME
} from '@core/constants/model.constant';
import {
    CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME,
    TRANSACTION_REPOSITORY_NAME
} from '@core/constants/repository.constant';
import { CustomerRepository } from '@core/repositories/implementations/customer.repository';
import { ProviderRepository } from '@core/repositories/implementations/provider.repository';
import { TransactionRepository } from '@core/repositories/implementations/transaction.repository';
import { CustomerDocument } from '@core/schema/customer.schema';
import { ProviderDocument } from '@core/schema/provider.schema';
import { TransactionDocument } from '@core/schema/transaction.schema';
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

export const paymentRepositoryProviders: Provider[] = [
    {
        provide: TRANSACTION_REPOSITORY_NAME,
        useFactory: (transactionModel: Model<TransactionDocument>) =>
            new TransactionRepository(transactionModel),
        inject: [getModelToken(TRANSACTION_MODEL_NAME)]
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
]