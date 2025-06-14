import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PROVIDER_MODEL_NAME, SCHEDULES_MODEL_NAME } from "src/core/constants/model.constant";
import { PROVIDER_REPOSITORY_INTERFACE_NAME, SCHEDULES_REPOSITORY_NAME } from "src/core/constants/repository.constant";
import { ProviderRepository } from "src/core/repositories/implementations/provider.repository";
import { SchedulesRepository } from "src/core/repositories/implementations/schedules.repository";
import { ProviderDocument } from "src/core/schema/provider.schema";
import { SchedulesDocumnet } from "src/core/schema/schedules.schema";

export const schedulesRepositoryProviders: Provider[] = [
    {
        provide: SCHEDULES_REPOSITORY_NAME,
        useFactory: (schedulesModel: Model<SchedulesDocumnet>) =>
            new SchedulesRepository(schedulesModel),
        inject: [getModelToken(SCHEDULES_MODEL_NAME)]
    },
    {
        provide: PROVIDER_REPOSITORY_INTERFACE_NAME,
        useFactory: (providerModel: Model<ProviderDocument>) =>
            new ProviderRepository(providerModel),
        inject: [getModelToken(PROVIDER_MODEL_NAME)]
    }
]