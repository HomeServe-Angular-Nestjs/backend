import { Model } from 'mongoose';
import { CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME, SERVICE_CATEGORY_MODEL_NAME, SERVICE_OFFERED_MODEL_NAME } from '@core/constants/model.constant';
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, PROVIDER_SERVICE_REPOSITORY_NAME, SERVICE_CATEGORY_REPOSITORY_NAME, } from '@core/constants/repository.constant';
import { CustomerRepository } from '@core/repositories/implementations/customer.repository';
import { ProviderRepository } from '@core/repositories/implementations/provider.repository';
import { CustomerDocument } from '@core/schema/customer.schema';
import { ProviderDocument } from '@core/schema/provider.schema';
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { ProviderServiceDocument } from '@core/schema/provider-service.schema';
import { ProviderServiceRepository } from '@core/repositories/implementations/provider-service.repository';
import { ServiceCategoryDocument } from '@core/schema/service-category';
import { ServiceCategoryRepository } from '@core/repositories/implementations/service-category.repository';

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
    },
    {
        provide: PROVIDER_SERVICE_REPOSITORY_NAME,
        useFactory: (providerServiceModel: Model<ProviderServiceDocument>) =>
            new ProviderServiceRepository(providerServiceModel),
        inject: [getModelToken(SERVICE_OFFERED_MODEL_NAME)]
    },
    {
        provide:SERVICE_CATEGORY_REPOSITORY_NAME,
        useFactory: (serviceCategoryModel: Model<ServiceCategoryDocument>) =>
            new ServiceCategoryRepository(serviceCategoryModel),
        inject: [getModelToken(SERVICE_CATEGORY_MODEL_NAME)]
    },

]