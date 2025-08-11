import { Model } from 'mongoose';

import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

import {
    BOOKINGS_MODEL_NAME, CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME,
    SERVICE_OFFERED_MODEL_NAME, TRANSACTION_MODEL_NAME
} from '@core/constants/model.constant';
import {
    BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME,
    SERVICE_OFFERED_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME
} from '@core/constants/repository.constant';
import { BookingRepository } from '@core/repositories/implementations/bookings.repository';
import { CustomerRepository } from '@core/repositories/implementations/customer.repository';
import { ProviderRepository } from '@core/repositories/implementations/provider.repository';
import {
    ServiceOfferedRepository
} from '@core/repositories/implementations/serviceOffered.repository';
import {
    TransactionRepository
} from '@core/repositories/implementations/transaction.repository';
import { BookingDocument } from '@core/schema/bookings.schema';
import { CustomerDocument } from '@core/schema/customer.schema';
import { ProviderDocument } from '@core/schema/provider.schema';
import { ServiceDocument } from '@core/schema/service.schema';
import { TransactionDocument } from '@core/schema/transaction.schema';

export const repositoryProviders: Provider[] = [
    {
        provide: SERVICE_OFFERED_REPOSITORY_NAME,
        useFactory: (serviceOfferedModel: Model<ServiceDocument>) =>
            new ServiceOfferedRepository(serviceOfferedModel),
        inject: [getModelToken(SERVICE_OFFERED_MODEL_NAME)],
    },
    {
        provide: BOOKING_REPOSITORY_NAME,
        useFactory: (bookingModel: Model<BookingDocument>) =>
            new BookingRepository(bookingModel),
        inject: [getModelToken(BOOKINGS_MODEL_NAME)]
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
    {
        provide: TRANSACTION_REPOSITORY_NAME,
        useFactory: (transactionModel: Model<TransactionDocument>) =>
            new TransactionRepository(transactionModel),
        inject: [getModelToken(TRANSACTION_MODEL_NAME)]
    },
]