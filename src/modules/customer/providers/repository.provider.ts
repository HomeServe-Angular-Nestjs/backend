import { Provider } from "@nestjs/common";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "../../../core/constants/repository.constant";
import { Model } from "mongoose";
import { CustomerDocument } from "../../../core/schema/customer.schema";
import { CustomerRepository } from "../../../core/repositories/implementations/customer.repository";
import { getModelToken } from "@nestjs/mongoose";
import { CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME } from "../../../core/constants/model.constant";
import { ProviderDocument } from "src/core/schema/provider.schema";
import { ProviderRepository } from "src/core/repositories/implementations/provider.repository";

export const customerRepositoryProviders: Provider[] = [
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