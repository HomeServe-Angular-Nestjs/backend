import { Provider } from "@nestjs/common";
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SCHEDULES_REPOSITORY_NAME, SERVICE_OFFERED_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME } from "../../../core/constants/repository.constant";
import { ServiceDocument } from "../../../core/schema/service.schema";
import { Model } from "mongoose";
import { ServiceOfferedRepository } from "../../../core/repositories/implementations/serviceOffered.repository";
import { getModelToken } from "@nestjs/mongoose";
import { BOOKINGS_MODEL_NAME, CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME, SCHEDULES_MODEL_NAME, SERVICE_OFFERED_MODEL_NAME, TRANSACTION_MODEL_NAME } from "../../../core/constants/model.constant";
import { BookingDocument } from "../../../core/schema/bookings.schema";
import { BookingRepository } from "../../../core/repositories/implementations/bookings.repository";
import { CustomerDocument } from "../../../core/schema/customer.schema";
import { CustomerRepository } from "../../../core/repositories/implementations/customer.repository";
import { ProviderDocument } from "../../../core/schema/provider.schema";
import { ProviderRepository } from "../../../core/repositories/implementations/provider.repository";
import { SchedulesDocument } from "src/core/schema/schedules.schema";
import { SchedulesRepository } from "src/core/repositories/implementations/schedules.repository";
import { TransactionDocument } from "src/core/schema/transaction.schema";
import { TransactionRepository } from "src/core/repositories/implementations/transaction.repository";


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
        provide: SCHEDULES_REPOSITORY_NAME,
        useFactory: (schedulesModel: Model<SchedulesDocument>) =>
            new SchedulesRepository(schedulesModel),
        inject: [getModelToken(SCHEDULES_MODEL_NAME)]
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
    }
]