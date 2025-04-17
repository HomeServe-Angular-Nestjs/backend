import { Provider } from "@nestjs/common";
import { PROVIDER_REPOSITORY_INTERFACE_NAME } from "../../../core/constants/repository.constant";
import { ProviderRepository } from "../../../core/repositories/implementations/provider.repository";
import { getModelToken } from "@nestjs/mongoose";
import { PROVIDER_MODEL_NAME } from "../../../core/constants/model.constant";

export const repositoryProviders: Provider[] = [
    {
        provide: PROVIDER_REPOSITORY_INTERFACE_NAME,
        useFactory: (providerModel) => new ProviderRepository(providerModel),
        inject: [getModelToken(PROVIDER_MODEL_NAME)]
    }
]