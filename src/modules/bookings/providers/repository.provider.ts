import { Provider } from "@nestjs/common";
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SCHEDULE_REPOSITORY_NAME, SERVICE_OFFERED_REPOSITORY_NAME } from "../../../core/constants/repository.constant";
import { ServiceDocument } from "../../../core/schema/service.schema";
import { Model } from "mongoose";
import { ServiceOfferedRepository } from "../../../core/repositories/implementations/serviceOffered.repository";
import { getModelToken } from "@nestjs/mongoose";
import { BOOKINGS_MODEL_NAME, CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME, SCHEDULE_MODEL_NAME, SERVICE_OFFERED_MODEL_NAME } from "../../../core/constants/model.constant";
import { BookingDocument } from "../../../core/schema/bookings.schema";
import { BookingRepository } from "../../../core/repositories/implementations/bookings.repository";
import { ScheduleDocument } from "../../../core/schema/schedule.schema";
import { ScheduleRepository } from "../../../core/repositories/implementations/schedule.repository";
import { CustomerDocument } from "../../../core/schema/customer.schema";
import { CustomerRepository } from "../../../core/repositories/implementations/customer.repository";
import { ProviderDocument } from "../../../core/schema/provider.schema";
import { ProviderRepository } from "../../../core/repositories/implementations/provider.repository";


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
        provide: SCHEDULE_REPOSITORY_NAME,
        useFactory: (scheduleModel: Model<ScheduleDocument>) =>
            new ScheduleRepository(scheduleModel),
        inject: [getModelToken(SCHEDULE_MODEL_NAME)]
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
    }
]