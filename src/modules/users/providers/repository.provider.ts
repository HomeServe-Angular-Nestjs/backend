import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME } from "src/core/constants/model.constant";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "src/core/constants/repository.constant";
import { CustomerRepository } from "src/core/repositories/implementations/customer.repository";
import { ProviderRepository } from "src/core/repositories/implementations/provider.repository";
import { CustomerDocument } from "src/core/schema/customer.schema";
import { ProviderDocument } from "src/core/schema/provider.schema";

export const adminRepositoryProviders: Provider[] = [
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