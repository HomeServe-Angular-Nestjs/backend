import { PROFESSION_MODEL_NAME, PROVIDER_SERVICE_MODEL_NAME, SERVICE_CATEGORY_MODEL_NAME } from "@core/constants/model.constant";
import { PROFESSION_REPOSITORY_NAME, PROVIDER_SERVICE_REPOSITORY_NAME, SERVICE_CATEGORY_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ProfessionRepository } from "@core/repositories/implementations/profession.repository";
import { ProviderServiceRepository } from "@core/repositories/implementations/provider-service.repository";
import { ServiceCategoryRepository } from "@core/repositories/implementations/service-category.repository";
import { ProfessionDocument } from "@core/schema/profession.schema";
import { ProviderServiceDocument } from "@core/schema/provider-service.schema";
import { ServiceCategoryDocument } from "@core/schema/service-category";
import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

export const providerServiceRepositoryProvider: Provider[] = [
    {
        provide: PROVIDER_SERVICE_REPOSITORY_NAME,
        useFactory: (providerServiceModel: Model<ProviderServiceDocument>) =>
            new ProviderServiceRepository(providerServiceModel),
        inject: [getModelToken(PROVIDER_SERVICE_MODEL_NAME)]
    },
    {
        provide: PROFESSION_REPOSITORY_NAME,
        useFactory: (professionModel: Model<ProfessionDocument>) =>
            new ProfessionRepository(professionModel),
        inject: [getModelToken(PROFESSION_MODEL_NAME)]
    },
    {
        provide: SERVICE_CATEGORY_REPOSITORY_NAME,
        useFactory: (serviceCategoryModel: Model<ServiceCategoryDocument>) =>
            new ServiceCategoryRepository(serviceCategoryModel),
        inject: [getModelToken(SERVICE_CATEGORY_MODEL_NAME)]
    }
];
