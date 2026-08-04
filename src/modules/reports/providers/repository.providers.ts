import { BOOKINGS_MODEL_NAME, CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME, REPORT_MODEL_NAME } from "@core/constants/model.constant";
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, REPORT_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { BookingRepository } from "@core/repositories/implementations/bookings.repository";
import { CustomerRepository } from "@core/repositories/implementations/customer.repository";
import { ProviderRepository } from "@core/repositories/implementations/provider.repository";
import { ReportRepository } from "@core/repositories/implementations/report.repository";
import { BookingDocument } from "@core/schema/bookings.schema";
import { CustomerDocument } from "@core/schema/customer.schema";
import { ProviderDocument } from "@core/schema/provider.schema";
import { ReportDocument } from "@core/schema/report.schema";
import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

export const reportRepositoryProvider: Provider[] = [
    {
        provide: REPORT_REPOSITORY_NAME,
        useFactory: (reportModel: Model<ReportDocument>) =>
            new ReportRepository(reportModel),
        inject: [getModelToken(REPORT_MODEL_NAME)]
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
]